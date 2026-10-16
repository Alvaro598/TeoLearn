import express from "express";
import {
  evaluarEvaluacion,
  obtenerPreguntasEvaluacion,
  obtenerResultadoEvaluacionFinal,
} from "../controllers/evaluacion.controller.js";

const router = express.Router();

router.get("/:slug/preguntas", obtenerPreguntasEvaluacion);
router.post("/evaluar", evaluarEvaluacion);
router.get("/final/resultado", obtenerResultadoEvaluacionFinal);

export default router;
