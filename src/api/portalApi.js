import api from "./axios"

export async function getFeaturedAnimals() {
  const response = await api.get("/api/public/featured-animals")
  return response.data
}

export async function getPublicAnimals(params = {}) {
  const response = await api.get("/api/public/animals", { params })
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