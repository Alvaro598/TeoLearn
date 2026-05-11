export const preguntarIA = async (
  pregunta
) => {

  const response = await fetch(
    "http://localhost:3000/api/chat",
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