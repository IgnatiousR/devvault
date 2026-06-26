import { prisma } from "@/lib/prisma";

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
  tags: string[];
  updatedAt: Date;
  collectionName: string | null;
}

export async function getPinnedItems(userId: string): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      isPinned: true,
    },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: {
          collection: true,
        },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    itemType: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.name),
    updatedAt: item.updatedAt,
    collectionName: item.collections[0]?.collection.name ?? null,
  }));
}

export async function getRecentItems(
  userId: string,
  limit: number = 10
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: {
          collection: true,
        },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    itemType: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.name),
    updatedAt: item.updatedAt,
    collectionName: item.collections[0]?.collection.name ?? null,
  }));
}

export async function getItemCounts(userId: string) {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, favoriteItems };
}

export interface ItemTypeCount {
  name: string;
  icon: string;
  color: string;
  count: number;
}

const ITEM_TYPE_ORDER = ['snippet', 'prompt', 'command', 'note', 'file', 'image', 'link'];

export async function getItemsByTypeCount(userId: string): Promise<ItemTypeCount[]> {
  const [itemTypes, counts] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
    }),
    prisma.item.groupBy({
      by: ['itemTypeId'],
      where: { userId },
      _count: true,
    }),
  ]);

  const countMap = new Map(counts.map(c => [c.itemTypeId, c._count]));

  return itemTypes.map(itemType => ({
    name: itemType.name,
    icon: itemType.icon,
    color: itemType.color,
    count: countMap.get(itemType.id) || 0,
  })).sort((a, b) => {
    const aIndex = ITEM_TYPE_ORDER.indexOf(a.name.toLowerCase());
    const bIndex = ITEM_TYPE_ORDER.indexOf(b.name.toLowerCase());
    return aIndex - bIndex;
  });
}
