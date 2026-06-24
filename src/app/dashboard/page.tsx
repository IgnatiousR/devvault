import { MainContent } from "@/components/main/MainContent";
import { getCollectionsWithStats } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getItemCounts } from "@/lib/db/items";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevVault | Dashboard",
};

export default async function DashboardPage() {
  const user = await prisma.user.findFirst({
    where: { email: "demo@devvault.io" },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No user found. Please run seed script.</p>
      </div>
    );
  }

  const [collections, pinnedItems, recentItems, itemCounts] = await Promise.all([
    getCollectionsWithStats(user.id),
    getPinnedItems(user.id),
    getRecentItems(user.id, 10),
    getItemCounts(user.id),
  ]);

  const favoriteCollections = collections.filter((c) => c.isFavorite).length;

  return (
    <MainContent
      collections={collections}
      pinnedItems={pinnedItems}
      recentItems={recentItems}
      totalItems={itemCounts.totalItems}
      totalCollections={collections.length}
      favoriteItems={itemCounts.favoriteItems}
      favoriteCollections={favoriteCollections}
    />
  );
}
