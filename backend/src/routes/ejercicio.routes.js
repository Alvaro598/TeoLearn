import express from "express";
import pool from "../database/db.js";

const router = express.Router();

router.get("/leccion/:leccionId", async (req, res) => {

  try {

    const { leccionId } = req.params;

    const resultado = await pool.query(
      `
      SELECT *
      FROM ejercicios
      WHERE leccion_id = $1
      ORDER BY orden ASC
      `,
      [leccionId]
    );

    res.json(resultado.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo ejercicios"
    });
  }
});

export default router;