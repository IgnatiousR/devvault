import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-utils";
import {
  getPinnedItems,
  getRecentItems,
  getItemCounts,
  getItemsByTypeCount,
} from "@/lib/db/items";
import { getCollectionsWithStats } from "@/lib/db/collections";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "No user found" }, { status: 404 });
    }

    const [collectionsResult, pinnedItems, recentItems, itemCounts, itemTypesByCount] =
      await Promise.all([
        getCollectionsWithStats(user.id, { limit: 6 }),
        getPinnedItems(user.id),
        getRecentItems(user.id, 10),
        getItemCounts(user.id),
        getItemsByTypeCount(user.id),
      ]);

    const collections = collectionsResult.collections;
    const favoriteCollections = collections.filter((c) => c.isFavorite).length;

    return NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        isPro: dbUser.isPro,
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
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
