import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaw,
  FaPhone,
  FaShareAlt,
  FaShieldAlt,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import PawLoader from "../../components/PawLoader";
import { getUsuario } from "../../api/petApi";
import { getPublicAnimalById } from "../../api/portalApi";
import "../../styles/animal-detail.css";
import { formatAgeDisplay } from "../../utils/formatters";

function mapStatusLabel(status) {
  const normalized = (status || "DISPONIVEL").toString().toUpperCase();

  const labels = {
    DISPONIVEL: "Disponível para adoção",
    EM_PROCESSO: "Em processo de adoção",
    RESERVADO: "Reservado",
    ADOTADO: "Adotado",
  };

  return labels[normalized] || normalized.replaceAll("_", " ");
}

function formatWeight(weight) {
  if (weight === null || weight === undefined || weight === "")
    return "Peso não informado";

  const numericWeight = Number(weight);
  if (Number.isNaN(numericWeight)) return String(weight);

  return `${numericWeight.toLocaleString("pt-BR")} kg`;
}

function getOwnerName(tutor) {
  if (!tutor) return "Equipe responsável";

  return (
    tutor.nome ||
    tutor.razaoSocial ||
    tutor.nomeFantasia ||
    "Equipe responsável"
  );
}

function getTutorContact(tutor) {
  if (!tutor) return "";

  return (
    tutor.telefone ||
    tutor.celular ||
    tutor.whatsapp ||
    tutor.fone ||
    tutor.phone ||
    ""
  );
}

function resolveTutor(animal) {
  const rawTutor = animal?.tutor || animal?.usuario || null;

  const tutor = rawTutor
    ? {
        ...rawTutor,
        nome:
          rawTutor.nome ||
          rawTutor.razaoSocial ||
          rawTutor.nomeFantasia ||
          rawTutor.tutorNome ||
          rawTutor.nomeCompleto ||
          "",
        telefone:
          rawTutor.telefone ||
          rawTutor.celular ||
          rawTutor.whatsapp ||
          rawTutor.fone ||
          rawTutor.phone ||
          "",
        email: rawTutor.email || rawTutor.emailContato || "",
        endereco:
          rawTutor.endereco ||
          rawTutor.localizacao ||
          rawTutor.enderecoCompleto ||
          "",
      }
    : {
        id: animal?.tutorId ?? animal?.usuarioId ?? null,
        nome:
          animal?.tutorNome ||
          animal?.usuarioNome ||
          animal?.responsavelNome ||
          "",
        telefone:
          animal?.tutorTelefone ||
          animal?.usuarioTelefone ||
          animal?.responsavelTelefone ||
          "",
        email:
          animal?.tutorEmail ||
          animal?.usuarioEmail ||
          animal?.responsavelEmail ||
          "",
        endereco:
          animal?.tutorEndereco ||
          animal?.usuarioEndereco ||
          animal?.localizacao ||
          animal?.responsavelEndereco ||
          "",
        perfil:
          animal?.tutorPerfil || animal?.usuarioPerfil || "ONG / responsável",
      };

  return tutor.nome ||
    tutor.telefone ||
    tutor.email ||
    tutor.endereco ||
    tutor.id
    ? tutor
    : null;
}

