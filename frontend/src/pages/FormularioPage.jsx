import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postFormulario } from "../api/formularioApi";
import DocumentChecklist from "../components/DocumentChecklist";
import FileUploader from "../components/FileUploader";
import FormField from "../components/FormField";
import ProgressBar from "../components/ProgressBar";
import SectionCard from "../components/SectionCard";
import StatusCheckboxGroup from "../components/StatusCheckboxGroup";
import SuccessToast from "../components/SuccessToast";

const allowedMimeTypes = ["application/pdf", "image/png"];
const maxFiles = 10;

const labelsByField = {
  secretaria: "Secretaria",
  periodoReferencia: "Período de referência",
  nomeResponsavel: "Nome",
  matricula: "Matrícula",
  nomeProjeto: "Nome do projeto",
  objetivo: "Objetivo",
  metaComoAlcancar: "Meta e como alcançar",
  quantitativo: "Quantitativo",
  unidade: "Unidade",
  endereco: "Endereço",
  situacaoProjeto: "Situação do projeto",
  percentualExecucao: "Percentual de execução",
  prazoPrevistoConclusao: "Prazo previsto de conclusão",
  contratadoNome: "Nome do contratado",
  numeroContrato: "Número do contrato",
  objetoContrato: "Objeto",
  avancosPeriodo: "Principais avanços no período",
  dificuldadesEntraves: "Principais dificuldades ou entraves",
  acoesNecessarias: "Ações necessárias",
  dataEnvio: "Data do envio",
  formaEnvio: "Forma de envio",
};

const requiredFields = [
  "secretaria",
  "periodoReferencia",
  "nomeResponsavel",
  "matricula",
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
];

function today() {
  return new Date().toISOString().split("T")[0];
}

