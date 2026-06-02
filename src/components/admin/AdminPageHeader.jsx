function AdminPageHeader({ title, description, className = "" }) {
  return (
    <header className={`admin-page__hero${className ? ` ${className}` : ""}`}>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}

export default AdminPageHeader;
