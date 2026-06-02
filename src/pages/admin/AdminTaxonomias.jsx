import { useEffect, useState } from "react";
import { FaPaw, FaPlus, FaTrash } from "react-icons/fa";

import {
  createAdminEspecie,
  createAdminRaca,
  deleteAdminEspecie,
  deleteAdminRaca,
  listAdminTaxonomias,
  updateAdminEspecie,
  updateAdminRaca,
} from "../../api/adminApi";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../context/ToastContext";

import "../../styles/admin.css";

function AdminTaxonomias() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [especies, setEspecies] = useState([]);
  const [novaEspecie, setNovaEspecie] = useState("");
  const [novasRacas, setNovasRacas] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    loadTaxonomias();
  }, []);

  async function loadTaxonomias() {
    setLoading(true);
    setError("");

    try {
      const response = await listAdminTaxonomias();
      setEspecies(Array.isArray(response) ? response : []);
    } catch (requestError) {
      const message = "Nao foi possivel carregar especies e racas.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  function patchEspecie(especieId, changes) {
    setEspecies((current) =>
      current.map((item) =>
        item.id === especieId ? { ...item, ...changes } : item,
      ),
    );
  }

  function patchRaca(especieId, racaId, changes) {
    setEspecies((current) =>
      current.map((item) => {
        if (item.id !== especieId) {
          return item;
        }

        return {
          ...item,
          racas: (item.racas || []).map((raca) =>
            raca.id === racaId ? { ...raca, ...changes } : raca,
          ),
        };
      }),
    );
  }

  async function handleCreateEspecie(event) {
    event.preventDefault();

    if (!novaEspecie.trim()) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const created = await createAdminEspecie({ nome: novaEspecie.trim() });
      setEspecies((current) => [...current, created]);
      setNovaEspecie("");
      showToast("Especie cadastrada com sucesso.", {
        title: "Sucesso",
        variant: "success",
      });
    } catch (requestError) {
      const message = "Falha ao cadastrar especie.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEspecie(especie) {
    setSaving(true);
    setError("");

    try {
      const updated = await updateAdminEspecie(especie.id, {
        nome: especie.nome,
        ativo: Boolean(especie.ativo),
      });
      patchEspecie(especie.id, updated);
      showToast("Especie atualizada.", {
        title: "Sucesso",
        variant: "success",
      });
    } catch (requestError) {
      const message = "Falha ao atualizar especie.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateRaca(especieId) {
    const nome = String(novasRacas[especieId] || "").trim();

    if (!nome) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updatedEspecie = await createAdminRaca({ nome, especieId });
      patchEspecie(especieId, updatedEspecie);
      setNovasRacas((current) => ({ ...current, [especieId]: "" }));
      showToast("Raca cadastrada.", { title: "Sucesso", variant: "success" });
    } catch (requestError) {
      const message = "Falha ao cadastrar raca.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRaca(especieId, raca) {
    setSaving(true);
    setError("");

    try {
      const updatedEspecie = await updateAdminRaca(raca.id, {
        nome: raca.nome,
        especieId,
        ativo: Boolean(raca.ativo),
      });
      patchEspecie(especieId, updatedEspecie);
      showToast("Raca atualizada.", { title: "Sucesso", variant: "success" });
    } catch (requestError) {
      const message = "Falha ao atualizar raca.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (pendingDelete.type === "especie") {
        await deleteAdminEspecie(pendingDelete.id);
        setEspecies((current) =>
          current.filter((item) => item.id !== pendingDelete.id),
        );
      } else {
        const updatedEspecie = await deleteAdminRaca(pendingDelete.id);
        patchEspecie(updatedEspecie.id, updatedEspecie);
      }

      showToast("Item removido com sucesso.", {
        title: "Sucesso",
        variant: "success",
      });
      setPendingDelete(null);
    } catch (requestError) {
      const message = "Nao foi possivel remover o item.";
      setError(message);
      showToast(message, { title: "Erro", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page__hero">
        <h1>Especies e Racas</h1>
        <p>Cadastre e mantenha a taxonomia oficial de animais da plataforma.</p>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <section className="admin-card admin-card--full">
        <form className="admin-inline-form" onSubmit={handleCreateEspecie}>
          <label>
            Nova especie
            <input
              type="text"
              value={novaEspecie}
              onChange={(event) => setNovaEspecie(event.target.value)}
              placeholder="Ex.: Cachorro"
            />
          </label>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            disabled={saving}
          >
            <FaPlus />
            Adicionar especie
          </button>
        </form>
      </section>

      {loading ? (
        <div className="admin-empty">Carregando taxonomias...</div>
      ) : especies.length === 0 ? (
        <div className="admin-empty">Nenhuma especie cadastrada.</div>
      ) : (
        <section className="admin-list" aria-label="Lista de especies e racas">
          {especies.map((especie) => (
            <article key={especie.id} className="admin-list-item">
              <div className="admin-list-item__header admin-list-item__header--split">
                <h2>
                  <FaPaw />
                  <span>Especie #{especie.id}</span>
                </h2>
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() =>
                    setPendingDelete({
                      type: "especie",
                      id: especie.id,
                      label: especie.nome,
                    })
                  }
                  disabled={saving}
                >
                  <FaTrash />
                  Excluir especie
                </button>
              </div>

              <div className="admin-form-grid">
                <label>
                  Nome da especie
                  <input
                    type="text"
                    value={especie.nome}
                    onChange={(event) =>
                      patchEspecie(especie.id, { nome: event.target.value })
                    }
                  />
                </label>

                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(especie.ativo)}
                    onChange={(event) =>
                      patchEspecie(especie.id, { ativo: event.target.checked })
                    }
                  />
                  Especie ativa
                </label>
              </div>

              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() => handleSaveEspecie(especie)}
                  disabled={saving}
                >
                  Salvar especie
                </button>
              </div>

              <div className="admin-sublist">
                <h3>Racas</h3>

                <div className="admin-inline-form admin-inline-form--raca">
                  <input
                    type="text"
                    value={novasRacas[especie.id] || ""}
                    onChange={(event) =>
                      setNovasRacas((current) => ({
                        ...current,
                        [especie.id]: event.target.value,
                      }))
                    }
                    placeholder={`Nova raca para ${especie.nome}`}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() => handleCreateRaca(especie.id)}
                    disabled={saving}
                  >
                    <FaPlus />
                    Adicionar raca
                  </button>
                </div>

                {(especie.racas || []).length === 0 ? (
                  <p className="admin-subtext">Nenhuma raca cadastrada.</p>
                ) : (
                  <div className="admin-sublist__items">
                    {(especie.racas || []).map((raca) => (
                      <div key={raca.id} className="admin-sublist__item">
                        <input
                          type="text"
                          value={raca.nome}
                          onChange={(event) =>
                            patchRaca(especie.id, raca.id, {
                              nome: event.target.value,
                            })
                          }
                        />

                        <label className="admin-checkbox">
                          <input
                            type="checkbox"
                            checked={Boolean(raca.ativo)}
                            onChange={(event) =>
                              patchRaca(especie.id, raca.id, {
                                ativo: event.target.checked,
                              })
                            }
                          />
                          Ativa
                        </label>

                        <button
                          type="button"
                          className="admin-btn admin-btn--primary"
                          onClick={() => handleSaveRaca(especie.id, raca)}
                          disabled={saving}
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          onClick={() =>
                            setPendingDelete({
                              type: "raca",
                              id: raca.id,
                              label: raca.nome,
                            })
                          }
                          disabled={saving}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Confirmar exclusao"
        description={
          pendingDelete
            ? `Deseja realmente excluir ${pendingDelete.label}?`
            : ""
        }
        confirmLabel="Excluir"
        intent="danger"
        busy={saving}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}

export default AdminTaxonomias;
