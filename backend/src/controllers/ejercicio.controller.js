import pool from "../database/db.js";

export const obtenerEjerciciosLeccion = async (req, res) => {
  try {
    const { leccionId } = req.params;
    const result = await pool.query(
      `
      SELECT id, leccion_id, tipo, pregunta, contenido, puntos, orden
      FROM ejercicio
      WHERE leccion_id = $1
      ORDER BY orden ASC
      `,
      [leccionId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo ejercicios" });
  }
};


