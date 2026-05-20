import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaEnvelope, FaLock } from "react-icons/fa"

import { useAuth } from "../context/AuthContext"
import PawLoader from "../components/PawLoader"

import "../styles/auth.css"
import dogImage from "../assets/dogs-login.jpg"

const MIN_LOADER_TIME_MS = 900

function Login() {

  const navigate = useNavigate()

  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {

    e.preventDefault()

    const startTime = Date.now()

    setErro("")
    setLoading(true)

    try {

      await login(email, senha)

      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, MIN_LOADER_TIME_MS - elapsedTime)

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      navigate("/")

    } catch (error) {

      setErro("Email ou senha inválidos")

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
            <h1 className="auth-brand">
              Adota<span>Patos</span>
            </h1>

            <h2 className="auth-title">
              Faça seu login
            </h2>

            <p className="auth-description">
              Entre para acessar a plataforma da clínica
            </p>
          </header>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            {loading && (
              <div className="auth-loader-overlay">
                <PawLoader compact label="Entrando na plataforma..." />
              </div>
            )}

            {erro && (
              <div className="auth-error">
                {erro}
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email">
                Email
              </label>

              <div className="auth-input">
                <FaEnvelope />

                <input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="senha">
                Senha
              </label>

              <div className="auth-input">
                <FaLock />

                <input
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  autoComplete="current-password"
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="auth-footer">
              <p>Não possui conta?</p>

              <Link
                to="/register"
                className="auth-link"
              >
                Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login