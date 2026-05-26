import { Link, NavLink } from "react-router-dom";
import { FaPaw } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

import "../styles/home.css";

function Navbar() {
  const { authenticated, user, logout } = useAuth();

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
        {authenticated ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `home-nav__cta${isActive ? " is-active" : ""}`
              }
            >
              Meu painel
            </NavLink>
            <button type="button" className="home-nav__cta" onClick={logout}>
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
