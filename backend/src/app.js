import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from "./routes/chatRouter.js";
import moduloRoutes from "./routes/modulo.routes.js";
import unidadRoutes from "./routes/unidad.routes.js";
import leccionRoutes from "./routes/leccion.routes.js";
import ejercicioRoutes from "./routes/ejercicio.routes.js";

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRouter);
app.use("/api/modulos", moduloRoutes);
app.use("/api/unidades", unidadRoutes);
app.use("/api/lecciones", leccionRoutes);
app.use("/api/ejercicios", ejercicioRoutes);


app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});