import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/entitlements", () => ({
  getUserEntitlements: vi.fn(),
}));

import {
  createCheckoutSession,
  openBillingPortal,
  getBillingStatus,
} from "./billing";
import { auth } from "@/lib/auth";
import { getUserEntitlements } from "@/lib/entitlements";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetUserEntitlements = vi.mocked(getUserEntitlements);

describe("createCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await createCheckoutSession(false);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns error when already Pro", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);
    mockGetUserEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });

    const result = await createCheckoutSession(false);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Already subscribed to Pro");
  });

  it("returns success with upgrade URL for free user", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);
    mockGetUserEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });

    const result = await createCheckoutSession(false);

    expect(result.success).toBe(true);
    expect(result.url).toBe("/api/auth/subscription/upgrade");
  });

  it("returns error when entitlements throw", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);
    mockGetUserEntitlements.mockRejectedValue(new Error("DB error"));

    const result = await createCheckoutSession(false);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to create checkout session");
  });

  it("returns error when session fetch throws", async () => {
    mockGetSession.mockRejectedValue(new Error("Network error"));

    const result = await createCheckoutSession(false);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to create checkout session");
  });
});

describe("openBillingPortal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await openBillingPortal();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("returns success with portal URL", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);

    const result = await openBillingPortal();

    expect(result.success).toBe(true);
    expect(result.url).toBe("/api/auth/subscription/billing-portal");
  });

  it("returns error when session fetch throws", async () => {
    mockGetSession.mockRejectedValue(new Error("Network error"));

    const result = await openBillingPortal();

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to open billing portal");
  });
});

describe("getBillingStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await getBillingStatus();

    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("returns billing status for free user", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" },
    } as never);
    mockGetUserEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });

    const result = await getBillingStatus();

    expect(result).toEqual({
      userId: "user-1",
      email: "test@example.com",
      isPro: false,
      entitlements: {
        isPro: false,
        maxItems: 50,
        maxCollections: 3,
        maxFileUploads: false,
        aiAccess: false,
        customItemTypes: false,
        exportEnabled: false,
      },
    });
  });

  it("returns billing status for Pro user", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", email: "pro@example.com" },
    } as never);
    mockGetUserEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });

    const result = await getBillingStatus();

    expect(result).toEqual({
      userId: "user-1",
      email: "pro@example.com",
      isPro: true,
      entitlements: {
        isPro: true,
        maxItems: Infinity,
        maxCollections: Infinity,
        maxFileUploads: true,
        aiAccess: true,
        customItemTypes: true,
        exportEnabled: true,
      },
    });
  });

  it("returns error when session fetch throws", async () => {
    mockGetSession.mockRejectedValue(new Error("Network error"));

    const result = await getBillingStatus();

    expect(result).toEqual({ error: "Failed to get billing status" });
  });
});
