import { Routes, Route } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import PawLoader from "../components/PawLoader";
import ProtectedRoute from "./ProtectedRoute";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import Home from "../pages/public/Home";
import AnimalDetail from "../pages/public/AnimalDetail";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OtpVerification from "../pages/auth/OtpVerification";
import Dashboard from "../pages/user/Dashboard";
import RegisterAnimal from "../pages/user/RegisterAnimal";
import MeusAnimais from "../pages/user/MeusAnimais";
import MeusAnimalDetail from "../pages/user/MeusAnimalDetail";
import SolicitacaoAtendimento from "../pages/user/SolicitacaoAtendimento";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAgendaDia from "../pages/admin/AdminAgendaDia";
import AdminAgendaEvento from "../pages/admin/AdminAgendaEvento";
import AdminAnimals from "../pages/admin/AdminAnimals";
import AdminAdocoes from "../pages/admin/AdminAdocoes";
import AdminSolicitacoes from "../pages/admin/AdminSolicitacoes";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminTaxonomias from "../pages/admin/AdminTaxonomias";
import AdminServices from "../pages/admin/AdminServices";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="paw-loader-screen">
        <PawLoader label="Carregando sua sessão..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/otp" element={<OtpVerification />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pets/novo"
        element={
          <ProtectedRoute>
            <RegisterAnimal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/meus-animais"
        element={
          <ProtectedRoute>
            <MeusAnimais />
          </ProtectedRoute>
        }
      />

      <Route
        path="/meus-animais/:id"
        element={
          <ProtectedRoute>
            <MeusAnimalDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/solicitacoes/atendimento"
        element={
          <ProtectedRoute>
            <SolicitacaoAtendimento />
          </ProtectedRoute>
        }
      />

      <Route path="/pets/:id" element={<AnimalDetail />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedPerfis={["ADMIN"]}>
            <AdminSidebarLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="animais" element={<AdminAnimals />} />
        <Route path="adocoes" element={<AdminAdocoes />} />
        <Route
          path="solicitacoes"
          element={<AdminSolicitacoes variant="pendentes" />}
        />
        <Route
          path="solicitacoes/negadas"
          element={<AdminSolicitacoes variant="negadas" />}
        />
        <Route path="usuarios" element={<AdminUsers />} />
        <Route path="taxonomias" element={<AdminTaxonomias />} />
        <Route path="servicos" element={<AdminServices />} />
        <Route path="agenda/dia/:data" element={<AdminAgendaDia />} />
        <Route path="agenda/evento/:id" element={<AdminAgendaEvento />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
