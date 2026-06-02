import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaPaw } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

import "../styles/home.css";

function Navbar() {
  const navigate = useNavigate();
  const { authenticated, user, logout } = useAuth();
  const isAdmin = String(user?.perfil ?? "").toUpperCase() === "ADMIN";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="home-header">
      <Link to="/" className="home-brand">
        <span className="home-brand__mark">
          <FaPaw />
        </span>
        <span className="home-brand__text">
          Pet Register
          <strong>A adoção começa aqui</strong>
        </span>
      </Link>

      <nav className="home-nav">
        <NavLink
          to="/meus-animais"
          className={({ isActive }) =>
            `home-nav__link${isActive ? " is-active" : ""}`
          }
        >
          Meus animais
        </NavLink>
        <NavLink
          to="/solicitacoes/atendimento"
          className={({ isActive }) =>
            `home-nav__link${isActive ? " is-active" : ""}`
          }
        >
          Solicitar atendimento
        </NavLink>
        <NavLink
          to="/pets/novo"
          className={({ isActive }) =>
            `home-nav__link${isActive ? " is-active" : ""}`
          }
        >
          Cadastrar animal
        </NavLink>
        {authenticated && isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `home-nav__link${isActive ? " is-active" : ""}`
            }
          >
            Painel admin
          </NavLink>
        )}
        {authenticated ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `home-nav__cta${isActive ? " is-active" : ""}`
              }
            >
              Meu perfil
            </NavLink>
            <button
              type="button"
              className="home-nav__cta"
              onClick={handleLogout}
            >
              Sair
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `home-nav__cta${isActive ? " is-active" : ""}`
            }
          >
            Entrar
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
