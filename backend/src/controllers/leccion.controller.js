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
      FROM leccion
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
        leccion.*,
        modulo.slug AS modulo_slug
      FROM leccion
      JOIN unidad ON unidad.id = leccion.unidad_id
      JOIN modulo ON modulo.id = unidad.modulo_id
      WHERE leccion.id = $1
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