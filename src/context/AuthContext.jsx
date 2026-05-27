import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();
const MIN_LOADING_TIME_MS = 1400;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function login(email, senha) {
    const response = await api.post("/api/auth/login", {
      email,
      senha,
    });

    localStorage.setItem("token", response.data.accessToken);

    localStorage.setItem("refreshToken", response.data.refreshToken);

    await getMe();
  }

  async function getMe() {
    try {
      const response = await api.get("/api/auth/me");

      setUser(response.data);
    } catch (error) {
      logout();
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    setUser(null);
  }

  useEffect(() => {
    async function loadUser() {
      const startTime = Date.now();

      const token = localStorage.getItem("token");

      if (token) {
        await getMe();
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME_MS - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshUser: getMe,
        authenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
