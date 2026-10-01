import { firebaseAuth, isFirebaseAdminConfigured } from "../config/firebaseAdmin.js";

function decodeFirebaseDevToken(token) {
  const parts = token.split(".");
  if (parts.length < 2) {
    throw new Error("Formato de token inválido");
  }

  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const normalized = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
  const decoded = Buffer.from(normalized, "base64").toString("utf8");
  const parsed = JSON.parse(decoded);

  return {
    uid: parsed.uid || parsed.user_id || parsed.sub || null,
    email: parsed.email || null,
    claims: parsed,
  };
}

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
      if (process.env.NODE_ENV === "production") {
        return res.status(503).json({
          error: "La autenticación de Firebase no está configurada en el servidor.",
        });
      }

      const decodedToken = decodeFirebaseDevToken(token);
      req.firebaseUser = decodedToken;
      return next();
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
