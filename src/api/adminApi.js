import api from "./axios";

export async function listAdminAnimals() {
  const response = await api.get("/api/animals");
  return response.data;
}

export async function updateAdminAnimal(id, payload) {
  const response = await api.put(`/api/animals/${id}`, payload);
  return response.data;
}

export async function deleteAdminAnimal(id) {
  const response = await api.delete(`/api/animals/${id}`);
  return response.data;
}

export async function listAdminUsers() {
  const response = await api.get("/api/usuarios/admin");
  return response.data;
}

export async function updateAdminUserPerfil(id, perfil) {
  const response = await api.patch(`/api/usuarios/${id}/perfil`, {
    perfil,
  });

  return response.data;
}

export async function updateAdminUserStatus(id, ativo) {
  const response = await api.patch(`/api/usuarios/${id}/status`, {
    ativo,
  });

  return response.data;
}

export async function listAdminSolicitacoes() {
  const response = await api.get("/api/solicitacoes");
  return response.data;
}

export async function updateAdminSolicitacaoStatus(id, status, horario, data) {
  const response = await api.patch(`/api/solicitacoes/${id}/status`, null, {
    params: { status, horario, data },
  });

  return response.data;
}

export async function deleteAdminSolicitacao(id) {
  const response = await api.delete(`/api/solicitacoes/${id}`);
  return response.data;
}

export async function listAdminAgenda(params = {}) {
  const response = await api.get("/api/admin/agenda", { params });
  return response.data;
}

export async function listAdminAgendaDia(data) {
  const response = await api.get("/api/admin/agenda/dia", {
    params: { data },
  });

  return response.data;
}

export async function getAdminAgendaEvento(id) {
  const response = await api.get(`/api/admin/agenda/${id}`);
  return response.data;
}

export async function listAdminAdocoes() {
  const response = await api.get("/api/adocoes");
  return response.data;
}

export async function updateAdminAdocaoStatus(id, status) {
  const response = await api.patch(`/api/adocoes/${id}/status`, null, {
    params: { status },
  });

  return response.data;
}

export async function listAdminServicos() {
  const response = await api.get("/api/admin/servicos");
  return response.data;
}

export async function createAdminServico(payload) {
  const response = await api.post("/api/admin/servicos", payload);
  return response.data;
}

export async function updateAdminServico(id, payload) {
  const response = await api.put(`/api/admin/servicos/${id}`, payload);
  return response.data;
}

export async function deleteAdminServico(id) {
  const response = await api.delete(`/api/admin/servicos/${id}`);
  return response.data;
}

export async function listAdminTaxonomias() {
  const response = await api.get("/api/admin/taxonomias/especies");
  return response.data;
}

export async function createAdminEspecie(payload) {
  const response = await api.post("/api/admin/taxonomias/especies", payload);
  return response.data;
}

export async function updateAdminEspecie(id, payload) {
  const response = await api.patch(`/api/admin/taxonomias/especies/${id}`, payload);
  return response.data;
}

export async function deleteAdminEspecie(id) {
  const response = await api.delete(`/api/admin/taxonomias/especies/${id}`);
  return response.data;
}

export async function createAdminRaca(payload) {
  const response = await api.post("/api/admin/taxonomias/racas", payload);
  return response.data;
}

export async function updateAdminRaca(id, payload) {
  const response = await api.patch(`/api/admin/taxonomias/racas/${id}`, payload);
  return response.data;
}

export async function deleteAdminRaca(id) {
  const response = await api.delete(`/api/admin/taxonomias/racas/${id}`);
  return response.data;
}
