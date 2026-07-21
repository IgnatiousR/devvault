"use server";

import { getSessionUser } from "@/actions/shared";
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
    const user = await getSessionUser();
    if (!("userId" in user)) return user;

    const entitlements = await getUserEntitlements(user.userId);
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
    const user = await getSessionUser();
    if (!("userId" in user)) return user;

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
    const user = await getSessionUser();
    if (!("userId" in user)) return user;

    const entitlements = await getUserEntitlements(user.userId);

    return {
      userId: user.userId,
      email: user.email,
      isPro: entitlements.isPro,
      entitlements,
    };
  } catch (error) {
    console.error("Failed to get billing status:", error);
    return { error: "Failed to get billing status" };
  }
}
