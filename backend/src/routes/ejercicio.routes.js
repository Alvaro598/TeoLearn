import express from "express";
import { obtenerEjerciciosLeccion } from "../controllers/ejercicio.controller.js";
import { evaluarRespuesta } from "../controllers/respuesta.controller.js";

const router = express.Router();
router.get("/leccion/:leccionId", obtenerEjerciciosLeccion);
router.post("/:id/evaluar", evaluarRespuesta);

export default router;