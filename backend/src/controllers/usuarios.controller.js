import pool from "../database/db.js";

// ==========================================
// CREAR USUARIO
// ==========================================
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo } = req.body;
    const firebaseUid = req.firebaseUser?.uid;
    const firebaseEmail = req.firebaseUser?.email || correo;

    if (!firebaseUid || !firebaseEmail) {
      return res.status(401).json({ error: "Token de autenticación requerido" });
    }

    if (!correo || !firebaseEmail) {
      return res.status(400).json({ error: "Campos requeridos" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(firebaseEmail)) {
      return res.status(400).json({ error: "Correo inválido" });
    }

    const result = await pool.query(
      `INSERT INTO usuario (nombre, correo, firebase_uid)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre || firebaseEmail.split("@")[0], firebaseEmail, firebaseUid]
    );

    return res.status(201).json({ usuario: result.rows[0] });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Usuario ya existe" });
    }
    return res.status(500).json({ error: "Error servidor" });
  }
};

// ==========================================
// OBTENER USUARIO POR FIREBASE UID
// ==========================================
export const obtenerUsuarioPorFirebaseUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const authenticatedUid = req.firebaseUser?.uid;

    if (!authenticatedUid) {
      return res.status(401).json({ error: "Token de autenticación requerido" });
    }

    if (uid !== authenticatedUid) {
      return res.status(403).json({ error: "No tienes permisos para consultar este usuario" });
    }

    const resultado = await pool.query(
      `SELECT * FROM usuario WHERE firebase_uid = $1`,
      [uid]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({ usuario: resultado.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo usuario" });
  }
};

// ==========================================
// OBTENER O CREAR USUARIO (SYNC POST-LOGIN)
// Estrategia sin ON CONFLICT para no depender
// de que constraints existen en la tabla:
// 1. Buscar por firebase_uid  - devolver si existe
// 2. Buscar por correo        - actualizar firebase_uid y devolver
// 3. Si no existe ninguno     - insertar fila nueva
// ==========================================
export const obtenerOCrearUsuario = async (req, res) => {
  try {
    const { nombre, correo } = req.body;
    const firebaseUid = req.firebaseUser?.uid;
    const firebaseEmail = req.firebaseUser?.email || correo;

    if (!firebaseUid || !firebaseEmail) {
      return res.status(401).json({ error: "Token de autenticación requerido" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(firebaseEmail)) {
      return res.status(400).json({ error: "Correo inválido" });
    }

    // 1. Ya existe con este firebase_uid: actualizar nombre/correo por si
    //    cambiaron en Firebase (ej. el usuario editó su displayName)
    const porUid = await pool.query(
      `SELECT * FROM usuario WHERE firebase_uid = $1`,
      [firebaseUid]
    );
    if (porUid.rows.length > 0) {
      const actualizado = await pool.query(
        `UPDATE usuario SET nombre = $1, correo = $2 WHERE firebase_uid = $3 RETURNING *`,
        [nombre || porUid.rows[0].nombre, firebaseEmail, firebaseUid]
      );
      return res.json({ usuario: actualizado.rows[0], creado: false });
    }

    // 2. Existe con este correo pero distinto firebase_uid (o sin uid):
    //    actualizar firebase_uid y nombre con los datos actuales
    const porCorreo = await pool.query(
      `SELECT * FROM usuario WHERE correo = $1`,
      [firebaseEmail]
    );
    if (porCorreo.rows.length > 0) {
      const actualizado = await pool.query(
        `UPDATE usuario SET firebase_uid = $1, nombre = $2, correo = $3 WHERE correo = $4 RETURNING *`,
        [firebaseUid, nombre || porCorreo.rows[0].nombre, firebaseEmail, firebaseEmail]
      );
      return res.json({ usuario: actualizado.rows[0], creado: false });
    }

    // 3. No existe de ninguna forma: crear
    const nuevo = await pool.query(
      `INSERT INTO usuario (nombre, correo, firebase_uid, xp, nivel)
       VALUES ($1, $2, $3, 0, 1)
       RETURNING *`,
      [nombre || firebaseEmail.split("@")[0], firebaseEmail, firebaseUid]
    );
    return res.status(201).json({ usuario: nuevo.rows[0], creado: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error sincronizando usuario" });
  }
};

export const obtenerEstadoUsuario = async (req, res) => {
  try {
    const uid = req.firebaseUser?.uid;
    if (!uid) return res.status(401).json({ error: "Token de autenticación requerido" });

    const result = await pool.query(
      `
      SELECT s.preferencias, s.historial_chat, s.resultado_quiz_final,
             s.resultados_quiz_modulo,
             COALESCE(s.racha_actual, 0) AS racha_actual
      FROM usuario u
      LEFT JOIN teolearn_user_state s ON s.usuario_id = u.id
      WHERE u.firebase_uid = $1
      `,
      [uid]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Usuario no encontrado" });

    const state = result.rows[0];
    return res.json({
      preferencias: state.preferencias || {},
      historial_chat: state.historial_chat || [],
      resultado_quiz_final: state.resultado_quiz_final || null,
      resultados_quiz_modulo: state.resultados_quiz_modulo || {},
      racha_actual: state.racha_actual,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo el estado del usuario" });
  }
};

export const actualizarEstadoUsuario = async (req, res) => {
  try {
    const uid = req.firebaseUser?.uid;
    if (!uid) return res.status(401).json({ error: "Token de autenticación requerido" });

    const { preferencias, historial_chat, resultado_quiz_final, resultados_quiz_modulo } = req.body || {};
    if (preferencias !== undefined && (!preferencias || typeof preferencias !== "object" || Array.isArray(preferencias))) {
      return res.status(400).json({ error: "Preferencias inválidas" });
    }
    if (historial_chat !== undefined && (!Array.isArray(historial_chat) || historial_chat.length > 500)) {
      return res.status(400).json({ error: "Historial de chat inválido" });
    }
    if (resultado_quiz_final !== undefined && resultado_quiz_final !== null && (typeof resultado_quiz_final !== "object" || Array.isArray(resultado_quiz_final))) {
      return res.status(400).json({ error: "Resultado de quiz inválido" });
    }
    if (resultados_quiz_modulo !== undefined) {
      const modulosValidos = new Set(["ritmo", "melodia", "armonia"]);
      if (!resultados_quiz_modulo || typeof resultados_quiz_modulo !== "object" || Array.isArray(resultados_quiz_modulo)) {
        return res.status(400).json({ error: "Resultados de quizzes modulares inválidos" });
      }

      for (const [slug, resultado] of Object.entries(resultados_quiz_modulo)) {
        if (
          !modulosValidos.has(slug)
          || !resultado
          || typeof resultado !== "object"
          || Array.isArray(resultado)
          || resultado.moduloSlug !== slug
          || !Array.isArray(resultado.preguntas)
          || !resultado.respuestas
          || typeof resultado.respuestas !== "object"
          || Array.isArray(resultado.respuestas)
        ) {
          return res.status(400).json({ error: "Resultado de quiz modular inválido" });
        }
      }
    }

    const userResult = await pool.query(
      "SELECT id FROM usuario WHERE firebase_uid = $1",
      [uid]
    );
    if (!userResult.rows[0]) return res.status(404).json({ error: "Usuario no encontrado" });

    const serializedPreferences = preferencias === undefined ? null : JSON.stringify(preferencias);
    const serializedHistory = historial_chat === undefined ? null : JSON.stringify(historial_chat);
    const serializedQuiz = resultado_quiz_final === undefined ? null : JSON.stringify(resultado_quiz_final);
    const serializedModuleQuizzes = resultados_quiz_modulo === undefined ? null : JSON.stringify(resultados_quiz_modulo);
    const result = await pool.query(
      `
      INSERT INTO teolearn_user_state (usuario_id, preferencias, historial_chat, resultado_quiz_final, resultados_quiz_modulo)
      VALUES ($1, COALESCE($2::jsonb, '{}'::jsonb), COALESCE($3::jsonb, '[]'::jsonb), $4::jsonb, COALESCE($5::jsonb, '{}'::jsonb))
      ON CONFLICT (usuario_id) DO UPDATE SET
        preferencias = COALESCE($2::jsonb, teolearn_user_state.preferencias),
        historial_chat = COALESCE($3::jsonb, teolearn_user_state.historial_chat),
        resultado_quiz_final = COALESCE($4::jsonb, teolearn_user_state.resultado_quiz_final),
        resultados_quiz_modulo = COALESCE($5::jsonb, '{}'::jsonb) || COALESCE(teolearn_user_state.resultados_quiz_modulo, '{}'::jsonb)
      RETURNING preferencias, historial_chat, resultado_quiz_final, resultados_quiz_modulo, racha_actual
      `,
      [userResult.rows[0].id, serializedPreferences, serializedHistory, serializedQuiz, serializedModuleQuizzes]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error guardando el estado del usuario" });
  }
};
