import pool from "../database/db.js";

function pitchValue(note) {
  const match = typeof note === "string" && note.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return null;
  const semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const alteration = match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0;
  return Number(match[3]) * 12 + semitones[match[1]] + alteration;
}

function sameNotes(expected = [], received = []) {
  return Array.isArray(received) && expected.length === received.length &&
    expected.every((note, index) => pitchValue(note) !== null && pitchValue(note) === pitchValue(received[index]));
}

function sameStacks(expected = [], received = []) {
  return Array.isArray(received) && expected.length === received.length &&
    expected.every((chord, index) => {
      if (!Array.isArray(received[index])) return false;
      const expectedValues = chord.map(pitchValue).sort((a, b) => a - b);
      const receivedValues = received[index].map(pitchValue).sort((a, b) => a - b);
      return expectedValues.length === receivedValues.length &&
        expectedValues.every((value, noteIndex) => value !== null && value === receivedValues[noteIndex]);
    });
}

function samePattern(expected = {}, received = {}) {
  if (!received || typeof received !== "object" || Array.isArray(received)) return false;
  if (!Object.values(expected).every(Array.isArray) || !Object.values(received).every(Array.isArray)) return false;
  const instruments = new Set([...Object.keys(expected), ...Object.keys(received)]);
  return [...instruments].every((instrument) => {
    const expectedSteps = [...(expected[instrument] || [])].sort((a, b) => a - b);
    const receivedSteps = [...(received[instrument] || [])].sort((a, b) => a - b);
    return JSON.stringify(expectedSteps) === JSON.stringify(receivedSteps);
  });
}

export function answerIsCorrect(exercise, answer) {
  const expected = exercise.respuesta_correcta || {};
  const received = answer && typeof answer === "object" ? answer : {};

  if (exercise.contenido?.subtipo === "reloj-interno") {
    return Number.isFinite(received.diferenciaMs) && received.diferenciaMs >= 0 && received.diferenciaMs <= 220;
  }
  if (exercise.tipo === "midi" && exercise.contenido?.subtipo === "duracion") {
    return received.duracion === expected.duracion;
  }
  if (exercise.tipo === "midi" && expected.notas) return sameNotes(expected.notas, received.notas);
  if (exercise.tipo === "midi" && expected.stack) return sameStacks(expected.stack, received.stack);
  if (exercise.tipo === "midi" && expected.patron) return samePattern(expected.patron, received.patron);
  if (expected.toleranciaMs !== undefined) {
    return Number.isFinite(received.diferenciaMs) && received.diferenciaMs >= 0 && received.diferenciaMs <= expected.toleranciaMs;
  }
  if (!Object.hasOwn(expected, "respuesta")) return false;
  return received.respuesta === expected.respuesta;
}

export const evaluarRespuesta = async (req, res) => {
  try {
    const exerciseId = Number(req.params.id);
    const answer = req.body?.respuesta_usuario;
    const firebaseUid = req.firebaseUser?.uid;

    if (!Number.isInteger(exerciseId) || exerciseId <= 0 || !firebaseUid || answer == null) {
      return res.status(400).json({ error: "Ejercicio y respuesta válidos requeridos" });
    }

    const userResult = await pool.query(
      "SELECT id FROM usuario WHERE firebase_uid = $1",
      [firebaseUid]
    );
    if (!userResult.rows[0]) return res.status(404).json({ error: "Usuario no encontrado" });

    const exerciseResult = await pool.query(
      "SELECT tipo, contenido, respuesta_correcta, puntos FROM ejercicio WHERE id = $1",
      [exerciseId]
    );
    const exercise = exerciseResult.rows[0];
    if (!exercise) return res.status(404).json({ error: "Ejercicio no encontrado" });

    const correcta = answerIsCorrect(exercise, answer);
    const puntuacion = correcta ? exercise.puntos : 0;
    const feedback = correcta ? "Respuesta correcta. Excelente trabajo." : "Respuesta incorrecta. Revisa la consigna e inténtalo de nuevo.";

    await pool.query(
      `
      INSERT INTO intento_ejercicio (usuario_id, ejercicio_id, respuesta_usuario, correcta, puntuacion, feedback_ia)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [userResult.rows[0].id, exerciseId, JSON.stringify(answer), correcta, puntuacion, feedback]
    );

    const streakResult = await pool.query(
      `
      INSERT INTO teolearn_user_state (usuario_id, racha_actual, ultima_practica)
      VALUES ($1, 1, CURRENT_DATE)
      ON CONFLICT (usuario_id) DO UPDATE SET
        racha_actual = CASE
          WHEN teolearn_user_state.ultima_practica = CURRENT_DATE THEN teolearn_user_state.racha_actual
          WHEN teolearn_user_state.ultima_practica = CURRENT_DATE - 1 THEN teolearn_user_state.racha_actual + 1
          ELSE 1
        END,
        ultima_practica = CURRENT_DATE
      RETURNING racha_actual
      `,
      [userResult.rows[0].id]
    );

    return res.json({ correcta, puntuacion, feedback, racha_actual: streakResult.rows[0].racha_actual });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error evaluando la respuesta" });
  }
};