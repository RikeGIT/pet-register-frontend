import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FaArrowRight,
  FaBone,
  FaCheckCircle,
  FaDog,
  FaFilter,
  FaHeart,
  FaPaw,
  FaSearch,
  FaStar,
  FaTimesCircle,
  FaUserShield,
  FaUsers,
  FaUpload
} from "react-icons/fa"

import PawLoader from "../components/PawLoader"
import AnimalCard from "../components/AnimalCard"
import { useAuth } from "../context/AuthContext"
import {
  createAdocao,
  getFeaturedAnimals,
  getPublicAnimals
} from "../api/petApi"

import "../styles/home.css"

const SPECIES_OPTIONS = ["", "Cachorro", "Gato", "Coelho", "Ave"]

const DEFAULT_ADOPTION_FORM = {
  animalId: "",
  mensagem: "",
  telefoneContato: ""
}

function unwrapPage(data) {
  if (Array.isArray(data)) {
    return { items: data, total: data.length }
  }

  return {
    items: data?.content ?? [],
    total: data?.totalElements ?? data?.content?.length ?? 0
  }
}

function Home() {
  const navigate = useNavigate()
  const { authenticated, user } = useAuth()
  const featuredRef = useRef(null)
  const adoptionRef = useRef(null)

  const [search, setSearch] = useState("")
  const [species, setSpecies] = useState("")
  const [animals, setAnimals] = useState([])
  const [featuredAnimals, setFeaturedAnimals] = useState([])
  const [totalAnimals, setTotalAnimals] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submittingAdoption, setSubmittingAdoption] = useState(false)
  const [adoptionForm, setAdoptionForm] = useState(DEFAULT_ADOPTION_FORM)

  function scrollTo(ref) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  async function loadAnimals() {
    setLoading(true)
    setError("")

    try {
      const [publicResponse, featuredResponse] = await Promise.all([
        getPublicAnimals({ page: 0, size: 12, especie: species || undefined, search: search || undefined }),
        getFeaturedAnimals()
      ])

      const publicPage = unwrapPage(publicResponse)
      const featuredPage = unwrapPage(featuredResponse)

      setAnimals(publicPage.items)
      setFeaturedAnimals(featuredPage.items)
      setTotalAnimals(publicPage.total)
    } catch (requestError) {
      setError("Não foi possível carregar os animais no momento.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadAnimals, 180)
    return () => window.clearTimeout(timer)
  }, [search, species])

  const heroStats = useMemo(() => ([
    { label: "Animais na vitrine", value: totalAnimals, icon: FaDog },
    { label: "Destaques ativos", value: featuredAnimals.length, icon: FaStar },
    { label: "Fluxos prontos", value: "2", icon: FaUsers }
  ]), [featuredAnimals.length, totalAnimals])

  function handleSelectAnimal(animal) {
    setAdoptionForm((current) => ({ ...current, animalId: String(animal.id) }))
    setSuccess(`Animal selecionado: ${animal.nome}`)
    scrollTo(adoptionRef)
  }

  async function handleSubmitAdoption(event) {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (!authenticated) {
      navigate("/login")
      return
    }

    setSubmittingAdoption(true)

    try {
      await createAdocao({
        animalId: Number(adoptionForm.animalId),
        mensagem: adoptionForm.mensagem,
        telefoneContato: adoptionForm.telefoneContato
      })

      setAdoptionForm(DEFAULT_ADOPTION_FORM)
      setSuccess("Pedido de adoção enviado com sucesso.")
    } catch (requestError) {
      setError("Não foi possível enviar o pedido de adoção.")
    } finally {
      setSubmittingAdoption(false)
    }
  }

  return (
    <main className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand">
          <span className="home-brand__mark"><FaPaw /></span>
          <span className="home-brand__text">
            Pet Register
            <strong>A adoção começa aqui</strong>
          </span>
        </Link>

        <nav className="home-nav">
          <button type="button" onClick={() => scrollTo(featuredRef)}>Animais</button>
          <button type="button" onClick={() => scrollTo(adoptionRef)}>Quero adotar</button>
          <Link to="/pets/novo" className="home-nav__link">Cadastrar animal</Link>
          {authenticated ? (
            <Link to="/dashboard" className="home-nav__cta">Meu painel</Link>
          ) : (
            <Link to="/login" className="home-nav__cta">Entrar</Link>
          )}
        </nav>
      </header>

      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="home-eyebrow">Amor em movimento</p>
          <h1>Encontre um amigo, publique um resgate, faça a diferença.</h1>
          <p className="home-hero__text">
            Uma vitrine pública para adoção responsável, com busca rápida, destaques da ONG e os fluxos prontos para solicitar adoção ou cadastrar um novo animal.
          </p>

          <div className="home-hero__actions">
            <button type="button" className="home-button home-button--primary" onClick={() => scrollTo(featuredRef)}>
              Ver animais
              <FaArrowRight />
            </button>
            <button type="button" className="home-button home-button--ghost" onClick={() => scrollTo(adoptionRef)}>
              Solicitar adoção
            </button>
            <Link to="/pets/novo" className="home-button home-button--ghost">
              Cadastrar animal
            </Link>
          </div>

          <div className="home-hero__notice">
            {authenticated ? (
              <>
                <FaCheckCircle />
                Seja bem vindo<strong>{user?.nome}</strong>. Você já pode adotar o seu pet e cadastrar animais para adoção.
              </>
            ) : (
              <>
                <FaUserShield />
                Faça login para concluir adoções e divulgar novos animais.
              </>
            )}
          </div>

          <div className="home-stats">
            {heroStats.map((stat) => {
              const Icon = stat.icon

              return (
                <article key={stat.label} className="home-stat">
                  <span className="home-stat__icon"><Icon /></span>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="home-section home-section--intro">
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
      </section>
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
              <select value={species} onChange={(event) => setSpecies(event.target.value)}>
                {SPECIES_OPTIONS.map((option) => (
                  <option key={option || "all"} value={option}>
                    {option || "Todas as espécies"}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error && <div className="home-error"><FaTimesCircle /> {error}</div>}
        {success && <div className="home-success"><FaCheckCircle /> {success}</div>}

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
                onAction={() => navigate(`/pets/${animal.id}`, { state: { animal } })}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Home