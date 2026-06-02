import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaTrash } from "react-icons/fa";

import {
  deleteAnimal,
  getPublicTaxonomias,
  listMyAnimals,
  listMySolicitacoes,
  updateAnimal,
  uploadAnimalPhoto,
} from "../../api/petApi";
import "../../styles/animal-detail.css";

const STATUS_OPTIONS = [
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "EM_PROCESSO", label: "Em processo" },
  { value: "RESERVADO", label: "Reservado" },
  { value: "ADOTADO", label: "Adotado" },
];

function normalizeAnimal(animal) {
  return {
    id: String(animal?.id ?? ""),
    nome: animal?.nome ?? "",
    especie: animal?.especie ?? "Cachorro",
    raca: animal?.raca ?? "",
    idade: animal?.idade ?? null,
    peso: animal?.peso ?? "",
    statusAdocao: animal?.statusAdocao ?? "DISPONIVEL",
    descricaoPublica: animal?.descricaoPublica ?? "",
    observacoesInternas:
      animal?.observacoesInternas ?? animal?.observacoes ?? "",
    publicarVitrine: animal?.publicarVitrine ?? animal?.publico ?? true,
    marcarDestaque: animal?.marcarDestaque ?? animal?.destaque ?? false,
    fotoUrl: animal?.fotoUrl ?? "",
  };
}

function buildUpdatePayload(animal) {
  return {
    nome: animal.nome,
    especie: animal.especie,
    raca: animal.raca,
    idade: animal.idade ? Number(animal.idade) : null,
    fotoUrl: animal.fotoUrl ?? null,
    peso: animal.peso,
    statusAdocao: animal.statusAdocao,
    descricaoPublica: animal.descricaoPublica,
    observacoes: animal.observacoesInternas,
    observacoesInternas: animal.observacoesInternas,
    publico: animal.publicarVitrine,
    publicarVitrine: animal.publicarVitrine,
    destaque: animal.marcarDestaque,
    marcarDestaque: animal.marcarDestaque,
  };
}

