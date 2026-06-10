import pool from "../database/db.js";

// ==========================================
// CREAR USUARIO
// ==========================================
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, firebase_uid } = req.body;

    if (!correo || !firebase_uid) {
      return res.status(400).json({ error: "Campos requeridos" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ error: "Correo inválido" });
    }

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, firebase_uid)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, correo, firebase_uid]
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

    const resultado = await pool.query(
      `SELECT * FROM usuarios WHERE firebase_uid = $1`,
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
    const { firebase_uid, nombre, correo } = req.body;

    if (!firebase_uid || !correo) {
      return res.status(400).json({ error: "firebase_uid y correo son requeridos" });
    }

    // 1. Ya existe con este firebase_uid
    const porUid = await pool.query(
      `SELECT * FROM usuarios WHERE firebase_uid = $1`,
      [firebase_uid]
    );
    if (porUid.rows.length > 0) {
      return res.json({ usuario: porUid.rows[0], creado: false });
    }

    // 2. Existe con este correo pero distinto firebase_uid (o sin uid)
    const porCorreo = await pool.query(
      `SELECT * FROM usuarios WHERE correo = $1`,
      [correo]
    );
    if (porCorreo.rows.length > 0) {
      const actualizado = await pool.query(
        `UPDATE usuarios SET firebase_uid = $1 WHERE correo = $2 RETURNING *`,
        [firebase_uid, correo]
      );
      return res.json({ usuario: actualizado.rows[0], creado: false });
    }

    // 3. No existe de ninguna forma: crear
    const nuevo = await pool.query(
      `INSERT INTO usuarios (nombre, correo, firebase_uid, xp, nivel)
       VALUES ($1, $2, $3, 0, 1)
       RETURNING *`,
      [nombre || correo.split("@")[0], correo, firebase_uid]
    );
    return res.status(201).json({ usuario: nuevo.rows[0], creado: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error sincronizando usuario" });
  }
};