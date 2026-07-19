"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserEntitlements } from "@/lib/entitlements";

interface BillingResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function createCheckoutSession(
  annual: boolean
): Promise<BillingResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const entitlements = await getUserEntitlements(session.user.id);
    if (entitlements.isPro) {
      return { success: false, error: "Already subscribed to Pro" };
    }

    return {
      success: true,
      url: `/api/auth/subscription/upgrade`,
    };
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return { success: false, error: "Failed to create checkout session" };
  }
}

export async function openBillingPortal(): Promise<BillingResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    return {
      success: true,
      url: `/api/auth/subscription/billing-portal`,
    };
  } catch (error) {
    console.error("Portal creation failed:", error);
    return { success: false, error: "Failed to open billing portal" };
  }
}

export async function getBillingStatus() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const entitlements = await getUserEntitlements(session.user.id);

    return {
      userId: session.user.id,
      email: session.user.email,
      isPro: entitlements.isPro,
      entitlements,
    };
  } catch (error) {
    console.error("Failed to get billing status:", error);
    return { error: "Failed to get billing status" };
  }
}
