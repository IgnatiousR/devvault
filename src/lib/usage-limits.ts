import { prisma } from "./prisma";
import { getUserEntitlements } from "./entitlements";

export interface UsageStatus {
  items: { current: number; limit: number; percentage: number };
  collections: { current: number; limit: number; percentage: number };
}

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const [entitlements, itemCount, collectionCount] = await Promise.all([
    getUserEntitlements(userId),
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
  ]);

  return {
    items: {
      current: itemCount,
      limit: entitlements.maxItems,
      percentage: entitlements.maxItems === Infinity ? 0 : (itemCount / entitlements.maxItems) * 100,
    },
    collections: {
      current: collectionCount,
      limit: entitlements.maxCollections,
      percentage: entitlements.maxCollections === Infinity ? 0 : (collectionCount / entitlements.maxCollections) * 100,
    },
  };
}

export async function canCreateItem(userId: string): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId);
  if (entitlements.isPro) return true;

  const count = await prisma.item.count({ where: { userId } });
  return count < entitlements.maxItems;
}

export async function canCreateCollection(userId: string): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId);
  if (entitlements.isPro) return true;

  const count = await prisma.collection.count({ where: { userId } });
  return count < entitlements.maxCollections;
}

export async function assertWithinItemLimit(userId: string): Promise<void> {
  const allowed = await canCreateItem(userId);
  if (!allowed) {
    throw new Error("Free tier item limit reached (50 items). Upgrade to Pro for unlimited items.");
  }
}

export async function assertWithinCollectionLimit(userId: string): Promise<void> {
  const allowed = await canCreateCollection(userId);
  if (!allowed) {
    throw new Error("Free tier collection limit reached (3 collections). Upgrade to Pro for unlimited collections.");
  }
}

export async function requireProForFeature(userId: string, feature: "fileUpload" | "ai" | "customItemTypes" | "export"): Promise<void> {
  const entitlements = await getUserEntitlements(userId);

  const featureMap: Record<string, keyof typeof entitlements> = {
    fileUpload: "maxFileUploads",
    ai: "aiAccess",
    customItemTypes: "customItemTypes",
    export: "exportEnabled",
  };

  const entitlementKey = featureMap[feature];
  if (entitlementKey && !entitlements[entitlementKey]) {
    throw new Error(`Pro subscription required for ${feature}`);
  }
}
