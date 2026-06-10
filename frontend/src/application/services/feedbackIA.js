import api from "./api";

export async function solicitarFeedbackIA({
  ejercicio,
  respuestaUsuario,
  correcta,
  puntuacion,
}) {
  const response = await api.post("/feedback/ejercicio", {
    ejercicio,
    respuestaUsuario,
    correcta,
    puntuacion,
  });

  return response.data.feedback;
}
