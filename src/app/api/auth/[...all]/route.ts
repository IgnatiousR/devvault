import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { rateLimit, getIpFromHeaders } from "@/lib/rate-limit";
import type { Duration } from "@upstash/ratelimit";

const { GET, POST: OriginalPOST } = toNextJsHandler(auth);

const RATE_LIMITS: Record<string, { max: number; window: Duration; keyBy: "ip" | "ip+email" }> = {
  "sign-in.email": { max: 5, window: "15 m", keyBy: "ip+email" },
  "sign-up.email": { max: 3, window: "1 h", keyBy: "ip" },
  forgetPassword: { max: 3, window: "1 h", keyBy: "ip" },
  resetPassword: { max: 5, window: "15 m", keyBy: "ip" },
  sendVerificationEmail: { max: 3, window: "15 m", keyBy: "ip+email" },
};

export async function POST(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.replace(/^\/api\/auth\//, "").split("/");
  const action = pathParts.join(".");
  const ip = getIpFromHeaders(request.headers);

  const config = RATE_LIMITS[action];

  if (config) {
    let key = ip;
    if (config.keyBy === "ip+email") {
      try {
        const cloned = request.clone();
        const body = await cloned.json();
        key = `${ip}:${body.email ?? "unknown"}`;
      } catch {
        // body not parseable, use IP only
      }
    }

    const result = await rateLimit(key, config.max, config.window);
    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({ error: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.` }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }
  }

  return OriginalPOST(request);
}

export { GET };
