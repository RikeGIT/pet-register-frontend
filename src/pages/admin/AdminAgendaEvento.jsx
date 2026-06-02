import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaPaw,
  FaPhone,
  FaStethoscope,
  FaUser,
} from "react-icons/fa";

import { getAdminAgendaEvento } from "../../api/adminApi";
import {
  formatAgendaDate,
  formatAgendaDateTime,
  formatAgendaTime,
  getAgendaServiceColor,
} from "../../utils/agenda";

import "../../styles/admin.css";

function AdminAgendaEvento() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [evento, setEvento] = useState(null);

  const dataReferencia = searchParams.get("data");

  const accent = useMemo(() => {
    return getAgendaServiceColor(evento?.nomeServico, evento?.servicoId);
  }, [evento?.nomeServico, evento?.servicoId]);

  useEffect(() => {
    async function loadEvento() {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminAgendaEvento(id);
        setEvento(response);
      } catch (requestError) {
        setError("Nao foi possivel carregar os detalhes do atendimento.");
      } finally {
        setLoading(false);
      }
    }

    loadEvento();
  }, [id]);

  return (
    <main className="admin-page admin-agenda-page">
      <header className="admin-page__hero admin-agenda-page__hero">
        <div>
          <p className="admin-calendar-card__eyebrow">Detalhe do atendimento</p>
          <h1>{evento?.nomeServico || "Atendimento"}</h1>
          <p>
            {evento?.inicio
              ? `${formatAgendaDateTime(evento.inicio)} até ${formatAgendaTime(evento.fim)}`
              : "Visualização detalhada do agendamento."}
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn--secondary"
          onClick={() =>
            navigate(
              dataReferencia ? `/admin/agenda/dia/${dataReferencia}` : "/admin",
            )
          }
        >
          <FaArrowLeft />
          Voltar
        </button>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <div className="admin-agenda-empty">Carregando detalhes...</div>
      ) : evento ? (
        <section className="admin-agenda-detail">
          <article
            className="admin-agenda-detail__panel"
            style={{ "--service-accent": accent }}
          >
            <div className="admin-agenda-detail__header">
              <span
                className="admin-agenda-detail__marker"
                aria-hidden="true"
              />
              <div>
                <p className="admin-calendar-card__eyebrow">Serviço marcado</p>
                <h2>{evento.nomeServico || "Serviço"}</h2>
              </div>
            </div>

            <div className="admin-agenda-detail__grid">
              <div className="admin-agenda-detail__item">
                <FaCalendarAlt />
                <div>
                  <span>Data</span>
                  <strong>
                    {formatAgendaDate(
                      evento.inicio?.slice?.(0, 10) || dataReferencia,
                    )}
                  </strong>
                </div>
              </div>

              <div className="admin-agenda-detail__item">
                <FaClock />
                <div>
                  <span>Horário</span>
                  <strong>
                    {formatAgendaTime(evento.inicio)}
                    {evento.fim ? ` - ${formatAgendaTime(evento.fim)}` : ""}
                  </strong>
                </div>
              </div>

              <div className="admin-agenda-detail__item">
                <FaPaw />
                <div>
                  <span>Animal</span>
                  <strong>{evento.nomeAnimal || "Não informado"}</strong>
                </div>
              </div>

              <div className="admin-agenda-detail__item">
                <FaStethoscope />
                <div>
                  <span>Veterinário</span>
                  <strong>{evento.nomeVeterinario || "Não informado"}</strong>
                </div>
              </div>
            </div>
          </article>

          <aside className="admin-agenda-detail__side">
            <article className="admin-agenda-detail__card">
              <p className="admin-calendar-card__eyebrow">Solicitação</p>
              <div className="admin-agenda-detail__meta-list">
                <div>
                  <span>Tipo</span>
                  <strong>{evento.tipoSolicitacao || "Não informado"}</strong>
                </div>
                <div>
                  <span>Solicitante</span>
                  <strong>{evento.nomeSolicitante || "Não informado"}</strong>
                </div>
                <div>
                  <span>CPF</span>
                  <strong>{evento.cpfSolicitante || "Não informado"}</strong>
                </div>
                <div>
                  <span>Contato</span>
                  <strong>
                    {evento.contatoSolicitacao || "Não informado"}
                  </strong>
                </div>
                <div>
                  <span>Data preferencial</span>
                  <strong>
                    {evento.dataPreferencial
                      ? formatAgendaDate(evento.dataPreferencial)
                      : "Não informado"}
                  </strong>
                </div>
              </div>
            </article>

            <article className="admin-agenda-detail__card">
              <p className="admin-calendar-card__eyebrow">Observações</p>
              <div className="admin-agenda-detail__observations">
                {evento.descricaoSolicitacao ||
                  "Nenhuma observação foi registrada para este atendimento."}
              </div>
            </article>

            <article className="admin-agenda-detail__card">
              <p className="admin-calendar-card__eyebrow">Status</p>
              <strong className="admin-agenda-detail__status">
                {evento.status || "MARCADO"}
              </strong>
            </article>
          </aside>
        </section>
      ) : null}
    </main>
  );
}

export default AdminAgendaEvento;
