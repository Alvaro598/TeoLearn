import express from "express";
import {
  obtenerProgreso,
  completarLeccion,
  guardarIntento,
  obtenerDashboard,
} from "../controllers/progreso.controller.js";

const router = express.Router();

// POST /api/progress/intento — registrar intento de ejercicio
router.post("/intento", guardarIntento);

// POST /api/progress/completar — marcar lección como completada y sumar XP
router.post("/completar", completarLeccion);

// GET /api/progress/dashboard/:usuarioId — resumen completo para el Dashboard
router.get("/dashboard/:usuarioId", obtenerDashboard);

// GET /api/progress/:usuarioId — progreso básico (completadas / total)
router.get("/:usuarioId", obtenerProgreso);

export default router;
