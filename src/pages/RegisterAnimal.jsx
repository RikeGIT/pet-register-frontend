import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaArrowLeft, FaCheckCircle, FaPaw, FaUpload } from "react-icons/fa"

import { useAuth } from "../context/AuthContext"
import PawLoader from "../components/PawLoader"
import { createAnimal, uploadAnimalPhoto, writeOwnedAnimalCache } from "../api/petApi"

import "../styles/register-animal.css"

const DEFAULT_FORM = {
  nome: "",
  especie: "Cachorro",
  raca: "",
  dataNascimento: "",
  peso: "",
  observacoes: "",
  descricaoPublica: "",
  publico: true,
  destaque: false,
  statusAdocao: "DISPONIVEL"
}

const SPECIES_OPTIONS = ["Cachorro", "Gato", "Coelho", "Ave"]
const BREED_OPTIONS = ["SRD", "Labrador", "Poodle", "Siamês", "Persa", "Coelho Angorá", "Canário"]

// Helper function to calculate age from birth date
function calculateAge(dataNascimento) {
  if (!dataNascimento) return null
  const birthDate = new Date(dataNascimento)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function RegisterAnimal() {
  const navigate = useNavigate()
  const { authenticated, user } = useAuth()

  const [form, setForm] = useState(DEFAULT_FORM)
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (!authenticated) {
      navigate("/login")
      return
    }

    setLoading(true)

    try {
      const createdAnimal = await createAnimal({
        nome: form.nome,
        especie: form.especie,
        raca: form.raca,
        dataNascimento: form.dataNascimento,
        peso: form.peso ? Number(form.peso) : null,
        observacoes: form.observacoes,
        descricaoPublica: form.descricaoPublica,
        publico: form.publico,
        destaque: form.destaque,
        statusAdocao: form.statusAdocao
      })

      if (photo && createdAnimal?.id) {
        await uploadAnimalPhoto(createdAnimal.id, photo)
      }

      writeOwnedAnimalCache(user, createdAnimal)

      setForm(DEFAULT_FORM)
      setPhoto(null)
      setSuccess("Animal cadastrado com sucesso e pronto para a vitrine.")
    } catch (requestError) {
      setError("Não foi possível cadastrar o animal. Verifique os dados e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-animal-page">
      <section className="register-animal-card">
        {loading ? (
          <div className="register-animal-loading">
            <PawLoader label="Cadastrando animal..." />
          </div>
        ) : (
          <form className="register-animal-form" onSubmit={handleSubmit}>
            <div className="register-animal-grid">
              <label>
                Nome
                <input
                  type="text"
                  value={form.nome}
                  onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                  required
                />
              </label>

              <label>
                Espécie
                <select
                  value={form.especie}
                  onChange={(event) => setForm((current) => ({ ...current, especie: event.target.value }))}
                >
                  {SPECIES_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label>
                Raça
                <select
                  value={form.raca}
                  onChange={(event) => setForm((current) => ({ ...current, raca: event.target.value }))}
                >
                  <option value="">Selecione uma raça</option>
                  {BREED_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label>
                Data de nascimento
                <input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(event) => setForm((current) => ({ ...current, dataNascimento: event.target.value }))}
                />
                {form.dataNascimento && (
                  <small style={{ display: "block", marginTop: "4px", color: "#666" }}>
                    Idade aproximada: {calculateAge(form.dataNascimento)} ano(s)
                  </small>
                )}
              </label>

              <label>
                Peso
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.peso}
                  onChange={(event) => setForm((current) => ({ ...current, peso: event.target.value }))}
                />
              </label>

              <label>
                Status de adoção
                <select
                  value={form.statusAdocao}
                  onChange={(event) => setForm((current) => ({ ...current, statusAdocao: event.target.value }))}
                >
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="EM_PROCESSO">Em processo</option>
                  <option value="RESERVADO">Reservado</option>
                  <option value="ADOTADO">Adotado</option>
                </select>
              </label>
            </div>

            <label>
              Descrição pública
              <textarea
                rows="4"
                value={form.descricaoPublica}
                onChange={(event) => setForm((current) => ({ ...current, descricaoPublica: event.target.value }))}
                required
              />
            </label>

            <label>
              Observações internas
              <textarea
                rows="4"
                value={form.observacoes}
                onChange={(event) => setForm((current) => ({ ...current, observacoes: event.target.value }))}
              />
            </label>

            <div className="register-animal-grid register-animal-grid--checks">
              <label className="register-animal-check">
                <input
                  type="checkbox"
                  checked={form.publico}
                  onChange={(event) => setForm((current) => ({ ...current, publico: event.target.checked }))}
                />
                Publicar na vitrine
              </label>

              <label className="register-animal-check">
                <input
                  type="checkbox"
                  checked={form.destaque}
                  onChange={(event) => setForm((current) => ({ ...current, destaque: event.target.checked }))}
                />
                Marcar como destaque
              </label>
            </div>

            <label>
              Foto do animal
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              />
            </label>

            {error && <div className="register-animal-alert register-animal-alert--error">{error}</div>}
            {success && <div className="register-animal-alert register-animal-alert--success">{success}</div>}

            <button type="submit" className="register-animal-button">
              <FaUpload />
              Cadastrar animal
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

export default RegisterAnimal