import pool from "../database/db.js";
import {
  PREGUNTAS_EVALUACION_FINAL,
  PREGUNTAS_POR_MODULO,
  calcularAciertos,
} from "../database/quizQuestions.js";

const MODULOS_REQUERIDOS = ["ritmo", "melodia", "armonia"];
const MODULO_SLUGS = new Set([...MODULOS_REQUERIDOS, "final"]);

async function obtenerUsuarioAutenticado(req, res) {
  const uid = req.firebaseUser?.uid;
  if (!uid) {
    res.status(401).json({ error: "Token de autenticación requerido" });
    return null;
  }

  const result = await pool.query(
    "SELECT id, nombre FROM usuario WHERE firebase_uid = $1",
    [uid]
  );
  if (!result.rows.length) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return null;
  }
  return { uid, id: Number(result.rows[0].id), nombre: result.rows[0].nombre };
}

async function puedePresentar(req, res, slug) {
  const usuario = await obtenerUsuarioAutenticado(req, res);
  if (!usuario) return null;

  const slugs = slug === "final" ? MODULOS_REQUERIDOS : [slug];
  const result = await pool.query(
    `SELECT m.slug,
            COUNT(DISTINCT l.id)::int AS total,
            COUNT(DISTINCT pu.leccion_id) FILTER (
              WHERE pu.usuario_id = $1 AND pu.completada = true
            )::int AS completadas
     FROM modulo m
     LEFT JOIN unidad u ON u.modulo_id = m.id
     LEFT JOIN leccion l ON l.unidad_id = u.id
     LEFT JOIN progreso_usuario pu ON pu.leccion_id = l.id
     WHERE m.slug = ANY($2::text[])
     GROUP BY m.slug`,
    [usuario.id, slugs]
  );

  const completadas = new Map(result.rows.map((row) => [row.slug, row.total > 0 && row.total === row.completadas]));
  if (slugs.some((requiredSlug) => !completadas.get(requiredSlug))) {
    res.status(403).json({ error: "Completa los módulos requeridos antes de presentar esta evaluación" });
    return null;
  }
  return usuario;
}

function preguntasPara(slug) {
  if (slug !== "final") return PREGUNTAS_POR_MODULO[slug].map((question) => ({ ...question }));
  return PREGUNTAS_EVALUACION_FINAL.map((question) => ({ ...question }));
}

export async function obtenerPreguntasEvaluacion(req, res) {
  try {
    const slug = req.params.slug || "final";
    if (!MODULO_SLUGS.has(slug)) return res.status(404).json({ error: "Evaluación no encontrada" });
    if (slug === "final") {
      const usuario = await obtenerUsuarioAutenticado(req, res);
      if (!usuario) return;
      const saved = await pool.query(
        "SELECT resultado FROM evaluacion_final_usuario WHERE firebase_uid = $1",
        [usuario.uid]
      );
      if (saved.rows.length) return res.status(409).json({ error: "Evaluación final ya completada", resultado: saved.rows[0].resultado });
    }

    const usuario = await puedePresentar(req, res, slug);
    if (!usuario) return;
    const questions = preguntasPara(slug).map(({ respuesta, explicacion, ...question }) => question);
    return res.json({ preguntas: questions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo preguntas" });
  }
}

export async function evaluarEvaluacion(req, res) {
  try {
    const { slug, respuestas } = req.body || {};
    if (!MODULO_SLUGS.has(slug) || !respuestas || typeof respuestas !== "object" || Array.isArray(respuestas)) {
      return res.status(400).json({ error: "Evaluación o respuestas inválidas" });
    }
    const usuario = await puedePresentar(req, res, slug);
    if (!usuario) return;
    if (slug === "final") {
      const saved = await pool.query(
        "SELECT resultado FROM evaluacion_final_usuario WHERE firebase_uid = $1",
        [usuario.uid]
      );
      if (saved.rows.length) return res.status(409).json({ error: "Evaluación final ya completada", resultado: saved.rows[0].resultado });
    }

    const preguntas = preguntasPara(slug);
    if (preguntas.some((question) => typeof respuestas[question.id] !== "string" || !question.opciones.includes(respuestas[question.id]))) {
      return res.status(400).json({ error: "Debes responder todas las preguntas con una opción válida" });
    }

    const aciertos = calcularAciertos(preguntas, respuestas);
    const result = {
      moduloSlug: slug === "final" ? "Evaluación final" : slug,
      nombreUsuario: usuario.nombre,
      preguntas,
      respuestas,
      aciertos,
      errores: preguntas.length - aciertos,
      porcentaje: Math.round((aciertos / preguntas.length) * 100),
    };

    if (slug === "final") {
      const saved = await pool.query(
        `INSERT INTO evaluacion_final_usuario (firebase_uid, resultado)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (firebase_uid) DO NOTHING
         RETURNING resultado`,
        [usuario.uid, JSON.stringify(result)]
      );
      if (!saved.rows.length) {
        const existing = await pool.query(
          "SELECT resultado FROM evaluacion_final_usuario WHERE firebase_uid = $1",
          [usuario.uid]
        );
        return res.status(409).json({ error: "Evaluación final ya completada", resultado: existing.rows[0]?.resultado });
      }
    }
    return res.json({ resultado: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error evaluando respuestas" });
  }
}

export async function obtenerResultadoEvaluacionFinal(req, res) {
  try {
    const usuario = await obtenerUsuarioAutenticado(req, res);
    if (!usuario) return;
    const result = await pool.query(
      "SELECT resultado FROM evaluacion_final_usuario WHERE firebase_uid = $1",
      [usuario.uid]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Aún no hay un resultado final guardado" });
    return res.json({ resultado: result.rows[0].resultado });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo el resultado final" });
  }
}
