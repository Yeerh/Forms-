const { randomUUID } = require("crypto");
const fs = require("fs");
const path = require("path");
const { readFormularios, writeFormularios } = require("../utils/storage");
const { validateFormulario } = require("../validators/formularioValidator");

const checklistTemplate = [
  { id: "documento_valido", label: "Documento valido", checked: false },
  { id: "informacoes_completas", label: "Informacoes completas", checked: false },
  { id: "dados_conferidos", label: "Dados conferidos", checked: false },
  { id: "aprovacao_secretaria", label: "Aprovacao da secretaria", checked: false },
];

function safeParseArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(trimmedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return trimmedValue
      .split(",")
      .map((item) => item.replace(/\\/g, "").replace(/^[\[\]"']+|[\[\]"']+$/g, "").trim())
      .filter(Boolean);
  }
}

function formatUploadedFiles(files) {
  if (!Array.isArray(files)) {
    return [];
  }

  return files.map((file) => ({
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`,
  }));
}

function cleanupUploadedFiles(files) {
  if (!Array.isArray(files)) {
    return;
  }

  files.forEach((file) => {
    if (!file.path) {
      return;
    }

    try {
      fs.unlinkSync(path.resolve(file.path));
    } catch (error) {
      // Ignore cleanup errors to avoid masking validation response.
    }
  });
}

function normalizePayload(body, files) {
  return {
    secretaria: body.secretaria,
    periodoReferencia: body.periodoReferencia,
    nomeResponsavel: body.nomeResponsavel,
    matricula: body.matricula,
    tipoProjetoAcao: body.tipoProjetoAcao,
    nomeProjeto: body.nomeProjeto,
    objetivo: body.objetivo,
    metaComoAlcancar: body.metaComoAlcancar,
    quantitativo: body.quantitativo,
    unidade: body.unidade,
    endereco: body.endereco,
    situacaoProjeto: body.situacaoProjeto,
    percentualExecucao: body.percentualExecucao,
    prazoPrevistoConclusao: body.prazoPrevistoConclusao,
    prazoAtualizado: body.prazoAtualizado,
    contratadoNome: body.contratadoNome,
    numeroContrato: body.numeroContrato,
    objetoContrato: body.objetoContrato,
    avancosPeriodo: body.avancosPeriodo,
    dificuldadesEntraves: body.dificuldadesEntraves,
    acoesNecessarias: body.acoesNecessarias,
    tiposDocumentos: safeParseArray(body.tiposDocumentos),
    outrosDocumento: body.outrosDocumento,
    dataEnvio: body.dataEnvio,
    formaEnvio: body.formaEnvio,
    arquivos: formatUploadedFiles(files),
  };
}

function ensureChecklist(rawChecklist) {
  const normalized = Array.isArray(rawChecklist) ? rawChecklist : [];
  const map = new Map(normalized.map((item) => [item.id, !!item.checked]));

  return checklistTemplate.map((item) => ({
    id: item.id,
    label: item.label,
    checked: map.has(item.id) ? map.get(item.id) : item.checked,
  }));
}

function getChecklistStatus(checklist) {
  const checkedCount = checklist.filter((item) => item.checked).length;

  if (checkedCount === 0) {
    return "pendente";
  }

  if (checkedCount === checklist.length) {
    return "aprovado";
  }

  return "em_analise";
}

function buildDocumentos(tiposDocumentos, arquivos, outrosDocumento) {
  const tipos = Array.isArray(tiposDocumentos) ? tiposDocumentos : [];
  const normalizedOutros =
    tipos.includes("Outros") && outrosDocumento ? `Outros: ${outrosDocumento}` : "Outros";

  return arquivos.map((arquivo, index) => {
    let tipo = tipos[index] || tipos[0] || "Documento de apoio";
    if (tipo === "Outros") {
      tipo = normalizedOutros;
    }

    return {
      id: randomUUID(),
      tipo,
      arquivo,
    };
  });
}

function mapForPersistence(payload) {
  const checklist = ensureChecklist([]);
  const documentos = buildDocumentos(payload.tiposDocumentos, payload.arquivos, payload.outrosDocumento);

  return {
    id: randomUUID(),
    nomePessoa: payload.nomeResponsavel,
    matricula: payload.matricula,
    identificador: {
      secretaria: payload.secretaria,
      periodoReferencia: payload.periodoReferencia,
      nomeResponsavel: payload.nomeResponsavel,
      matricula: payload.matricula,
    },
    projetoAcao: {
      tipoProjetoAcao: payload.tipoProjetoAcao,
      nomeProjeto: payload.nomeProjeto,
      objetivo: payload.objetivo,
    },
    meta: {
      metaComoAlcancar: payload.metaComoAlcancar,
      quantitativo: Number(payload.quantitativo),
    },
    execucao: {
      unidade: payload.unidade,
      endereco: payload.endereco,
    },
    situacaoProjeto: {
      status: payload.situacaoProjeto,
      percentualExecucao: Number(payload.percentualExecucao),
    },
    prazo: {
      prazoPrevistoConclusao: payload.prazoPrevistoConclusao,
      prazoAtualizado: payload.prazoAtualizado || null,
    },
    contratado: {
      nome: payload.contratadoNome,
      numeroContrato: payload.numeroContrato,
      objeto: payload.objetoContrato,
    },
    observacoes: {
      avancosPeriodo: payload.avancosPeriodo,
      dificuldadesEntraves: payload.dificuldadesEntraves,
      acoesNecessarias: payload.acoesNecessarias,
    },
    documentosApoio: {
      tipos: payload.tiposDocumentos,
      outros: payload.outrosDocumento || null,
      arquivos: payload.arquivos,
    },
    documentos,
    checklist,
    verificado: false,
    statusVerificacao: "pendente",
    envio: {
      dataEnvio: payload.dataEnvio,
      formaEnvio: payload.formaEnvio,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checklistUpdatedAt: null,
  };
}

function mapLegacyDocumentos(item) {
  const tipos = item.documentosApoio?.tipos || [];
  const arquivos = item.documentosApoio?.arquivos || [];

  return arquivos.map((arquivo, index) => ({
    id: randomUUID(),
    tipo: tipos[index] || tipos[0] || "Documento de apoio",
    arquivo,
  }));
}

function normalizeFormulario(item) {
  const checklist = ensureChecklist(item.checklist);
  const statusVerificacao = item.statusVerificacao || getChecklistStatus(checklist);

  return {
    ...item,
    nomePessoa: item.nomePessoa || item.identificador?.nomeResponsavel || "",
    matricula: item.matricula || item.identificador?.matricula || "",
    documentos: Array.isArray(item.documentos) && item.documentos.length ? item.documentos : mapLegacyDocumentos(item),
    checklist,
    statusVerificacao,
    verificado: typeof item.verificado === "boolean" ? item.verificado : checklist.some((entry) => entry.checked),
  };
}

function getFormulariosForRead() {
  return readFormularios().map(normalizeFormulario);
}

function createFormulario(request, response) {
  const payload = normalizePayload(request.body, request.files);
  const validationErrors = validateFormulario(payload);

  if (Object.keys(validationErrors).length > 0) {
    cleanupUploadedFiles(request.files);
    return response.status(400).json({
      message: "Falha na validacao do formulario.",
      errors: validationErrors,
    });
  }

  const formularios = getFormulariosForRead();
  const novoFormulario = mapForPersistence(payload);
  formularios.push(novoFormulario);
  writeFormularios(formularios);

  return response.status(201).json({
    message: "Formulario enviado com sucesso.",
    formulario: novoFormulario,
  });
}

function getFormularios(request, response) {
  const query = String(request.query.query || "").trim().toLowerCase();

  const items = getFormulariosForRead()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((item) => {
      if (!query) {
        return true;
      }

      const nome = String(item.nomePessoa || "").toLowerCase();
      const matricula = String(item.matricula || "").toLowerCase();
      return nome.includes(query) || matricula.includes(query);
    })
    .map((item) => ({
      id: item.id,
      nomePessoa: item.nomePessoa,
      matricula: item.matricula,
      statusVerificacao: item.statusVerificacao,
      verificado: item.verificado,
      checklistUpdatedAt: item.checklistUpdatedAt,
      totalDocumentos: Array.isArray(item.documentos) ? item.documentos.length : 0,
    }));

  return response.status(200).json({
    total: items.length,
    items,
  });
}

function getFormularioById(request, response) {
  const formularios = getFormulariosForRead();
  const item = formularios.find((entry) => entry.id === request.params.id);

  if (!item) {
    return response.status(404).json({
      message: "Formulario nao encontrado.",
    });
  }

  return response.status(200).json({
    formulario: item,
  });
}

function normalizeChecklistInput(checklistInput) {
  if (!Array.isArray(checklistInput)) {
    return null;
  }

  const map = new Map();
  checklistInput.forEach((item) => {
    if (!item || !item.id) {
      return;
    }

    map.set(item.id, !!item.checked);
  });

  return checklistTemplate.map((entry) => ({
    id: entry.id,
    label: entry.label,
    checked: map.has(entry.id) ? map.get(entry.id) : false,
  }));
}

function updateChecklist(request, response) {
  const checklist = normalizeChecklistInput(request.body.checklist);

  if (!checklist) {
    return response.status(400).json({
      message: "Checklist invalido.",
    });
  }

  const formularios = getFormulariosForRead();
  const index = formularios.findIndex((entry) => entry.id === request.params.id);

  if (index < 0) {
    return response.status(404).json({
      message: "Formulario nao encontrado.",
    });
  }

  const current = formularios[index];
  const statusVerificacao = getChecklistStatus(checklist);
  const updated = {
    ...current,
    checklist,
    statusVerificacao,
    verificado: true,
    updatedAt: new Date().toISOString(),
    checklistUpdatedAt: new Date().toISOString(),
    checklistUpdatedBy: request.user?.email || request.user?.name || "usuario",
  };

  formularios[index] = updated;
  writeFormularios(formularios);

  return response.status(200).json({
    message: "Checklist atualizado com sucesso.",
    formulario: updated,
  });
}

module.exports = {
  createFormulario,
  getFormularioById,
  getFormularios,
  updateChecklist,
};
