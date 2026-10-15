import express from "express";
import { obtenerModulos } from "../controllers/modulo.controller.js";

const router = express.Router();
router.get("/", obtenerModulos);

export default router;