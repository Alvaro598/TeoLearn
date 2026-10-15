import { firebaseAuth, isFirebaseAdminConfigured } from "../config/firebaseAdmin.js";

export async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "").trim()
      : null;

    if (!token) {
      return res.status(401).json({ error: "Token de autenticación requerido" });
    }

    if (!isFirebaseAdminConfigured || !firebaseAuth) {
      return res.status(503).json({
        error: "La autenticación de Firebase no está configurada en el servidor.",
      });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      claims: decodedToken,
    };

    return next();
  } catch (error) {
    console.error("Error verificando token de Firebase:", error);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}
