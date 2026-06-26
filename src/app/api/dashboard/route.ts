import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getPinnedItems,
  getRecentItems,
  getItemCounts,
  getItemsByTypeCount,
} from "@/lib/db/items";
import { getCollectionsWithStats } from "@/lib/db/collections";

export async function GET() {
  const user = await prisma.user.findFirst({
    where: { email: "demo@devvault.io" },
  });

  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 404 });
  }

  const [collections, pinnedItems, recentItems, itemCounts, itemTypesByCount] =
    await Promise.all([
      getCollectionsWithStats(user.id),
      getPinnedItems(user.id),
      getRecentItems(user.id, 10),
      getItemCounts(user.id),
      getItemsByTypeCount(user.id),
    ]);

  const favoriteCollections = collections.filter((c) => c.isFavorite).length;

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
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
}
