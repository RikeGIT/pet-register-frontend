import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { createSolicitacao, listMyAnimals } from "../../api/petApi";
import { getPublicServices } from "../../api/portalApi";
import "../../styles/solicitacao-atendimento.css";
import { formatAgeDisplay } from "../../utils/formatters";

const INITIAL_FORM_STATE = {
  animalId: "",
  servicoId: "",
  descricaoSintomas: "",
  dataPreferencial: "",
  contato: "",
  observacoesTutor: "",
};

const DEFAULT_TIPO_SOLICITACAO = "Consulta";

const TIPO_MAP = {
  Consulta: "CONSULTA",
  Cirurgia: "CIRURGIA",
  Retorno: "RETORNO",
};

function buildAnimalLabel(animal) {
  const age = formatAgeDisplay({ idade: animal?.idade });
  return `${animal?.nome ?? "Animal"} (${animal?.especie ?? "-"} • ${animal?.raca ?? "-"} • ${age})`;
}

function buildPayload(form) {
  const descricao = [
    form.descricaoSintomas.trim(),
    form.observacoesTutor.trim()
      ? `Observações: ${form.observacoesTutor.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    animalId: form.animalId,
    servicoId: form.servicoId ? Number(form.servicoId) : null,
    tipo: TIPO_MAP[DEFAULT_TIPO_SOLICITACAO] ?? DEFAULT_TIPO_SOLICITACAO,
    descricao,
    descricaoSintomas: form.descricaoSintomas.trim(),
    dataPreferencial: form.dataPreferencial,
    contato: form.contato.trim(),
    observacoesTutor: form.observacoesTutor.trim(),
  };
}

export default function SolicitacaoAtendimento() {
  const { user } = useAuth();

  const [animais, setAnimais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loadingAnimais, setLoadingAnimais] = useState(false);
  const [loadingServicos, setLoadingServicos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [mensagemErro, setMensagemErro] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errosValidacao, setErrosValidacao] = useState({});

  useEffect(() => {
    if (!form.contato && (user?.telefone || user?.email)) {
      setForm((current) => ({
        ...current,
        contato: user.telefone || user.email || "",
      }));
    }
  }, [user, form.contato]);

  useEffect(() => {
    async function carregarAnimais() {
      setLoadingAnimais(true);
      setMensagemErro(null);

      try {
        const response = await listMyAnimals();
        const lista = Array.isArray(response) ? response : [];
        const normalized = lista.map((a) => ({
          ...a,
          idade: a.idade ?? null,
        }));

        setAnimais(normalized);
      } catch (error) {
        console.error("Erro ao carregar animais:", error);
        setAnimais([]);
        setMensagemErro(
          "Não foi possível carregar os animais disponíveis para a solicitação.",
        );
      } finally {
        setLoadingAnimais(false);
      }
    }

    carregarAnimais();
  }, []);

  useEffect(() => {
    async function carregarServicos() {
      setLoadingServicos(true);
      setMensagemErro(null);

      try {
        const response = await getPublicServices();
        const lista = Array.isArray(response) ? response : [];
        const ativos = lista.filter((item) => Boolean(item?.ativo));

        setServicos(ativos);

        if (ativos.length > 0) {
          setForm((current) => ({
            ...current,
            servicoId: current.servicoId || String(ativos[0].id),
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar servicos:", error);
        setServicos([]);
        setMensagemErro(
          "Não foi possível carregar os serviços disponíveis para solicitação.",
        );
      } finally {
        setLoadingServicos(false);
      }
    }

    carregarServicos();
  }, []);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (errosValidacao[name]) {
      setErrosValidacao((current) => ({
        ...current,
        [name]: undefined,
      }));
    }
  }

  function validarFormulario() {
    const erros = {};

    if (!form.animalId)
      erros.animalId = "Selecione o animal que necessita de atendimento.";
    if (!form.servicoId)
      erros.servicoId = "Selecione o serviço que deseja solicitar.";
    if (!form.contato.trim())
      erros.contato = "Informe um telefone ou e-mail de contato.";
    if (!form.descricaoSintomas.trim())
      erros.descricaoSintomas =
        "Descreva brevemente os sintomas ou o motivo da cirurgia.";
    if (form.descricaoSintomas.trim().length < 10)
      erros.descricaoSintomas =
        "A descrição deve conter pelo menos 10 caracteres.";
    if (!form.dataPreferencial)
      erros.dataPreferencial =
        "Insira uma data preferencial para o agendamento.";

    if (form.dataPreferencial) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataEscolhida = new Date(form.dataPreferencial);
      dataEscolhida.setHours(0, 0, 0, 0);

      if (dataEscolhida < hoje) {
        erros.dataPreferencial = "A data preferencial não pode ser retroativa.";
      }
    }

    setErrosValidacao(erros);
    return Object.keys(erros).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagemSucesso(null);
    setMensagemErro(null);

    if (!validarFormulario()) return;

    setSubmitting(true);

    try {
      await createSolicitacao(buildPayload(form));

      setMensagemSucesso(
        `Solicitação de ${servicos.find((item) => String(item.id) === String(form.servicoId))?.nome ?? "serviço selecionado"} enviada com sucesso! Nossa equipe entrará em contato.`,
      );
      setForm({
        ...INITIAL_FORM_STATE,
        contato: user?.telefone || user?.email || "",
      });
      setErrosValidacao({});
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      setMensagemErro(
        "Não foi possível enviar a solicitação no momento. Tente novamente em instantes.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="solicitacao-atendimento-page">
      <div className="solicitacao-atendimento-card">
        {mensagemSucesso && (
          <div className="solicitacao-atendimento-alert solicitacao-atendimento-alert--success">
            <span>✅</span> {mensagemSucesso}
          </div>
        )}

        {mensagemErro && (
          <div className="solicitacao-atendimento-alert solicitacao-atendimento-alert--error">
            <span>❌</span> {mensagemErro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="solicitacao-atendimento-form">
          <div>
            <label className="solicitacao-atendimento-label">
              Selecione o Animal *
            </label>
            <select
              name="animalId"
              value={form.animalId}
              onChange={handleInputChange}
              disabled={loadingAnimais || submitting}
              className={`solicitacao-atendimento-input ${errosValidacao.animalId ? "has-error" : ""}`}
            >
              <option value="">
                -- Selecione um animal sob sua responsabilidade --
              </option>
              {animais.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {buildAnimalLabel(animal)}
                </option>
              ))}
            </select>
            {errosValidacao.animalId && (
              <span className="solicitacao-atendimento-feedback">
                {errosValidacao.animalId}
              </span>
            )}
          </div>

          <div>
            <label className="solicitacao-atendimento-label">
              Serviço solicitado *
            </label>
            <select
              name="servicoId"
              value={form.servicoId}
              onChange={handleInputChange}
              disabled={loadingServicos || submitting}
              className={`solicitacao-atendimento-input ${errosValidacao.servicoId ? "has-error" : ""}`}
            >
              <option value="">-- Selecione um serviço --</option>
              {servicos.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome}
                  {servico.duracaoMinutos
                    ? ` • ${servico.duracaoMinutos} min`
                    : ""}
                </option>
              ))}
            </select>
            {errosValidacao.servicoId && (
              <span className="solicitacao-atendimento-feedback">
                {errosValidacao.servicoId}
              </span>
            )}
          </div>

          <div>
            <label className="solicitacao-atendimento-label">
              Data Preferencial para Atendimento *
            </label>
            <input
              type="date"
              name="dataPreferencial"
              value={form.dataPreferencial}
              onChange={handleInputChange}
              disabled={submitting}
              className={`solicitacao-atendimento-input ${errosValidacao.dataPreferencial ? "has-error" : ""}`}
            />
            {errosValidacao.dataPreferencial && (
              <span className="solicitacao-atendimento-feedback">
                {errosValidacao.dataPreferencial}
              </span>
            )}
          </div>

          <div>
            <label className="solicitacao-atendimento-label">
              Contato para retorno *
            </label>
            <input
              type="text"
              name="contato"
              value={form.contato}
              onChange={handleInputChange}
              disabled={submitting}
              placeholder="Telefone ou e-mail"
              className={`solicitacao-atendimento-input ${errosValidacao.contato ? "has-error" : ""}`}
            />
            {errosValidacao.contato && (
              <span className="solicitacao-atendimento-feedback">
                {errosValidacao.contato}
              </span>
            )}
          </div>

          <div>
            <label className="solicitacao-atendimento-label">
              Descrição do Caso clínico / Sintomas *
            </label>
            <textarea
              name="descricaoSintomas"
              rows={4}
              value={form.descricaoSintomas}
              onChange={handleInputChange}
              disabled={submitting}
              placeholder="Descreva o comportamento do animal, sintomas aparentes ou a cirurgia necessária..."
              className={`solicitacao-atendimento-textarea ${errosValidacao.descricaoSintomas ? "has-error" : ""}`}
            />
            {errosValidacao.descricaoSintomas && (
              <span className="solicitacao-atendimento-feedback">
                {errosValidacao.descricaoSintomas}
              </span>
            )}
          </div>

          <div>
            <label className="solicitacao-atendimento-label">
              Restrições ou Observações Adicionais (Opcional)
            </label>
            <textarea
              name="observacoesTutor"
              rows={2}
              value={form.observacoesTutor}
              onChange={handleInputChange}
              disabled={submitting}
              placeholder="Ex: Animal agressivo com outros cães, alergia a algum medicamento, restrição de horário..."
              className="solicitacao-atendimento-textarea"
            />
          </div>

          <div className="solicitacao-atendimento-actions">
            <button
              type="submit"
              disabled={submitting || loadingAnimais}
              className="solicitacao-atendimento-button"
            >
              {submitting
                ? "Enviando Solicitação..."
                : "Enviar Solicitação Médica"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
