import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MainContent } from "@/components/main/main-content";
import {
  DASHBOARD_COLLECTIONS_LIMIT,
  DASHBOARD_RECENT_ITEMS_LIMIT,
} from "@/lib/constants";
import {
  getPinnedItems,
  getRecentItems,
  getItemCounts,
  getItemsByTypeCount,
} from "@/lib/db/items";
import { getCollectionsWithStats } from "@/lib/db/collections";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevVault | Dashboard",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  const [collectionsResult, pinnedItems, recentItems, itemCounts, itemTypesByCount] =
    await Promise.all([
      getCollectionsWithStats(user.id, { limit: DASHBOARD_COLLECTIONS_LIMIT }),
      getPinnedItems(user.id),
      getRecentItems(user.id, DASHBOARD_RECENT_ITEMS_LIMIT),
      getItemCounts(user.id),
      getItemsByTypeCount(user.id),
    ]);

  const collections = collectionsResult.collections;
  const favoriteCollections = collections.filter((c) => c.isFavorite).length;

  const dashboardData = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isPro: user.isPro,
    },
    collections,
    pinnedItems: pinnedItems.map((item) => ({
      ...item,
      updatedAt: item.updatedAt.toISOString(),
    })),
    recentItems: recentItems.map((item) => ({
      ...item,
      updatedAt: item.updatedAt.toISOString(),
    })),
    itemCounts,
    itemTypesByCount,
    favoriteCollections,
    totalCollections: collections.length,
  };

  return <MainContent initialData={dashboardData} />;
}
