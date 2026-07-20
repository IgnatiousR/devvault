# OpenRouter SDK Research

## Summary

Comprehensive reference for integrating `@openrouter/sdk` into a Next.js (DevVault) project. Covers installation, initialization, free model discovery, completions (streaming and non-streaming), error handling, rate limits, the `:free` variant pattern, and production gotchas.

---

## 1. Installation & Initialization

### Install

```bash
npm install @openrouter/sdk
```

### Initialize (server-only)

```typescript
import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  httpReferer: "https://devvault.app",   // optional: your app URL for rankings
  appTitle: "DevVault",                   // optional: shown in OpenRouter dashboard
});
```

### Next.js env var setup

```env
# .env.local (never commit, never prefix with NEXT_PUBLIC_)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
```

**Rule:** `OPENROUTER_API_KEY` must stay server-only. Never expose it to client components. Use it exclusively in Server Actions, Route Handlers, or server-side utility modules.

---

## 2. Models API — Listing Free Models

### Endpoint

```
GET https://openrouter.ai/api/v1/models
```

### SDK usage

```typescript
const models = await openRouter.models.list();
```

### Filtering for free models

Free models have an ID ending in `:free`. Filter the response:

```typescript
const freeModels = models.data.filter(
  (m) => m.id.endsWith(":free")
);
```

Or filter by pricing (prompt + completion == "0"):

```typescript
const freeByPricing = models.data.filter(
  (m) => m.pricing.prompt === "0" && m.pricing.completion === "0"
);
```

### Model response shape (relevant fields)

```json
{
  "id": "deepseek/deepseek-r1-0528:free",
  "name": "DeepSeek R1 0528 (free)",
  "context_length": 163840,
  "pricing": {
    "prompt": "0",
    "completion": "0",
    "request": "0"
  },
  "supported_parameters": ["temperature", "top_p", "max_tokens"],
  "top_provider": {
    "context_length": 163840,
    "max_completion_tokens": 163840
  }
}
```

### Known free model IDs (as of mid-2026 — check live list)

| Model ID | Provider |
|---|---|
| `deepseek/deepseek-r1-0528:free` | DeepSeek |
| `meta-llama/llama-3.3-70b-instruct:free` | Meta |
| `google/gemma-3-12b-it:free` | Google |
| `qwen/qwen3-4b:free` | Alibaba |
| `moonshotai/kimi-k2:free` | Moonshot |
| `openai/gpt-oss-120b:free` | OpenAI |
| `nvidia/nemotron-3-super-120b-a12b:free` | NVIDIA |

> Free model availability changes frequently. Always verify at `openrouter.ai/models` filtered to Free.

---

## 3. Non-Streaming Completions

```typescript
const response = await openRouter.chat.send({
  model: "deepseek/deepseek-r1-0528:free",
  messages: [
    { role: "user", content: "Explain quantum entanglement in one paragraph." }
  ],
  stream: false,
});

const content = response.choices[0]?.message?.content;
console.log(content);
```

---

## 4. Streaming Completions

```typescript
const stream = await openRouter.chat.send({
  model: "meta-llama/llama-3.3-70b-instruct:free",
  messages: [
    { role: "user", content: "Write a haiku about compilers." }
  ],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}
```

### Streaming with the Free Models Router

```typescript
const stream = await openRouter.chat.send({
  model: "openrouter/free",   // auto-picks a free model
  messages: [{ role: "user", content: "Hello!" }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}
```

---

## 5. Error Handling

### Error classes (SDK)

```typescript
import {
  TooManyRequestsResponseError,   // 429
  BadRequestResponseError,        // 400
  UnauthorizedResponseError,      // 401
  ForbiddenResponseError,         // 403
  InternalServerErrorResponseError, // 500
} from "@openrouter/sdk/models/errors";
```

### Typed error response shape

```json
{
  "error": {
    "code": 429,
    "message": "Rate limit exceeded",
    "metadata": {
      "error_type": "rate_limit_exceeded",
      "provider_code": "rate_limited",
      "headers": {
        "X-RateLimit-Limit": "20",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": "1741294740000"
      }
    }
  }
}
```

### Error types reference

| `error_type` | HTTP | Meaning |
|---|---|---|
| `rate_limit_exceeded` | 429 | Request/token rate limit hit |
| `provider_overloaded` | 503 | Upstream provider temporarily overloaded |
| `provider_unavailable` | 502 | Upstream returned invalid/empty response |
| `context_length_exceeded` | 400 | Prompt + output exceeds context window |
| `max_tokens_exceeded` | 400 | Hit `max_tokens` limit during generation |
| `authentication` | 401 | Invalid or expired API key |
| `content_policy_violation` | 403 | Moderation filter triggered |

### Retry pattern with Retry-After

```typescript
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.response?.status ?? err?.statusCode;
      if (status !== 429 && status !== 503) throw err;

      const retryAfter = parseInt(
        err?.response?.headers?.["retry-after"] ?? "3",
        10
      );
      const delay = retryAfter * 1000 + Math.random() * 1000; // jitter
      console.log(`Attempt ${attempt + 1} got ${status}, retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("OpenRouter rate limit exceeded after retries");
}

