import api from "./axios"

export async function requestLoginOtp(email, senha) {
  const response = await api.post("/api/auth/login", {
    email,
    senha,
  })

  return response.data
}

export async function verifyOtp(email, codigo) {
  const response = await api.post("/api/auth/otp/verify", {
    email,
    codigo,
  })

  return response.data
}

export async function createRegistrationOtp(payload) {
  const response = await api.post("/api/usuarios", payload)
  return response.data
}

export async function getFeaturedAnimals() {
  const response = await api.get("/api/public/featured-animals")
  return response.data
}

export async function getPublicAnimals(params = {}) {
  const response = await api.get("/api/public/animals", { params })
  return response.data
}

export async function getPublicServices(params = {}) {
  const response = await api.get("/api/servicos", { params })
  return response.data
}

export async function getPublicAnimalById(id) {
  const response = await api.get(`/api/public/animals/${id}`)
  return response.data
}

export async function createAdoptionRequest(payload) {
  const response = await api.post("/api/adocoes", payload)
  return response.data
}

export async function listMyAdoptionRequests() {
  const response = await api.get("/api/adocoes/minhas")
  return response.data
}

export async function createCareRequest(payload) {
  const response = await api.post("/api/solicitacoes", payload)
  return response.data
}

export async function listMyCareRequests() {
  const response = await api.get("/api/solicitacoes/minhas")
  return response.data
}

export async function submitPublicAnimal(payload) {
  const response = await api.post("/api/public/animals", payload)
  return response.data
}

export async function getPublicTaxonomias() {
  const response = await api.get("/api/public/taxonomias/especies")
  return response.data
}