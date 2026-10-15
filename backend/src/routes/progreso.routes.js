import express from "express";
import {
  obtenerProgreso,
  completarLeccion,
  obtenerEjerciciosCompletados,
  obtenerDashboard,
  progresoModulo,
} from "../controllers/progreso.controller.js";

const router = express.Router();

// GET /api/progress/ejercicios/:usuarioId/:leccionId — ejercicios aprobados
router.get("/ejercicios/:usuarioId/:leccionId", obtenerEjerciciosCompletados);

// POST /api/progress/completar — marcar lección como completada y sumar XP
router.post("/completar", completarLeccion);

// GET /api/progress/dashboard/:usuarioId — resumen completo para el Dashboard
router.get("/dashboard/:usuarioId", obtenerDashboard);

// GET /api/progress/modulo/:usuarioId/:moduloSlug — progreso de un módulo específico
router.get("/modulo/:usuarioId/:moduloSlug", progresoModulo);

// GET /api/progress/:usuarioId — progreso básico (completadas / total)
router.get("/:usuarioId", obtenerProgreso);

export default router;