function createInitialFormData() {
  return {
    secretaria: "",
    periodoReferencia: "",
    nomeResponsavel: "",
    matricula: "",
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

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function validateForm(formData, files) {
  const nextErrors = {};

  requiredFields.forEach((field) => {
    if (isBlank(formData[field])) {
      nextErrors[field] = `${labelsByField[field]} é obrigatório(a).`;
    }
  });

  const percentual = Number(formData.percentualExecucao);
  if (!isBlank(formData.percentualExecucao) && (Number.isNaN(percentual) || percentual < 0 || percentual > 100)) {
    nextErrors.percentualExecucao = "Informe um percentual entre 0 e 100.";
  }

  const quantitativo = Number(formData.quantitativo);
  if (!isBlank(formData.quantitativo) && (Number.isNaN(quantitativo) || quantitativo < 0)) {
    nextErrors.quantitativo = "Quantitativo deve ser maior ou igual a 0.";
  }

  if (!Array.isArray(formData.tiposDocumentos) || formData.tiposDocumentos.length === 0) {
    nextErrors.tiposDocumentos = "Selecione ao menos um tipo de documento.";
  }

  if (formData.tiposDocumentos.includes("Outros") && isBlank(formData.outrosDocumento)) {
    nextErrors.outrosDocumento = "Descreva o documento no campo Outros.";
  }

  if (!files.length) {
    nextErrors.arquivos = "Envie ao menos um arquivo de apoio.";
  }

  if (files.length > maxFiles) {
    nextErrors.arquivos = `Envie no máximo ${maxFiles} arquivos.`;
  }

  const hasInvalidFile = files.some((file) => !allowedMimeTypes.includes(file.type));
  if (hasInvalidFile) {
    nextErrors.arquivos = "Apenas arquivos PDF e PNG são permitidos.";
  }

  return nextErrors;
}

function FormularioPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(createInitialFormData);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const progress = useMemo(() => {
    const checks = requiredFields.map((field) => !isBlank(formData[field]));
    checks.push(formData.tiposDocumentos.length > 0);
    checks.push(files.length > 0);
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [formData, files]);

  function onInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function onStatusChange(status) {
    setFormData((current) => ({
      ...current,
      situacaoProjeto: status,
    }));

    setErrors((current) => ({
      ...current,
      situacaoProjeto: "",
    }));
  }

  function onToggleTipoDocumento(tipo) {
    setFormData((current) => {
      const hasItem = current.tiposDocumentos.includes(tipo);
      const nextTipos = hasItem
        ? current.tiposDocumentos.filter((item) => item !== tipo)
        : [...current.tiposDocumentos, tipo];

      return {
        ...current,
        tiposDocumentos: nextTipos,
        outrosDocumento: nextTipos.includes("Outros") ? current.outrosDocumento : "",
      };
    });

    setErrors((current) => ({
      ...current,
      tiposDocumentos: "",
      outrosDocumento: "",
    }));
  }

  function onFilesSelected(selectedFiles) {
    const invalidFile = selectedFiles.find((file) => !allowedMimeTypes.includes(file.type));
    if (invalidFile) {
      setErrors((current) => ({
        ...current,
        arquivos: "Apenas arquivos PDF e PNG são permitidos.",
      }));
      return;
    }

    setFiles((current) => {
      const merged = [...current, ...selectedFiles];
      const unique = merged.filter((file, index, array) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        return array.findIndex((item) => `${item.name}-${item.size}-${item.lastModified}` === key) === index;
      });

      return unique.slice(0, maxFiles);
    });

    setErrors((current) => ({
      ...current,
      arquivos: "",
    }));
  }

  function onFileRemove(fileName) {
    setFiles((current) => current.filter((file) => file.name !== fileName));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setApiError("");
    setSuccessMessage("");

    const nextErrors = validateForm(formData, files);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

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

    try {
      setSubmitting(true);
      const response = await postFormulario(payload);
      setSuccessMessage(response.message || "Formulário enviado com sucesso.");
      setFormData(createInitialFormData());
      setFiles([]);
      setErrors({});
    } catch (requestError) {
      const serverMessage =
        requestError.response?.data?.message || "Não foi possível concluir o envio. Tente novamente.";
      const serverErrors = requestError.response?.data?.errors || {};
      setApiError(serverMessage);
      setErrors((current) => ({
        ...current,
        ...serverErrors,
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="title-row">
        <div>
          <h2>Formulário de Acompanhamento</h2>
          <p>Preencha os dados abaixo para registrar o andamento do projeto.</p>
        </div>
        <button type="button" className="ghost-button" onClick={() => navigate("/dashboard")}>
          Ver Dashboard
        </button>
      </div>

      <ProgressBar value={progress} />

      {successMessage ? <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} /> : null}
      {apiError ? <p className="api-error">{apiError}</p> : null}

      <form className="form-layout" onSubmit={onSubmit} noValidate>
        <SectionCard title="Seção 1 - Identificador">
          <div className="grid-2">
            <FormField
              label="Secretaria"
              name="secretaria"
              value={formData.secretaria}
              onChange={onInputChange}
              error={errors.secretaria}
              required
              placeholder="Ex.: Secretaria de Educação"
            />
            <FormField
              label="Período de referência"
              name="periodoReferencia"
              type="text"
              value={formData.periodoReferencia}
              onChange={onInputChange}
              error={errors.periodoReferencia}
              required
              placeholder="Ex.: 1º trimestre de 2026"
            />
            <FormField
              label="Nome"
              name="nomeResponsavel"
              value={formData.nomeResponsavel}
              onChange={onInputChange}
              error={errors.nomeResponsavel}
              required
            />
            <FormField
              label="Matrícula"
              name="matricula"
              value={formData.matricula}
              onChange={onInputChange}
              error={errors.matricula}
              required
            />
          </div>
        </SectionCard>

        <SectionCard title="Seção 2 - Dados do Projeto/Ação">
          <div className="grid-2">
            <FormField
              label="Nome do projeto"
              name="nomeProjeto"
              value={formData.nomeProjeto}
              onChange={onInputChange}
              error={errors.nomeProjeto}
              required
              className="grid-full"
            />
            <FormField
              label="Objetivo"
              name="objetivo"
              value={formData.objetivo}
              onChange={onInputChange}
              error={errors.objetivo}
              required
              textarea
              rows={4}
              className="grid-full"
            />
          </div>
        </SectionCard>

        <SectionCard title="Seção 3 - Meta">
          <div className="grid-2">
            <FormField
              label="Meta e como alcançar"
              name="metaComoAlcancar"
              value={formData.metaComoAlcancar}
              onChange={onInputChange}
              error={errors.metaComoAlcancar}
              required
              textarea
              rows={4}
              className="grid-full"
            />
            <FormField
              label="Quantitativo"
              name="quantitativo"
              type="number"
              min={0}
              step="1"
              value={formData.quantitativo}
              onChange={onInputChange}
              error={errors.quantitativo}
              required
            />
          </div>
        </SectionCard>

        <SectionCard title="Seção 4 - Execução">
          <div className="grid-2">
            <FormField
              label="Unidade"
              name="unidade"
              value={formData.unidade}
              onChange={onInputChange}
              error={errors.unidade}
              required
            />
            <FormField
              label="Endereço"
              name="endereco"
              value={formData.endereco}
              onChange={onInputChange}
              error={errors.endereco}
              required
            />
          </div>
        </SectionCard>

        <SectionCard title="Seção 5 - Situação do Projeto">
          <div className="grid-2">
            <StatusCheckboxGroup
              value={formData.situacaoProjeto}
              onChange={onStatusChange}
              error={errors.situacaoProjeto}
            />
            <FormField
              label="Percentual de execução (%)"
              name="percentualExecucao"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={formData.percentualExecucao}
              onChange={onInputChange}
              error={errors.percentualExecucao}
              required
            />
          </div>
        </SectionCard>

        <SectionCard title="Seção 6 - Prazo">
          <div className="grid-2">
            <FormField
              label="Prazo previsto de conclusão"
              name="prazoPrevistoConclusao"
              type="date"
              value={formData.prazoPrevistoConclusao}
              onChange={onInputChange}
              error={errors.prazoPrevistoConclusao}
              required
            />
            <FormField
              label="Prazo atualizado (opcional)"
              name="prazoAtualizado"
              type="date"
              value={formData.prazoAtualizado}
              onChange={onInputChange}
              error={errors.prazoAtualizado}
            />
          </div>
        </SectionCard>

        <SectionCard title="Seção 7 - Contratado">
          <div className="grid-2">
            <FormField
              label="Nome"
              name="contratadoNome"
              value={formData.contratadoNome}
              onChange={onInputChange}
              error={errors.contratadoNome}
              required
            />
            <FormField
              label="Número do contrato"
              name="numeroContrato"
              value={formData.numeroContrato}
              onChange={onInputChange}
              error={errors.numeroContrato}
              required
            />
            <FormField
              label="Objeto"
              name="objetoContrato"
              value={formData.objetoContrato}
              onChange={onInputChange}
              error={errors.objetoContrato}
              required
              textarea
              rows={4}
              className="grid-full"
            />
          </div>
        </SectionCard>

        <SectionCard title="Seção 8 - Observações">
          <div className="grid-2">
            <FormField
              label="Principais avanços no período"
              name="avancosPeriodo"
              value={formData.avancosPeriodo}
              onChange={onInputChange}
              error={errors.avancosPeriodo}
              required
              textarea
              rows={4}
              className="grid-full"
            />
            <FormField
              label="Principais dificuldades ou entraves"
              name="dificuldadesEntraves"
              value={formData.dificuldadesEntraves}
              onChange={onInputChange}
              error={errors.dificuldadesEntraves}
              required
              textarea
              rows={4}
              className="grid-full"
            />
            <FormField
              label="Ações necessárias"
              name="acoesNecessarias"
              value={formData.acoesNecessarias}
              onChange={onInputChange}
              error={errors.acoesNecessarias}
              required
              textarea
              rows={4}
              className="grid-full"
            />
          </div>
        </SectionCard>

        <SectionCard title="Seção 9 - Documentos de Apoio">
          <DocumentChecklist
            selected={formData.tiposDocumentos}
            onToggle={onToggleTipoDocumento}
            outrosValue={formData.outrosDocumento}
            onOutrosChange={onInputChange}
            errors={errors}
          />
          <FileUploader files={files} onFilesSelected={onFilesSelected} onFileRemove={onFileRemove} error={errors.arquivos} />
        </SectionCard>

        <SectionCard title="Seção 10 - Envio">
          <div className="grid-2">
            <FormField
              label="Data do envio"
              name="dataEnvio"
              type="date"
              value={formData.dataEnvio}
              onChange={onInputChange}
              error={errors.dataEnvio}
              required
            />
            <FormField
              label="Forma de envio"
              name="formaEnvio"
              value={formData.formaEnvio}
              onChange={onInputChange}
              error={errors.formaEnvio}
              required
              placeholder="Ex.: Sistema web institucional"
            />
          </div>
        </SectionCard>

        <div className="submit-row">
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar formulário"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default FormularioPage;

