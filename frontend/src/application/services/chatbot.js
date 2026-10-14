import { apiUrl } from "../config/apiBase";
import { authFetch } from "./api";

export const preguntarIA = async (pregunta, historial = []) => {
  const response = await authFetch(
    apiUrl("/chat"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pregunta,
        historial,
      }),
    }
  );

  return response.json();
};