import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

function AdminModal({
  open,
  title,
  description,
  children,
  actions,
  className = "",
  titleId = "admin-modal-title",
  descriptionId = "admin-modal-description",
  closeLabel = "Fechar",
  closeButton = true,
  busy = false,
  onClose,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className={`admin-modal${className ? ` ${className}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          {closeButton && (
            <button
              type="button"
              className="admin-icon-btn"
              onClick={onClose}
              disabled={busy}
              aria-label={closeLabel}
            >
              <FaTimes />
            </button>
          )}
        </div>

        {children}

        {actions && <div className="admin-modal__actions">{actions}</div>}
      </section>
    </div>
  );
}

export default AdminModal;
