"use server";

import { z } from "zod";
import { validateSimple } from "@/lib/action-utils";
import { getSessionUserId } from "@/actions/shared";
import { getUserEntitlements } from "@/lib/entitlements";
import { rateLimit } from "@/lib/rate-limit";
import {
  OPENROUTER_FREE_MODEL,
  assertFreeOpenRouterModel,
  getOpenRouterClient,
} from "@/lib/openrouter";
import { parseAutoTags } from "@/lib/ai-tag-parser";
import {
  AI_RATE_LIMIT_MAX_REQUESTS,
  AI_RATE_LIMIT_WINDOW,
  AUTO_TAG_CONTENT_LIMIT,
} from "@/lib/ai-config";

const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1).max(500),
  content: z.string().max(10_000).optional(),
  itemType: z.string().max(50).optional(),
  existingTags: z.array(z.string().max(50)).max(20).optional(),
});

type GenerateAutoTagsInput = z.infer<typeof generateAutoTagsSchema>;

export type GenerateAutoTagsResult =
  | { success: true; tags: string[] }
  | { success: false; error: string };

const SYSTEM_PROMPT = `You are a developer-content tagging assistant. Return ONLY valid JSON.
Given the item below, suggest 3-5 concise, lowercase, freeform tags.
- Avoid duplicates and near-duplicates
- Omit tags already present in the existing tags list
- Do not use leading # characters
- Do not include commentary, markdown, or explanations

Expected format: {"tags":["tag1","tag2","tag3"]}`;

function buildUserPrompt(
  title: string,
  itemType: string | undefined,
  existingTags: string[],
  content: string
): string {
  const parts = [`Title: ${title}`];
  if (itemType) parts.push(`Type: ${itemType}`);
  if (existingTags.length > 0) {
    parts.push(`Existing tags: ${existingTags.join(", ")}`);
  }
  if (content) parts.push(`\nContent:\n${content}`);
  return parts.join("\n");
}

export async function generateAutoTags(
  input: GenerateAutoTagsInput
): Promise<GenerateAutoTagsResult> {
  const validation = validateSimple(generateAutoTagsSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const entitlements = await getUserEntitlements(auth.userId);
  if (!entitlements.aiAccess) {
    return { success: false, error: "AI features require a Pro subscription" };
  }

  const limitResult = await rateLimit(
    `ai:${auth.userId}`,
    AI_RATE_LIMIT_MAX_REQUESTS,
    AI_RATE_LIMIT_WINDOW
  );
  if (!limitResult.success) {
    return {
      success: false,
      error: "You have reached the AI request limit. Try again later.",
    };
  }

  const truncatedContent = validation.data.content
    ? validation.data.content.slice(0, AUTO_TAG_CONTENT_LIMIT)
    : "";

  const userPrompt = buildUserPrompt(
    validation.data.title,
    validation.data.itemType,
    validation.data.existingTags ?? [],
    truncatedContent
  );

  assertFreeOpenRouterModel(OPENROUTER_FREE_MODEL);

  let response;
  try {
    response = await getOpenRouterClient().chat.send(
      {
        chatRequest: {
          model: OPENROUTER_FREE_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        },
      },
      { fetchOptions: { signal: AbortSignal.timeout(30_000) } }
    );
  } catch (err: unknown) {
    const status =
      (err as { response?: { status?: number }; statusCode?: number })
        .response?.status ??
      (err as { statusCode?: number }).statusCode;

    if (status === 401) {
      return {
        success: false,
        error: "AI service configuration error",
      };
    }

    if (status === 402) {
      return {
        success: false,
        error: "Free AI models are busy or unavailable. Try again later.",
      };
    }

    if (status === 429 || status === 502 || status === 503) {
      return {
        success: false,
        error: "Free AI models are busy or unavailable. Try again later.",
      };
    }

    return {
      success: false,
      error: "AI service configuration error",
    };
  }

  const chatResult = response as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = chatResult.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    return {
      success: false,
      error: "The AI service returned an invalid response. Try again.",
    };
  }

  const tags = parseAutoTags(content, validation.data.existingTags ?? []);

  if (tags.length === 0) {
    return {
      success: false,
      error: "The AI service returned an invalid response. Try again.",
    };
  }

  return { success: true, tags };
}
