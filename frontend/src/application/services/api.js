import axios from "axios";
import { getApiBaseUrl } from "../config/apiBase";
import { auth } from "../../infrastructure/config/firebase";

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

async function getCurrentAuthHeaders() {
  try {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const token = await currentUser.getIdToken();
      localStorage.setItem("token", token);
      localStorage.setItem("teolearn-firebase-uid", currentUser.uid);
      if (currentUser.email) {
        localStorage.setItem("teolearn-user-email", currentUser.email);
      }
      return { Authorization: `Bearer ${token}` };
    }
  } catch (error) {
    console.error("No se pudo obtener el token actual de Firebase:", error);
  }

  const storedToken = localStorage.getItem("token");
  return storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
}

// Conservada para los usos síncronos existentes.
export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

api.interceptors.request.use(async (config) => {
  const headers = await getCurrentAuthHeaders();
  config.headers = { ...config.headers, ...headers };
  return config;
});

export async function authFetch(input, init = {}) {
  const authHeaders = await getCurrentAuthHeaders();
  const headers = {
    ...(init.headers || {}),
    ...authHeaders,
  };

  return fetch(input, { ...init, headers });
}

export default api;
