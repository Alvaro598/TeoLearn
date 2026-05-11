import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ritmoRoutes from "./routes/ritmo.routes.js";
import chatRouter from "./routes/chatRouter.js";

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRouter);
app.use("/api/ritmo", ritmoRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});