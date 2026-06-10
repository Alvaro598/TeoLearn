import express from "express";
import {
  crearUsuario,
  obtenerUsuarioPorFirebaseUid,
  obtenerOCrearUsuario,
} from "../controllers/usuarios.controller.js";

const router = express.Router();

// POST /api/usuarios — crear usuario nuevo
router.post("/", crearUsuario);

// GET /api/usuarios/firebase/:uid — obtener usuario de la BD por firebase_uid
router.get("/firebase/:uid", obtenerUsuarioPorFirebaseUid);

// POST /api/usuarios/sync — obtener o crear usuario (idempotente, usado en login)
router.post("/sync", obtenerOCrearUsuario);

export default router;
