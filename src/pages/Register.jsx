import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api/axios"
import PawLoader from "../components/PawLoader"
import dogImage from "../assets/dogs-login.jpg"
import "../styles/auth.css"

const MIN_LOADER_TIME_MS = 900

function Register() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    senha: "",
    perfil: "TUTOR"
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e) {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e) {

    e.preventDefault()

    const startTime = Date.now()

    setError("")
    setLoading(true)

    try {

      await api.post("/api/usuarios", formData)

      localStorage.setItem(
        "pet-register:last-user-phone",
        formData.telefone
      )

      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, MIN_LOADER_TIME_MS - elapsedTime)

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      navigate("/login")

    } catch (err) {

      setError("Erro ao cadastrar usuário")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__media">
        <img
          src={dogImage}
          alt="Pets"
        />
      </div>

      <div className="auth-page__content">
        <div className="auth-card">
          <header className="auth-header">
            <h1 className="auth-title">
              Crie sua conta
            </h1>

            <p className="auth-description">
              Cadastre-se para acessar o sistema da clínica
            </p>
          </header>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            {loading && (
              <div className="auth-loader-overlay">
                <PawLoader compact label="Criando sua conta..." />
              </div>
            )}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="nome">
                Nome
              </label>

              <div className="auth-input">
                <input
                  id="nome"
                  type="text"
                  name="nome"
                  placeholder="Digite seu nome"
                  value={formData.nome}
                  autoComplete="name"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">
                Email
              </label>

              <div className="auth-input">
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  autoComplete="email"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="cpf">
                CPF
              </label>

              <div className="auth-input">
                <input
                  id="cpf"
                  type="text"
                  name="cpf"
                  placeholder="Digite seu CPF"
                  value={formData.cpf}
                  autoComplete="off"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="telefone">
                Telefone
              </label>

              <div className="auth-input">
                <input
                  id="telefone"
                  type="tel"
                  name="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  autoComplete="tel"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="senha">
                Senha
              </label>

              <div className="auth-input">
                <input
                  id="senha"
                  type="password"
                  name="senha"
                  placeholder="Digite sua senha"
                  value={formData.senha}
                  autoComplete="new-password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-field">
              <label>
                Perfil
              </label>

              <div className="auth-profile-options">
                <button
                  type="button"
                  className={`auth-profile-option ${formData.perfil === "TUTOR" ? "is-active" : ""}`}
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      perfil: "TUTOR"
                    }))
                  }
                >
                  TUTOR
                </button>

                <button
                  type="button"
                  className={`auth-profile-option ${formData.perfil === "VETERINARIO" ? "is-active" : ""}`}
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      perfil: "VETERINARIO"
                    }))
                  }
                >
                  VETERINARIO
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Já possui conta?</p>

            <Link
              to="/login"
              className="auth-link"
            >
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register