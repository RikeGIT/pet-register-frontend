import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCamera,
  FaDog,
  FaPaw,
  FaSave,
  FaSignOutAlt,
  FaUserEdit,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import PawLoader from "../components/PawLoader";
import AnimalCard from "../components/AnimalCard";
import {
  getUsuario,
  listMyAnimals,
  updateAnimal,
  updateUsuario,
  uploadAnimalPhoto,
} from "../api/petApi";
import { formatCpf, formatPhone } from "../utils/formatters";

import "../styles/dashboard.css";

const SPECIES_OPTIONS = ["Cachorro", "Gato", "Coelho", "Ave"];

const DEFAULT_ANIMAL_FORM = {
  nome: "",
  especie: "Cachorro",
  raca: "",
  idade: "",
  peso: "",
  observacoes: "",
  descricaoPublica: "",
  publico: true,
  destaque: false,
  statusAdocao: "DISPONIVEL",
};

function buildProfileForm(user) {
  const storedPhone =
    localStorage.getItem("pet-register:last-user-phone") ?? "";

  return {
    nome: user?.nome ?? "",
    email: user?.email ?? "",
    cpf: formatCpf(user?.cpf ?? ""),
    telefone: formatPhone(user?.telefone ?? storedPhone),
    perfil: user?.perfil ?? "",
    senha: user?.senha ?? "",
  };
}

function buildAnimalForm(animal) {
  if (!animal) {
    return { ...DEFAULT_ANIMAL_FORM };
  }

  return {
    nome: animal.nome ?? "",
    especie: animal.especie ?? "Cachorro",
    raca: animal.raca ?? "",
    idade: animal.idade ?? "",
    peso: animal.peso ?? "",
    observacoes: animal.observacoes ?? "",
    descricaoPublica: animal.descricaoPublica ?? "",
    publico: animal.publico ?? true,
    destaque: animal.destaque ?? false,
    statusAdocao: animal.statusAdocao ?? "DISPONIVEL",
  };
}

