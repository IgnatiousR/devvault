import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

export async function rateLimit(
  key: string,
  maxRequests: number,
  window: Duration
): Promise<RateLimitResult> {
  if (!redis) {
    return { success: true, remaining: maxRequests, reset: 0 };
  }

  const customLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, window),
    analytics: true,
  });

  const { success, remaining, reset } = await customLimiter.limit(key);
  return { success, remaining, reset };
}

export function getIpFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
