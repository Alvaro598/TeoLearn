import express from "express";
import { evaluarRitmo } from "../controllers/ritmo.controller.js";

const router = express.Router();

router.post("/evaluar", evaluarRitmo);

export default router;