# AI Integration Plan for DevVault

## Summary

This plan adds AI-powered features to DevVault using **OpenRouter with free models only**. All model calls go through `openrouter/free` (auto-router) with explicit `:free`-suffixed fallbacks. The current Pro-only AI gate (`requireProForFeature("ai")`) is replaced with a per-user signed-in quota. No paid models are ever used.

---

## Scope and Method

**Evidence sources inspected:**

| Source | Path | Purpose |
|---|---|---|
| Auth config | `src/lib/auth.ts` | Better Auth setup, `getSession` API, `isPro` additional field |
| Session helper | `src/actions/shared.ts` | `getSessionUserId()` pattern |
| Existing actions | `src/actions/items.ts` | Action patterns: Zod validation, ownership, return types |
| Action utils | `src/lib/action-utils.ts` | `validateWithFieldErrors`, `validateSimple`, `notFound` |
| Rate limiting | `src/lib/rate-limit.ts` | Upstash `@upstash/ratelimit` wrapper |
| Usage limits | `src/lib/usage-limits.ts` | `requireProForFeature("ai")` — current Pro gate |
| Entitlements | `src/lib/entitlements.ts` | `aiAccess: boolean` field on `Entitlements` interface |
| Test patterns | `src/actions/items.test.ts` | Vitest mocking conventions |
| Package deps | `package.json` | Current dependencies (no `@openrouter/sdk` yet) |
| OpenRouter docs | External research | SDK, free models, streaming, errors, rate limits |
| Better Auth docs | External research | Server session, headers, TypeScript types |

---

## Findings

### 1. Current AI Access Gate

`src/lib/entitlements.ts:13-21` — The free tier sets `aiAccess: false`. `src/lib/usage-limits.ts:60-74` — `requireProForFeature(userId, "ai")` throws if not Pro. This gate must be replaced with a per-user quota system.

### 2. Existing Action Pattern

All server actions follow the same structure (`src/actions/items.ts`):

1. `"use server"` directive
2. Zod schema for input validation
3. `getSessionUserId()` call for auth
4. Ownership/authorization checks
5. DB operation
6. Typed return `{ success: true; data? }` or `{ success: false; error?; fieldErrors? }`

AI actions must follow this same pattern exactly.

### 3. Auth Integration

`src/actions/shared.ts:6-18` — `getSessionUserId()` calls `auth.api.getSession({ headers: await headers() })` and returns `{ userId }` or `{ success: false; error: "Unauthorized" }`. This is the only auth pattern to use — no NextAuth, no custom middleware.

### 4. Rate Limiting Infrastructure

`src/lib/rate-limit.ts:18-35` — `rateLimit(key, maxRequests, window)` wraps `@upstash/ratelimit` with sliding window. Returns `{ success, remaining, reset }`. Already has graceful fallback when Redis is unavailable.

### 5. OpenRouter Free Model Routing

- **Default model**: `openrouter/free` — auto-routes to a random free model matching request capabilities
- **Pinned fallback**: Must use `:free` suffix (e.g., `meta-llama/llama-4-scout:free`)
- **Rate limits**: 20 req/min; 50 req/day (no credits) → 1,000/day (after $10 one-time purchase)
- **Gotcha**: Free model availability rotates; feature support varies per model; 429 attempts still count toward daily quota

### 6. Streaming vs Non-Streaming

| Feature | Mode | Reason |
|---|---|---|
| Auto-tagging | Non-streaming | Short output, structured JSON response |
| AI summaries | Non-streaming | Short output, needs post-processing |
| Prompt improvement | Non-streaming | Short output, needs acceptance flow |
| Code explanation | Streaming | Long output, better UX with progressive render |

### 7. Prisma Schema

No AI-related models exist yet. AI usage tracking should use the existing `rate-limit.ts` with Upstash rather than adding a new DB table — keeps it stateless and avoids migration overhead.

---

## Recommended Architecture

