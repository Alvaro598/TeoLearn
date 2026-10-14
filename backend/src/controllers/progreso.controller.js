import pool from "../database/db.js";

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function ensureUsuarioOwnedByFirebase(req, res, usuarioId) {
  const authUid = req.firebaseUser?.uid;
  const parsedUsuarioId = parsePositiveInt(usuarioId);

  if (!authUid) {
    return { error: res.status(401).json({ error: "Token de autenticación requerido" }) };
  }

  if (!parsedUsuarioId) {
    return { error: res.status(400).json({ error: "usuario_id inválido" }) };
  }

  const usuarioResult = await pool.query(
    `SELECT id, firebase_uid FROM usuario WHERE id = $1`,
    [parsedUsuarioId]
  );

  if (usuarioResult.rows.length === 0) {
    return { error: res.status(404).json({ error: "Usuario no encontrado" }) };
  }

  if (usuarioResult.rows[0].firebase_uid !== authUid) {
    return { error: res.status(403).json({ error: "No tienes permisos para operar sobre este usuario" }) };
  }

  return { usuarioId: parsedUsuarioId };
}

// ==========================================
// GUARDAR INTENTO DE EJERCICIO
// Registra cada respuesta en intento_ejercicio.
// No modifica progreso_usuario ni XP por sí solo.
// ==========================================
export const guardarIntento = async (req, res) => {
  try {
    const { usuario_id, ejercicio_id, respuesta_usuario, correcta, puntuacion } = req.body;
    const parsedUsuarioId = parsePositiveInt(usuario_id);
    const parsedEjercicioId = parsePositiveInt(ejercicio_id);

    if (!parsedUsuarioId || !parsedEjercicioId) {
      return res.status(400).json({ error: "usuario_id y ejercicio_id deben ser enteros positivos" });
    }

    const ownership = await ensureUsuarioOwnedByFirebase(req, res, parsedUsuarioId);
    if (ownership?.error) {
      return ownership.error;
    }

    const resultado = await pool.query(
      `
      INSERT INTO intento_ejercicio
        (usuario_id, ejercicio_id, respuesta_usuario, correcta, puntuacion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        parsedUsuarioId,
        parsedEjercicioId,
        JSON.stringify(respuesta_usuario),
        correcta ?? false,
        puntuacion ?? 0,
      ]
    );

    return res.status(201).json({ intento: resultado.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error guardando intento" });
  }
};

// ==========================================
// OBTENER EJERCICIOS COMPLETADOS DE UNA LECCIÓN
// Un ejercicio queda completado al registrar al menos un intento correcto.
// ==========================================
export const obtenerEjerciciosCompletados = async (req, res) => {
  try {
    const { usuarioId, leccionId } = req.params;
    const parsedUsuarioId = parsePositiveInt(usuarioId);
    const parsedLeccionId = parsePositiveInt(leccionId);

    if (!parsedUsuarioId || !parsedLeccionId) {
      return res.status(400).json({ error: "usuarioId y leccionId deben ser enteros positivos" });
    }

    const ownership = await ensureUsuarioOwnedByFirebase(req, res, parsedUsuarioId);
    if (ownership?.error) {
      return ownership.error;
    }

    const result = await pool.query(
      `
      SELECT DISTINCT ie.ejercicio_id
      FROM intento_ejercicio ie
      JOIN ejercicio e ON e.id = ie.ejercicio_id
      WHERE ie.usuario_id = $1
        AND e.leccion_id = $2
        AND ie.correcta = true
      ORDER BY ie.ejercicio_id
      `,
      [parsedUsuarioId, parsedLeccionId]
    );

    return res.json({ ejercicios_completados_ids: result.rows.map((row) => String(row.ejercicio_id)) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo ejercicios completados" });
  }
};

// ==========================================
// COMPLETAR LECCIÓN
// 1. Evita duplicados en progreso_usuario.
// 2. Suma xp_recompensa al usuario.
// 3. Recalcula nivel (cada 200 XP = 1 nivel).
// ==========================================
export const completarLeccion = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { usuario_id, leccion_id, puntuacion } = req.body;
    const parsedUsuarioId = parsePositiveInt(usuario_id);
    const parsedLeccionId = parsePositiveInt(leccion_id);

    if (!parsedUsuarioId || !parsedLeccionId) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "usuario_id y leccion_id deben ser enteros positivos" });
    }

    const ownership = await ensureUsuarioOwnedByFirebase(req, res, parsedUsuarioId);
    if (ownership?.error) {
      await client.query("ROLLBACK");
      return ownership.error;
    }

    // Serializa completados simultáneos de la misma lección para este usuario.
    // Sin este bloqueo, dos solicitudes paralelas pueden pasar el SELECT de abajo
    // y crear dos filas aunque una repetición normal no lo haga.
    await client.query(
      "SELECT pg_advisory_xact_lock($1, $2)",
      [parsedUsuarioId, parsedLeccionId]
    );

    // Verificar si ya existe el registro de progreso para esta lección
    const existente = await client.query(
      `SELECT id FROM progreso_usuario WHERE usuario_id = $1 AND leccion_id = $2`,
      [parsedUsuarioId, parsedLeccionId]
    );

    let xpGanada = 0;

    if (existente.rows.length === 0) {
      // Obtener xp_recompensa de la lección
      const leccion = await client.query(
        `SELECT xp_recompensa FROM leccion WHERE id = $1`,
        [parsedLeccionId]
      );

      xpGanada = leccion.rows[0]?.xp_recompensa ?? 0;

      // Insertar progreso
      await client.query(
        `
        INSERT INTO progreso_usuario
          (usuario_id, leccion_id, completada, puntuacion, fecha_completado)
        VALUES ($1, $2, true, $3, NOW())
        `,
        [parsedUsuarioId, parsedLeccionId, puntuacion ?? 0]
      );

      // Sumar XP al usuario y recalcular nivel
      if (xpGanada > 0) {
        await client.query(
          `
          UPDATE usuario
          SET
            xp = xp + $1,
            nivel = FLOOR((xp + $1) / 200) + 1
          WHERE id = $2
          `,
          [xpGanada, parsedUsuarioId]
        );
      }
    }

    // Devolver usuario actualizado
    const usuarioActualizado = await client.query(
      `SELECT id, nombre, correo, xp, nivel FROM usuario WHERE id = $1`,
      [parsedUsuarioId]
    );

    await client.query("COMMIT");

    return res.json({
      success: true,
      ya_completada: existente.rows.length > 0,
      xp_ganada: xpGanada,
      usuario: usuarioActualizado.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ error: "Error guardando progreso" });
  } finally {
    client.release();
  }
};

// ==========================================
// OBTENER PROGRESO BÁSICO DE UN USUARIO
// ==========================================
export const obtenerProgreso = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const ownership = await ensureUsuarioOwnedByFirebase(req, res, usuarioId);
    if (ownership?.error) {
      return ownership.error;
    }

    const resultado = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE completada = true) AS completadas,
        COUNT(*) AS total
      FROM progreso_usuario
      WHERE usuario_id = $1
      `,
      [ownership.usuarioId]
    );

    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo progreso" });
  }
};

