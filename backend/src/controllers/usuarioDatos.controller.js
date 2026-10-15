import pool from "../database/db.js";

function getUid(req, res) {
  const uid = req.firebaseUser?.uid;
  if (!uid) {
    res.status(401).json({ error: "Token de autenticación requerido" });
    return null;
  }
  return uid;
}

export async function obtenerDatosUsuario(req, res) {
  const uid = getUid(req, res);
  if (!uid) return;
  try {
    const result = await pool.query(
      "SELECT preferencias, historial_chat FROM usuario_datos WHERE firebase_uid = $1",
      [uid]
    );
    return res.json(result.rows[0] || { preferencias: {}, historial_chat: [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo datos del usuario" });
  }
}

export async function guardarDatosUsuario(req, res) {
  const uid = getUid(req, res);
  if (!uid) return;
  const { campo, valor } = req.body || {};
  if (!["preferencias", "historial_chat"].includes(campo)) {
    return res.status(400).json({ error: "Campo de datos inválido" });
  }
  if (campo === "preferencias" && (!valor || typeof valor !== "object" || Array.isArray(valor))) {
    return res.status(400).json({ error: "Preferencias inválidas" });
  }
  if (campo === "historial_chat" && !Array.isArray(valor)) {
    return res.status(400).json({ error: "Historial de chat inválido" });
  }

  try {
    if (campo === "preferencias") {
      await pool.query(
        `INSERT INTO usuario_datos (firebase_uid, preferencias) VALUES ($1, $2::jsonb)
         ON CONFLICT (firebase_uid) DO UPDATE SET preferencias = EXCLUDED.preferencias, actualizado_en = NOW()`,
        [uid, JSON.stringify(valor)]
      );
    } else {
      const historial = valor.slice(-50).map((message) => ({
        from: message?.from === "user" ? "user" : "bot",
        text: String(message?.text || "").slice(0, 1000),
      }));
      await pool.query(
        `INSERT INTO usuario_datos (firebase_uid, historial_chat) VALUES ($1, $2::jsonb)
         ON CONFLICT (firebase_uid) DO UPDATE SET historial_chat = EXCLUDED.historial_chat, actualizado_en = NOW()`,
        [uid, JSON.stringify(historial)]
      );
    }
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error guardando datos del usuario" });
  }
}
