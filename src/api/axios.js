import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080"
})

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token")

  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/public/animals",
    "/api/public/featured-animals",
    "/api/public/animals/"
  ]

  const requestUrl = config.url ?? ""
  const isPublicRoute = publicRoutes.some(route => requestUrl.includes(route))

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api