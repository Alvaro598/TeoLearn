import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("Falta configurar GEMINI_API_KEY.");
    }

    const gemini = new GoogleGenAI({ apiKey });
    const response = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      contents: "Hola",
      config: {
        thinkingConfig: { thinkingLevel: "low", includeThoughts: false },
        maxOutputTokens: 1000,
      },
    });

    console.log(response.text);
  } catch (error) {
    console.error(error);
  }
}

test();