import { openai }
  from "../config/openai.js";

export const preguntarChatbot =
  async (req, res) => {

    try {

      const { pregunta } = req.body;

     const completion =
  await openai.chat.completions.create({

    model:
      "openai/gpt-3.5-turbo",

    messages: [

      {
        role: "system",

        content: `
Eres Teo,
un tutor virtual especializado
en teoría musical.

Formas parte de la plataforma
educativa TeoLearn.

Tu objetivo es ayudar
a estudiantes principiantes.

REGLAS:
- Responde solo temas musicales
- Sé amigable y educativo
- Explica paso a paso
- Usa ejemplos sencillos
- Motiva al estudiante
- Mantén respuestas cortas
`
      },

      {
        role: "user",
        content: pregunta,
      },
    ],
  });

      res.json({
        respuesta:
          completion.choices[0]
            .message.content,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        respuesta:
          "Error con IA",
      });
    }
  };