export default function MeusAnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialAnimal = location.state?.animal ?? null;

  const [animal, setAnimal] = useState(null);
  const [formAnimal, setFormAnimal] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");
  const [fotoArquivo, setFotoArquivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [linkedSolicitacoes, setLinkedSolicitacoes] = useState([]);
  const [taxonomias, setTaxonomias] = useState([]);

  const speciesOptions = useMemo(() => {
    const base = taxonomias.map((item) => item.nome);

    if (formAnimal?.especie && !base.includes(formAnimal.especie)) {
      return [formAnimal.especie, ...base];
    }

    return base;
  }, [formAnimal?.especie, taxonomias]);

  const breedOptions = useMemo(() => {
    const especieSelecionada = taxonomias.find(
      (item) => item.nome === formAnimal?.especie,
    );

    const base = (especieSelecionada?.racas || []).map((item) => item.nome);

    if (formAnimal?.raca && !base.includes(formAnimal.raca)) {
      return [formAnimal.raca, ...base];
    }

    return base;
  }, [formAnimal?.especie, taxonomias]);

  async function carregarAnimal() {
    setLoading(true);

    try {
      const [animalsResponse, solicitacoesResponse] = await Promise.all([
        listMyAnimals(),
        listMySolicitacoes(),
      ]);

      const listaNormalizada = Array.isArray(animalsResponse)
        ? animalsResponse.map(normalizeAnimal)
        : [];

      const solicitacoesNormalizadas = Array.isArray(solicitacoesResponse)
        ? solicitacoesResponse
        : [];

      const encontrado =
        listaNormalizada.find((item) => String(item.id) === String(id)) ??
        (initialAnimal && String(initialAnimal.id) === String(id)
          ? normalizeAnimal(initialAnimal)
          : null);

      if (!encontrado) {
        setAnimal(null);
        setFormAnimal(null);
        setPreviewFoto("");
        return;
      }

      const display = {
        ...encontrado,
        idade: encontrado.idade ?? null,
      };

      setAnimal(encontrado);
      setFormAnimal(display);
      setPreviewFoto(encontrado.fotoUrl);
      setLinkedSolicitacoes(
        solicitacoesNormalizadas.filter(
          (solicitacao) =>
            String(solicitacao?.animalId ?? solicitacao?.animal?.id ?? "") ===
            String(id),
        ),
      );
    } catch (error) {
      console.error("Erro ao carregar animal:", error);
      setAnimal(null);
      setFormAnimal(null);
      setPreviewFoto("");
      setLinkedSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAnimal();
  }, [id]);

  useEffect(() => {
    async function carregarTaxonomias() {
      try {
        const response = await getPublicTaxonomias();
        setTaxonomias(Array.isArray(response) ? response : []);
      } catch (error) {
        setTaxonomias([]);
      }
    }

    carregarTaxonomias();
  }, []);

  function handleChange(event) {
    if (!formAnimal) return;

    const { name, value, type, checked } = event.target;

    setFormAnimal((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Preserve existing fotoUrl if present and not being overwritten
      if (!updated.fotoUrl && prev?.fotoUrl) {
        updated.fotoUrl = prev.fotoUrl;
      }

      // Ensure previewFoto remains if available
      if (
        !updated.previewFoto &&
        typeof previewFoto === "string" &&
        previewFoto
      ) {
        // keep previewFoto state as the source of truth for displayed image
      }

      return updated;
    });
  }

  function handleFotoChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      setFotoArquivo(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  }

  function handleCancel() {
    if (!animal) return;

    setFormAnimal(animal);
    setPreviewFoto(animal.fotoUrl);
    setFotoArquivo(null);
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!formAnimal) return;

    try {
      setSaving(true);
      await updateAnimal(formAnimal.id, buildUpdatePayload(formAnimal));

      if (fotoArquivo) {
        await uploadAnimalPhoto(formAnimal.id, fotoArquivo);
      }

      await carregarAnimal();
      setFotoArquivo(null);
      alert(`Dados de ${formAnimal.nome} atualizados com sucesso!`);
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      alert("Erro ao salvar os dados do animal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!formAnimal) return;

    if (linkedSolicitacoes.length > 0) {
      alert(
        "Este animal possui solicitações vinculadas. Exclua ou encerre essas solicitações antes de remover o animal.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${formAnimal.nome}? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteAnimal(formAnimal.id);
      navigate("/meus-animais", { replace: true });
    } catch (error) {
      console.error("Erro ao excluir animal:", error);
      const backendMessage = String(
        error?.response?.data?.message ?? error?.message ?? "",
      );
      if (
        backendMessage.includes("foreign key constraint") ||
        backendMessage.includes("Cannot delete or update a parent row")
      ) {
        alert(
          "Não foi possível excluir porque existem solicitações ligadas a este animal.",
        );
        return;
      }

      alert("Não foi possível excluir este animal.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="animal-detail-page">
        <div className="animal-detail-inner">
          <p>Carregando animal...</p>
        </div>
      </main>
    );
  }

  if (!animal || !formAnimal) {
    return (
      <main className="animal-detail-page">
        <div className="animal-detail-inner">
          <button
            className="back-link"
            onClick={() => navigate("/meus-animais")}
          >
            <FaArrowLeft />
            Voltar
          </button>
          <div className="animal-panel">
            <p>Animal não encontrado.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="animal-detail-page">
      <div className="animal-detail-inner">
        <button className="back-link" onClick={() => navigate("/meus-animais")}>
          <FaArrowLeft />
          Voltar para meus animais
        </button>

        <section className="animal-hero animal-hero--editable">
          <div className="animal-hero__media">
            {previewFoto || formAnimal?.fotoUrl ? (
              <img
                src={previewFoto || formAnimal?.fotoUrl}
                alt={formAnimal.nome}
              />
            ) : (
              <div className="animal-hero__placeholder">
                <span>Sem foto disponível</span>
              </div>
            )}
          </div>

          <div className="animal-hero__content">
            <div className="animal-hero__topline">
              <span className="animal-badge animal-badge--status">
                Edição do cadastro
              </span>
            </div>

            <div className="animal-hero__title-row">
              <div>
                <p className="animal-eyebrow">Editar animal</p>
                <h1>{formAnimal.nome}</h1>
                <p className="animal-subtitle">
                  {formAnimal.especie || "Animal"} •{" "}
                  {formAnimal.raca || "Raça não informada"}
                </p>
              </div>
            </div>

            <div className="animal-hero__actions">
              <button
                type="submit"
                form="animal-edit-form"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar edição
              </button>
            </div>
          </div>
        </section>

        <section className="animal-detail-layout animal-detail-layout--editable">
          <div className="animal-detail-main">
            <article className="animal-panel">
              <p className="animal-panel__eyebrow">Dados editáveis</p>
              <h2>Informações do animal</h2>

              <form
                id="animal-edit-form"
                className="animal-edit-form"
                onSubmit={handleSave}
              >
                <div className="animal-edit-photo">
                  <img
                    src={
                      previewFoto ||
                      formAnimal?.fotoUrl ||
                      "https://via.placeholder.com/600x420?text=Pet"
                    }
                    alt={formAnimal.nome}
                    className="animal-edit-photo__image"
                  />
                  <div className="animal-edit-photo__content">
                    <label className="animal-edit-label">Foto do animal</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="animal-edit-input"
                    />
                    <p className="animal-edit-help">
                      Selecione uma nova imagem para substituir a atual.
                    </p>
                  </div>
                </div>

                <div className="animal-edit-grid">
                  <label className="animal-edit-field">
                    <span>Nome</span>
                    <input
                      type="text"
                      name="nome"
                      value={formAnimal.nome}
                      onChange={handleChange}
                      className="animal-edit-input"
                    />
                  </label>

                  <label className="animal-edit-field">
                    <span>Espécie</span>
                    <select
                      name="especie"
                      value={formAnimal.especie}
                      onChange={(event) => {
                        const selectedEspecie = event.target.value;
                        setFormAnimal((current) => ({
                          ...current,
                          especie: selectedEspecie,
                          raca: "",
                        }));
                      }}
                      className="animal-edit-input"
                    >
                      {speciesOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="animal-edit-field">
                    <span>Raça</span>
                    <select
                      name="raca"
                      value={formAnimal.raca}
                      onChange={handleChange}
                      className="animal-edit-input"
                    >
                      <option value="">Selecione uma raça</option>
                      {breedOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="animal-edit-field">
                    <span>Idade (anos)</span>
                    <input
                      type="number"
                      min="0"
                      name="idade"
                      value={formAnimal.idade ?? ""}
                      onChange={handleChange}
                      className="animal-edit-input"
                    />
                  </label>

                  <label className="animal-edit-field">
                    <span>Peso</span>
                    <input
                      type="text"
                      name="peso"
                      value={formAnimal.peso}
                      onChange={handleChange}
                      className="animal-edit-input"
                    />
                  </label>

                  <label className="animal-edit-field">
                    <span>Status de adoção</span>
                    <select
                      name="statusAdocao"
                      value={formAnimal.statusAdocao}
                      onChange={handleChange}
                      className="animal-edit-input"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="animal-edit-field">
                  <span>Descrição pública</span>
                  <textarea
                    name="descricaoPublica"
                    rows={4}
                    value={formAnimal.descricaoPublica}
                    onChange={handleChange}
                    className="animal-edit-textarea"
                  />
                </label>

                <label className="animal-edit-field">
                  <span>Observações internas</span>
                  <textarea
                    name="observacoesInternas"
                    rows={4}
                    value={formAnimal.observacoesInternas}
                    onChange={handleChange}
                    className="animal-edit-textarea"
                  />
                </label>

                <div className="animal-edit-switches">
                  <label className="animal-edit-check">
                    <input
                      type="checkbox"
                      name="publicarVitrine"
                      checked={!!formAnimal.publicarVitrine}
                      onChange={handleChange}
                    />
                    Publicar na vitrine
                  </label>
                  <label className="animal-edit-check">
                    <input
                      type="checkbox"
                      name="marcarDestaque"
                      checked={!!formAnimal.marcarDestaque}
                      onChange={handleChange}
                    />
                    Marcar como destaque
                  </label>
                </div>
              </form>
            </article>
          </div>

          <aside className="animal-detail-sidebar">
            <div className="animal-contact-card animal-contact-card--actions">
              <p className="animal-panel__eyebrow">Ações</p>
              <h2>Gerenciar cadastro</h2>
              <p className="animal-contact-card__text">
                Salve as alterações quando terminar ou exclua o animal se ele
                não fizer mais parte do seu cadastro.
              </p>

              {linkedSolicitacoes.length > 0 && (
                <div className="animal-edit-warning">
                  <strong>Exclusão bloqueada</strong>
                  <span>
                    Existem {linkedSolicitacoes.length} solicitação(ões)
                    vinculada(s) a este animal.
                  </span>
                </div>
              )}

              <button
                type="submit"
                form="animal-edit-form"
                className="btn btn-primary btn-block"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar edição
              </button>
              <button
                type="button"
                className="btn btn-danger btn-block"
                onClick={handleDelete}
                disabled={saving || deleting || linkedSolicitacoes.length > 0}
              >
                <FaTrash />
                {deleting ? "Excluindo..." : "Excluir animal"}
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
