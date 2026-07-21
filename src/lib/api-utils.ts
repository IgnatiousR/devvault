import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { rateLimit, getIpFromHeaders } from "@/lib/rate-limit";
import type { Duration } from "@upstash/ratelimit";

export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return null;
  }
  return session.user;
}

export async function checkRateLimit(limit: number, window: Duration) {
  const ip = getIpFromHeaders(await headers());
  const rl = await rateLimit(ip, limit, window);
  if (!rl.success) {
    const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  return null;
}