// Usage
const result = await callWithRetry(() =>
  openRouter.chat.send({
    model: "deepseek/deepseek-r1-0528:free",
    messages: [{ role: "user", content: "Hello" }],
    stream: false,
  })
);
```

### Streaming errors (mid-stream)

Errors that occur after streaming starts arrive as SSE events, not HTTP errors:

```text
data: {"choices":[{"delta":{"content":""},"finish_reason":"error"}],"error":{"code":429,"message":"Rate limit exceeded"}}
```

Handle in the iterator:

```typescript
for await (const chunk of stream) {
  if (chunk.error) {
    console.error("Stream error:", chunk.error);
    break;
  }
  // process chunk...
}
```

---

## 6. Rate Limits for Free Models

| Limit | Without credits | With ≥$10 lifetime credits |
|---|---|---|
| Requests per minute | 20 | 20 |
| Requests per day | 50 | 1,000 |

**Key facts:**
- Limits are per API key, globally (making multiple keys does not help)
- Failed 429 attempts **still count** toward your daily quota
- A one-time $10 credit purchase permanently raises the daily cap to 1,000
- Negative credit balance can trigger 402 errors even on free models
- Paid models (non-`:free`) have no platform-level rate limits from OpenRouter; 429s on paid models come from upstream providers

### Monitoring remaining quota

```
GET https://openrouter.ai/api/v1/key
```

Returns `limit_remaining` and usage stats.

---

## 7. Free Model Routing — The `:free` Pattern

### Two approaches

| Approach | Model ID | Behavior |
|---|---|---|
| **Specific free model** | `meta-llama/llama-3.3-70b-instruct:free` | Always uses that exact model |
| **Free Models Router** | `openrouter/free` | Auto-selects a random free model matching your request's capabilities |

### How `openrouter/free` works

1. Your request is analyzed for required capabilities (vision, tool calling, structured output)
2. Available free models are filtered to those supporting those capabilities
3. A model is randomly selected from the filtered pool
4. Response includes metadata showing which model was used

### When to use which

- **Pin a model** (`:free` suffix) when you need predictable behavior, specific capabilities, or consistent output quality
- **Use `openrouter/free`** as a fallback when your pinned model is rate-limited or unavailable

### Always include `:free`

If you call a model ID **without** the `:free` suffix and have credits on your account, OpenRouter routes it as a **paid request**. Be explicit:

```typescript
// WRONG — will be charged as paid
model: "deepseek/deepseek-r1-0528"

// CORRECT — free tier
model: "deepseek/deepseek-r1-0528:free"
```

---

## 8. Gotchas & Production Considerations

### Free model availability is volatile
Free models rotate in and out. Providers add or remove free-tier access at any time. Never hardcode a free model ID as your only option. Always have a fallback list or use `openrouter/free`.

### Free models have higher latency during peak hours
Same infrastructure as paid models, but free tier gets lower priority. Expect 2-5x latency spikes during high-traffic periods.

### Feature support varies
Not all free models support tool calling, vision, structured output, or long contexts. Check `supported_parameters` and `top_provider` fields in the model response.

### Provider-level failover is automatic
If one provider serving a model goes down, OpenRouter automatically tries the next provider for that model. This is on by default (`allow_fallbacks: true`).

### Model-level fallbacks are opt-in
If every provider for your primary model fails, you can configure a fallback chain:

```typescript
const response = await openRouter.chat.send({
  models: [
    "deepseek/deepseek-r1-0528:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openrouter/free",  // floor model
  ],
  messages: [{ role: "user", content: "Hello" }],
  stream: false,
});
```

### Zero-completion insurance
You are not billed for requests that ultimately fail after all fallbacks are exhausted. However, some edge cases with 429 paths and partial outputs may still consume credits — monitor your activity log.

### Negative balance = 402 on free models
Keep your balance at $0 or above. A negative balance triggers 402 errors even on free-tier requests.

### Cloudflare DDoS protection
Requests that dramatically exceed reasonable usage patterns can be blocked by Cloudflare's DDoS protection, independent of OpenRouter's own rate limits.

---

## 9. Quick Reference — Complete Next.js Server Action Example

```typescript
"use server";

import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  httpReferer: "https://devvault.app",
  appTitle: "DevVault",
});

const FREE_MODELS = [
  "deepseek/deepseek-r1-0528:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-4b:free",
];

export async function generateContent(prompt: string) {
  for (const model of FREE_MODELS) {
    try {
      const response = await openRouter.chat.send({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      });
      return response.choices[0]?.message?.content ?? "";
    } catch (err: any) {
      const status = err?.response?.status ?? err?.statusCode;
      if (status === 429) {
        console.warn(`Rate limited on ${model}, trying next...`);
        continue;
      }
      throw err;
    }
  }
  // All models exhausted — use the router as final fallback
  const response = await openRouter.chat.send({
    model: "openrouter/free",
    messages: [{ role: "user", content: prompt }],
    stream: false,
  });
  return response.choices[0]?.message?.content ?? "";
}
```

---

## Sources

- OpenRouter TypeScript SDK docs: https://github.com/openrouterteam/typescript-sdk
- OpenRouter API rate limits: https://openrouter.ai/docs/api/reference/limits
- OpenRouter errors & debugging: https://openrouter.ai/docs/api/reference/errors-and-debugging
- Free Models Router: https://openrouter.ai/docs/guides/routing/routers/free-router
- Free variant docs: https://openrouter.ai/docs/guides/routing/model-variants/free
- Models API: https://openrouter.ai/docs/api/api-reference/models/get-models
- SDK ModelId type: `src/types/models.ts` in typescript-sdk repo (lists `:free` variants)
