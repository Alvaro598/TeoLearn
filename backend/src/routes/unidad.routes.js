import express from "express";

import pool from "../database/db.js";

const router = express.Router();

router.get(
  "/modulo/:moduloSlug",

  async (req, res) => {

    try {

      const { moduloSlug } = req.params;

      const moduloQuery =
        await pool.query(

          `
          SELECT id
          FROM modulos
          WHERE slug = $1
          `,

          [moduloSlug]

        );

      if (
        moduloQuery.rows.length === 0
      ) {

        return res.status(404).json({
          error: "Módulo no encontrado"
        });

      }

      const moduloId =
        moduloQuery.rows[0].id;

      const unidadesQuery =
        await pool.query(

          `
          SELECT *
          FROM unidades
          WHERE modulo_id = $1
          ORDER BY orden
          `,

          [moduloId]

        );

      res.json(
        unidadesQuery.rows
      );

    }

    catch (error) {

      console.error(error);

      res.status(500).json({
        error: "Error del servidor"
      });

    }

  }
);

router.get("/:unidadId/lecciones", async (req, res) => {

  try {

    const { unidadId } = req.params;

    const unidadQuery = await pool.query(
      `
      SELECT
        unidades.*,
        modulos.slug AS modulo_slug
      FROM unidades
      INNER JOIN modulos ON modulos.id = unidades.modulo_id
      WHERE unidades.id = $1
      `,
      [unidadId]
    );

    const leccionesQuery = await pool.query(
      `
      SELECT *
      FROM lecciones
      WHERE unidad_id = $1
      ORDER BY orden
      `,
      [unidadId]
    );

    res.json({
      ...unidadQuery.rows[0],
      lecciones: leccionesQuery.rows
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({
      error: "Error obteniendo lecciones"
    });

  }

});

export default router;