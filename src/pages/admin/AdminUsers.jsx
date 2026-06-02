import { useEffect, useMemo, useState } from "react";
import { FaBan, FaCheck, FaUserShield } from "react-icons/fa";

import {
  listAdminUsers,
  updateAdminUserPerfil,
  updateAdminUserStatus,
} from "../../api/adminApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/ToastContext";

import "../../styles/admin.css";

const PERFIL_OPTIONS = ["ADMIN", "VETERINARIO", "TUTOR"];

function AdminUsers() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [pendingStatusUser, setPendingStatusUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await listAdminUsers();
      setUsers(response);
    } catch (requestError) {
      setError("Nao foi possivel carregar os usuarios.");
      showToast("Nao foi possivel carregar os usuarios.", {
        title: "Erro",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function patchUser(id, changes) {
    setUsers((current) =>
      current.map((user) => (user.id === id ? { ...user, ...changes } : user)),
    );
  }

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      const haystack = [
        user.nome,
        user.email,
        user.cpf,
        user.telefone,
        user.perfil,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [search, users]);

  async function handleSavePerfil(user) {
    setSavingId(user.id);
    setError("");

    try {
      const updated = await updateAdminUserPerfil(user.id, user.perfil);
      patchUser(user.id, updated);
      showToast(`Perfil de ${user.nome} atualizado.`, {
        title: "Sucesso",
        variant: "success",
      });
    } catch (requestError) {
      const message = "Falha ao atualizar o perfil do usuario.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSavingId(null);
    }
  }

  function askToggleStatus(user) {
    setPendingStatusUser(user);
  }

  async function confirmToggleStatus() {
    if (!pendingStatusUser) {
      return;
    }

    const nextActive = !pendingStatusUser.ativo;
    setSavingId(pendingStatusUser.id);
    setError("");

    try {
      const updated = await updateAdminUserStatus(
        pendingStatusUser.id,
        nextActive,
      );
      patchUser(pendingStatusUser.id, updated);
      showToast(
        nextActive
          ? `${pendingStatusUser.nome} foi reativado.`
          : `${pendingStatusUser.nome} foi bloqueado.`,
        {
          title: "Sucesso",
          variant: "success",
        },
      );
      setPendingStatusUser(null);
    } catch (requestError) {
      const message = "Falha ao alterar o status do usuario.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page__hero">
        <h1>Gestao de Usuarios</h1>
        <p>Liste usuarios, altere perfis e bloqueie ou reative contas.</p>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <section className="admin-toolbar">
        <label className="admin-search">
          Buscar usuario
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, email, CPF, telefone ou perfil"
          />
        </label>
      </section>

      {loading ? (
        <div className="admin-empty">Carregando usuarios...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-empty">Nenhum usuario encontrado.</div>
      ) : (
        <section className="admin-list" aria-label="Lista de usuarios">
          {filteredUsers.map((user) => (
            <article key={user.id} className="admin-list-item admin-user-item">
              <div className="admin-user-item__top">
                <div>
                  <h2>
                    {user.nome} <span>#{user.id}</span>
                  </h2>
                  <p>{user.email}</p>
                </div>

                <span
                  className={`admin-badge ${user.ativo ? "admin-badge--success" : "admin-badge--muted"}`}
                >
                  {user.ativo ? "Ativo" : "Bloqueado"}
                </span>
              </div>

              <div className="admin-user-meta">
                <span>CPF: {user.cpf}</span>
                <span>Telefone: {user.telefone || "Nao informado"}</span>
              </div>

              <div className="admin-form-grid">
                <label>
                  Perfil
                  <select
                    value={user.perfil || "TUTOR"}
                    onChange={(event) =>
                      patchUser(user.id, { perfil: event.target.value })
                    }
                  >
                    {PERFIL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() => handleSavePerfil(user)}
                  disabled={savingId === user.id}
                >
                  <FaCheck />
                  Salvar perfil
                </button>
                <button
                  type="button"
                  className={`admin-btn ${user.ativo ? "admin-btn--warning" : "admin-btn--secondary"}`}
                  onClick={() => askToggleStatus(user)}
                  disabled={savingId === user.id}
                >
                  <FaBan />
                  {user.ativo ? "Bloquear" : "Reativar"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(pendingStatusUser)}
        title={
          pendingStatusUser?.ativo ? "Bloquear usuario" : "Reativar usuario"
        }
        description={
          pendingStatusUser
            ? `Confirma a alteração de status para ${pendingStatusUser.nome}?`
            : ""
        }
        confirmLabel={pendingStatusUser?.ativo ? "Bloquear" : "Reativar"}
        intent="danger"
        busy={Boolean(
          savingId && pendingStatusUser && savingId === pendingStatusUser.id,
        )}
        onCancel={() => setPendingStatusUser(null)}
        onConfirm={confirmToggleStatus}
      />
    </main>
  );
}

export default AdminUsers;
