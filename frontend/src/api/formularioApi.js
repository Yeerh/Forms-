import httpClient from "./httpClient";

export async function submitFormulario(formData) {
  const response = await httpClient.post("/formulario", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getFormularios(query = "") {
  const response = await httpClient.get("/formularios", {
    params: {
      query: query || undefined,
    },
  });

  return response.data;
}

export async function getFormularioById(id) {
  const response = await httpClient.get(`/formulario/${id}`);
  return response.data;
}

export async function updateChecklist(id, checklist) {
  const response = await httpClient.put(`/formulario/${id}/checklist`, {
    checklist,
  });

  return response.data;
}
