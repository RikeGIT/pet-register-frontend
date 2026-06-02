import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEnvelope, FaShieldAlt } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import PawLoader from "../../components/PawLoader";

import "../../styles/auth.css";
import dogImage from "../../assets/dogs-login.jpg";

function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();

  const stateEmail = location.state?.email;
  const stateFlow = location.state?.flow;
  const stateMessage = location.state?.message;

  const [email, setEmail] = useState(
    stateEmail || localStorage.getItem("pet-register:otp-email") || "",
  );
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [stateEmail]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedUser = await verifyOtp(email, codigo);
      localStorage.removeItem("pet-register:otp-email");
      localStorage.removeItem("pet-register:otp-flow");

      const destination =
        String(loggedUser?.perfil ?? "").toUpperCase() === "ADMIN"
          ? "/admin"
          : "/dashboard";

      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Código inválido ou expirado",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__media">
        <img src={dogImage} alt="Pets" />
      </div>

      <div className="auth-page__content">
        <div className="auth-card">
          <header className="auth-header">
            <h1 className="auth-title">Digite o código</h1>
            <p className="auth-description">
              {stateMessage ||
                (stateFlow === "register"
                  ? "Confira seu e-mail para confirmar o cadastro."
                  : "Digite o código enviado ao seu e-mail para concluir o login.")}
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {loading && (
              <div className="auth-loader-overlay">
                <PawLoader compact label="Validando código..." />
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label htmlFor="otp-email">Email</label>
              <div className="auth-input">
                <FaEnvelope />
                <input
                  id="otp-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Digite seu email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="codigo">Código</label>
              <div className="auth-input">
                <FaShieldAlt />
                <input
                  id="codigo"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={codigo}
                  onChange={(event) =>
                    setCodigo(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || codigo.length !== 6}
              className="auth-button"
            >
              {loading ? "Validando..." : "Confirmar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;
