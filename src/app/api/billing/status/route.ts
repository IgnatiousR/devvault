import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-utils";
import { getUserEntitlements } from "@/lib/entitlements";
import { getUsageStatus } from "@/lib/usage-limits";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [entitlements, usage] = await Promise.all([
      getUserEntitlements(user.id),
      getUsageStatus(user.id),
    ]);

    return NextResponse.json({
      userId: user.id,
      email: user.email,
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
