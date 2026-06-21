import express from "express";
import cors from "cors";
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
import { seedLearningPath } from "./database/seedLearningPath.js";
import { rateLimit } from "./middleware/rateLimit.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", rateLimit({ windowMs: 60000, max: 15 }), chatRouter);
app.use("/api/modulos", moduloRoutes);
app.use("/api/unidades", unidadRoutes);
app.use("/api/lecciones", leccionRoutes);
app.use("/api/ejercicios", ejercicioRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/progreso", progresoRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

async function ensureLearningPathSeeded() {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM modulos");

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
