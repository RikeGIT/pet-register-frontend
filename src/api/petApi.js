import api from "./axios"

export async function getPublicAnimals(params = {}) {
  const response = await api.get("/api/public/animals", { params })
  return response.data
}

export async function getFeaturedAnimals() {
  const response = await api.get("/api/public/featured-animals")
  return response.data
}

export async function getPublicAnimal(id) {
  try {
    const response = await api.get(`/api/public/animals/${id}`)
    return response.data
  } catch (err) {
    // Fallback: some backends expose single animal at /api/animals/{id}
    try {
      const resp2 = await api.get(`/api/animals/${id}`)
      return resp2.data
    } catch (err2) {
      throw err
    }
  }
}

export async function createAnimal(payload) {
  const response = await api.post("/api/animals", payload)
  return response.data
}

export async function uploadAnimalPhoto(animalId, file) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await api.post(`/api/animals/${animalId}/foto`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })

  return response.data
}

export async function createAdocao(payload) {
  const response = await api.post("/api/adocoes", payload)
  return response.data
}

export async function listMyAdocoes() {
  const response = await api.get("/api/adocoes/minhas")
  return response.data
}

export async function createSolicitacao(payload) {
  const response = await api.post("/api/solicitacoes", payload)
  return response.data
}

export async function listMySolicitacoes() {
  const response = await api.get("/api/solicitacoes/minhas")
  return response.data
}

export async function getUsuario(id) {
  const response = await api.get(`/api/usuarios/${id}`)
  return response.data
}
