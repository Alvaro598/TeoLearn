import express from "express";
import { preguntarChatbot } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/", preguntarChatbot);

export default router;