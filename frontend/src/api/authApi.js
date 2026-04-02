import httpClient from "./httpClient";

export async function loginRequest(identifier, password) {
  const response = await httpClient.post("/login", {
    identifier,
    password,
  });

  return response.data;
}

export async function saveComplementsRequest(payload) {
  const response = await httpClient.put("/me/complements", payload);
  return response.data;
}
