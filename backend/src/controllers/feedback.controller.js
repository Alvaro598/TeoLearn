import { openai } from "../config/openai.js";

function buildFeedbackPrompt({ ejercicio, respuestaUsuario, correcta, puntuacion }) {
  return `
Eres Teo, tutor de teoria musical para estudiantes principiantes.

Genera retroalimentacion inmediata para un ejercicio de TeoLearn.

Datos del ejercicio:
- Tipo: ${ejercicio?.tipo || "desconocido"}
- Pregunta: ${ejercicio?.pregunta || "sin pregunta"}
- Contenido: ${JSON.stringify(ejercicio?.contenido || {})}
- Respuesta correcta: ${JSON.stringify(ejercicio?.respuesta_correcta || {})}
- Respuesta del estudiante: ${JSON.stringify(respuestaUsuario || {})}
- Resultado automatico: ${correcta ? "correcto" : "incorrecto"}
- Puntuacion: ${puntuacion ?? 0}

Instrucciones:
1. Responde en espanol.
2. Maximo 120 palabras.
3. Di primero si la respuesta va bien o que debe corregir.
4. Explica el concepto musical implicado.
5. Da una micro-practica concreta para repetir ahora.
6. No inventes datos que no esten en el ejercicio.
`;
}

export async function generarFeedbackEjercicio(req, res) {
  try {
    const { ejercicio, respuestaUsuario, correcta, puntuacion } = req.body;

    if (!ejercicio || !respuestaUsuario) {
      return res.status(400).json({
        error: "Faltan datos del ejercicio o de la respuesta del usuario."
      });
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_FEEDBACK_MODEL || "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Eres un tutor musical breve, pedagogico y cuidadoso. Solo retroalimentas teoria musical."
        },
        {
          role: "user",
          content: buildFeedbackPrompt({
            ejercicio,
            respuestaUsuario,
            correcta: Boolean(correcta),
            puntuacion
          })
        }
      ],
      temperature: 0.4
    });

    return res.json({
      feedback: completion.choices[0].message.content
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      feedback:
        "No pude generar retroalimentacion con IA en este momento. Revisa la respuesta correcta y vuelve a intentarlo."
    });
  }
}
