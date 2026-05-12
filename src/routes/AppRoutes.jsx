import { Routes, Route } from "react-router-dom"

import { useAuth } from "../context/AuthContext"
import PawLoader from "../components/PawLoader"
import ProtectedRoute from "./ProtectedRoute"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Dashboard from "../pages/Dashboard"
import RegisterAnimal from "../pages/RegisterAnimal"
import AnimalDetail from "../pages/AnimalDetail"

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="paw-loader-screen">
        <PawLoader label="Carregando sua sessão..." />
      </div>
    )
  }

  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/pets/novo"
        element={(
          <ProtectedRoute>
            <RegisterAnimal />
          </ProtectedRoute>
        )}
      />

      <Route path="/pets/:id" element={<AnimalDetail />} />
    </Routes>
  )
}

export default AppRoutes