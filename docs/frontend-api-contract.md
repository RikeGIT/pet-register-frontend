# Frontend API Contract

This document defines the minimum backend API surface needed to build a public home page for the ONG, inspired by a pet adoption portal.

## Current backend coverage

- Authentication: login, refresh token, `/api/auth/me`
- Users: `/api/usuarios`
- Animals: `/api/animals` with authenticated CRUD
- Clinical flows: agendamento, atendimento, exame, anamnese, medicamento, servico

## Missing for the public home page

- Public animal listing without authentication
- Animal media/photos
- Animal adoption status
- Adoption request flow
- Surgery/request-for-care flow
- Public filters and pagination
- Featured animals / homepage highlights

## Suggested endpoints

### Public home

- `GET /api/public/animals`
  - Returns paginated animals available for adoption.
  - Query params: `page`, `size`, `especie`, `raca`, `idadeMin`, `idadeMax`, `status`, `search`
- `GET /api/public/animals/{id}`
  - Returns public animal details.
- `GET /api/public/featured-animals`
  - Returns animals highlighted on the home page.

### Adoption

- `POST /api/adocoes`
  - Creates an adoption request.
  - Body example:

```json
{
  "animalId": 12,
  "nomeInteressado": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999999999",
  "mensagem": "Quero adotar esse animal"
}
```

- `GET /api/adocoes/minhas`
  - Returns logged-in user's adoption requests.
- `PATCH /api/adocoes/{id}/status`
  - Updates adoption request status for staff/admin.

### Animal registration for public listing

- `POST /api/public/animals`
  - Submits an animal to be listed by the ONG.
  - Could be public or authenticated, depending on the business rule.
  - Should support image upload or image URL.

### Surgery / care request

- `POST /api/solicitacoes`
  - Creates a care request.
  - Body example:

```json
{
  "tipo": "CIRURGIA",
  "animalId": 12,
  "descricao": "Solicito avaliação para cirurgia ortopédica",
  "contato": "11999999999"
}
```

- `GET /api/solicitacoes/minhas`
  - Returns the authenticated user's requests.

## DTOs recommended for the backend

- `PublicAnimalResponseDTO`
- `AnimalCardDTO`
- `AdoptionRequestDTO`
- `AdoptionRequestResponseDTO`
- `CareRequestDTO`
- `CareRequestResponseDTO`
- `PagedResponseDTO<T>`

## Important backend adjustments

- `Animal` currently behaves like an internal record tied to `tutor` and `criadoPor`.
- For a public home page, the backend should either:
  - add a new adoption-facing entity, or
  - extend `Animal` with fields such as `statusAdocao`, `fotoPrincipal`, `descricaoPublica`, and `publico`.
- Public endpoints should not require JWT for home browsing.
- Media upload should be supported via multipart or storage URLs.
