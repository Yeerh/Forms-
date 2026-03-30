import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: 15000,
});

export async function postFormulario(formData) {
  const response = await apiClient.post("/formulario", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getFormularios() {
  const response = await apiClient.get("/formularios");
  return response.data;
}

