import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaLock,
  FaSave,
  FaShieldAlt,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import PawLoader from "../../components/PawLoader";
import { getUsuario, updateUsuario } from "../../api/petApi";
import { formatCpf, formatPhone } from "../../utils/formatters";

import "../../styles/dashboard.css";

function buildProfileForm(user) {
  const storedPhone =
    localStorage.getItem("pet-register:last-user-phone") ?? "";

  return {
    nome: user?.nome ?? "",
    email: user?.email ?? "",
    cpf: formatCpf(user?.cpf ?? ""),
    telefone: formatPhone(user?.telefone ?? storedPhone),
    perfil: user?.perfil ?? "USUARIO",
    bio: user?.bio ?? "",
    senha: user?.senha ?? "",
  };
}

function getMembershipText(user) {
  const candidate = user?.createdAt ?? user?.dataCriacao ?? user?.created_at;
  if (!candidate) return "Membro desde a criação da conta";

  const date = new Date(candidate);
  if (Number.isNaN(date.getTime())) return "Membro desde a criação da conta";

  return `Membro desde ${date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })}`;
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileForm, setProfileForm] = useState(() => buildProfileForm(null));

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const userResponse = user?.id ? await getUsuario(user.id) : null;
      setProfileForm(buildProfileForm({ ...user, ...userResponse }));
    } catch (requestError) {
      setError("Nao foi possivel carregar seus dados no momento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const lastUpdateText = useMemo(() => {
    return `Hoje as ${new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }, [success]);

  const profileTypeLabel = useMemo(() => {
    return profileForm.perfil || user?.perfil || "Usuario";
  }, [profileForm.perfil, user?.perfil]);

  const membershipText = useMemo(
    () => getMembershipText({ ...user, ...profileForm }),
    [user, profileForm],
  );

  async function handleSubmitProfile(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await updateUsuario(user.id, {
        nome: profileForm.nome,
        email: profileForm.email,
        cpf: profileForm.cpf,
        telefone: profileForm.telefone,
        perfil: profileForm.perfil,
        senha: profileForm.senha,
      });

      if (typeof refreshUser === "function") {
        await refreshUser();
      }

      setSuccess("Suas informacoes foram atualizadas com sucesso.");
    } catch (requestError) {
      setError("Nao foi possivel atualizar seu perfil.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleChangePassword() {
    navigate("/register");
  }

  if (loading) {
    return (
      <div className="dashboard-page dashboard-page--loading">
        <PawLoader label="Carregando seu perfil..." />
      </div>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <h1>Ola, {profileForm.nome || user?.nome || "Usuario"}</h1>
          <p>
            Mantenha suas informacoes pessoais e de contato sempre atualizadas
            para facilitar a comunicacao.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Sair da conta
        </button>
      </header>

      <section className="dashboard-overview" aria-label="Resumo da conta">
        <article className="dashboard-overview-card">
          <span className="dashboard-overview-card__icon dashboard-overview-card__icon--mint">
            <FaUser />
          </span>
          <div>
            <p>Tipo de Conta</p>
            <strong>{profileTypeLabel}</strong>
          </div>
        </article>

        <article className="dashboard-overview-card">
          <span className="dashboard-overview-card__icon dashboard-overview-card__icon--peach">
            <FaClock />
          </span>
          <div>
            <p>Ultima atualizacao</p>
            <strong>{lastUpdateText}</strong>
          </div>
        </article>

        <article className="dashboard-overview-card">
          <span className="dashboard-overview-card__icon dashboard-overview-card__icon--emerald">
            <FaCheckCircle />
          </span>
          <div>
            <p>Status da Conta</p>
            <strong>Verificado por Pet Register</strong>
          </div>
        </article>
      </section>

      {error && (
        <div className="dashboard-alert dashboard-alert--error">{error}</div>
      )}
      {success && (
        <div className="dashboard-alert dashboard-alert--success">
          {success}
        </div>
      )}

      <section className="dashboard-profile-card">
        <aside className="dashboard-profile-side">
          <div className="dashboard-avatar-wrap">
            <div className="dashboard-avatar" aria-hidden="true">
              <FaUser />
            </div>
            <button
              type="button"
              className="dashboard-avatar-edit"
              aria-label="Trocar foto de perfil"
            >
              <FaCamera />
            </button>
          </div>

          <h2>{profileForm.nome || "Usuario"}</h2>
          <p>{membershipText}</p>

          <div className="dashboard-side-list">
            <div>
              <FaShieldAlt />
              <span>Seguranca da conta: Alta</span>
            </div>
            <div>
              <FaEnvelope />
              <span>{profileForm.email || "email@exemplo.com"}</span>
            </div>
          </div>
        </aside>

        <article className="dashboard-profile-main">
          <h3>Editar meus dados</h3>

          <form className="dashboard-form" onSubmit={handleSubmitProfile}>
            <label>
              Nome completo
              <input
                type="text"
                value={profileForm.nome}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    nome: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              Endereco de e-mail
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
              />
            </label>

            <div className="dashboard-form-row">
              <label>
                CPF
                <input
                  type="text"
                  value={profileForm.cpf}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      cpf: formatCpf(event.target.value),
                    }))
                  }
                  placeholder="000.000.000-00"
                  required
                />
              </label>

              <label>
                Telefone para contato
                <input
                  type="text"
                  value={profileForm.telefone}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      telefone: formatPhone(event.target.value),
                    }))
                  }
                  placeholder="(11) 99999-9999"
                />
              </label>
            </div>

            <label>
              Biografia (Opcional)
              <textarea
                rows={4}
                value={profileForm.bio}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
                placeholder="Conte um pouco sobre voce..."
              />
            </label>

            <div className="dashboard-form-actions">
              <button
                type="submit"
                className="dashboard-button dashboard-button--primary"
                disabled={submitting}
              >
                <FaSave />
                {submitting ? "Salvando..." : "Salvar alteracoes"}
              </button>

              <button
                type="button"
                className="dashboard-button dashboard-button--ghost"
                onClick={loadDashboard}
                disabled={submitting}
              >
                Descartar
              </button>
            </div>
          </form>
        </article>
      </section>

      <section
        className="dashboard-security-card"
        aria-label="Seguranca da conta"
      >
        <div className="dashboard-security-card__icon">
          <FaLock />
        </div>
        <div>
          <h4>Deseja alterar sua senha?</h4>
          <p>Mantenha sua conta protegida alterando sua senha regularmente.</p>
        </div>
        <button
          type="button"
          className="dashboard-security-card__button"
          onClick={handleChangePassword}
        >
          Alterar Senha
        </button>
      </section>
    </main>
  );
}

export default Dashboard;
