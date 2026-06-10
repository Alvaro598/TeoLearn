import pool from "../database/db.js";

// ==========================================
// GUARDAR INTENTO DE EJERCICIO
// Registra cada respuesta en intentos_ejercicio.
// No modifica progreso_usuario ni XP por sí solo.
// ==========================================
export const guardarIntento = async (req, res) => {
  try {
    const { usuario_id, ejercicio_id, respuesta_usuario, correcta, puntuacion } = req.body;

    if (!usuario_id || !ejercicio_id) {
      return res.status(400).json({ error: "usuario_id y ejercicio_id son requeridos" });
    }

    const resultado = await pool.query(
      `
      INSERT INTO intentos_ejercicio
        (usuario_id, ejercicio_id, respuesta_usuario, correcta, puntuacion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        usuario_id,
        ejercicio_id,
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

    if (!usuario_id || !leccion_id) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "usuario_id y leccion_id son requeridos" });
    }

    // Verificar si ya existe el registro de progreso para esta lección
    const existente = await client.query(
      `SELECT id FROM progreso_usuario WHERE usuario_id = $1 AND leccion_id = $2`,
      [usuario_id, leccion_id]
    );

    let xpGanada = 0;

    if (existente.rows.length === 0) {
      // Obtener xp_recompensa de la lección
      const leccion = await client.query(
        `SELECT xp_recompensa FROM lecciones WHERE id = $1`,
        [leccion_id]
      );

      xpGanada = leccion.rows[0]?.xp_recompensa ?? 0;

      // Insertar progreso
      await client.query(
        `
        INSERT INTO progreso_usuario
          (usuario_id, leccion_id, completada, puntuacion, fecha_completado)
        VALUES ($1, $2, true, $3, NOW())
        `,
        [usuario_id, leccion_id, puntuacion ?? 0]
      );

      // Sumar XP al usuario y recalcular nivel
      if (xpGanada > 0) {
        await client.query(
          `
          UPDATE usuarios
          SET
            xp = xp + $1,
            nivel = FLOOR((xp + $1) / 200) + 1
          WHERE id = $2
          `,
          [xpGanada, usuario_id]
        );
      }
    }

    // Devolver usuario actualizado
    const usuarioActualizado = await client.query(
      `SELECT id, nombre, correo, xp, nivel FROM usuarios WHERE id = $1`,
      [usuario_id]
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

    const resultado = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE completada = true) AS completadas,
        COUNT(*) AS total
      FROM progreso_usuario
      WHERE usuario_id = $1
      `,
      [usuarioId]
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

    // XP y nivel del usuario
    const usuarioResult = await pool.query(
      `SELECT xp, nivel FROM usuarios WHERE id = $1`,
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const { xp, nivel } = usuarioResult.rows[0];

    // Total de lecciones y completadas globalmente
    const globalResult = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM lecciones) AS total_lecciones,
        (
          SELECT COUNT(*)
          FROM progreso_usuario
          WHERE usuario_id = $1 AND completada = true
        ) AS lecciones_completadas
      `,
      [usuarioId]
    );

    const { total_lecciones, lecciones_completadas } = globalResult.rows[0];

    // Porcentaje por módulo
    const modulosResult = await pool.query(
      `
      SELECT
        m.id,
        m.titulo,
        m.slug,
        COUNT(l.id) AS total_lecciones,
        COUNT(pu.id) FILTER (
          WHERE pu.usuario_id = $1 AND pu.completada = true
        ) AS lecciones_completadas
      FROM modulos m
      LEFT JOIN unidades u ON u.modulo_id = m.id
      LEFT JOIN lecciones l ON l.unidad_id = u.id
      LEFT JOIN progreso_usuario pu
        ON pu.leccion_id = l.id AND pu.usuario_id = $1
      GROUP BY m.id, m.titulo, m.slug
      ORDER BY m.orden ASC
      `,
      [usuarioId]
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
      modulos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo dashboard" });
  }
};
