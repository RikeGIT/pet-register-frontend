import { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";

import { listAdminAdocoes, updateAdminAdocaoStatus } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";

import "../../styles/admin.css";

const STATUS_OPTIONS = ["PENDENTE", "EM_ANALISE", "APROVADO", "REPROVADO"];

function AdminAdocoes() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [adocoes, setAdocoes] = useState([]);

  useEffect(() => {
    loadAdocoes();
  }, []);

  async function loadAdocoes() {
    setLoading(true);
    setError("");

    try {
      const response = await listAdminAdocoes();
      setAdocoes(response);
    } catch (requestError) {
      setError("Nao foi possivel carregar as adocoes.");
      showToast("Nao foi possivel carregar as adocoes.", {
        title: "Erro",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  function setStatus(id, status) {
    setAdocoes((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  async function handleSave(item) {
    setSavingId(item.id);
    setError("");

    try {
      await updateAdminAdocaoStatus(item.id, item.status);
      showToast(`Adocao #${item.id} atualizada com sucesso.`, {
        title: "Sucesso",
        variant: "success",
      });
    } catch (requestError) {
      setError("Falha ao atualizar o status da adocao.");
      showToast("Falha ao atualizar o status da adocao.", {
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
        <h1>Moderacao de Adocoes</h1>
        <p>Atualize o andamento das solicitacoes de adocao enviadas.</p>
      </header>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <div className="admin-empty">Carregando adocoes...</div>
      ) : adocoes.length === 0 ? (
        <div className="admin-empty">
          Nenhuma solicitacao de adocao encontrada.
        </div>
      ) : (
        <section className="admin-list" aria-label="Lista de adocoes">
          {adocoes.map((item) => (
            <article key={item.id} className="admin-list-item">
              <div className="admin-list-item__header">
                <h2>
                  Solicitacao #{item.id} <span>Pet #{item.animalId}</span>
                </h2>
                <p>{item.nomeAnimal}</p>
              </div>

              <p className="admin-message">
                {item.mensagem || "Sem mensagem."}
              </p>

              <div className="admin-form-grid">
                <label>
                  Status
                  <select
                    value={item.status || "PENDENTE"}
                    onChange={(event) => setStatus(item.id, event.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() => handleSave(item)}
                  disabled={savingId === item.id}
                >
                  <FaSave />
                  Salvar status
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminAdocoes;
