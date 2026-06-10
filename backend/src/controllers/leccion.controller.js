import pool
from "../database/db.js";

/* LECCIONES DE UNA UNIDAD */
export const obtenerLeccionesUnidad =
async (req, res) => {

  try {

    const { unidadId } = req.params;

    const resultado =
    await pool.query(
      `
      SELECT *
      FROM lecciones
      WHERE unidad_id = $1
      ORDER BY orden ASC
      `,
      [unidadId]
    );

    res.json(resultado.rows);

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      error:
      "Error obteniendo lecciones"

    });

  }

};

/* UNA LECCIÓN */
export const obtenerLeccion =
async (req, res) => {

  try {

    const { id } = req.params;

    const resultado =
    await pool.query(
      `
      SELECT *
      FROM lecciones
      WHERE id = $1
      `,
      [id]
    );

    res.json(resultado.rows[0]);

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      error:
      "Error obteniendo lección"

    });

  }

};