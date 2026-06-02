import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaChevronLeft,
  FaChevronRight,
  FaDog,
  FaCalendarAlt,
  FaGavel,
  FaPaw,
  FaStethoscope,
  FaUsers,
} from "react-icons/fa";

import {
  listAdminAdocoes,
  listAdminAgenda,
  listAdminAnimals,
  listAdminSolicitacoes,
  listAdminTaxonomias,
  listAdminServicos,
  listAdminUsers,
} from "../../api/adminApi";
import { getAgendaServiceColor } from "../../utils/agenda";

import "../../styles/admin.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agendaLoading, setAgendaLoading] = useState(true);
  const [error, setError] = useState("");
  const [agendaError, setAgendaError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [agenda, setAgenda] = useState([]);
  const [summary, setSummary] = useState({
    animais: 0,
    adocoes: 0,
    solicitacoes: 0,
    usuarios: 0,
    taxonomias: 0,
    servicos: 0,
  });

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }, [currentMonth]);

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();
    const cells = [];

    for (let i = 0; i < startOffset; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  }, [currentMonth]);

  const agendaByDay = useMemo(() => {
    const grouped = new Map();

    agenda.forEach((item) => {
      if (!item?.inicio) {
        return;
      }

      const dayKey = item.inicio.slice(0, 10);
      const current = grouped.get(dayKey) ?? [];
      current.push(item);
      grouped.set(dayKey, current);
    });

    return grouped;
  }, [agenda]);

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);
      setError("");

      try {
        const [animals, adocoes, solicitacoes, users, taxonomias, servicos] =
          await Promise.all([
            listAdminAnimals(),
            listAdminAdocoes(),
            listAdminSolicitacoes(),
            listAdminUsers(),
            listAdminTaxonomias(),
            listAdminServicos(),
          ]);

        setSummary({
          animais: animals.length,
          adocoes: adocoes.length,
          solicitacoes: solicitacoes.length,
          usuarios: users.length,
          taxonomias: taxonomias.length,
          servicos: servicos.length,
        });
      } catch (requestError) {
        setError("Nao foi possivel carregar os dados administrativos.");
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  useEffect(() => {
    async function loadAgenda() {
      setAgendaLoading(true);
      setAgendaError("");

      try {
        const response = await listAdminAgenda({
          ano: currentMonth.getFullYear(),
          mes: currentMonth.getMonth() + 1,
        });

        setAgenda(Array.isArray(response) ? response : []);
      } catch (requestError) {
        setAgendaError("Nao foi possivel carregar a agenda do mes.");
      } finally {
        setAgendaLoading(false);
      }
    }

    loadAgenda();
  }, [currentMonth]);

  function changeMonth(offset) {
    setCurrentMonth((current) => {
      const next = new Date(current);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  }

  function formatDayNumber(date) {
    return date.getDate().toString().padStart(2, "0");
  }

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function openDayAgenda(dayKey) {
    navigate(`/admin/agenda/dia/${dayKey}`);
  }

  function handleDayKeyDown(event, dayKey) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDayAgenda(dayKey);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page__hero">
        <h1>Painel Administrativo</h1>
        <p>
          Gerencie moderacao de conteudo, solicitacoes e processos de adocao.
        </p>
      </header>

      <section className="admin-grid" aria-label="Resumo administrativo">
        <article className="admin-card">
          <span className="admin-card__icon admin-card__icon--teal">
            <FaDog />
          </span>
          <div>
            <p>Animais cadastrados</p>
            <strong>{loading ? "..." : summary.animais}</strong>
          </div>
          <Link to="/admin/animais" className="admin-card__link">
            Moderar animais
          </Link>
        </article>

        <article className="admin-card">
          <span className="admin-card__icon admin-card__icon--gold">
            <FaGavel />
          </span>
          <div>
            <p>Pedidos de adocao</p>
            <strong>{loading ? "..." : summary.adocoes}</strong>
          </div>
          <Link to="/admin/adocoes" className="admin-card__link">
            Revisar adocoes
          </Link>
        </article>

        <article className="admin-card">
          <span className="admin-card__icon admin-card__icon--blue">
            <FaClipboardList />
          </span>
          <div>
            <p>Solicitacoes de atendimento</p>
            <strong>{loading ? "..." : summary.solicitacoes}</strong>
          </div>
          <Link to="/admin/solicitacoes" className="admin-card__link">
            Analisar solicitacoes
          </Link>
        </article>

        <article className="admin-card">
          <span className="admin-card__icon admin-card__icon--indigo">
            <FaUsers />
          </span>
          <div>
            <p>Usuarios do sistema</p>
            <strong>{loading ? "..." : summary.usuarios}</strong>
          </div>
          <Link to="/admin/usuarios" className="admin-card__link">
            Gerenciar usuarios
          </Link>
        </article>

        <article className="admin-card">
          <span className="admin-card__icon admin-card__icon--teal">
            <FaPaw />
          </span>
          <div>
            <p>Especies cadastradas</p>
            <strong>{loading ? "..." : summary.taxonomias}</strong>
          </div>
          <Link to="/admin/taxonomias" className="admin-card__link">
            Gerenciar especies e racas
          </Link>
        </article>

        <article className="admin-card">
          <span className="admin-card__icon admin-card__icon--gold">
            <FaStethoscope />
          </span>
          <div>
            <p>Servicos cadastrados</p>
            <strong>{loading ? "..." : summary.servicos}</strong>
          </div>
          <Link to="/admin/servicos" className="admin-card__link">
            Gerenciar servicos
          </Link>
        </article>
      </section>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <section className="admin-calendar-card">
        <div className="admin-calendar-card__header">
          <div>
            <p className="admin-calendar-card__eyebrow">Agenda</p>
            <h2>Atendimentos marcados</h2>
          </div>

          <div className="admin-calendar-card__controls">
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => changeMonth(-1)}
            >
              <FaChevronLeft />
            </button>
            <strong>{monthLabel}</strong>
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={() => changeMonth(1)}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="admin-calendar-card__summary">
          <span>
            <FaCalendarAlt /> {agenda.length} atendimentos no mês
          </span>
        </div>

        {agendaError && (
          <div className="admin-alert admin-alert--error">{agendaError}</div>
        )}

        <div className="admin-calendar-grid">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
            <div key={day} className="admin-calendar-grid__weekday">
              {day}
            </div>
          ))}

          {calendarCells.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="admin-calendar-grid__cell admin-calendar-grid__cell--empty"
                />
              );
            }

            const dayKey = formatDateKey(date);
            const items = agendaByDay.get(dayKey) ?? [];
            const isToday = dayKey === formatDateKey(new Date());

            return (
              <div
                key={dayKey}
                className={`admin-calendar-grid__cell admin-calendar-grid__cell--clickable${isToday ? " is-today" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => openDayAgenda(dayKey)}
                onKeyDown={(event) => handleDayKeyDown(event, dayKey)}
                title="Abrir agenda do dia"
              >
                <div className="admin-calendar-grid__day-number">
                  {formatDayNumber(date)}
                </div>

                <div className="admin-calendar-grid__events">
                  {agendaLoading ? (
                    <span className="admin-calendar-grid__loading">...</span>
                  ) : items.length === 0 ? (
                    <span className="admin-calendar-grid__empty">
                      Sem marcações
                    </span>
                  ) : items.length > 1 ? (
                    <article
                      className="admin-calendar-event admin-calendar-event--summary"
                      style={{
                        "--service-accent": getAgendaServiceColor(
                          items[0]?.nomeServico,
                          items[0]?.servicoId,
                        ),
                      }}
                      role="button"
                      tabIndex={0}
                      onClick={() => openDayAgenda(dayKey)}
                      onKeyDown={(event) => handleDayKeyDown(event, dayKey)}
                    >
                      <span
                        className="admin-calendar-event__marker"
                        aria-hidden="true"
                      />
                      <strong>Múltiplos atendimentos</strong>
                      <small>clique aqui para ver os detalhes</small>
                    </article>
                  ) : (
                    items.slice(0, 3).map((item) => (
                      <article
                        key={item.agendamentoId}
                        className="admin-calendar-event"
                        style={{
                          "--service-accent": getAgendaServiceColor(
                            item.nomeServico,
                            item.servicoId,
                          ),
                        }}
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(
                            `/admin/agenda/evento/${item.agendamentoId}?data=${dayKey}`,
                          );
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            navigate(
                              `/admin/agenda/evento/${item.agendamentoId}?data=${dayKey}`,
                            );
                          }
                        }}
                      >
                        <span
                          className="admin-calendar-event__marker"
                          aria-hidden="true"
                        />
                        <strong>{item.nomeServico || "Serviço"}</strong>
                        <span>{item.nomeAnimal || "Animal"}</span>
                        <small>
                          {item.inicio
                            ? new Date(item.inicio).toLocaleTimeString(
                                "pt-BR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : ""}
                        </small>
                      </article>
                    ))
                  )}
                  {items.length > 3 && (
                    <span className="admin-calendar-grid__more">
                      +{items.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
