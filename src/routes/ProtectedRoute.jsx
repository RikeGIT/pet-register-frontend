import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import PawLoader from "../components/PawLoader";

function ProtectedRoute({ children, allowedPerfis = [] }) {
  const { authenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="paw-loader-screen">
        <PawLoader label="Validando acesso..." />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedPerfis.length > 0) {
    const currentPerfil = String(user?.perfil ?? "").toUpperCase();
    const hasPermission = allowedPerfis
      .map((perfil) => String(perfil).toUpperCase())
      .includes(currentPerfil);

    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
