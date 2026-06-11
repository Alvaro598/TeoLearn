import pool from "./db.js";
import { learningPath } from "./learningPathData.js";
import { pathToFileURL } from "url";

async function ensureSchema() {
  await pool.query(`
    ALTER TABLE modulos
    ADD COLUMN IF NOT EXISTS slug VARCHAR(80) UNIQUE
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_unidades_modulo_orden
    ON unidades (modulo_id, orden)
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_unidades_modulo_orden
    ON unidades (modulo_id, orden)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_lecciones_unidad_orden
    ON lecciones (unidad_id, orden)
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_lecciones_unidad_orden
    ON lecciones (unidad_id, orden)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_ejercicios_leccion_orden
    ON ejercicios (leccion_id, orden)
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_ejercicios_leccion_orden
    ON ejercicios (leccion_id, orden)
  `);
}

async function upsertModulo(client, modulo) {
  const result = await client.query(
    `
    INSERT INTO modulos (slug, titulo, descripcion, imagen, orden)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (slug)
    DO UPDATE SET
      titulo = EXCLUDED.titulo,
      descripcion = EXCLUDED.descripcion,
      imagen = EXCLUDED.imagen,
      orden = EXCLUDED.orden
    RETURNING id
    `,
    [modulo.slug, modulo.titulo, modulo.descripcion, modulo.imagen, modulo.orden]
  );

  return result.rows[0].id;
}

async function upsertUnidad(client, moduloId, unidad) {
  const result = await client.query(
    `
    INSERT INTO unidades (modulo_id, titulo, descripcion, orden)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT DO NOTHING
    RETURNING id
    `,
    [moduloId, unidad.titulo, unidad.descripcion, unidad.orden]
  );

  if (result.rows[0]?.id) return result.rows[0].id;

  const existing = await client.query(
    `
    UPDATE unidades
    SET descripcion = $3
    WHERE modulo_id = $1 AND orden = $2
    RETURNING id
    `,
    [moduloId, unidad.orden, unidad.descripcion]
  );

  return existing.rows[0].id;
}

async function upsertLeccion(client, unidadId, leccion) {
  const result = await client.query(
    `
    INSERT INTO lecciones (
      unidad_id, titulo, descripcion, contenido, video_url, orden, xp_recompensa
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT DO NOTHING
    RETURNING id
    `,
    [
      unidadId,
      leccion.titulo,
      leccion.descripcion,
      leccion.contenido,
      leccion.video_url || null,
      leccion.orden,
      leccion.xp_recompensa
    ]
  );

  if (result.rows[0]?.id) return result.rows[0].id;

  const existing = await client.query(
    `
    UPDATE lecciones
    SET
      titulo = $3,
      descripcion = $4,
      contenido = $5,
      video_url = $6,
      xp_recompensa = $7
    WHERE unidad_id = $1 AND orden = $2
    RETURNING id
    `,
    [
      unidadId,
      leccion.orden,
      leccion.titulo,
      leccion.descripcion,
      leccion.contenido,
      leccion.video_url || null,
      leccion.xp_recompensa
    ]
  );

  return existing.rows[0].id;
}

async function upsertEjercicio(client, leccionId, ejercicio) {
  const result = await client.query(
    `
    INSERT INTO ejercicios (
      leccion_id, tipo, pregunta, contenido, respuesta_correcta, puntos, orden
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT DO NOTHING
    RETURNING id
    `,
    [
      leccionId,
      ejercicio.tipo,
      ejercicio.pregunta,
      JSON.stringify(ejercicio.contenido),
      JSON.stringify(ejercicio.respuesta_correcta),
      ejercicio.puntos,
      ejercicio.orden
    ]
  );

  if (result.rows[0]?.id) return;

  await client.query(
    `
    UPDATE ejercicios
    SET
      tipo = $3,
      pregunta = $4,
      contenido = $5,
      respuesta_correcta = $6,
      puntos = $7
    WHERE leccion_id = $1 AND orden = $2
    `,
    [
      leccionId,
      ejercicio.orden,
      ejercicio.tipo,
      ejercicio.pregunta,
      JSON.stringify(ejercicio.contenido),
      JSON.stringify(ejercicio.respuesta_correcta),
      ejercicio.puntos
    ]
  );
}

export async function seedLearningPath({ closePool = true } = {}) {
  await ensureSchema();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "DELETE FROM modulos WHERE slug = $1",
      ["generalidades"]
    );

    for (const modulo of learningPath) {
      const moduloId = await upsertModulo(client, modulo);

      for (const unidad of modulo.unidades) {
        const unidadId = await upsertUnidad(client, moduloId, unidad);

        for (const leccion of unidad.lecciones) {
          const leccionId = await upsertLeccion(client, unidadId, leccion);

          for (const ejercicio of leccion.ejercicios) {
            await upsertEjercicio(client, leccionId, ejercicio);
          }
        }
      }
    }

    await client.query("COMMIT");
    console.log("Camino de aprendizaje sembrado correctamente.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("No se pudo sembrar el camino de aprendizaje:", error);
    process.exitCode = 1;
  } finally {
    client.release();

    if (closePool) {
      await pool.end();
    }
  }
}

const isExecutedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isExecutedDirectly) {
  seedLearningPath();
}