function ContactModal({ tutor, onClose }) {
  const tutorPhone = getTutorContact(tutor);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <FaTimes />
        </button>
        <p className="modal-eyebrow">Contato para adoção</p>
        <h3>Fale com o responsável por este pet</h3>
        {tutor ? (
          <div className="modal-body">
            <p className="modal-body__name">
              <strong>{getOwnerName(tutor)}</strong>
            </p>
            {tutorPhone ? (
              <p>
                <FaPhone /> {tutorPhone}
              </p>
            ) : (
              <p>
                <FaPhone /> Telefone não cadastrado
              </p>
            )}
            {tutor.email && (
              <p>
                <FaEnvelope /> {tutor.email}
              </p>
            )}
            {tutor.endereco && (
              <p>
                <FaMapMarkerAlt /> {tutor.endereco}
              </p>
            )}
            <p className="modal-note">
              Esta vitrine conecta você diretamente ao responsável para combinar
              os próximos passos da adoção.
            </p>
          </div>
        ) : (
          <div className="modal-body">
            <p>
              Informações de contato não estão disponíveis. Tente entrar em
              contato com a ONG responsável pela publicação.
            </p>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialAnimal = location.state?.animal ?? null;
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const baseAnimal =
        initialAnimal && String(initialAnimal.id) === String(id)
          ? initialAnimal
          : null;
      try {
        const publicAnimal = await getPublicAnimalById(id);
        const mergedAnimal = {
          ...publicAnimal,
          ...baseAnimal,
        };

        if (mounted) setAnimal(mergedAnimal);

        const tutorId =
          mergedAnimal?.tutorId ??
          mergedAnimal?.tutor?.id ??
          mergedAnimal?.usuario?.id;
        if (tutorId) {
          try {
            const user = await getUsuario(tutorId);
            if (mounted && user) {
              setAnimal((previous) => ({
                ...previous,
                tutor: {
                  ...(previous?.tutor ?? {}),
                  ...user,
                },
              }));
            }
          } catch (userError) {
            // ignore tutor fetch errors
          }
        }
      } catch (error) {
        if (mounted && baseAnimal) {
          setAnimal(baseAnimal);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id, initialAnimal]);

  if (loading) {
    return (
      <div className="page-loader">
        <PawLoader label="Carregando perfil do pet..." />
      </div>
    );
  }

  if (!animal) {
    return (
      <main className="animal-detail-page">
        <div className="animal-detail-inner">
          <p>Animal não encontrado.</p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>
      </main>
    );
  }

  const tutor = resolveTutor(animal);
  const statusLabel = mapStatusLabel(animal.statusAdocao);
  const description =
    animal.descricaoPublica ||
    animal.observacoes ||
    "Sem descrição pública disponível.";
  const facts = [
    { label: "Espécie", value: animal.especie || "Não informada" },
    { label: "Raça", value: animal.raca || "Sem informação" },
    {
      label: "Idade",
      value: formatAgeDisplay({ idade: animal.idade }),
    },
    { label: "Peso", value: formatWeight(animal.peso) },
  ];
  const highlights = [
    animal.destaque ? "Animal em destaque" : null,
    animal.publico ? "Publicação visível na vitrine" : null,
    animal.statusAdocao ? statusLabel : null,
  ].filter(Boolean);

  const shareAnimal = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: animal.nome,
          text: `Veja o perfil de adoção de ${animal.nome}`,
          url: shareUrl,
        });
        return;
      } catch (shareError) {
        // fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (clipboardError) {
      // ignore clipboard failures
    }
  };

  return (
    <main className="animal-detail-page">
      <div className="animal-detail-inner">
        <button className="back-link" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Voltar
        </button>

        <section className="animal-hero">
          <div className="animal-hero__media">
            {animal.fotoUrl ? (
              <img src={animal.fotoUrl} alt={animal.nome} />
            ) : (
              <div className="animal-hero__placeholder">
                <FaPaw />
                <span>Sem foto disponível</span>
              </div>
            )}
          </div>

          <div className="animal-hero__content">
            <div className="animal-hero__topline">
              <span className="animal-badge animal-badge--status">
                {statusLabel}
              </span>
              {animal.destaque && (
                <span className="animal-badge animal-badge--highlight">
                  <FaStar />
                  Destaque
                </span>
              )}
            </div>

            <div className="animal-hero__title-row">
              <div>
                <p className="animal-eyebrow">Perfil de adoção</p>
                <h1>{animal.nome}</h1>
                <p className="animal-subtitle">
                  {animal.especie || "Animal"} •{" "}
                  {animal.raca || "Raça não informada"} •{" "}
                  {formatAgeDisplay({ idade: animal.idade })}
                </p>
              </div>

              <div className="animal-hero__meta-card">
                <FaShieldAlt />
                <div>
                  <strong>{getOwnerName(tutor)}</strong>
                  <span>Responsável pela publicação</span>
                </div>
              </div>
            </div>

            <div className="animal-hero__chips" aria-label="Resumo do animal">
              {facts.map((fact) => (
                <div key={fact.label} className="animal-chip">
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>

            <div className="animal-hero__actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                Quero adotar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={shareAnimal}
              >
                <FaShareAlt />
                Compartilhar
              </button>
            </div>

            <div className="animal-hero__info-strip">
              <div>
                <span className="animal-strip__label">Publicação</span>
                <strong>
                  {animal.publico ? "Visível na vitrine" : "Apenas interna"}
                </strong>
              </div>
              <div>
                <span className="animal-strip__label">Tutor</span>
                <strong>{getOwnerName(tutor)}</strong>
              </div>
              <div>
                <span className="animal-strip__label">Observação</span>
                <strong>
                  {animal.observacoes
                    ? "Há notas internas"
                    : "Sem observações internas"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className="animal-detail-layout">
          <div className="animal-detail-main">
            <article className="animal-panel">
              <p className="animal-panel__eyebrow">Sobre</p>
              <h2>A história deste pet</h2>
              <p className="animal-description">{description}</p>
              {highlights.length > 0 && (
                <div
                  className="animal-tags"
                  aria-label="Características em destaque"
                >
                  {highlights.map((item) => (
                    <span key={item} className="animal-tag">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </article>

            <article className="animal-panel">
              <p className="animal-panel__eyebrow">Detalhes</p>
              <h2>Informações rápidas</h2>
              <dl className="animal-facts">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>

          <aside className="animal-detail-sidebar">
            <div className="animal-contact-card">
              <p className="animal-panel__eyebrow">Contato</p>
              <h2>Fale com o responsável</h2>
              <p className="animal-contact-card__text">
                Se você quer adotar, abra o contato direto para confirmar
                disponibilidade e combinar os próximos passos.
              </p>

              <div className="animal-contact-card__person">
                <strong>{getOwnerName(tutor)}</strong>
                <span>{tutor?.perfil || "ONG / responsável"}</span>
              </div>

              <div className="animal-contact-card__list">
                {getTutorContact(tutor) ? (
                  <a href={`tel:${getTutorContact(tutor)}`}>
                    <FaPhone />
                    {getTutorContact(tutor)}
                  </a>
                ) : (
                  <div>
                    <FaPhone />
                    Telefone não cadastrado
                  </div>
                )}

                {tutor?.email ? (
                  <a href={`mailto:${tutor.email}`}>
                    <FaEnvelope />
                    {tutor.email}
                  </a>
                ) : (
                  <div>
                    <FaEnvelope />
                    E-mail não disponível
                  </div>
                )}

                <div>
                  <FaMapMarkerAlt />
                  Entre em contato para confirmar local e logística da adoção.
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setShowModal(true)}
              >
                Entrar em contato
              </button>
            </div>
          </aside>
        </section>

        {showModal && (
          <ContactModal tutor={tutor} onClose={() => setShowModal(false)} />
        )}
      </div>
    </main>
  );
}

export default AnimalDetail;
