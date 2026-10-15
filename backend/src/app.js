import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import chatRouter from "./routes/chatRouter.js";
import moduloRoutes from "./routes/modulo.routes.js";
import unidadRoutes from "./routes/unidad.routes.js";
import leccionRoutes from "./routes/leccion.routes.js";
import ejercicioRoutes from "./routes/ejercicio.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import progresoRoutes from "./routes/progreso.routes.js";
import pool from "./database/db.js";
import { ensureLearningPathSchema, seedLearningPath } from "./database/seedLearningPath.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { verifyFirebaseToken } from "./middleware/auth.js";


dotenv.config();

const app = express();
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isProduction = process.env.NODE_ENV === "production";

const corsOptions =
  corsOrigins.length > 0
    ? {
        origin(origin, callback) {
          if (!origin || corsOrigins.includes(origin)) {
            callback(null, true);
            return;
          }
          callback(new Error("Origen no permitido por CORS"));
        },
        credentials: true,
      }
    : isProduction
      ? { origin: false }
      : { origin: true, credentials: true };

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));
app.use("/api", rateLimit({ windowMs: 60000, max: 120 }));

app.use("/api/chat", rateLimit({ windowMs: 60000, max: 15 }), verifyFirebaseToken, chatRouter);
app.use("/api/modulos", moduloRoutes);
app.use("/api/unidades", unidadRoutes);
app.use("/api/lecciones", leccionRoutes);
app.use("/api/ejercicios", verifyFirebaseToken, ejercicioRoutes);
app.use("/api/feedback", rateLimit({ windowMs: 60000, max: 30 }), verifyFirebaseToken, feedbackRoutes);
app.use("/api/usuarios", rateLimit({ windowMs: 60000, max: 60 }), verifyFirebaseToken, usuarioRoutes);
app.use("/api/progreso", rateLimit({ windowMs: 60000, max: 60 }), verifyFirebaseToken, progresoRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

async function ensureLearningPathSeeded() {
  await ensureLearningPathSchema();
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM modulo");

  if ((result.rows[0]?.count ?? 0) === 0) {
    await seedLearningPath({ closePool: false });
  }
}

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await ensureLearningPathSeeded();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error);
    process.exitCode = 1;
  }
}

bootstrap();
