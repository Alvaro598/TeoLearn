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