// ==========================================
// DASHBOARD COMPLETO
// Devuelve:
//   - xp total
//   - nivel
//   - lecciones completadas / total
//   - porcentaje completado por módulo
// ==========================================
export const obtenerDashboard = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const ownership = await ensureUsuarioOwnedByFirebase(req, res, usuarioId);
    if (ownership?.error) {
      return ownership.error;
    }

    // XP y nivel del usuario
    const usuarioResult = await pool.query(
      `SELECT xp, nivel FROM usuario WHERE id = $1`,
      [ownership.usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const { xp, nivel } = usuarioResult.rows[0];

    // Total de lecciones y completadas globalmente
    const globalResult = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM leccion) AS total_lecciones,
        (
          SELECT COUNT(DISTINCT leccion_id)
          FROM progreso_usuario
          WHERE usuario_id = $1 AND completada = true
        ) AS lecciones_completadas
      `,
      [ownership.usuarioId]
    );

    const completedLessonsResult = await pool.query(
      `
      SELECT DISTINCT leccion_id
      FROM progreso_usuario
      WHERE usuario_id = $1 AND completada = true
      ORDER BY leccion_id ASC
      `,
      [ownership.usuarioId]
    );

    const { total_lecciones, lecciones_completadas } = globalResult.rows[0];

    // Porcentaje por módulo
    const modulosResult = await pool.query(
      `
      SELECT
        m.id,
        m.titulo,
        m.slug,
        COUNT(DISTINCT l.id) AS total_lecciones,
        COUNT(DISTINCT pu.leccion_id) FILTER (
          WHERE pu.usuario_id = $1 AND pu.completada = true
        ) AS lecciones_completadas
      FROM modulo m
      LEFT JOIN unidad u ON u.modulo_id = m.id
      LEFT JOIN leccion l ON l.unidad_id = u.id
      LEFT JOIN progreso_usuario pu
        ON pu.leccion_id = l.id AND pu.usuario_id = $1
      GROUP BY m.id, m.titulo, m.slug
      ORDER BY m.orden ASC
      `,
      [ownership.usuarioId]
    );

    const modulos = modulosResult.rows.map((m) => ({
      id: m.id,
      titulo: m.titulo,
      slug: m.slug,
      total_lecciones: parseInt(m.total_lecciones, 10),
      lecciones_completadas: parseInt(m.lecciones_completadas, 10),
      porcentaje:
        m.total_lecciones > 0
          ? Math.round((m.lecciones_completadas / m.total_lecciones) * 100)
          : 0,
    }));

    return res.json({
      xp: parseInt(xp, 10),
      nivel: parseInt(nivel, 10),
      xp_nivel: parseInt(xp, 10) % 200,
      lecciones_completadas: parseInt(lecciones_completadas, 10),
      total_lecciones: parseInt(total_lecciones, 10),
      lecciones_completadas_ids: completedLessonsResult.rows.map((row) =>
        String(row.leccion_id)
      ),
      modulos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo dashboard" });
  }
};

// ==========================================
// PROGRESO POR MÓDULO INDIVIDUAL
// GET /api/progress/modulo/:usuarioId/:moduloSlug
// Devuelve: { porcentaje, completada, lecciones_completadas, total_lecciones }
// Usado por ModuloCard y QuizModulo para saber si el módulo está desbloqueado.
// ==========================================
export const progresoModulo = async (req, res) => {
  try {
    const { usuarioId, moduloSlug } = req.params;
    const ownership = await ensureUsuarioOwnedByFirebase(req, res, usuarioId);
    if (ownership?.error) {
      return ownership.error;
    }

    const result = await pool.query(
      `
      SELECT
        m.titulo,
        m.slug,
        COUNT(DISTINCT l.id) AS total_lecciones,
        COUNT(DISTINCT pu.leccion_id) FILTER (WHERE pu.usuario_id = $1 AND pu.completada = true) AS lecciones_completadas
      FROM modulo m
      LEFT JOIN unidad u         ON u.modulo_id = m.id
      LEFT JOIN leccion l        ON l.unidad_id = u.id
      LEFT JOIN progreso_usuario pu ON pu.leccion_id = l.id
      WHERE m.slug = $2
      GROUP BY m.titulo, m.slug
      `,
      [ownership.usuarioId, moduloSlug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Módulo no encontrado" });
    }

    const row = result.rows[0];
    const total     = parseInt(row.total_lecciones, 10);
    const completadas = parseInt(row.lecciones_completadas, 10);
    const porcentaje  = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return res.json({
      slug:                  row.slug,
      titulo:                row.titulo,
      total_lecciones:       total,
      lecciones_completadas: completadas,
      porcentaje,
      completado:            total > 0 && completadas === total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo progreso del módulo" });
  }
};
