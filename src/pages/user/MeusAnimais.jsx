import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listMyAnimals } from "../../api/petApi";
import { formatAgeDisplay } from "../../utils/formatters";
import "../../styles/meus-animais.css";

function normalizeAnimal(animal) {
  return {
    id: String(animal?.id ?? ""),
    nome: animal?.nome ?? "",
    especie: animal?.especie ?? "Cachorro",
    raca: animal?.raca ?? "",
    fotoUrl: animal?.fotoUrl ?? "",
    idade: animal?.idade ?? null,
  };
}

export default function MeusAnimais() {
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function carregarAnimais() {
      try {
        setLoading(true);
        const response = await listMyAnimals();
        const listaNormalizada = Array.isArray(response)
          ? response.map(normalizeAnimal)
          : [];

        if (mounted) {
          setAnimais(listaNormalizada);
        }
      } catch (error) {
        console.error("Erro ao buscar animais:", error);
        alert("Não foi possível carregar a lista de animais.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    carregarAnimais();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="meus-animais-page">
      <section className="meus-animais-hero">
        <div className="meus-animais-hero__copy">
          <p className="meus-animais-eyebrow">Meus animais</p>
          <h1>Animais em cards</h1>
          <p className="meus-animais-subtitle">
            Clique em um card para abrir a tela de edição, ajustar os dados do
            animal ou excluí-lo.
          </p>
        </div>

        <div className="meus-animais-hero__stats">
          <strong>{animais.length}</strong>
          <span>cadastros encontrados</span>
        </div>
      </section>

      {loading ? (
        <p className="meus-animais-empty meus-animais-empty--center">
          Carregando animais...
        </p>
      ) : animais.length === 0 ? (
        <p className="meus-animais-empty meus-animais-empty--center">
          Você ainda não possui animais cadastrados.
        </p>
      ) : (
        <div className="meus-animais-cards-grid">
          {animais.map((animal) => (
            <Link
              key={animal.id}
              to={`/meus-animais/${animal.id}`}
              state={{ animal }}
              className="meus-animais-card"
            >
              <div className="meus-animais-card__media">
                <img
                  src={
                    animal.fotoUrl ||
                    "https://via.placeholder.com/900x675?text=Pet"
                  }
                  alt={animal.nome}
                  className="meus-animais-card__image"
                />
                <span className="meus-animais-card__badge">
                  {animal.especie}
                </span>
              </div>
              <div className="meus-animais-card__body">
                <div className="meus-animais-card__info">
                  <h3>{animal.nome}</h3>
                  <p>{animal.raca || "Raça não informada"}</p>
                  <small className="meus-animais-card__age">
                    {formatAgeDisplay({ idade: animal.idade })}
                  </small>
                </div>
                <span className="meus-animais-card__action">Abrir edição</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
