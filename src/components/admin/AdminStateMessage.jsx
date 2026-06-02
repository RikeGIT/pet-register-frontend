function AdminStateMessage({ children, variant = "empty" }) {
  const className =
    variant === "error"
      ? "admin-alert admin-alert--error"
      : "admin-empty";

  return <div className={className}>{children}</div>;
}

export default AdminStateMessage;
