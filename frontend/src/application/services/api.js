import axios from "axios";
import { getApiBaseUrl } from "../config/apiBase";

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

api.interceptors.request.use((config) => {
  const headers = getAuthHeaders();
  config.headers = {
    ...config.headers,
    ...headers,
  };
  return config;
});

export async function authFetch(input, init = {}) {
  const headers = {
    ...(init.headers || {}),
    ...getAuthHeaders(),
  };

  const response = await fetch(input, {
    ...init,
    headers,
  });

  return response;
}

export default api;