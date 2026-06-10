import express from "express";
import { generarFeedbackEjercicio } from "../controllers/feedback.controller.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();

router.post(
  "/ejercicio",
  rateLimit({ windowMs: 60000, max: 12 }),
  generarFeedbackEjercicio
);

export default router;