### A. Package Installation

```bash
npm install @openrouter/sdk
```

Add `@vercel/ai` only if streaming is needed for code explanation (check if the free model supports streaming via `models.list()` first).

### B. Environment Variable

```
OPENROUTER_API_KEY=sk-or-v1-...  # Server-only, never exposed to client
```

### C. New Files

```
src/lib/ai/
  client.ts          — OpenRouter client singleton
  models.ts          — Free model discovery, caching, fallback
  prompts.ts         — Reusable prompt templates for each feature
  types.ts           — Shared AI response types and Zod schemas

src/actions/ai.ts    — Server actions (auto-tag, summarize, explain, improve)
src/actions/ai.test.ts — Tests with mocked OpenRouter responses
```

### D. `src/lib/ai/client.ts`

```typescript
import OpenRouter from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export default openrouter;
```

- Server-only file (never imported in client components)
- No `OPENROUTER_API_KEY` in `process.env` client-side — use `NEXT_PUBLIC_` prefix guard or server-action boundary

### E. `src/lib/ai/models.ts`

```typescript
// Model routing: always use :free suffix or openrouter/free
const DEFAULT_MODEL = "openrouter/free";
const FALLBACK_MODELS = [
  "meta-llama/llama-4-scout:free",
  "google/gemma-3-12b-it:free",
  "mistralai/mistral-small-3.2-24b-instruct:free",
];

// Cache discovered free models for 1 hour
let cachedFreeModels: string[] | null = null;
let cacheExpiry = 0;

export async function getAvailableFreeModels(): Promise<string[]> {
  if (cachedFreeModels && Date.now() < cacheExpiry) return cachedFreeModels;

  const response = await openrouter.models.list();
  cachedFreeModels = response.data
    .filter((m) => m.id.endsWith(":free") || m.pricing?.prompt === "0")
    .map((m) => m.id);
  cacheExpiry = Date.now() + 60 * 60 * 1000;
  return cachedFreeModels;
}

export async function resolveModel(preference?: string): Promise<string> {
  if (preference) return preference;
  return DEFAULT_MODEL; // openrouter/free handles routing
}
```

### F. `src/lib/ai/prompts.ts`

Reusable prompt helpers (not stored in DB, just functions):

```typescript
export function autoTagPrompt(title: string, content: string, language?: string): string {
  return `Suggest 3-7 concise tags for this ${language ? `${language} ` : ''}item.
Return ONLY a JSON array of strings. No explanation.

Title: ${title}
Content:
${truncate(content, 4000)}`;
}

export function summarizePrompt(title: string, content: string, language?: string): string {
  return `Write a 1-3 sentence summary of this ${language ? `${language} ` : ''}item.

Title: ${title}
Content:
${truncate(content, 4000)}`;
}

export function explainPrompt(content: string, language: string): string {
  return `Explain this ${language} code. Cover:
1. What it does
2. Key patterns/techniques
3. Potential improvements

Be concise (under 300 words).

Code:
\`\`\`${language}
${truncate(content, 8000)}
\`\`\``;
}

export function improvePrompt(content: string, language: string): string {
  return `Suggest improvements for this ${language} code. Return:
1. An improved version of the code
2. A brief explanation of changes

Code:
\`\`\`${language}
${truncate(content, 8000)}
\`\`\``;
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + "\n...[truncated]" : text;
}
```

### G. `src/actions/ai.ts`

```typescript
"use server";

import { z } from "zod";
import openrouter from "@/lib/ai/client";
import { resolveModel } from "@/lib/ai/models";
import {
  autoTagPrompt,
  summarizePrompt,
  explainPrompt,
  improvePrompt,
} from "@/lib/ai/prompts";
import { getSessionUserId } from "./shared";
import { validateWithFieldErrors } from "@/lib/action-utils";
import { rateLimit } from "@/lib/rate-limit";

