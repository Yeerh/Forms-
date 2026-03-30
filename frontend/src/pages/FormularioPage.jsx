import { useEffect, useMemo, useState } from "react";
import { submitFormulario } from "../api/formularioApi";

const tiposDocumento = [
  "Relatorios internos",
  "Fotos da execucao",
  "Documentos de licitacao/contrato",
  "Outros",
];

const situacoesProjeto = ["Em andamento", "Concluido", "Atencao (atraso ou dificuldade)", "Nao iniciado"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createInitialState() {
  return {
    secretaria: "",
    periodoReferencia: "",
    nomeResponsavel: "",
    matricula: "",
    tipoProjetoAcao: "",
    nomeProjeto: "",
    objetivo: "",
    metaComoAlcancar: "",
    quantitativo: "",
    unidade: "",
    endereco: "",
    situacaoProjeto: "",
    percentualExecucao: "",
    prazoPrevistoConclusao: "",
    prazoAtualizado: "",
    contratadoNome: "",
    numeroContrato: "",
    objetoContrato: "",
    avancosPeriodo: "",
    dificuldadesEntraves: "",
    acoesNecessarias: "",
    tiposDocumentos: [],
    outrosDocumento: "",
    dataEnvio: today(),
    formaEnvio: "",
  };
}

function FieldBlock({ label, error, required = false, full = false, children }) {
  return (
    <label className={`field-label ${full ? "full-width" : ""}`.trim()}>
      <span className="field-title">
        {label}
        {required ? <span className="required-mark">*</span> : null}
      </span>
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

function FormularioPage() {
  const [formData, setFormData] = useState(createInitialState);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const requiredFields = useMemo(
    () => [
      "secretaria",
      "periodoReferencia",
      "nomeResponsavel",
      "matricula",
      "tipoProjetoAcao",
      "nomeProjeto",
      "objetivo",
      "metaComoAlcancar",
      "quantitativo",
      "unidade",
      "endereco",
      "situacaoProjeto",
      "percentualExecucao",
      "prazoPrevistoConclusao",
      "contratadoNome",
      "numeroContrato",
      "objetoContrato",
      "avancosPeriodo",
      "dificuldadesEntraves",
      "acoesNecessarias",
      "dataEnvio",
      "formaEnvio",
    ],
    []
  );

  const completion = useMemo(() => {
    const filled = requiredFields.filter((field) => !isBlank(formData[field])).length;
    const extra = formData.tiposDocumentos.length > 0 ? 1 : 0;
    const filesFilled = files.length > 0 ? 1 : 0;
    const total = requiredFields.length + 2;
    const done = filled + extra + filesFilled;
    return {
      done,
      total,
      percent: Math.round((done / total) * 100),
    };
  }, [files.length, formData, requiredFields]);
  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === "";
  }

  function updateField(name, value) {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function toggleTipoDocumento(tipo) {
    setFormData((current) => {
      const alreadySelected = current.tiposDocumentos.includes(tipo);
      const next = alreadySelected
        ? current.tiposDocumentos.filter((item) => item !== tipo)
        : [...current.tiposDocumentos, tipo];

      return {
        ...current,
        tiposDocumentos: next,
        outrosDocumento: next.includes("Outros") ? current.outrosDocumento : "",
      };
    });

    setErrors((current) => ({
      ...current,
      tiposDocumentos: "",
      outrosDocumento: "",
    }));
  }

  function handleFileChange(event) {
    const selected = Array.from(event.target.files || []);
    const valid = selected.filter((file) => file.type === "application/pdf" || file.type === "image/png");
    setFiles(valid);
    setErrors((current) => ({ ...current, arquivos: "" }));
  }

  function validate() {
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (isBlank(formData[field])) {
        nextErrors[field] = "Campo obrigatorio.";
      }
    });

    const percentual = Number(formData.percentualExecucao);
    if (!Number.isNaN(percentual) && (percentual < 0 || percentual > 100)) {
      nextErrors.percentualExecucao = "Informe valor entre 0 e 100.";
    }

    const quantitativo = Number(formData.quantitativo);
    if (!Number.isNaN(quantitativo) && quantitativo < 0) {
      nextErrors.quantitativo = "Informe valor maior ou igual a zero.";
    }

    if (!formData.tiposDocumentos.length) {
      nextErrors.tiposDocumentos = "Selecione ao menos um tipo de documento.";
    }

    if (formData.tiposDocumentos.includes("Outros") && isBlank(formData.outrosDocumento)) {
      nextErrors.outrosDocumento = "Descreva o tipo em Outros.";
    }

    if (!files.length) {
      nextErrors.arquivos = "Anexe ao menos um PDF ou PNG.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tiposDocumentos") {
          payload.append(key, JSON.stringify(value));
          return;
        }
        payload.append(key, value);
      });

      files.forEach((file) => {
        payload.append("documentosApoio", file);
      });

      const response = await submitFormulario(payload);
      setSuccessMessage(response.message || "Formulario enviado com sucesso.");
      setFormData(createInitialState());
      setFiles([]);
      setErrors({});
    } catch (error) {
      setApiError(error.response?.data?.message || "Nao foi possivel enviar o formulario.");
      if (error.response?.data?.errors) {
        setErrors((current) => ({ ...current, ...error.response.data.errors }));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="form-page">
      <article className="form-card form-card-enhanced">
        {successMessage ? (
          <div className="form-toast" role="status">
            <div>
              <strong>Envio confirmado</strong>
              <p>{successMessage}</p>
            </div>
            <button type="button" className="ghost-button" onClick={() => setSuccessMessage("")}>
              Fechar
            </button>
          </div>
        ) : null}
        <header className="form-header">
          <div>
            <h2>Formulario de Acompanhamento</h2>
            <p className="muted">Preencha as secoes abaixo. Campos com * sao obrigatorios.</p>
          </div>

          <div className="form-progress">
            <div className="form-progress-head">
              <strong>{completion.done}</strong>
              <span>de {completion.total} itens</span>
            </div>
            <div className="progress-shell">
              <span className="progress-fill" style={{ width: `${completion.percent}%` }} />
            </div>
            <small>{completion.percent}% concluido</small>
          </div>
        </header>

        {apiError ? <p className="api-error">{apiError}</p> : null}

        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          <section className="form-section">
            <h3>1. Identificacao</h3>
            <div className="form-grid">
              <FieldBlock label="Secretaria" error={errors.secretaria} required>
                <input className={errors.secretaria ? "field-input has-error" : "field-input"} value={formData.secretaria} onChange={(event) => updateField("secretaria", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Periodo de referencia" error={errors.periodoReferencia} required>
                <input className={errors.periodoReferencia ? "field-input has-error" : "field-input"} value={formData.periodoReferencia} onChange={(event) => updateField("periodoReferencia", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Nome" error={errors.nomeResponsavel} required>
                <input className={errors.nomeResponsavel ? "field-input has-error" : "field-input"} value={formData.nomeResponsavel} onChange={(event) => updateField("nomeResponsavel", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Matricula" error={errors.matricula} required>
                <input className={errors.matricula ? "field-input has-error" : "field-input"} value={formData.matricula} onChange={(event) => updateField("matricula", event.target.value)} />
              </FieldBlock>
            </div>
          </section>

          <section className="form-section">
            <h3>2. Projeto e Meta</h3>
            <div className="form-grid">
              <FieldBlock label="Projeto ou Acao" error={errors.tipoProjetoAcao} required full>
                <div className="chip-group">
                  {["Projeto", "Acao"].map((tipo) => (
                    <label key={tipo} className={formData.tipoProjetoAcao === tipo ? "chip-option active" : "chip-option"}>
                      <input
                        type="radio"
                        name="tipoProjetoAcao"
                        value={tipo}
                        checked={formData.tipoProjetoAcao === tipo}
                        onChange={(event) => updateField("tipoProjetoAcao", event.target.value)}
                      />
                      <span>{tipo}</span>
                    </label>
                  ))}
                </div>
              </FieldBlock>

              <FieldBlock label="Nome do projeto" error={errors.nomeProjeto} required full>
                <input className={errors.nomeProjeto ? "field-input has-error" : "field-input"} value={formData.nomeProjeto} onChange={(event) => updateField("nomeProjeto", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Objetivo" error={errors.objetivo} required full>
                <textarea rows={3} className={errors.objetivo ? "field-input has-error" : "field-input"} value={formData.objetivo} onChange={(event) => updateField("objetivo", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Meta e como alcancar" error={errors.metaComoAlcancar} required full>
                <textarea rows={3} className={errors.metaComoAlcancar ? "field-input has-error" : "field-input"} value={formData.metaComoAlcancar} onChange={(event) => updateField("metaComoAlcancar", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Quantitativo" error={errors.quantitativo} required>
                <input type="number" min="0" className={errors.quantitativo ? "field-input has-error" : "field-input"} value={formData.quantitativo} onChange={(event) => updateField("quantitativo", event.target.value)} />
              </FieldBlock>
            </div>
          </section>

          <section className="form-section">
            <h3>3. Execucao e Situacao</h3>
            <div className="form-grid">
              <FieldBlock label="Unidade" error={errors.unidade} required>
                <input className={errors.unidade ? "field-input has-error" : "field-input"} value={formData.unidade} onChange={(event) => updateField("unidade", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Endereco" error={errors.endereco} required>
                <input className={errors.endereco ? "field-input has-error" : "field-input"} value={formData.endereco} onChange={(event) => updateField("endereco", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Percentual de execucao (%)" error={errors.percentualExecucao} required>
                <input type="number" min="0" max="100" className={errors.percentualExecucao ? "field-input has-error" : "field-input"} value={formData.percentualExecucao} onChange={(event) => updateField("percentualExecucao", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Prazo previsto de conclusao" error={errors.prazoPrevistoConclusao} required>
                <input type="date" className={errors.prazoPrevistoConclusao ? "field-input has-error" : "field-input"} value={formData.prazoPrevistoConclusao} onChange={(event) => updateField("prazoPrevistoConclusao", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Prazo atualizado (opcional)">
                <input type="date" className="field-input" value={formData.prazoAtualizado} onChange={(event) => updateField("prazoAtualizado", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Situacao do projeto" error={errors.situacaoProjeto} required full>
                <div className="chip-group">
                  {situacoesProjeto.map((status) => (
                    <label key={status} className={formData.situacaoProjeto === status ? "chip-option active" : "chip-option"}>
                      <input type="radio" name="situacaoProjeto" value={status} checked={formData.situacaoProjeto === status} onChange={(event) => updateField("situacaoProjeto", event.target.value)} />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              </FieldBlock>
            </div>
          </section>

          <section className="form-section">
            <h3>4. Contrato e Observacoes</h3>
            <div className="form-grid">
              <FieldBlock label="Nome do contratado" error={errors.contratadoNome} required>
                <input className={errors.contratadoNome ? "field-input has-error" : "field-input"} value={formData.contratadoNome} onChange={(event) => updateField("contratadoNome", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Numero do contrato" error={errors.numeroContrato} required>
                <input className={errors.numeroContrato ? "field-input has-error" : "field-input"} value={formData.numeroContrato} onChange={(event) => updateField("numeroContrato", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Objeto" error={errors.objetoContrato} required full>
                <textarea rows={3} className={errors.objetoContrato ? "field-input has-error" : "field-input"} value={formData.objetoContrato} onChange={(event) => updateField("objetoContrato", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Principais avancos no periodo" error={errors.avancosPeriodo} required full>
                <textarea rows={3} className={errors.avancosPeriodo ? "field-input has-error" : "field-input"} value={formData.avancosPeriodo} onChange={(event) => updateField("avancosPeriodo", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Principais dificuldades ou entraves" error={errors.dificuldadesEntraves} required full>
                <textarea rows={3} className={errors.dificuldadesEntraves ? "field-input has-error" : "field-input"} value={formData.dificuldadesEntraves} onChange={(event) => updateField("dificuldadesEntraves", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Acoes necessarias" error={errors.acoesNecessarias} required full>
                <textarea rows={3} className={errors.acoesNecessarias ? "field-input has-error" : "field-input"} value={formData.acoesNecessarias} onChange={(event) => updateField("acoesNecessarias", event.target.value)} />
              </FieldBlock>
            </div>
          </section>

          <section className="form-section">
            <h3>5. Documentos e Envio</h3>
            <div className="form-grid">
              <FieldBlock label="Tipos de documentos" error={errors.tiposDocumentos} required full>
                <div className="chip-group">
                  {tiposDocumento.map((tipo) => (
                    <label key={tipo} className={formData.tiposDocumentos.includes(tipo) ? "chip-option active" : "chip-option"}>
                      <input type="checkbox" checked={formData.tiposDocumentos.includes(tipo)} onChange={() => toggleTipoDocumento(tipo)} />
                      <span>{tipo}</span>
                    </label>
                  ))}
                </div>
              </FieldBlock>

              {formData.tiposDocumentos.includes("Outros") ? (
                <FieldBlock label="Outros (descreva)" error={errors.outrosDocumento} required full>
                  <input className={errors.outrosDocumento ? "field-input has-error" : "field-input"} value={formData.outrosDocumento} onChange={(event) => updateField("outrosDocumento", event.target.value)} />
                </FieldBlock>
              ) : null}

              <FieldBlock label="Upload de arquivos (PDF/PNG)" error={errors.arquivos} required full>
                <input type="file" className={errors.arquivos ? "field-input has-error" : "field-input"} multiple accept=".pdf,.png" onChange={handleFileChange} />
                {files.length ? (
                  <ul className="file-pill-list">
                    {files.map((file) => (
                      <li key={`${file.name}-${file.lastModified}`} className="file-pill">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <small className="field-inline-note">Nenhum arquivo selecionado.</small>
                )}
              </FieldBlock>

              <FieldBlock label="Data do envio" error={errors.dataEnvio} required>
                <input type="date" className={errors.dataEnvio ? "field-input has-error" : "field-input"} value={formData.dataEnvio} onChange={(event) => updateField("dataEnvio", event.target.value)} />
              </FieldBlock>

              <FieldBlock label="Forma de envio" error={errors.formaEnvio} required>
                <input className={errors.formaEnvio ? "field-input has-error" : "field-input"} value={formData.formaEnvio} onChange={(event) => updateField("formaEnvio", event.target.value)} />
              </FieldBlock>
            </div>
          </section>

          <div className="full-width form-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Enviando..." : "Enviar formulario"}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

export default FormularioPage;

