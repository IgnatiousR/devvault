# AI Integration Research

## Output

`docs/compose/plans/ai-integration-plan.md`

## Goal

Create a compact AI integration plan for DevVault using **OpenRouter only with free models**. Default to `openrouter/free`; any pinned fallback must use a current `:free` model. Never fall back to paid models.

Features:

- Auto-tagging
- AI summaries
- Code explanation
- Prompt improvement

## Include

- OpenRouter setup with `OPENROUTER_API_KEY` kept server-only; prefer `@openrouter/sdk`, adding Vercel AI SDK only when streaming is needed.
- Free-model routing and discovery through OpenRouter’s Models API; handle changing availability and inconsistent model capabilities.
- Better Auth integration using the existing `auth.api.getSession()` / `getSessionUserId()` pattern—no NextAuth.
- A `src/actions/ai.ts` server-action pattern with Zod validation, typed results, ownership checks, and reusable prompt helpers.
- Non-streaming for tags, summaries, and prompt improvement; streaming only for longer code explanations.
- Per-user AI limits using `src/lib/rate-limit.ts`; return clear errors for 429, timeout, unavailable model, malformed output, and service failure.
- Do not require Pro solely for AI. Replace the current AI Pro gate with a small signed-in-user quota while keeping all model calls free.
- Compact UI patterns: loading state, cancel/retry, accept/reject suggestion, and preserve original content.
- Security: never expose the API key, cap input/output size, sanitize rendered Markdown, exclude secrets/private files, and validate model JSON before saving.
- Tests with mocked OpenRouter responses for auth failure, rate limits, invalid JSON, and provider errors.

## Project Sources

- `src/lib/auth.ts`
- `src/actions/shared.ts`
- `src/actions/items.ts`
- `src/lib/action-utils.ts`
- `src/lib/rate-limit.ts`
- `src/lib/usage-limits.ts`
- `package.json`

## External Sources

- OpenRouter free router, SDK, Models API, streaming, errors, and rate-limit docs
- Better Auth Next.js server-session docs
