import express from "express";
import {
  obtenerUnidadesModulo,
  obtenerLeccionesUnidad,
} from "../controllers/unidad.controller.js";

const router = express.Router();
router.get("/modulo/:moduloSlug", obtenerUnidadesModulo);
router.get("/:unidadId/lecciones", obtenerLeccionesUnidad);

export default router;