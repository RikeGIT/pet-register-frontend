import { FaPaw, FaHeart, FaRegStar } from "react-icons/fa";
import { formatAgeDisplay } from "../utils/formatters";

const DESCRIPTION_LIMIT = 140;

function truncateText(text, limit = DESCRIPTION_LIMIT) {
  const value = String(text || "").trim();

  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit).trimEnd()}...`;
}

function AnimalCard({
  animal,
  featured = false,
  onAction,
  actionLabel = "Ver mais",
}) {
  const badgeClass = `animal-card__badge animal-card__badge--${(
    animal.statusAdocao || "disponivel"
  ).toLowerCase()}`;

  const description =
    animal.descricaoPublica ||
    animal.observacoes ||
    "Animal pronto para receber uma nova família.";

  const shortDescription = truncateText(description);

  const ageLabel = formatAgeDisplay({ idade: animal.idade });

  return (
    <article
      className={`animal-card ${featured ? "animal-card--featured" : ""}`}
    >
      <div className="animal-card__media">
        {animal.fotoUrl ? (
          <img src={animal.fotoUrl} alt={animal.nome} />
        ) : (
          <div className="animal-card__placeholder" aria-hidden="true">
            <FaPaw />
          </div>
        )}

        <span className={badgeClass}>
          {animal.statusAdocao || "DISPONÍVEL"}
        </span>

        {animal.destaque && (
          <span className="animal-card__highlight">
            <FaRegStar />
            Destaque
          </span>
        )}
      </div>

      <div className="animal-card__body">
        <div className="animal-card__heading">
          <h3>{animal.nome}</h3>
          <span>{animal.especie}</span>
        </div>

        <p className="animal-card__text">{shortDescription}</p>

        <dl className="animal-card__meta">
          <div>
            <dt>Raça</dt>
            <dd>{animal.raca || "Sem informação"}</dd>
          </div>
          <div>
            <dt>Idade</dt>
            <dd>{ageLabel}</dd>
          </div>
          <div>
            <dt>Peso</dt>
            <dd>{animal.peso ? `${animal.peso} kg` : "-"}</dd>
          </div>
        </dl>

        {onAction && (
          <button
            type="button"
            className="animal-card__action"
            onClick={onAction}
          >
            <FaHeart />
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}

export default AnimalCard;
