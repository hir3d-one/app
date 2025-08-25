import { z } from "zod";
import { generateObject } from "ai";
import { model, defaultModelName } from "./llm";

export type ModelProvider = "openai" | "google" | "custom";

export type StructuredOutputOptions<TSchema extends z.ZodTypeAny> = {
  schema: TSchema;
  system?: string;
  prompt: string;
  provider?: ModelProvider;
  model?: string;
};

export async function structuredOutput<TSchema extends z.ZodTypeAny>(options: StructuredOutputOptions<TSchema>) {
  const { schema, system, prompt, model: modelName = defaultModelName } = options;

  const result = await generateObject({
    model: model(modelName),
    schema,
    messages: [
      ...(system ? [{ role: "system" as const, content: system }] : []),
      { role: "user" as const, content: prompt },
    ],
  });

  return { object: result.object as z.infer<TSchema>, warnings: result.warnings };
}

