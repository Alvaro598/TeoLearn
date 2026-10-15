import { apiUrl } from "../config/apiBase";
import { authFetch } from "./api";

export async function obtenerEstadoUsuario() {
  const response = await authFetch(apiUrl("/usuarios/state"));
  if (!response.ok) throw new Error("No se pudo cargar el estado del usuario");
  return response.json();
}

export async function actualizarEstadoUsuario(updates) {
  const response = await authFetch(apiUrl("/usuarios/state"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("No se pudo guardar el estado del usuario");
  return response.json();
}
