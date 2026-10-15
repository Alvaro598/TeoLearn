import express from "express";
import {
  obtenerLeccionesUnidad,
  obtenerLeccion,
} from "../controllers/leccion.controller.js";

const router = express.Router();
router.get("/unidad/:unidadId", obtenerLeccionesUnidad);
router.get("/:id", obtenerLeccion);

export default router;