function buildAnimalPayload(form) {
  return {
    nome: form.nome,
    especie: form.especie,
    raca: form.raca,
    idade: form.idade ? Number(form.idade) : null,
    peso: form.peso ? Number(form.peso) : null,
    observacoes: form.observacoes,
    descricaoPublica: form.descricaoPublica,
    publico: form.publico,
    destaque: form.destaque,
    statusAdocao: form.statusAdocao,
  };
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [animalSubmitting, setAnimalSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileForm, setProfileForm] = useState(() => buildProfileForm(null));
  const [selectedAnimalId, setSelectedAnimalId] = useState("");
  const [animalForm, setAnimalForm] = useState(() => buildAnimalForm(null));
  const [animalPhoto, setAnimalPhoto] = useState(null);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [animalsResponse, userResponse] = await Promise.all([
        listMyAnimals(),
        user?.id ? getUsuario(user.id) : Promise.resolve(null),
      ]);

      setAnimals(Array.isArray(animalsResponse) ? animalsResponse : []);
      setProfileForm(buildProfileForm({ ...user, ...userResponse }));
    } catch (requestError) {
      setError("Não foi possível carregar seus dados no momento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const myAnimals = useMemo(() => animals, [animals]);

  useEffect(() => {
    if (myAnimals.length === 0) {
      setSelectedAnimalId("");
      setAnimalForm(buildAnimalForm(null));
      setAnimalPhoto(null);
      return;
    }

    const stillExists = myAnimals.some(
      (animal) => String(animal.id) === String(selectedAnimalId),
    );

    if (!stillExists) {
      setSelectedAnimalId(String(myAnimals[0].id));
    }
  }, [myAnimals, selectedAnimalId]);

  const selectedAnimal = useMemo(
    () =>
      myAnimals.find(
        (animal) => String(animal.id) === String(selectedAnimalId),
      ) ?? null,
    [myAnimals, selectedAnimalId],
  );

  useEffect(() => {
    setAnimalForm(buildAnimalForm(selectedAnimal));
    setAnimalPhoto(null);
  }, [selectedAnimal?.id]);

  const quickStats = useMemo(
    () => [
      { label: "Dados do perfil", value: 3, icon: FaUserEdit },
      { label: "Animais sob sua gestão", value: myAnimals.length, icon: FaDog },
      {
        label: "Perfil autenticado",
        value: user?.perfil || "USUÁRIO",
        icon: FaPaw,
      },
    ],
    [myAnimals.length, user?.perfil],
  );

  async function handleSubmitProfile(event) {
    event.preventDefault();
    setProfileSubmitting(true);
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

      setSuccess("Seu perfil foi atualizado com sucesso.");
    } catch (requestError) {
      setError("Não foi possível atualizar seu perfil.");
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handleSubmitAnimal(event) {
    event.preventDefault();
    setAnimalSubmitting(true);
    setError("");
    setSuccess("");

    if (!selectedAnimal) {
      setError("Selecione um animal para editar.");
      setAnimalSubmitting(false);
      return;
    }

    try {
      await updateAnimal(selectedAnimal.id, buildAnimalPayload(animalForm));

      if (animalPhoto) {
        await uploadAnimalPhoto(selectedAnimal.id, animalPhoto);
      }

      await loadDashboard();
      setSuccess("Animal atualizado com sucesso.");
    } catch (requestError) {
      setError("Não foi possível atualizar o animal.");
    } finally {
      setAnimalSubmitting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
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
        <div>
          <Link to="/" className="dashboard-back-link">
            <FaArrowLeft />
            Voltar para a vitrine
          </Link>
          <p className="dashboard-eyebrow">Meu perfil</p>
          <h1>Olá, {user?.nome || "usuário"}.</h1>
          <p className="dashboard-subtitle">
            Aqui você atualiza seus dados e edita os animais que colocou para
            adoção.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Sair
        </button>
      </header>

      <section className="dashboard-stats">
        {quickStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className="dashboard-stat-card">
              <span className="dashboard-stat-card__icon">
                <Icon />
              </span>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          );
        })}
      </section>

      {error && (
        <div className="dashboard-alert dashboard-alert--error">{error}</div>
      )}
      {success && (
        <div className="dashboard-alert dashboard-alert--success">
          {success}
        </div>
      )}

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <p className="dashboard-eyebrow">Conta</p>
              <h2>Editar meus dados</h2>
            </div>
            <FaUserEdit />
          </div>

          <form className="dashboard-form" onSubmit={handleSubmitProfile}>
            <label>
              Nome
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
              Email
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
              Telefone
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

            <label>
              Perfil
              <input type="text" value={user?.perfil || "USUÁRIO"} disabled />
            </label>

            <button
              type="submit"
              className="dashboard-button"
              disabled={profileSubmitting}
            >
              <FaSave />
              {profileSubmitting ? "Salvando..." : "Salvar perfil"}
            </button>
          </form>
        </article>

        <article className="dashboard-panel dashboard-panel--animals">
          <div className="dashboard-panel__header">
            <div>
              <p className="dashboard-eyebrow">Animais</p>
              <h2>Editar animais cadastrados</h2>
            </div>
            <Link to="/pets/novo" className="dashboard-panel__link">
              Cadastrar novo
            </Link>
          </div>

          <div className="dashboard-animal-manager">
            <div className="dashboard-animal-manager__list">
              {myAnimals.length === 0 ? (
                <div className="dashboard-empty dashboard-empty--soft">
                  Você ainda não cadastrou animais para editar.
                </div>
              ) : (
                myAnimals.map((animal) => (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    featured={String(animal.id) === String(selectedAnimalId)}
                    actionLabel={
                      String(animal.id) === String(selectedAnimalId)
                        ? "Em edição"
                        : "Editar"
                    }
                    onAction={() => setSelectedAnimalId(String(animal.id))}
                  />
                ))
              )}
            </div>

            <form
              className="dashboard-form dashboard-form--animal"
              onSubmit={handleSubmitAnimal}
            >
              <div className="dashboard-panel__header dashboard-panel__header--compact">
                <div>
                  <p className="dashboard-eyebrow">Edição</p>
                  <h3>
                    {selectedAnimal
                      ? `Editando ${selectedAnimal.nome}`
                      : "Selecione um animal"}
                  </h3>
                </div>
                <FaCamera />
              </div>

              {selectedAnimal ? (
                <>
                  <label>
                    Nome
                    <input
                      type="text"
                      value={animalForm.nome}
                      onChange={(event) =>
                        setAnimalForm((current) => ({
                          ...current,
                          nome: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label>
                    Espécie
                    <select
                      value={animalForm.especie}
                      onChange={(event) =>
                        setAnimalForm((current) => ({
                          ...current,
                          especie: event.target.value,
                        }))
                      }
                    >
                      {SPECIES_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Raça
                    <input
                      type="text"
                      value={animalForm.raca}
                      onChange={(event) =>
                        setAnimalForm((current) => ({
                          ...current,
                          raca: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <div className="dashboard-form-grid">
                    <label>
                      Idade
                      <input
                        type="number"
                        min="0"
                        value={animalForm.idade}
                        onChange={(event) =>
                          setAnimalForm((current) => ({
                            ...current,
                            idade: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label>
                      Peso
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={animalForm.peso}
                        onChange={(event) =>
                          setAnimalForm((current) => ({
                            ...current,
                            peso: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>

                  <label>
                    Status de adoção
                    <select
                      value={animalForm.statusAdocao}
                      onChange={(event) =>
                        setAnimalForm((current) => ({
                          ...current,
                          statusAdocao: event.target.value,
                        }))
                      }
                    >
                      <option value="DISPONIVEL">Disponível</option>
                      <option value="EM_PROCESSO">Em processo</option>
                      <option value="RESERVADO">Reservado</option>
                      <option value="ADOTADO">Adotado</option>
                    </select>
                  </label>

                  <label>
                    Descrição pública
                    <textarea
                      rows="4"
                      value={animalForm.descricaoPublica}
                      onChange={(event) =>
                        setAnimalForm((current) => ({
                          ...current,
                          descricaoPublica: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label>
                    Observações internas
                    <textarea
                      rows="3"
                      value={animalForm.observacoes}
                      onChange={(event) =>
                        setAnimalForm((current) => ({
                          ...current,
                          observacoes: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <div className="dashboard-form-grid dashboard-form-grid--checks">
                    <label className="dashboard-check">
                      <input
                        type="checkbox"
                        checked={animalForm.publico}
                        onChange={(event) =>
                          setAnimalForm((current) => ({
                            ...current,
                            publico: event.target.checked,
                          }))
                        }
                      />
                      Publicar na vitrine
                    </label>

                    <label className="dashboard-check">
                      <input
                        type="checkbox"
                        checked={animalForm.destaque}
                        onChange={(event) =>
                          setAnimalForm((current) => ({
                            ...current,
                            destaque: event.target.checked,
                          }))
                        }
                      />
                      Marcar como destaque
                    </label>
                  </div>

                  <label>
                    Foto nova
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setAnimalPhoto(event.target.files?.[0] ?? null)
                      }
                    />
                  </label>

                  <button
                    type="submit"
                    className="dashboard-button"
                    disabled={animalSubmitting}
                  >
                    <FaSave />
                    {animalSubmitting ? "Salvando..." : "Salvar animal"}
                  </button>
                </>
              ) : (
                <div className="dashboard-empty dashboard-empty--soft">
                  Escolha um animal da lista ao lado para editar os dados.
                </div>
              )}
            </form>
          </div>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
