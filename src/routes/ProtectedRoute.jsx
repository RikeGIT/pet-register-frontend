import { Navigate, useLocation } from "react-router-dom"

import { useAuth } from "../context/AuthContext"
import PawLoader from "../components/PawLoader"

function ProtectedRoute({ children }) {
	const { authenticated, loading } = useAuth()
	const location = useLocation()

	if (loading) {
		return (
			<div className="paw-loader-screen">
				<PawLoader label="Validando acesso..." />
			</div>
		)
	}

	if (!authenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />
	}

	return children
}

export default ProtectedRoute
