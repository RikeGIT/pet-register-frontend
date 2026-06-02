import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBone,
  FaCheckCircle,
  FaDog,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaHeart,
  FaPaw,
  FaSearch,
  FaStar,
  FaTimesCircle,
  FaUserShield,
  FaUsers,
  FaUpload,
} from "react-icons/fa";

import PawLoader from "../../components/PawLoader";
import AnimalCard from "../../components/AnimalCard";
import { useAuth } from "../../context/AuthContext";
import { createAdocao } from "../../api/petApi";
import {
  getFeaturedAnimals,
  getPublicAnimals,
  getPublicServices,
  getPublicTaxonomias,
} from "../../api/portalApi";

import "../../styles/home.css";
import dogHero from "../../assets/dog-cat-hero.png";
import about from "../../assets/about.png";

const DEFAULT_ADOPTION_FORM = {
  animalId: "",
  mensagem: "",
  telefoneContato: "",
};

function unwrapPage(data) {
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }

  return {
    items: data?.content ?? [],
    total: data?.totalElements ?? data?.content?.length ?? 0,
  };
}

// Testimonials sample data (kept as dynamic-ready array; can be replaced by API later)
const TESTIMONIALS = [
  {
    id: 1,
    name: "Carlos Santos",
    role: "Tutor do Max (Golden Retriever)",
    text: "O atendimento clínico foi impecável. A equipe demonstrou muito preparo técnico e carinho durante toda a internação.",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Ana Oliveira",
    role: "Tutora da Luna (Gato SRD)",
    text: "Estrutura fantástica e profissionais muito bem qualificados. O diagnóstico foi rápido e o tratamento super eficaz.",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 3,
    name: "Rafael Costa",
    role: "Tutor do Thor (Bulldog)",
    text: "Sempre faço o acompanhamento de rotina aqui. O sistema de agendamento é prático e o suporte é excelente.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

function Home() {
  const navigate = useNavigate();
  const { authenticated, user } = useAuth();
  const featuredRef = useRef(null);
  const adoptionRef = useRef(null);

  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("");
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [featuredAnimals, setFeaturedAnimals] = useState([]);
  // Serviços da ONG (dinâmicos via API)
  const [services, setServices] = useState([]);
  const [servicesTotal, setServicesTotal] = useState(0);
  const [servicePage, setServicePage] = useState(0);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submittingAdoption, setSubmittingAdoption] = useState(false);
  const [adoptionForm, setAdoptionForm] = useState(DEFAULT_ADOPTION_FORM);

  function scrollTo(ref) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function loadAnimals() {
    setLoading(true);
    setError("");

    try {
      const [publicResponse, featuredResponse] = await Promise.all([
        getPublicAnimals({
          page: 0,
          size: 12,
          especie: species || undefined,
          search: search || undefined,
        }),
        getFeaturedAnimals(),
      ]);

      const publicPage = unwrapPage(publicResponse);
      const featuredPage = unwrapPage(featuredResponse);

      const normalize = (item) => ({
        ...item,
        idade: item.idade ?? null,
      });

      setAnimals(publicPage.items.map(normalize));
      setFeaturedAnimals(featuredPage.items.map(normalize));
      setTotalAnimals(publicPage.total);
    } catch (requestError) {
      setError("Não foi possível carregar os animais no momento.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTaxonomias() {
    try {
      const response = await getPublicTaxonomias();
      const parsed = Array.isArray(response) ? response : [];
      setSpeciesOptions(parsed.map((item) => item.nome));
    } catch (requestError) {
      setSpeciesOptions([]);
    }
  }

  // Helpers para mapear campos comuns retornados pela API de serviços
  function getServiceTitle(service) {
    return (
      service?.nome ??
      service?.titulo ??
      service?.servico ??
      "Serviço institucional"
    );
  }

  function getServiceDescription(service) {
    return (
      service?.descricaoCurta ??
      service?.descricaoPublica ??
      service?.descricao ??
      service?.resumo ??
      "Atendimento organizado para orientar, acolher e encaminhar cada necessidade da ONG."
    );
  }

  const SERVICE_PAGE_SIZE = 4;

  // Carrega serviços públicos com paginação e limita visualização a 4 itens
  async function loadServices(
    setter,
    setTotal,
    setLoading,
    setError,
    page = 0,
  ) {
    setLoading(true);
    setError("");

    try {
      const response = await getPublicServices({
        page,
        size: SERVICE_PAGE_SIZE,
      });
      const pageData = Array.isArray(response)
        ? { items: response, total: response.length }
        : {
            items: response?.content ?? [],
            total: response?.totalElements ?? response?.content?.length ?? 0,
          };

      setter(pageData.items.slice(0, SERVICE_PAGE_SIZE));
      setTotal(pageData.total);
    } catch (err) {
      setError("Não foi possível carregar os serviços no momento.");
      setter([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadAnimals, 180);
    return () => window.clearTimeout(timer);
  }, [search, species]);

  useEffect(() => {
    loadTaxonomias();
  }, []);

  function handleSelectAnimal(animal) {
    setAdoptionForm((current) => ({ ...current, animalId: String(animal.id) }));
    setSuccess(`Animal selecionado: ${animal.nome}`);
    scrollTo(adoptionRef);
  }

  async function handleSubmitAdoption(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!authenticated) {
      navigate("/login");
      return;
    }

    setSubmittingAdoption(true);

    try {
      await createAdocao({
        animalId: Number(adoptionForm.animalId),
        mensagem: adoptionForm.mensagem,
        telefoneContato: adoptionForm.telefoneContato,
      });

      setAdoptionForm(DEFAULT_ADOPTION_FORM);
      setSuccess("Pedido de adoção enviado com sucesso.");
    } catch (requestError) {
      setError("Não foi possível enviar o pedido de adoção.");
    } finally {
      setSubmittingAdoption(false);
    }
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="home-eyebrow">Amor em movimento</p>
          <h1>Encontre um amigo. Publique um resgate. Faça a diferença.</h1>
          <p className="home-hero__text">
            Uma vitrine pública para adoção responsável, com busca rápida,
            destaques da ONG e os fluxos prontos para solicitar adoção ou
            cadastrar um novo animal.
          </p>

          <div className="home-hero__actions">
            <button
              type="button"
              className="home-button home-button--primary"
              onClick={() => scrollTo(featuredRef)}
            >
              Ver animais
              <FaArrowRight />
            </button>
            <button
              type="button"
              className="home-button home-button--ghost"
              onClick={() => scrollTo(adoptionRef)}
            >
              Solicitar atendimento
            </button>
            <Link to="/pets/novo" className="home-button home-button--ghost">
              Cadastrar animal
            </Link>
          </div>

          <div className="home-hero__notice">
            {authenticated ? (
              <>
                <FaCheckCircle />
                Seja bem vindo! Você já pode adotar o seu pet e cadastrar
                animais para adoção.
              </>
            ) : (
              <>
                <FaUserShield />
                Faça login para solicitar serviços, adotar um bixinho ou
                divulgar novos animais.
              </>
            )}
          </div>
        </div>

        <div className="home-hero__image">
          <img src={dogHero} alt="Cachorro" />
        </div>
      </section>

      {/* Testimonials section - plain CSS implementation */}
      <section
        className="home-section testimonials-section"
        aria-labelledby="testimonials-title"
      >
        <div className="testimonials-inner">
          <div className="testimonials-header">
            <h2 id="testimonials-title">O que dizem sobre nós</h2>
            <p>
              A confiança de quem deixa seus melhores amigos em nossas mãos.
            </p>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <article key={t.id} className="testimonial-card">
                <div className="testimonial-meta">
                  <img
                    className="testimonial-avatar"
                    src={t.avatar}
                    alt={t.name}
                  />
                  <div className="testimonial-identity">
                    <strong className="testimonial-name">{t.name}</strong>
                    <span className="testimonial-role">{t.role}</span>
                  </div>
                </div>

                <p className="testimonial-text">“{t.text}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* <section className="home-section home-section--intro">
        <div className="home-intro-grid">
          <article>
            <FaHeart />
            <h2>Por que adotar?</h2>
            <p>Você transforma a vida de um animal e ganha um companheiro fiel para todos os dias.</p>
          </article>
          <article>
            <FaBone />
            <h2>Divulgar também ajuda</h2>
            <p>Resgates e lares temporários precisam de uma vitrine confiável para encontrar novas famílias.</p>
          </article>
          <article>
            <FaUpload />
            <h2>Cadastro rápido</h2>
            <p>Um fluxo simples para publicar o animal com foto e descrição pública em poucos segundos.</p>
          </article>
        </div>
      </section>*/}
      <section className="home-section home-section--catalog">
        <div className="home-toolbar">
          <div className="home-toolbar__title">
            <p className="home-section__eyebrow">Explorar</p>
            <h2>Animais disponíveis</h2>
          </div>

          <div className="home-toolbar__filters">
            <label className="home-filter">
              <FaSearch />
              <input
                type="search"
                placeholder="Buscar por nome ou descrição"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="home-filter">
              <FaFilter />
              <select
                value={species}
                onChange={(event) => setSpecies(event.target.value)}
              >
                {["", ...speciesOptions].map((option) => (
                  <option key={option || "all"} value={option}>
                    {option || "Todas as espécies"}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error && (
          <div className="home-error">
            <FaTimesCircle /> {error}
          </div>
        )}
        {success && (
          <div className="home-success">
            <FaCheckCircle /> {success}
          </div>
        )}

        {!loading && animals.length === 0 ? (
          <div className="home-state home-state--empty">
            Nenhum animal encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="home-grid">
            {animals.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                actionLabel="Ver mais"
                onAction={() =>
                  navigate(`/pets/${animal.id}`, { state: { animal } })
                }
              />
            ))}
          </div>
        )}
      </section>
      {/*
      <section className="home-section home-section--about">
        <div className="home-about__layout">
          <div className="home-about__media">
            <div className="home-about__frame">
              <img src={about} alt="Sobre a ONG" />
            </div>
            <div className="home-about__badge">5+ anos de experiência</div>
          </div>

          <div className="home-about__content">
            <p className="home-section__eyebrow">Quem somos</p>
            <h2>
              Somos uma equipe dedicada a ajudar animais a encontrarem lares
              amorosos
            </h2>
            <p>
              Com anos de experiência no resgate e reabilitação, estamos
              comprometidos em oferecer o melhor cuidado para cada animal e
              apoiar famílias durante todo o processo de adoção e atendimento.
            </p>

            <ul className="home-about__list">
              <li>Check-ups disponíveis</li>
              <li>Animais para adoção</li>
              <li>Cirurgias e castração</li>
            </ul>

            <button type="button" className="home-services__cta">
              Saiba mais
            </button>
          </div>
        </div>
      </section>*/}
      <section className="home-section home-section--team">
        <div className="home-team__layout">
          <div className="home-team__media">
            <img
              alt="Nossa equipe"
              className="home-team__image"
              data-alt="A professional and candid shot of a diverse group of veterinarians and volunteers smiling together in a modern, clean animal clinic. The environment is bright and welcoming, with high-end equipment and minimalist design. The lighting is natural and soft, creating a trustworthy and reliable atmosphere. Everyone is wearing professional attire, reflecting the competence and heart-led dedication of the Pet Register team. The overall style is corporate yet warm and editorial."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5wquvgzcBX27ma0EmBcnO75YDouBA_a4kNcCFSzTYNXGXdh7jIwsi6xXoj_B50se3c_rLMVtKPGr82gP_e0OovNPQFawMpav9qK1TdiYhGYbTd00AteqHPlz3yrgt1mCA2YsymQTfLr7LN5KMEH-Kl4gQAyhgVv_tnfH4oMq_DLYa14R67pLld6wWBylA1LZOwtekc2u07a0_r5aSRpmsg-QBl_634Cv-XfaKqo7Y5BOBS7rNKU7nPmXGwMyTeyzh_Xo-q1YHtjJE"
            />
          </div>

          <div className="home-team__content">
            <p className="home-section__eyebrow">Quem somos</p>
            <h2>
              Somos uma equipe dedicada a ajudar animais a encontrarem lares
              amorosos
            </h2>
            <p className="home-team__text">
              Com anos de experiência no resgate e reabilitação, estamos
              comprometidos em oferecer o melhor cuidado para cada animal e
              apoiar famílias durante todo o processo de adoção e atendimento.
            </p>

            <ul className="home-team__list">
              <li>
                <FaCheckCircle />
                <span>Check-ups disponíveis</span>
              </li>
              <li>
                <FaCheckCircle />
                <span>Animais para adoção</span>
              </li>
              <li>
                <FaCheckCircle />
                <span>Cirurgias e castração</span>
              </li>
            </ul>

            <button type="button" className="home-team__button">
              Saiba mais
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
