import axios from "axios";
import { authStorageKeys } from "../context/AuthContext";

function resolveApiBaseUrl() {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }

  const { protocol, hostname } = window.location;
  const resolvedProtocol = protocol === "https:" ? "https:" : "http:";
  const resolvedHostname = hostname || "localhost";

  return `${resolvedProtocol}//${resolvedHostname}:3001`;
}

const apiBaseUrl = resolveApiBaseUrl();

const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

httpClient.interceptors.request.use((config) => {
  const requestUrl = String(config.url || "");
  const isLoginRequest = requestUrl.endsWith("/login") || requestUrl === "/login";

  if (isLoginRequest) {
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  }

  const token = localStorage.getItem(authStorageKeys.TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { apiBaseUrl };
export default httpClient;
