import { prisma } from "./prisma";

export interface Entitlements {
  isPro: boolean;
  maxItems: number;
  maxCollections: number;
  maxFileUploads: boolean;
  aiAccess: boolean;
  customItemTypes: boolean;
  exportEnabled: boolean;
}

const FREE_TIER: Entitlements = {
  isPro: false,
  maxItems: 50,
  maxCollections: 3,
  maxFileUploads: false,
  aiAccess: false,
  customItemTypes: false,
  exportEnabled: false,
};

const PRO_TIER: Entitlements = {
  isPro: true,
  maxItems: Infinity,
  maxCollections: Infinity,
  maxFileUploads: true,
  aiAccess: true,
  customItemTypes: true,
  exportEnabled: true,
};

export async function getUserEntitlements(userId: string): Promise<Entitlements> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.isPro ? PRO_TIER : FREE_TIER;
}

export async function requirePro(userId: string): Promise<void> {
  const entitlements = await getUserEntitlements(userId);
  if (!entitlements.isPro) {
    throw new Error("Pro subscription required");
  }
}

export async function isProUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  return user?.isPro ?? false;
}
