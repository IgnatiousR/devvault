import "server-only";

import { OpenRouter } from "@openrouter/sdk";

export const OPENROUTER_FREE_MODEL = "openrouter/free" as const;

export function isFreeOpenRouterModel(model: string): boolean {
  return model === OPENROUTER_FREE_MODEL || model.endsWith(":free");
}

export function assertFreeOpenRouterModel(model: string): void {
  if (!isFreeOpenRouterModel(model)) {
    throw new Error(`Refusing to use non-free OpenRouter model: ${model}`);
  }
}

let client: OpenRouter | null = null;

export function getOpenRouterClient(): OpenRouter {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  client ??= new OpenRouter({
    apiKey,
    appTitle: "DevVault",
    ...(process.env.BETTER_AUTH_URL
      ? { httpReferer: process.env.BETTER_AUTH_URL }
      : {}),
  });

  return client;
}
