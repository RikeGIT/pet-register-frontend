import api from "./axios"

export const OWNED_ANIMALS_STORAGE_KEY = "pet-register:owned-animals"

function getUserOwnershipKey(user) {
  return String(
    user?.id
    ?? user?.usuarioId
    ?? user?.userId
    ?? user?.email
    ?? user?.cpf
    ?? user?.telefone
    ?? ""
  ).trim().toLowerCase()
}

export function readOwnedAnimalsCache() {
  try {
    const rawValue = localStorage.getItem(OWNED_ANIMALS_STORAGE_KEY)
    return rawValue ? JSON.parse(rawValue) : []
  } catch (error) {
    return []
  }
}

export function writeOwnedAnimalCache(user, animal) {
  const ownerKey = getUserOwnershipKey(user)

  if (!ownerKey || !animal) {
    return
  }

  const currentAnimals = readOwnedAnimalsCache()
  const nextAnimal = {
    ...animal,
    ownerKey,
    ownerId: user?.id ?? animal?.ownerId ?? null
  }

  const nextAnimals = [
    nextAnimal,
    ...currentAnimals.filter((item) => {
      const itemOwnerKey = String(item?.ownerKey ?? item?.ownerId ?? item?.usuarioId ?? item?.tutorId ?? item?.criadoPorId ?? "").trim().toLowerCase()
      return String(item.id) !== String(nextAnimal.id) || itemOwnerKey !== ownerKey
    })
  ]

  localStorage.setItem(OWNED_ANIMALS_STORAGE_KEY, JSON.stringify(nextAnimals))
}

export function getUserOwnershipKeyFromUser(user) {
  return getUserOwnershipKey(user)
}

export async function getPublicAnimals(params = {}) {
  const response = await api.get("/api/public/animals", { params })
  return response.data
}

export async function getFeaturedAnimals() {
  const response = await api.get("/api/public/featured-animals")
  return response.data
}

export async function getPublicServices(params = {}) {
  const response = await api.get("/api/servicos", { params })
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

export async function listMyAnimals() {
  const response = await api.get("/api/animals")
  return response.data
}

export async function updateAnimal(id, payload) {
  const response = await api.put(`/api/animals/${id}`, payload)
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

export async function updateUsuario(id, payload) {
  const response = await api.put(`/api/usuarios/${id}`, payload)
  return response.data
}
