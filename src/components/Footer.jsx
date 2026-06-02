import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaw,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";

import "../styles/footer.css";

const QUICK_LINKS = [
  { label: "Início", to: "/" },
  { label: "Meus animais", to: "/meus-animais" },
  { label: "Solicitar atendimento", to: "/solicitacoes/atendimento" },
  { label: "Cadastrar animal", to: "/pets/novo" },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__content">
        <div className="site-footer__shell">
          <div className="site-footer__brand">
            <span className="site-footer__mark">
              <FaPaw />
            </span>

            <div>
              <h2>Pet Register</h2>
              <p>
                Uma plataforma para acolher, organizar e acelerar o cuidado com
                cada animal.
              </p>
            </div>
          </div>

          <div className="site-footer__column">
            <h3>Atalhos</h3>

            <nav className="site-footer__links" aria-label="Links do rodapé">
              {QUICK_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="site-footer__link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="site-footer__column">
            <h3>Contato</h3>

            <ul className="site-footer__contact-list">
              <li>
                <FaWhatsapp />
                <span>(11) 99999-9999</span>
              </li>
              <li>
                <FaPhoneAlt />
                <span>(11) 3333-3333</span>
              </li>
              <li>
                <FaEnvelope />
                <span>contato@petregister.com</span>
              </li>
              <li>
                <FaMapMarkerAlt />
                <span>Atendimento veterinário e adoção responsável</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© 2026 Pet Register. Transformando vidas através da adoção.</p>
          <div className="site-footer__meta">
            <span>Privacidade</span>
            <span>Termos de uso</span>
            <span>Contato</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
