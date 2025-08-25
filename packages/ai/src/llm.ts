import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { generateText } from "ai";

// Centralized Google provider for the Vercel AI SDK
export const googleAI = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });

export const fastModelName = google("gemini-2.0-flash-exp");
export const deepModelName = google("gemini-1.5-pro");

export const defaultModelName = fastModelName;

export function model(modelName: any = defaultModelName) {
  return modelName;
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chat(messages: ChatMessage[], modelName = defaultModelName) {
  const result = await generateText({
    model: model(modelName),
    messages,
  });

  return { text: result.text, finishReason: result.finishReason, response: result.response }; 
}
