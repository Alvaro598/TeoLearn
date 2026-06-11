import { apiUrl } from "../config/apiBase";

export const preguntarIA = async (
  pregunta
) => {

  const response = await fetch(
    apiUrl("/chat"),
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        pregunta,
      }),
    }
  );

  const data =
    await response.json();

  return data.respuesta;
};