// ─── Shared limits ──────────────────────────────────────
const AI_RATE_LIMIT = { maxRequests: 10, window: "1h" as const };
const AI_DAILY_LIMIT = { maxRequests: 50, window: "1d" as const };
const MAX_INPUT_CHARS = 8000;
const MAX_OUTPUT_TOKENS = 1024;

async function checkAiQuota(userId: string): Promise<{ allowed: boolean; error?: string }> {
  const perUser = await rateLimit(`ai:${userId}`, AI_RATE_LIMIT.maxRequests, AI_RATE_LIMIT.window);
  if (!perUser.success) return { allowed: false, error: "AI rate limit exceeded. Try again later." };

  const daily = await rateLimit(`ai:daily:${userId}`, AI_DAILY_LIMIT.maxRequests, AI_DAILY_LIMIT.window);
  if (!daily.success) return { allowed: false, error: "Daily AI limit reached (50 requests)." };

  return { allowed: true };
}

async function callOpenRouter(
  prompt: string,
  options: { model?: string; maxTokens?: number; stream?: false }
): Promise<string> {
  const model = await resolveModel(options.model);

  const response = await openrouter.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: options.maxTokens ?? MAX_OUTPUT_TOKENS,
  });

  const content = response.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("AI returned empty or malformed response");
  }
  return content;
}

// ─── Actions ────────────────────────────────────────────

const autoTagSchema = z.object({
  itemId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().optional(),
  language: z.string().optional(),
  model: z.string().optional(),
});

