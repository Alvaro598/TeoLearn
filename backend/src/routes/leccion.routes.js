import express from "express";
import pool from "../database/db.js";

const router = express.Router();


// ==========================================
// OBTENER LECCIONES DE UNA UNIDAD
// ==========================================

router.get("/unidad/:unidadId", async (req, res) => {

  try {

    const { unidadId } = req.params;

    const resultado = await pool.query(
      `
      SELECT *
      FROM lecciones
      WHERE unidad_id = $1
      ORDER BY orden ASC
      `,
      [unidadId]
    );

    res.json(resultado.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo lecciones"
    });
  }
});


// ==========================================
// OBTENER UNA LECCIÓN
// ==========================================

router.get("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const resultado = await pool.query(
      `
      SELECT *
      FROM lecciones
      WHERE id = $1
      `,
      [id]
    );

    res.json(resultado.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo lección"
    });
  }
});

export default router;