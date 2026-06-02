import { useEffect, useState } from "react";
import { FaCheck, FaTrash } from "react-icons/fa";

import {
  deleteAdminAnimal,
  listAdminAnimals,
  updateAdminAnimal,
} from "../../api/adminApi";

import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/ToastContext";

import "../../styles/admin.css";

const ADOPTION_STATUS_OPTIONS = [
  "DISPONIVEL",
  "EM_PROCESSO",
  "ADOTADO",
  "RESERVADO",
];

function AdminAnimals() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [animals, setAnimals] = useState([]);
  const [pendingDeleteAnimal, setPendingDeleteAnimal] = useState(null);

  useEffect(() => {
    loadAnimals();
  }, []);

  async function loadAnimals() {
    setLoading(true);
    setError("");

    try {
      const response = await listAdminAnimals();
      setAnimals(response);
    } catch (requestError) {
      setError("Nao foi possivel carregar os animais.");
      showToast("Nao foi possivel carregar os animais.", {
        title: "Erro",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function patchAnimal(id, changes) {
    setAnimals((current) =>
      current.map((animal) =>
        animal.id === id ? { ...animal, ...changes } : animal,
      ),
    );
  }

  async function handleSave(animal) {
    setSavingId(animal.id);
    setError("");

    try {
      await updateAdminAnimal(animal.id, {
        nome: animal.nome,
        especie: animal.especie,
        raca: animal.raca,
        idade: animal.idade,
        peso: animal.peso,
        observacoes: animal.observacoes,
        fotoUrl: animal.fotoUrl,
        descricaoPublica: animal.descricaoPublica,
        publico: Boolean(animal.publico),
        destaque: Boolean(animal.destaque),
        statusAdocao: animal.statusAdocao || "DISPONIVEL",
      });
      showToast(`Animal ${animal.nome} atualizado com sucesso.`, {
        title: "Sucesso",
        variant: "success",
      });
    } catch (requestError) {
      setError("Falha ao atualizar o animal selecionado.");
      showToast("Falha ao atualizar o animal selecionado.", {
        title: "Erro",
        variant: "error",
      });
    } finally {
      setSavingId(null);
    }
  }
  function askDeleteAnimal(animal) {
    setPendingDeleteAnimal(animal);
  }

  async function confirmDeleteAnimal() {
    if (!pendingDeleteAnimal) {
      return;
    }

    setSavingId(pendingDeleteAnimal.id);
    setError("");

    try {
      await deleteAdminAnimal(pendingDeleteAnimal.id);
      setAnimals((current) =>
        current.filter((animal) => animal.id !== pendingDeleteAnimal.id),
      );
      showToast(`Animal ${pendingDeleteAnimal.nome} removido.`, {
        title: "Sucesso",
        variant: "success",
      });
      setPendingDeleteAnimal(null);
    } catch (requestError) {
      setError("Falha ao remover o animal.");
      showToast("Falha ao remover o animal.", {
        title: "Erro",
        variant: "error",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page__hero">
        <h1>Moderacao de Animais</h1>
        <p>Controle visibilidade publica, destaque e status de adocao.</p>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <div className="admin-empty">Carregando animais...</div>
      ) : animals.length === 0 ? (
        <div className="admin-empty">
          Nenhum animal cadastrado ate o momento.
        </div>
      ) : (
        <section className="admin-list" aria-label="Lista de animais">
          {animals.map((animal) => (
            <article key={animal.id} className="admin-list-item">
              <div className="admin-list-item__header">
                <h2>
                  {animal.nome} <span>#{animal.id}</span>
                </h2>
                <p>
                  {animal.especie} • {animal.raca || "Sem raca informada"}
                </p>
              </div>

              <div className="admin-form-grid">
                <label>
                  Status de adocao
                  <select
                    value={animal.statusAdocao || "DISPONIVEL"}
                    onChange={(event) =>
                      patchAnimal(animal.id, {
                        statusAdocao: event.target.value,
                      })
                    }
                  >
                    {ADOPTION_STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(animal.publico)}
                    onChange={(event) =>
                      patchAnimal(animal.id, {
                        publico: event.target.checked,
                      })
                    }
                  />
                  Publico no portal
                </label>

                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(animal.destaque)}
                    onChange={(event) =>
                      patchAnimal(animal.id, {
                        destaque: event.target.checked,
                      })
                    }
                  />
                  Em destaque
                </label>
              </div>

              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() => handleSave(animal)}
                  disabled={savingId === animal.id}
                >
                  <FaCheck />
                  Salvar
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => askDeleteAnimal(animal)}
                  disabled={savingId === animal.id}
                >
                  <FaTrash />
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteAnimal)}
        title="Excluir animal"
        description={
          pendingDeleteAnimal
            ? `Tem certeza que deseja excluir ${pendingDeleteAnimal.nome}? Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        intent="danger"
        busy={Boolean(
          savingId &&
          pendingDeleteAnimal &&
          savingId === pendingDeleteAnimal.id,
        )}
        onCancel={() => setPendingDeleteAnimal(null)}
        onConfirm={confirmDeleteAnimal}
      />
    </main>
  );
}

export default AdminAnimals;
