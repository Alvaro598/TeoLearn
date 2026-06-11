const DEFAULT_API_BASE = "/api";

export function getApiBaseUrl() {
  const envBase = import.meta.env.VITE_API_BASE_URL?.trim();

  if (envBase) {
    return envBase.replace(/\/$/, "");
  }

  return DEFAULT_API_BASE;
}

export function apiUrl(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
