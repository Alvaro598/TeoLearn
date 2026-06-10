import pool
from "../database/db.js";

export const evaluarRespuesta =
async (req, res) => {

  try {

    const {

      usuario_id,
      ejercicio_id,
      respuesta_usuario

    } = req.body;

    /* BUSCAR EJERCICIO */
    const ejercicioResult =
    await pool.query(
      `
      SELECT *
      FROM ejercicios
      WHERE id = $1
      `,
      [ejercicio_id]
    );

    const ejercicio =
    ejercicioResult.rows[0];

    /* VALIDAR EXISTENCIA */
    if (!ejercicio) {

      return res.status(404).json({

        error:
        "Ejercicio no encontrado"

      });

    }

    /* RESPUESTA CORRECTA */
    const respuestaCorrecta =
    ejercicio
    .respuesta_correcta
    .respuesta;

    /* VALIDACIÓN */
    const correcta =
    respuesta_usuario ===
    respuestaCorrecta;

    /* PUNTUACIÓN */
    const puntuacion =
    correcta
    ? ejercicio.puntos
    : 0;

    /* FEEDBACK */
    const feedback =
    correcta

    ? "Respuesta correcta. Excelente trabajo."

    : `Respuesta incorrecta. La respuesta correcta es ${respuestaCorrecta}.`;

    /* GUARDAR INTENTO */
    await pool.query(
      `
      INSERT INTO intentos_ejercicio (

        usuario_id,
        ejercicio_id,
        respuesta_usuario,
        correcta,
        puntuacion,
        feedback_ia

      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [

        usuario_id,

        ejercicio_id,

        JSON.stringify({
          respuesta:
          respuesta_usuario
        }),

        correcta,

        puntuacion,

        feedback

      ]
    );

    /* RESPUESTA */
    res.json({

      correcta,
      puntuacion,
      feedback

    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      error:
      error.message,

    });

  }

};