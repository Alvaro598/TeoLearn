
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let client;

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    ""
  );
}

export function getGeminiConfigurationError() {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return "Falta configurar GEMINI_API_KEY.";
  }

  if (apiKey.toLowerCase().startsWith("sk-or-")) {
    return "La clave configurada parece ser de OpenRouter, no de Google Gemini.";
  }

  return null;
}

export function isGeminiConfigured() {
  return getGeminiConfigurationError() === null;
}

export function getGeminiClient() {
  const configurationError = getGeminiConfigurationError();

  if (configurationError) {
    throw new Error(configurationError);
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: getGeminiApiKey(),
    });
  }

  return client;
}

export async function generateGeminiContent({
  model,
  contents,
  systemInstruction,
  thinkingLevel = "low",
  maxOutputTokens = 500,
  includeThoughts = false,
}) {
  if (!model || typeof model !== "string") {
    throw new Error("No se ha configurado un modelo válido de Gemini.");
  }

  if (
    !Number.isInteger(maxOutputTokens) ||
    maxOutputTokens < 1
  ) {
    throw new Error("maxOutputTokens debe ser un entero positivo.");
  }

  const validThinkingLevels = ["minimal", "low", "medium", "high"];

  const safeThinkingLevel = validThinkingLevels.includes(thinkingLevel)
    ? thinkingLevel
    : "low";

  const config = {
    maxOutputTokens,
    thinkingConfig: {
      thinkingLevel: safeThinkingLevel,
      includeThoughts: Boolean(includeThoughts),
    },
  };

  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  return getGeminiClient().models.generateContent({
    model,
    contents,
    config,
  });
}
