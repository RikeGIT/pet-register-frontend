import { NavLink, Outlet } from "react-router-dom";
import {
  FaDog,
  FaGavel,
  FaChevronDown,
  FaLayerGroup,
  FaPaw,
  FaSignOutAlt,
  FaUsers,
  FaWrench,
  FaStethoscope,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

import "../styles/admin.css";

const ADMIN_LINKS = [
  { to: "/admin", label: "Visao geral", icon: FaLayerGroup, end: true },
  { to: "/admin/animais", label: "Animais", icon: FaDog },
  { to: "/admin/adocoes", label: "Adocoes", icon: FaGavel },
  { type: "solicitacoes" },
  { to: "/admin/usuarios", label: "Usuarios", icon: FaUsers },
  { to: "/admin/taxonomias", label: "Especies e racas", icon: FaPaw },
  { to: "/admin/servicos", label: "Servicos", icon: FaStethoscope },
];

function AdminSidebarLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Menu administrativo">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">
            <FaPaw />
          </span>
          <div>
            <strong>Adotapatos</strong>
            <small>Painel administrativo</small>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {ADMIN_LINKS.map((item) => {
            if (item.type === "solicitacoes") {
              return (
                <div key="solicitacoes" className="admin-sidebar__group">
                  <NavLink
                    to="/admin/solicitacoes"
                    className={({ isActive }) =>
                      `admin-sidebar__link admin-sidebar__link--parent${isActive ? " is-active" : ""}`
                    }
                  >
                    <FaWrench />
                    <span>Solicitacoes</span>
                    <FaChevronDown className="admin-sidebar__chevron" />
                  </NavLink>
                  <div className="admin-sidebar__submenu">
                    <NavLink
                      to="/admin/solicitacoes"
                      end
                      className={({ isActive }) =>
                        `admin-sidebar__sublink${isActive ? " is-active" : ""}`
                      }
                    >
                      Solicitacoes pendentes
                    </NavLink>
                    <NavLink
                      to="/admin/solicitacoes/negadas"
                      className={({ isActive }) =>
                        `admin-sidebar__sublink${isActive ? " is-active" : ""}`
                      }
                    >
                      Solicitacoes negadas
                    </NavLink>
                  </div>
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-sidebar__link${isActive ? " is-active" : ""}`
                }
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <p>{user?.nome || "Administrador"}</p>
          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={logout}
          >
            <FaSignOutAlt />
            Sair
          </button>
        </div>
      </aside>

      <section className="admin-shell__content">
        <Outlet />
      </section>
    </div>
  );
}

export default AdminSidebarLayout;