export async function autoTagAction(input: z.infer<typeof autoTagSchema>) {
  const validation = validateWithFieldErrors(autoTagSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const quota = await checkAiQuota(auth.userId);
  if (!quota.allowed) return { success: false, error: quota.error };

  try {
    const { itemId, title, content, language, model } = validation.data;
    const truncated = (content ?? "").slice(0, MAX_INPUT_CHARS);
    const prompt = autoTagPrompt(title, truncated, language);

    const raw = await callOpenRouter(prompt, { model });
    const tags = JSON.parse(raw);

    if (!Array.isArray(tags) || !tags.every((t) => typeof t === "string")) {
      return { success: false, error: "AI returned invalid tag format" };
    }

    return { success: true, data: { tags: tags.slice(0, 7) } };
  } catch (error) {
    return mapAiError(error);
  }
}

const summarizeSchema = z.object({
  itemId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().optional(),
  language: z.string().optional(),
  model: z.string().optional(),
});

export async function summarizeAction(input: z.infer<typeof summarizeSchema>) {
  const validation = validateWithFieldErrors(summarizeSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const quota = await checkAiQuota(auth.userId);
  if (!quota.allowed) return { success: false, error: quota.error };

  try {
    const { title, content, language, model } = validation.data;
    const truncated = (content ?? "").slice(0, MAX_INPUT_CHARS);
    const prompt = summarizePrompt(title, truncated, language);

    const summary = await callOpenRouter(prompt, { model });
    return { success: true, data: { summary: summary.trim() } };
  } catch (error) {
    return mapAiError(error);
  }
}

const explainSchema = z.object({
  itemId: z.string().min(1),
  content: z.string().min(1),
  language: z.string().min(1),
  model: z.string().optional(),
});

export async function explainAction(input: z.infer<typeof explainSchema>) {
  const validation = validateWithFieldErrors(explainSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const quota = await checkAiQuota(auth.userId);
  if (!quota.allowed) return { success: false, error: quota.error };

  try {
    const { content, language, model } = validation.data;
    const prompt = explainPrompt(content, language);

    const explanation = await callOpenRouter(prompt, {
      model,
      maxTokens: 2048,
    });
    return { success: true, data: { explanation: explanation.trim() } };
  } catch (error) {
    return mapAiError(error);
  }
}

const improveSchema = z.object({
  itemId: z.string().min(1),
  content: z.string().min(1),
  language: z.string().min(1),
  model: z.string().optional(),
});

export async function improveAction(input: z.infer<typeof improveSchema>) {
  const validation = validateWithFieldErrors(improveSchema, input);
  if (!validation.success) return validation;

  const auth = await getSessionUserId();
  if (!("userId" in auth)) return auth;

  const quota = await checkAiQuota(auth.userId);
  if (!quota.allowed) return { success: false, error: quota.error };

  try {
    const { content, language, model } = validation.data;
    const prompt = improvePrompt(content, language);

    const raw = await callOpenRouter(prompt, { model, maxTokens: 2048 });

    // Parse "improved code\nexplanation" format
    const parts = raw.split("\n\n");
    const improvedCode = parts[0]?.replace(/^```[\w]*\n?|```$/gm, "").trim() ?? raw;
    const explanation = parts.slice(1).join("\n\n").trim() ?? "";

    return { success: true, data: { improvedCode, explanation } };
  } catch (error) {
    return mapAiError(error);
  }
}

// ─── Error mapper ───────────────────────────────────────

function mapAiError(error: unknown): { success: false; error: string } {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes("429") || msg.includes("rate limit")) {
    return { success: false, error: "AI provider rate limit exceeded. Please try again." };
  }
  if (msg.includes("402")) {
    return { success: false, error: "AI provider requires credits. Please contact support." };
  }
  if (msg.includes("503") || msg.includes("unavailable")) {
    return { success: false, error: "AI model temporarily unavailable. Please try again." };
  }
  if (msg.includes("JSON")) {
    return { success: false, error: "AI returned unexpected format. Please retry." };
  }
  if (msg.includes("timeout")) {
    return { success: false, error: "AI request timed out. Please try again." };
  }

  return { success: false, error: "AI service error. Please try again." };
}
```

### H. Entitlements Change

Remove the `aiAccess` gate from `src/lib/usage-limits.ts:60-74`. Replace with the per-user rate limit check in `src/actions/ai.ts`. The `requireProForFeature(userId, "ai")` call in any existing code must be removed — all signed-in users get AI access with the shared quota.

In `src/lib/entitlements.ts`, keep `aiAccess` for display purposes but change the runtime check:

```typescript
// OLD: free tier has aiAccess: false
// NEW: all users have aiAccess: true (quota-controlled, not feature-gated)
const FREE_TIER: Entitlements = {
  // ...
  aiAccess: true,  // Changed from false
  // ...
};
```

### I. Security Controls

| Control | Implementation |
|---|---|
| API key exposure | `OPENROUTER_API_KEY` only in server files; never in `NEXT_PUBLIC_` vars |
| Input size cap | `truncate(content, MAX_INPUT_CHARS)` before sending to model |
| Output size cap | `max_tokens` set per action type (1024 default, 2048 for explain/improve) |
| Markdown sanitization | Use `rehype-sanitize` (already in deps) when rendering AI output in UI |
| Secrets exclusion | Never include `fileUrl`, API keys, or private paths in prompts |
| JSON validation | `JSON.parse` with try/catch; validate structure before returning |

### J. UI Patterns

- **Loading state**: `useTransition` or `useState(isLoading)` with skeleton/spinner
- **Cancel/retry**: AbortController for streaming; simple retry button for non-streaming
- **Accept/reject**: Show AI suggestion in a diff/overlay; user clicks "Apply" to save or "Dismiss" to revert
- **Preserve original**: Never overwrite original content until user explicitly accepts
- **Error display**: Use `sonner` toast for errors (already in deps)

### K. Streaming for Code Explanation

```typescript
// In explainAction, if streaming is needed:
export async function explainStreamAction(input: ExplainInput) {
  // ... auth + quota checks ...

  const stream = await openrouter.chat.completions.create({
    model: await resolveModel(),
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2048,
    stream: true,
  });

  // Return ReadableStream for client consumption
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices?.[0]?.delta?.content;
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

This requires `@vercel/ai` or manual `ReadableStream` handling. Prefer manual streams to avoid extra dependencies.

---

## Evidence

### Auth pattern

`src/actions/shared.ts:6-18`:
```typescript
export async function getSessionUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Unauthorized" };
  return { userId: session.user.id };
}
```

### Current Pro AI gate

`src/lib/usage-limits.ts:60-74`:
```typescript
export async function requireProForFeature(userId: string, feature: "fileUpload" | "ai" | "customItemTypes" | "export") {
  const entitlements = await getUserEntitlements(userId);
  const featureMap: Record<string, keyof typeof entitlements> = {
    ai: "aiAccess",
    // ...
  };
  const entitlementKey = featureMap[feature];
  if (entitlementKey && !entitlements[entitlementKey]) {
    throw new Error(`Pro subscription required for ${feature}`);
  }
}
```

### Rate limiting

`src/lib/rate-limit.ts:18-35` — Uses `@upstash/ratelimit` with sliding window, graceful fallback when Redis unavailable.

### Test mocking pattern

`src/actions/items.test.ts:3-9`:
```typescript
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));
```

### OpenRouter free models

- `openrouter/free` auto-routes to a free model
- `:free` suffix required for explicit model selection
- 20 req/min, 50 req/day (no credits), 1,000/day (with $10 purchase)
- Free model availability rotates; negative balance triggers 402

---

## Gaps and Uncertainties

1. **Streaming support**: Free models may not all support streaming. Test `stream: true` with the resolved free model before relying on it for code explanation.

2. **Daily quota interaction**: The 50 req/day free-tier limit from OpenRouter applies per API key, not per user. If many users share one key, they share the daily limit. Consider either: (a) accepting this as the cost model, or (b) implementing a stricter per-user daily limit (e.g., 10/day) to stay within the 50/day key-wide limit.

3. **Model capability variance**: Different free models may return JSON in inconsistent formats. The auto-tag action parses JSON — some models may wrap it in markdown fences or add explanation text. The `JSON.parse` fallback should handle this, but edge cases remain.

4. **No DB persistence for AI usage**: The rate-limit approach uses Redis (Upstash). If Upstash is unavailable, `rateLimit()` returns `{ success: true }` (graceful bypass). This means no rate limiting in dev/degraded environments — acceptable but should be documented.

5. **`rehype-sanitize` for Markdown**: Already in deps (`rehype-sanitize: ^6.0.0`). Need to verify it's properly configured when rendering AI-explained code to prevent XSS from model output.

---

## Recommendations

1. **Implementation order**: Client → models → prompts → actions → entitlements change → tests → UI
2. **Test coverage**: Mock OpenRouter responses for: auth failure, rate limit exceeded, invalid JSON response, model unavailable (503), empty response, successful response
3. **Monitoring**: Add `console.error` logging for all AI failures in `mapAiError` for observability
4. **Documentation**: Add `OPENROUTER_API_KEY` to `.env.example` with a comment: "Server-only — never expose to client"
5. **Future**: If demand grows, consider OpenRouter credits ($10 one-time) to unlock 1,000 req/day, or switch to a self-hosted model

---

## Sources

- `src/lib/auth.ts` — Better Auth configuration
- `src/actions/shared.ts` — `getSessionUserId()` pattern
- `src/actions/items.ts` — Server action conventions
- `src/lib/action-utils.ts` — Validation utilities
- `src/lib/rate-limit.ts` — Upstash rate limiting
- `src/lib/usage-limits.ts` — Current Pro gate for AI
- `src/lib/entitlements.ts` — Entitlements interface and tiers
- `src/actions/items.test.ts` — Test mocking patterns
- `package.json` — Current dependencies
- `prisma/schema.prisma` — Data model
- OpenRouter docs — SDK, free models, Models API, streaming, errors, rate limits (researched via Context7)
- Better Auth docs — Server session, headers, TypeScript types (researched via Context7)
