import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserEntitlements } from "@/lib/entitlements";
import { getUsageStatus } from "@/lib/usage-limits";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [entitlements, usage] = await Promise.all([
      getUserEntitlements(session.user.id),
      getUsageStatus(session.user.id),
    ]);

    return NextResponse.json({
      userId: session.user.id,
      email: session.user.email,
      isPro: entitlements.isPro,
      entitlements,
      usage,
    });
  } catch (error) {
    console.error("Failed to get billing status:", error);
    return NextResponse.json(
      { error: "Failed to get billing status" },
      { status: 500 }
    );
  }
}
