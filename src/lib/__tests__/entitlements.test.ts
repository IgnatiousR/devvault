import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { getUserEntitlements, requirePro, isProUser } from "../entitlements";
import { prisma } from "@/lib/prisma";

const mockFindUnique = vi.mocked(prisma.user.findUnique);

describe("getUserEntitlements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns free tier for non-pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: false,
    } as never);

    const entitlements = await getUserEntitlements("user-1");

    expect(entitlements.isPro).toBe(false);
    expect(entitlements.maxItems).toBe(50);
    expect(entitlements.maxCollections).toBe(3);
    expect(entitlements.maxFileUploads).toBe(false);
    expect(entitlements.aiAccess).toBe(false);
    expect(entitlements.customItemTypes).toBe(false);
    expect(entitlements.exportEnabled).toBe(false);
  });

  it("returns pro tier for pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: true,
    } as never);

    const entitlements = await getUserEntitlements("user-1");

    expect(entitlements.isPro).toBe(true);
    expect(entitlements.maxItems).toBe(Infinity);
    expect(entitlements.maxCollections).toBe(Infinity);
    expect(entitlements.maxFileUploads).toBe(true);
    expect(entitlements.aiAccess).toBe(true);
    expect(entitlements.customItemTypes).toBe(true);
    expect(entitlements.exportEnabled).toBe(true);
  });

  it("throws when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(getUserEntitlements("nonexistent")).rejects.toThrow("User not found");
  });
});

describe("requirePro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw for pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: true,
    } as never);

    await expect(requirePro("user-1")).resolves.not.toThrow();
  });

  it("throws for non-pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: false,
    } as never);

    await expect(requirePro("user-1")).rejects.toThrow("Pro subscription required");
  });
});

describe("isProUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: true,
    } as never);

    expect(await isProUser("user-1")).toBe(true);
  });

  it("returns false for non-pro user", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      isPro: false,
    } as never);

    expect(await isProUser("user-1")).toBe(false);
  });

  it("returns false when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    expect(await isProUser("nonexistent")).toBe(false);
  });
});
