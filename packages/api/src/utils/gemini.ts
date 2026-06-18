import { GoogleGenAI } from "@google/genai";
import { env } from "@x-workflow/env/server";

const PLACEHOLDER_KEYS = new Set(["MY_GEMINI_API_KEY"]);

export function isGeminiConfigured(): boolean {
  const key = env.GEMINI_API_KEY;
  return !!key && key.trim() !== "" && !PLACEHOLDER_KEYS.has(key);
}

export async function generateReply({
  message,
  systemInstruction,
  temperature,
  model,
}: {
  message: string;
  systemInstruction?: string;
  temperature?: number;
  model?: string;
}): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: model ?? "gemini-3.5-flash",
    contents: message,
    config: {
      systemInstruction,
      temperature,
    },
  });

  if (!response.text) {
    throw new Error("Gemini response did not contain text content");
  }

  return response.text;
}
