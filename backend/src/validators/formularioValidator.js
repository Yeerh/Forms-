function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isInvalidDate(value) {
  return Number.isNaN(new Date(value).getTime());
}

function validateFormulario(payload) {
  const errors = {};

  const requiredFields = {
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

  Object.entries(requiredFields).forEach(([key, label]) => {
    if (isBlank(payload[key])) {
      errors[key] = `${label} é obrigatório(a).`;
    }
  });

  const quantitativo = Number(payload.quantitativo);
  if (!isBlank(payload.quantitativo) && (Number.isNaN(quantitativo) || quantitativo < 0)) {
    errors.quantitativo = "Quantitativo deve ser um número maior ou igual a 0.";
  }

  const percentual = Number(payload.percentualExecucao);
  if (
    !isBlank(payload.percentualExecucao) &&
    (Number.isNaN(percentual) || percentual < 0 || percentual > 100)
  ) {
    errors.percentualExecucao = "Percentual deve estar entre 0 e 100.";
  }

  if (!isBlank(payload.prazoPrevistoConclusao) && isInvalidDate(payload.prazoPrevistoConclusao)) {
    errors.prazoPrevistoConclusao = "Prazo previsto precisa ser uma data válida.";
  }

  if (!isBlank(payload.prazoAtualizado) && isInvalidDate(payload.prazoAtualizado)) {
    errors.prazoAtualizado = "Prazo atualizado precisa ser uma data válida.";
  }

  if (!isBlank(payload.dataEnvio) && isInvalidDate(payload.dataEnvio)) {
    errors.dataEnvio = "Data do envio precisa ser uma data válida.";
  }

  if (!Array.isArray(payload.tiposDocumentos) || payload.tiposDocumentos.length === 0) {
    errors.tiposDocumentos = "Selecione ao menos um tipo de documento de apoio.";
  }

  if (
    Array.isArray(payload.tiposDocumentos) &&
    payload.tiposDocumentos.includes("Outros") &&
    isBlank(payload.outrosDocumento)
  ) {
    errors.outrosDocumento = "Descreva o tipo de documento em 'Outros'.";
  }

  if (!Array.isArray(payload.arquivos) || payload.arquivos.length === 0) {
    errors.arquivos = "Anexe ao menos um arquivo de apoio (PDF ou PNG).";
  }

  return errors;
}

module.exports = {
  validateFormulario,
};

