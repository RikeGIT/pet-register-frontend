function PawLoader({ label = "Carregando...", compact = false }) {
  return (
    <div className={`paw-loader ${compact ? "paw-loader--compact" : ""}`} role="status" aria-live="polite" aria-label={label}>
      <div className="paw-loader__track" aria-hidden="true">
        <svg className="paw-loader__paw paw-loader__paw--1" viewBox="0 0 64 64">
          <g fill="currentColor">
            <circle cx="18" cy="16" r="7" />
            <circle cx="31" cy="10" r="7" />
            <circle cx="46" cy="16" r="7" />
            <circle cx="24" cy="28" r="6.5" />
            <ellipse cx="32" cy="40" rx="14" ry="16" />
          </g>
        </svg>

        <svg className="paw-loader__paw paw-loader__paw--2" viewBox="0 0 64 64">
          <g fill="currentColor">
            <circle cx="18" cy="16" r="7" />
            <circle cx="31" cy="10" r="7" />
            <circle cx="46" cy="16" r="7" />
            <circle cx="24" cy="28" r="6.5" />
            <ellipse cx="32" cy="40" rx="14" ry="16" />
          </g>
        </svg>

        <svg className="paw-loader__paw paw-loader__paw--3" viewBox="0 0 64 64">
          <g fill="currentColor">
            <circle cx="18" cy="16" r="7" />
            <circle cx="31" cy="10" r="7" />
            <circle cx="46" cy="16" r="7" />
            <circle cx="24" cy="28" r="6.5" />
            <ellipse cx="32" cy="40" rx="14" ry="16" />
          </g>
        </svg>

        <svg className="paw-loader__paw paw-loader__paw--4" viewBox="0 0 64 64">
          <g fill="currentColor">
            <circle cx="18" cy="16" r="7" />
            <circle cx="31" cy="10" r="7" />
            <circle cx="46" cy="16" r="7" />
            <circle cx="24" cy="28" r="6.5" />
            <ellipse cx="32" cy="40" rx="14" ry="16" />
          </g>
        </svg>

        <svg className="paw-loader__paw paw-loader__paw--5" viewBox="0 0 64 64">
          <g fill="currentColor">
            <circle cx="18" cy="16" r="7" />
            <circle cx="31" cy="10" r="7" />
            <circle cx="46" cy="16" r="7" />
            <circle cx="24" cy="28" r="6.5" />
            <ellipse cx="32" cy="40" rx="14" ry="16" />
          </g>
        </svg>
      </div>

      <p className="paw-loader__label">{label}</p>
    </div>
  )
}

export default PawLoader