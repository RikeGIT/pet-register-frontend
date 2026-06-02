import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarDay,
  FaClock,
  FaPaw,
  FaStethoscope,
  FaUser,
} from "react-icons/fa";

import { listAdminAgendaDia } from "../../api/adminApi";
import {
  formatAgendaDate,
  formatAgendaTime,
  getAgendaServiceColor,
} from "../../utils/agenda";

import "../../styles/admin.css";

function AdminAgendaDia() {
  const navigate = useNavigate();
  const { data } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agenda, setAgenda] = useState([]);

  const title = useMemo(() => formatAgendaDate(data), [data]);

  useEffect(() => {
    async function loadDayAgenda() {
      setLoading(true);
      setError("");

      try {
        const response = await listAdminAgendaDia(data);
        setAgenda(Array.isArray(response) ? response : []);
      } catch (requestError) {
        setError("Nao foi possivel carregar a agenda do dia.");
      } finally {
        setLoading(false);
      }
    }

    loadDayAgenda();
  }, [data]);

  return (
    <main className="admin-page admin-agenda-page">
      <header className="admin-page__hero admin-agenda-page__hero">
        <div>
          <p className="admin-calendar-card__eyebrow">Agenda do dia</p>
          <h1>{title || "Agenda detalhada"}</h1>
          <p>Visualize todos os atendimentos marcados para este dia.</p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn--secondary"
          onClick={() => navigate("/admin")}
        >
          <FaArrowLeft />
          Voltar ao painel
        </button>
      </header>

      <section className="admin-agenda-summary">
        <article className="admin-agenda-summary__card">
          <FaCalendarDay />
          <div>
            <span>Dia selecionado</span>
            <strong>{title || "Data inválida"}</strong>
          </div>
        </article>

        <article className="admin-agenda-summary__card">
          <FaPaw />
          <div>
            <span>Atendimentos</span>
            <strong>{agenda.length}</strong>
          </div>
        </article>
      </section>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <section className="admin-agenda-list">
        {loading ? (
          <div className="admin-agenda-empty">Carregando atendimentos...</div>
        ) : agenda.length === 0 ? (
          <div className="admin-agenda-empty">
            Nenhum atendimento marcado para este dia.
          </div>
        ) : (
          agenda.map((item) => {
            const accent = getAgendaServiceColor(
              item.nomeServico,
              item.servicoId,
            );

            return (
              <article
                key={item.agendamentoId}
                className="admin-agenda-item"
                style={{ "--service-accent": accent }}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(
                    `/admin/agenda/evento/${item.agendamentoId}?data=${data}`,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(
                      `/admin/agenda/evento/${item.agendamentoId}?data=${data}`,
                    );
                  }
                }}
              >
                <div className="admin-agenda-item__accent" aria-hidden="true" />
                <div className="admin-agenda-item__main">
                  <div className="admin-agenda-item__topline">
                    <strong>{item.nomeServico || "Serviço"}</strong>
                    <span>
                      <FaClock />
                      {formatAgendaTime(item.inicio)}
                      {item.fim ? ` - ${formatAgendaTime(item.fim)}` : ""}
                    </span>
                  </div>

                  <div className="admin-agenda-item__details">
                    <p>
                      <FaPaw /> {item.nomeAnimal || "Animal não informado"}
                    </p>
                    <p>
                      <FaUser />{" "}
                      {item.nomeSolicitante || "Solicitante não informado"}
                    </p>
                    <p>
                      <FaStethoscope />{" "}
                      {item.nomeVeterinario || "Veterinário não informado"}
                    </p>
                  </div>

                  {item.descricaoSolicitacao && (
                    <p className="admin-agenda-item__description">
                      {item.descricaoSolicitacao}
                    </p>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}

export default AdminAgendaDia;
