import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck, FaPlus, FaSearch, FaTimes, FaTrash } from "react-icons/fa";

import {
  createAdminServico,
  deleteAdminServico,
  listAdminServicos,
  updateAdminServico,
} from "../../api/adminApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/ToastContext";

import "../../styles/admin.css";

const EMPTY_FORM = {
  nome: "",
  descricao: "",
  preco: "",
  duracaoMinutos: "",
  ativo: true,
};

function normalizeServico(servico) {
  return {
    id: servico.id,
    nome: servico.nome ?? "",
    descricao: servico.descricao ?? "",
    preco: servico.preco ?? "",
    duracaoMinutos: servico.duracaoMinutos ?? "",
    ativo: Boolean(servico.ativo),
  };
}

function AdminServices() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [servicos, setServicos] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    nome: "",
    status: "todos",
  });

  const filteredServicos = useMemo(() => {
    const normalizedName = filters.nome.trim().toLowerCase();

    return servicos.filter((servico) => {
      const matchesName = normalizedName
        ? servico.nome.toLowerCase().includes(normalizedName)
        : true;
      const matchesStatus =
        filters.status === "todos"
          ? true
          : servico.ativo === (filters.status === "ativo");

      return matchesName && matchesStatus;
    });
  }, [filters, servicos]);

  const loadServicos = useCallback(async () => {
    try {
      const response = await listAdminServicos();
      setServicos(
        (Array.isArray(response) ? response : []).map(normalizeServico),
      );
      setError("");
    } catch {
      const message = "Nao foi possivel carregar os servicos.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadServicos();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadServicos]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function closeFormModal() {
    if (saving) {
      return;
    }

    resetForm();
    setFormModalOpen(false);
  }

  function beginCreate() {
    resetForm();
    setFormModalOpen(true);
  }

  function beginEdit(servico) {
    setEditingId(servico.id);
    setForm({
      nome: servico.nome,
      descricao: servico.descricao,
      preco: servico.preco,
      duracaoMinutos: servico.duracaoMinutos,
      ativo: servico.ativo,
    });
    setFormModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      preco: form.preco === "" ? null : Number(form.preco),
      duracaoMinutos:
        form.duracaoMinutos === "" ? null : Number(form.duracaoMinutos),
      ativo: form.ativo,
    };

    try {
      const response = editingId
        ? await updateAdminServico(editingId, payload)
        : await createAdminServico(payload);

      const normalized = normalizeServico(response);
      setServicos((current) =>
        editingId
          ? current.map((item) => (item.id === editingId ? normalized : item))
          : [...current, normalized],
      );

      showToast(
        editingId
          ? "Servico atualizado com sucesso."
          : "Servico cadastrado com sucesso.",
        { title: "Sucesso", variant: "success" },
      );
      resetForm();
      setFormModalOpen(false);
    } catch {
      const message = editingId
        ? "Falha ao atualizar o servico."
        : "Falha ao cadastrar o servico.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteAdminServico(pendingDelete.id);
      setServicos((current) =>
        current.filter((item) => item.id !== pendingDelete.id),
      );
      showToast("Servico removido com sucesso.", {
        title: "Sucesso",
        variant: "success",
      });
      setPendingDelete(null);
    } catch {
      const message = "Nao foi possivel remover o servico.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page__hero">
        <h1>Servicos</h1>
        <p>
          Cadastre, atualize e publique os servicos disponiveis para
          atendimento.
        </p>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <section className="admin-card admin-card--full admin-service-toolbar">
        <div className="admin-service-filters" aria-label="Filtros de servicos">
          <label className="admin-search admin-service-search">
            Nome
            <span className="admin-input-icon">
              <FaSearch aria-hidden="true" />
              <input
                type="search"
                value={filters.nome}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    nome: event.target.value,
                  }))
                }
                placeholder="Buscar por nome"
              />
            </span>
          </label>
          <label className="admin-search admin-service-status">
            Status
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              <option value="todos">Ativos e inativos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </label>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={beginCreate}
          disabled={saving}
        >
          <FaPlus />
          Adicionar
        </button>
      </section>

      {loading ? (
        <div className="admin-empty">Carregando servicos...</div>
      ) : servicos.length === 0 ? (
        <div className="admin-empty">Nenhum servico cadastrado.</div>
      ) : filteredServicos.length === 0 ? (
        <div className="admin-empty">Nenhum servico encontrado.</div>
      ) : (
        <section className="admin-list" aria-label="Lista de servicos">
          {filteredServicos.map((servico) => (
            <article key={servico.id} className="admin-list-item">
              <div className="admin-list-item__header admin-list-item__header--split">
                <div>
                  <h2>
                    {servico.nome} <span>#{servico.id}</span>
                  </h2>
                  <p>{servico.descricao || "Sem descricao."}</p>
                </div>
                <span
                  className={`admin-badge ${servico.ativo ? "admin-badge--success" : "admin-badge--muted"}`}
                >
                  {servico.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="admin-user-meta">
                <span>
                  Preco:{" "}
                  {servico.preco !== null && servico.preco !== undefined
                    ? `R$ ${Number(servico.preco).toFixed(2)}`
                    : "Nao informado"}
                </span>
                <span>Duracao: {servico.duracaoMinutos || 0} min</span>
              </div>

              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() => beginEdit(servico)}
                  disabled={saving}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => setPendingDelete(servico)}
                  disabled={saving}
                >
                  <FaTrash />
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {formModalOpen && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={closeFormModal}
        >
          <section
            className="admin-modal admin-modal--service-form"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-service-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal__header">
              <div>
                <h2 id="admin-service-modal-title">
                  {editingId ? "Editar servico" : "Adicionar servico"}
                </h2>
                <p>
                  {editingId
                    ? "Atualize as informacoes do servico selecionado."
                    : "Preencha os dados para publicar um novo servico."}
                </p>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={closeFormModal}
                disabled={saving}
                aria-label="Fechar formulario"
              >
                <FaTimes />
              </button>
            </div>

            <form className="admin-service-form" onSubmit={handleSubmit}>
              <label>
                Nome do servico
                <input
                  type="text"
                  value={form.nome}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nome: event.target.value,
                    }))
                  }
                  placeholder="Ex.: Consulta clinica"
                  required
                />
              </label>
              <label>
                Descricao
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      descricao: event.target.value,
                    }))
                  }
                  placeholder="Resumo exibido ao tutor"
                />
              </label>
              <div className="admin-service-form__row">
                <label>
                  Preco
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.preco}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        preco: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </label>
                <label>
                  Duracao (min)
                  <input
                    type="number"
                    min="0"
                    value={form.duracaoMinutos}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        duracaoMinutos: event.target.value,
                      }))
                    }
                    placeholder="60"
                  />
                </label>
              </div>
              <label className="admin-checkbox admin-checkbox--boxed">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ativo: event.target.checked,
                    }))
                  }
                />
                Ativo
              </label>
              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={closeFormModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={saving}
                >
                  {editingId ? <FaCheck /> : <FaPlus />}
                  {editingId ? "Salvar alteracoes" : "Adicionar servico"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Excluir servico"
        description={pendingDelete ? `Deseja excluir ${pendingDelete.nome}?` : ""}
        confirmLabel="Excluir"
        intent="danger"
        busy={saving}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}

export default AdminServices;
