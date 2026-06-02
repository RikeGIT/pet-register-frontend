import { useCallback, useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaCheck,
  FaClock,
  FaTimes,
  FaTimesCircle,
} from "react-icons/fa";

import {
  listAdminSolicitacoes,
  updateAdminSolicitacaoStatus,
} from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";

import "../../styles/admin.css";

const HORARIOS_DISPONIVEIS = [
  { label: "08:00", value: "08:00" },
  { label: "09:00", value: "09:00" },
  { label: "10:00", value: "10:00" },
  { label: "11:00", value: "11:00" },
  { label: "14:00", value: "14:00" },
  { label: "15:00", value: "15:00" },
  { label: "16:00", value: "16:00" },
  { label: "17:00", value: "17:00" },
];

function normalizeStatus(status) {
  if (!status) {
    return "PENDENTE";
  }

  return status === "EM_ANALISE" ? "MARCADO" : status;
}

function shouldShowSolicitacao(item, variant) {
  const status = normalizeStatus(item.status);

  if (variant === "negadas") {
    return status === "REPROVADO";
  }

  return status === "PENDENTE" || status === "MARCADO";
}

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

function parseDescricao(item) {
  const descricaoRobusta = item?.descricao || "";
  const separatorPattern = /\s*(?:\r?\n){1,}\s*Observa\S*es\s*:\s*/i;
  const descriptionPrefix = /^Descri\S*o:\s*/i;
  const partesDescricao = descricaoRobusta.split(separatorPattern);

  if (partesDescricao.length > 1) {
    return {
      sintomas: partesDescricao[0].replace(descriptionPrefix, "").trim(),
      observacoes: partesDescricao.slice(1).join("\n\n").trim(),
    };
  }

  const descricao = item?.descricao || "";
  const separator = "\n\nObservaÃ§Ãµes:";

  if (!descricao.includes(separator)) {
    return {
      sintomas: descricao.trim(),
      observacoes: "",
    };
  }

  const [sintomasParte, observacoesParte] = descricao.split(separator);

  return {
    sintomas: sintomasParte.replace(/^DescriÃ§Ã£o:\s*/i, "").trim(),
    observacoes: observacoesParte.trim(),
  };
}

