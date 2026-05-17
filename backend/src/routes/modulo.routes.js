import express from "express";
import pool from "../database/db.js";

const router = express.Router();

router.get("/", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT *
      FROM modulos
      ORDER BY orden ASC
    `);

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo módulos"
    });

  }

});

export default router;