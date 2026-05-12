import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaArrowLeft, FaSignOutAlt, FaPaperPlane, FaHandsHelping, FaCalendarAlt } from "react-icons/fa"

import { useAuth } from "../context/AuthContext"
import PawLoader from "../components/PawLoader"
import AnimalCard from "../components/AnimalCard"
import {
  createAdocao,
  createSolicitacao,
  getPublicAnimals,
  listMyAdocoes,
  listMySolicitacoes
} from "../api/petApi"

import "../styles/dashboard.css"

const SOLICITACAO_TIPOS = ["CIRURGIA", "CONSULTA", "CASTRACAO"]

function unwrapPage(data) {
  if (Array.isArray(data)) {
    return data
  }

  return data?.content ?? []
}

function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [animals, setAnimals] = useState([])
  const [myAdocoes, setMyAdocoes] = useState([])
  const [mySolicitacoes, setMySolicitacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submittingAdocao, setSubmittingAdocao] = useState(false)
  const [submittingSolicitacao, setSubmittingSolicitacao] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [adocaoForm, setAdocaoForm] = useState({
    animalId: "",
    mensagem: "",
    telefoneContato: ""
  })

  const [solicitacaoForm, setSolicitacaoForm] = useState({
    tipo: "CIRURGIA",
    animalId: "",
    descricao: "",
    contato: ""
  })

  async function loadDashboard() {
    setLoading(true)
    setError("")

    try {
      const [animalsResponse, adocoesResponse, solicitacoesResponse] = await Promise.all([
        getPublicAnimals({ page: 0, size: 50 }),
        listMyAdocoes(),
        listMySolicitacoes()
      ])

      setAnimals(unwrapPage(animalsResponse))
      setMyAdocoes(adocoesResponse)
      setMySolicitacoes(solicitacoesResponse)
    } catch (requestError) {
      setError("Não foi possível carregar seus dados no momento.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const quickStats = useMemo(() => ([
    { label: "Adoções enviadas", value: myAdocoes.length },
    { label: "Solicitações abertas", value: mySolicitacoes.length },
    { label: "Animais na vitrine", value: animals.length }
  ]), [animals.length, myAdocoes.length, mySolicitacoes.length])

  async function handleSubmitAdocao(event) {
    event.preventDefault()
    setSubmittingAdocao(true)
    setError("")
    setSuccess("")

    try {
      await createAdocao({
        animalId: Number(adocaoForm.animalId),
        mensagem: adocaoForm.mensagem,
        telefoneContato: adocaoForm.telefoneContato
      })

      setAdocaoForm({ animalId: "", mensagem: "", telefoneContato: "" })
      setSuccess("Pedido de adoção enviado com sucesso.")
      await loadDashboard()
    } catch (requestError) {
      setError("Não foi possível enviar o pedido de adoção.")
    } finally {
      setSubmittingAdocao(false)
    }
  }

  async function handleSubmitSolicitacao(event) {
    event.preventDefault()
    setSubmittingSolicitacao(true)
    setError("")
    setSuccess("")

    try {
      await createSolicitacao({
        tipo: solicitacaoForm.tipo,
        animalId: Number(solicitacaoForm.animalId),
        descricao: solicitacaoForm.descricao,
        contato: solicitacaoForm.contato
      })

      setSolicitacaoForm({ tipo: "CIRURGIA", animalId: "", descricao: "", contato: "" })
      setSuccess("Solicitação enviada com sucesso.")
      await loadDashboard()
    } catch (requestError) {
      setError("Não foi possível enviar a solicitação.")
    } finally {
      setSubmittingSolicitacao(false)
    }
  }

  function handleLogout() {
    logout()
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="dashboard-page dashboard-page--loading">
        <PawLoader label="Carregando seu painel..." />
      </div>
    )
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-hero">
        <div>
          <Link to="/" className="dashboard-back-link">
            <FaArrowLeft />
            Voltar para a vitrine
          </Link>
          <p className="dashboard-eyebrow">Área autenticada</p>
          <h1>Olá, {user?.nome || "usuário"}.</h1>
          <p className="dashboard-subtitle">
            Aqui você acompanha suas adoções, envia solicitações de atendimento e mantém tudo centralizado.
          </p>
        </div>

        <button type="button" className="dashboard-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          Sair
        </button>
      </header>

      <section className="dashboard-stats">
        {quickStats.map((stat) => (
          <article key={stat.label} className="dashboard-stat-card">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      {error && <div className="dashboard-alert dashboard-alert--error">{error}</div>}
      {success && <div className="dashboard-alert dashboard-alert--success">{success}</div>}

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <p className="dashboard-eyebrow">Adoção</p>
              <h2>Enviar pedido de adoção</h2>
            </div>
            <FaHandsHelping />
          </div>

          <form className="dashboard-form" onSubmit={handleSubmitAdocao}>
            <label>
              Animal
              <select
                value={adocaoForm.animalId}
                onChange={(event) => setAdocaoForm((current) => ({ ...current, animalId: event.target.value }))}
                required
              >
                <option value="">Selecione um animal</option>
                {animals.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.nome} - {animal.especie}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Telefone de contato
              <input
                type="text"
                value={adocaoForm.telefoneContato}
                onChange={(event) => setAdocaoForm((current) => ({ ...current, telefoneContato: event.target.value }))}
                placeholder="(11) 99999-9999"
                required
              />
            </label>

            <label>
              Mensagem
              <textarea
                rows="4"
                value={adocaoForm.mensagem}
                onChange={(event) => setAdocaoForm((current) => ({ ...current, mensagem: event.target.value }))}
                placeholder="Conte por que quer adotar este animal"
                required
              />
            </label>

            <button type="submit" className="dashboard-button" disabled={submittingAdocao}>
              <FaPaperPlane />
              {submittingAdocao ? "Enviando..." : "Enviar pedido"}
            </button>
          </form>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <p className="dashboard-eyebrow">Atendimento</p>
              <h2>Solicitar serviço</h2>
            </div>
            <FaCalendarAlt />
          </div>

          <form className="dashboard-form" onSubmit={handleSubmitSolicitacao}>
            <label>
              Tipo
              <select
                value={solicitacaoForm.tipo}
                onChange={(event) => setSolicitacaoForm((current) => ({ ...current, tipo: event.target.value }))}
              >
                {SOLICITACAO_TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Animal
              <select
                value={solicitacaoForm.animalId}
                onChange={(event) => setSolicitacaoForm((current) => ({ ...current, animalId: event.target.value }))}
                required
              >
                <option value="">Selecione um animal</option>
                {animals.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.nome} - {animal.especie}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Contato
              <input
                type="text"
                value={solicitacaoForm.contato}
                onChange={(event) => setSolicitacaoForm((current) => ({ ...current, contato: event.target.value }))}
                placeholder="Telefone ou e-mail"
                required
              />
            </label>

            <label>
              Descrição
              <textarea
                rows="4"
                value={solicitacaoForm.descricao}
                onChange={(event) => setSolicitacaoForm((current) => ({ ...current, descricao: event.target.value }))}
                placeholder="Descreva a necessidade do atendimento"
                required
              />
            </label>

            <button type="submit" className="dashboard-button" disabled={submittingSolicitacao}>
              <FaPaperPlane />
              {submittingSolicitacao ? "Enviando..." : "Enviar solicitação"}
            </button>
          </form>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid--lists">
        <article className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <p className="dashboard-eyebrow">Histórico</p>
              <h2>Minhas adoções</h2>
            </div>
          </div>

          <div className="dashboard-list">
            {myAdocoes.length === 0 ? (
              <p className="dashboard-empty">Nenhum pedido de adoção enviado ainda.</p>
            ) : (
              myAdocoes.map((item) => (
                <article className="dashboard-list-item" key={item.id}>
                  <strong>{item.nomeAnimal}</strong>
                  <span>Status: {item.status}</span>
                  <p>{item.mensagem}</p>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <p className="dashboard-eyebrow">Histórico</p>
              <h2>Minhas solicitações</h2>
            </div>
          </div>

          <div className="dashboard-list">
            {mySolicitacoes.length === 0 ? (
              <p className="dashboard-empty">Nenhuma solicitação enviada ainda.</p>
            ) : (
              mySolicitacoes.map((item) => (
                <article className="dashboard-list-item" key={item.id}>
                  <strong>{item.nomeAnimal}</strong>
                  <span>{item.tipo} • {item.status}</span>
                  <p>{item.descricao}</p>
                </article>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-panel dashboard-panel--catalog">
        <div className="dashboard-panel__header">
          <div>
            <p className="dashboard-eyebrow">Catálogo</p>
            <h2>Animais disponíveis para selecionar</h2>
          </div>
        </div>

        <div className="dashboard-catalog">
          {animals.slice(0, 6).map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Dashboard