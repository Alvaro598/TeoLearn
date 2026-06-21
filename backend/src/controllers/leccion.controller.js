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

/* UNA LECCIÓN — incluye el slug del módulo padre (modulo_slug) para que el
   frontend sepa qué set de componentes de ejercicio usar (ritmo/melodia/armonia) */
export const obtenerLeccion =
async (req, res) => {

  try {

    const { id } = req.params;

    const resultado =
    await pool.query(
      `
      SELECT
        lecciones.*,
        modulos.slug AS modulo_slug
      FROM lecciones
      JOIN unidades ON unidades.id = lecciones.unidad_id
      JOIN modulos  ON modulos.id  = unidades.modulo_id
      WHERE lecciones.id = $1
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