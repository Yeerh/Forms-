const { randomUUID } = require("crypto");
const fs = require("fs");
const path = require("path");
const { readFormularios, writeFormularios } = require("../utils/storage");
const { validateFormulario } = require("../validators/formularioValidator");

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

function mapForPersistence(payload) {
  return {
    id: randomUUID(),
    identificador: {
      secretaria: payload.secretaria,
      periodoReferencia: payload.periodoReferencia,
      nomeResponsavel: payload.nomeResponsavel,
      matricula: payload.matricula,
    },
    projetoAcao: {
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
    envio: {
      dataEnvio: payload.dataEnvio,
      formaEnvio: payload.formaEnvio,
    },
    createdAt: new Date().toISOString(),
  };
}

function createFormulario(request, response) {
  const payload = normalizePayload(request.body, request.files);
  const validationErrors = validateFormulario(payload);

  if (Object.keys(validationErrors).length > 0) {
    cleanupUploadedFiles(request.files);
    return response.status(400).json({
      message: "Falha na validação do formulário.",
      errors: validationErrors,
    });
  }

  const formularios = readFormularios();
  const novoFormulario = mapForPersistence(payload);
  formularios.push(novoFormulario);
  writeFormularios(formularios);

  return response.status(201).json({
    message: "Formulário enviado com sucesso.",
    formulario: novoFormulario,
  });
}

function getFormularios(request, response) {
  const formularios = readFormularios().sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return response.status(200).json({
    total: formularios.length,
    items: formularios,
  });
}

module.exports = {
  createFormulario,
  getFormularios,
};