function AdminSolicitacoes({ variant = "pendentes" }) {
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    data: getTodayValue(),
    horario: "",
  });

  const loadSolicitacoes = useCallback(async () => {
    try {
      const response = await listAdminSolicitacoes();
      setSolicitacoes(
        (Array.isArray(response) ? response : []).filter(
          (item) => shouldShowSolicitacao(item, variant),
        ),
      );
      setError("");
    } catch {
      setError("Nao foi possivel carregar as solicitacoes.");
      showToast("Nao foi possivel carregar as solicitacoes.", {
        title: "Erro",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast, variant]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadSolicitacoes();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSolicitacoes]);

  function patchSolicitacao(id, changes) {
    setSolicitacoes((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }

  async function handleReviewAction(item, status) {
    setSavingId(item.id);
    setError("");

    try {
      await updateAdminSolicitacaoStatus(item.id, status);

      if (status === "REPROVADO") {
        setSolicitacoes((current) =>
          current.filter((solicitacao) => solicitacao.id !== item.id),
        );
        showToast(`Solicitacao #${item.id} reprovada e removida da lista.`, {
          title: "Sucesso",
          variant: "success",
        });
      } else {
        patchSolicitacao(item.id, { status });
        showToast(`Solicitacao #${item.id} marcada para analise.`, {
          title: "Sucesso",
          variant: "success",
        });
      }
    } catch {
      const message =
        status === "REPROVADO"
          ? "Falha ao reprovar a solicitacao."
          : "Falha ao marcar a solicitacao para analise.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSavingId(null);
    }
  }

  function openScheduleModal(item) {
    setScheduleModal(item);
    setScheduleForm({
      data: getTodayValue(),
      horario: "",
    });
  }

  function closeScheduleModal() {
    if (savingId) {
      return;
    }

    setScheduleModal(null);
    setScheduleForm({
      data: getTodayValue(),
      horario: "",
    });
  }

  async function handleApprove(event) {
    event.preventDefault();

    if (!scheduleModal) {
      return;
    }

    setSavingId(scheduleModal.id);
    setError("");

    try {
      await updateAdminSolicitacaoStatus(
        scheduleModal.id,
        "APROVADO",
        scheduleForm.horario,
        scheduleForm.data,
      );
      setSolicitacoes((current) =>
        current.filter((item) => item.id !== scheduleModal.id),
      );
      showToast(`Solicitacao #${scheduleModal.id} aprovada e agendada.`, {
        title: "Sucesso",
        variant: "success",
      });
      setScheduleModal(null);
      setScheduleForm({
        data: getTodayValue(),
        horario: "",
      });
    } catch {
      const message = "Falha ao aprovar e agendar a solicitacao.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page__hero">
        <h1>
          {variant === "negadas"
            ? "Solicitacoes negadas"
            : "Solicitacoes pendentes"}
        </h1>
        <p>
          {variant === "negadas"
            ? "Consulte pedidos reprovados pela moderacao."
            : "Analise pedidos pendentes e encaminhe atendimentos aprovados."}
        </p>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <div className="admin-empty">Carregando solicitacoes...</div>
      ) : solicitacoes.length === 0 ? (
        <div className="admin-empty">
          {variant === "negadas"
            ? "Nenhuma solicitacao negada encontrada."
            : "Nenhuma solicitacao pendente encontrada."}
        </div>
      ) : (
        <section className="admin-list" aria-label="Lista de solicitacoes">
          {solicitacoes.map((item) => {
            const status = normalizeStatus(item.status);
            const { sintomas, observacoes } = parseDescricao(item);

            return (
              <article key={item.id} className="admin-list-item">
                <div className="admin-solicitacao-card-top">
                  <div className="admin-list-item__header">
                    <h2>
                      Solicitacao #{item.id} <span>Pet #{item.animalId}</span>
                    </h2>
                    <p>
                      {item.nomeAnimal}
                      {item.nomeServico ? ` - ${item.nomeServico}` : ""}
                    </p>
                  </div>

                  <div className="admin-solicitacao-card-top__right">
                    <span
                      className={`admin-badge ${
                        status === "APROVADO"
                          ? "admin-badge--success"
                          : "admin-badge--muted"
                      }`}
                    >
                      {status}
                    </span>

                    {variant !== "negadas" && (
                      <div
                        className="admin-status-actions"
                        aria-label="Acoes de status"
                      >
                        <button
                          type="button"
                          className="admin-status-action admin-status-action--danger"
                          onClick={() => handleReviewAction(item, "REPROVADO")}
                          disabled={savingId === item.id}
                          aria-label={`Reprovar solicitacao #${item.id}`}
                          title="Reprovar"
                        >
                          <FaTimesCircle />
                        </button>
                        <button
                          type="button"
                          className="admin-status-action admin-status-action--pending"
                          onClick={() => handleReviewAction(item, "EM_ANALISE")}
                          disabled={savingId === item.id}
                          aria-label={`Marcar solicitacao #${item.id} para analise`}
                          title="Marcar para analise"
                        >
                          <FaClock />
                        </button>
                        <button
                          type="button"
                          className="admin-status-action admin-status-action--success"
                          onClick={() => openScheduleModal(item)}
                          disabled={savingId === item.id}
                          aria-label={`Aprovar e agendar solicitacao #${item.id}`}
                          title="Aprovar e agendar"
                        >
                          <FaCalendarCheck />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-solicitacao-layout">
                  <div className="admin-solicitacao-panel">
                    <span className="admin-solicitacao-panel__label">
                      Servico
                    </span>
                    <strong>{item.nomeServico || "Nao informado"}</strong>
                    <small>
                      {item.servicoId
                        ? `ID ${item.servicoId}`
                        : "Servico sem identificador"}
                    </small>
                  </div>

                  <div className="admin-solicitacao-panel">
                    <span className="admin-solicitacao-panel__label">
                      Cliente
                    </span>
                    <strong>{item.nomeUsuario || "Nao informado"}</strong>
                    <small>
                      {item.cpfUsuario
                        ? `CPF ${item.cpfUsuario}`
                        : "CPF nao informado"}
                    </small>
                  </div>

                  <div className="admin-solicitacao-panel">
                    <span className="admin-solicitacao-panel__label">
                      Contato
                    </span>
                    <strong>{item.contato || "Nao informado"}</strong>
                    <small>{status}</small>
                  </div>
                </div>

                <div className="admin-solicitacao-text">
                  <div className="admin-solicitacao-text__block">
                    <span>Descricao</span>
                    <p>{sintomas || "Sem descricao."}</p>
                  </div>

                  <div className="admin-solicitacao-text__block">
                    <span>Observacoes</span>
                    <p>{observacoes || "Nenhuma observacao informada."}</p>
                  </div>
                </div>

              </article>
            );
          })}
        </section>
      )}

      {scheduleModal && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={closeScheduleModal}
        >
          <section
            className="admin-modal admin-modal--schedule"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-schedule-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal__header">
              <div>
                <h2 id="admin-schedule-modal-title">Agendar atendimento</h2>
                <p>
                  {scheduleModal.nomeAnimal || "Pet"} -{" "}
                  {scheduleModal.nomeServico || "Servico"}
                </p>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={closeScheduleModal}
                disabled={savingId === scheduleModal.id}
                aria-label="Fechar agendamento"
              >
                <FaTimes />
              </button>
            </div>

            <form className="admin-schedule-form" onSubmit={handleApprove}>
              <label>
                Dia do atendimento
                <input
                  type="date"
                  min={getTodayValue()}
                  value={scheduleForm.data}
                  onChange={(event) =>
                    setScheduleForm((current) => ({
                      ...current,
                      data: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label>
                Horario
                <select
                  value={scheduleForm.horario}
                  onChange={(event) =>
                    setScheduleForm((current) => ({
                      ...current,
                      horario: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Selecione um horario</option>
                  <optgroup label="Manha">
                    {HORARIOS_DISPONIVEIS.filter((option) =>
                      ["08:00", "09:00", "10:00", "11:00"].includes(
                        option.value,
                      ),
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tarde">
                    {HORARIOS_DISPONIVEIS.filter((option) =>
                      ["14:00", "15:00", "16:00", "17:00"].includes(
                        option.value,
                      ),
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>

              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={closeScheduleModal}
                  disabled={savingId === scheduleModal.id}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={savingId === scheduleModal.id}
                >
                  <FaCheck />
                  Confirmar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminSolicitacoes;
