import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      count: vi.fn(),
    },
    collection: {
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../entitlements", () => ({
  getUserEntitlements: vi.fn(),
}));

import {
  getUsageStatus,
  canCreateItem,
  canCreateCollection,
  assertWithinItemLimit,
  assertWithinCollectionLimit,
  requireProForFeature,
} from "../usage-limits";
import { prisma } from "@/lib/prisma";
import { getUserEntitlements } from "../entitlements";

const mockItemCount = vi.mocked(prisma.item.count);
const mockCollectionCount = vi.mocked(prisma.collection.count);
const mockGetEntitlements = vi.mocked(getUserEntitlements);

describe("getUsageStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct usage for free tier user", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(25);
    mockCollectionCount.mockResolvedValue(2);

    const status = await getUsageStatus("user-1");

    expect(status.items.current).toBe(25);
    expect(status.items.limit).toBe(50);
    expect(status.items.percentage).toBe(50);
    expect(status.collections.current).toBe(2);
    expect(status.collections.limit).toBe(3);
    expect(status.collections.percentage).toBeCloseTo(66.67, 1);
  });

  it("returns zero percentage for pro tier user", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });
    mockItemCount.mockResolvedValue(100);
    mockCollectionCount.mockResolvedValue(20);

    const status = await getUsageStatus("user-1");

    expect(status.items.current).toBe(100);
    expect(status.items.limit).toBe(Infinity);
    expect(status.items.percentage).toBe(0);
    expect(status.collections.current).toBe(20);
    expect(status.collections.limit).toBe(Infinity);
    expect(status.collections.percentage).toBe(0);
  });
});

describe("canCreateItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for pro user regardless of count", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });

    expect(await canCreateItem("user-1")).toBe(true);
  });

  it("returns true when under limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(49);

    expect(await canCreateItem("user-1")).toBe(true);
  });

  it("returns false when at limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(50);

    expect(await canCreateItem("user-1")).toBe(false);
  });

  it("returns false when over limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(51);

    expect(await canCreateItem("user-1")).toBe(false);
  });
});

describe("canCreateCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for pro user regardless of count", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });

    expect(await canCreateCollection("user-1")).toBe(true);
  });

  it("returns true when under limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockCollectionCount.mockResolvedValue(2);

    expect(await canCreateCollection("user-1")).toBe(true);
  });

  it("returns false when at limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockCollectionCount.mockResolvedValue(3);

    expect(await canCreateCollection("user-1")).toBe(false);
  });
});

describe("assertWithinItemLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw when under limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(49);

    await expect(assertWithinItemLimit("user-1")).resolves.not.toThrow();
  });

  it("throws when at limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockItemCount.mockResolvedValue(50);

    await expect(assertWithinItemLimit("user-1")).rejects.toThrow("Free tier item limit reached");
  });

  it("does not throw for pro user", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });

    await expect(assertWithinItemLimit("user-1")).resolves.not.toThrow();
  });
});

describe("assertWithinCollectionLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw when under limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockCollectionCount.mockResolvedValue(2);

    await expect(assertWithinCollectionLimit("user-1")).resolves.not.toThrow();
  });

  it("throws when at limit", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });
    mockCollectionCount.mockResolvedValue(3);

    await expect(assertWithinCollectionLimit("user-1")).rejects.toThrow("Free tier collection limit reached");
  });
});

describe("requireProForFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw for pro user", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: true,
      maxItems: Infinity,
      maxCollections: Infinity,
      maxFileUploads: true,
      aiAccess: true,
      customItemTypes: true,
      exportEnabled: true,
    });

    await expect(requireProForFeature("user-1", "fileUpload")).resolves.not.toThrow();
    await expect(requireProForFeature("user-1", "ai")).resolves.not.toThrow();
    await expect(requireProForFeature("user-1", "customItemTypes")).resolves.not.toThrow();
    await expect(requireProForFeature("user-1", "export")).resolves.not.toThrow();
  });

  it("throws for free tier user on pro features", async () => {
    mockGetEntitlements.mockResolvedValue({
      isPro: false,
      maxItems: 50,
      maxCollections: 3,
      maxFileUploads: false,
      aiAccess: false,
      customItemTypes: false,
      exportEnabled: false,
    });

    await expect(requireProForFeature("user-1", "fileUpload")).rejects.toThrow("Pro subscription required for fileUpload");
    await expect(requireProForFeature("user-1", "ai")).rejects.toThrow("Pro subscription required for ai");
    await expect(requireProForFeature("user-1", "customItemTypes")).rejects.toThrow("Pro subscription required for customItemTypes");
    await expect(requireProForFeature("user-1", "export")).rejects.toThrow("Pro subscription required for export");
  });
});
