import { prisma } from "@/lib/prisma";

export interface CreateCollectionData {
  name: string;
  description?: string | null;
}

export interface CreatedCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createCollection(
  userId: string,
  data: CreateCollectionData
): Promise<CreatedCollection | null> {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      userId,
    },
  });

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
}

type ItemTypeRef = { id: string; name: string; icon: string; color: string };
type TypeCount = { name: string; icon: string; color: string; count: number };

function countTypesByItem(items: { itemType: ItemTypeRef }[]) {
  const typeCount = new Map<string, TypeCount>();
  for (const item of items) {
    const t = item.itemType;
    const existing = typeCount.get(t.id);
    if (existing) {
      existing.count++;
    } else {
      typeCount.set(t.id, { name: t.name, icon: t.icon, color: t.color, count: 1 });
    }
  }
  return typeCount;
}

function findMostUsedType(typeCount: Map<string, TypeCount>) {
  let mostUsedType: { name: string; icon: string; color: string } | null = null;
  let maxCount = 0;
  for (const t of typeCount.values()) {
    if (t.count > maxCount) {
      maxCount = t.count;
      mostUsedType = { name: t.name, icon: t.icon, color: t.color };
    }
  }
  return mostUsedType;
}

export interface CollectionWithStats {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  resourceCount: number;
  mostUsedType: {
    name: string;
    icon: string;
    color: string;
  } | null;
  typeIcons: { icon: string; color: string }[];
}

export async function getCollectionsWithStats(
  userId: string
): Promise<CollectionWithStats[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          item: {
            include: {
              itemType: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return collections.map((collection) => {
    const items = collection.items.map((ic) => ic.item);
    const typeCount = countTypesByItem(items);

    const seen = new Set<string>();
    const typeIcons: { icon: string; color: string }[] = [];
    for (const t of typeCount.values()) {
      if (!seen.has(t.icon)) {
        seen.add(t.icon);
        typeIcons.push({ icon: t.icon, color: t.color });
      }
    }

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      resourceCount: items.length,
      mostUsedType: findMostUsedType(typeCount),
      typeIcons,
    };
  });
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  mostUsedType: {
    name: string;
    icon: string;
    color: string;
  } | null;
}

export async function getSidebarCollections(userId: string): Promise<SidebarCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          item: {
            include: {
              itemType: true,
            },
          },
        },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return collections.map((collection) => {
    const items = collection.items.map((ic) => ic.item);
    const typeCount = items.length > 0 ? countTypesByItem(items) : null;

    return {
      id: collection.id,
      name: collection.name,
      isFavorite: collection.isFavorite,
      mostUsedType: typeCount ? findMostUsedType(typeCount) : null,
    };
  });
}

// ─── Item-Collection Association Functions ────────────────────────────────

export interface CollectionSelectItem {
  id: string;
  name: string;
}

export async function getUserCollections(userId: string): Promise<CollectionSelectItem[]> {
  return prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function setItemCollections(
  itemId: string,
  userId: string,
  collectionIds: string[]
): Promise<boolean> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) return false;

  await prisma.itemCollection.deleteMany({
    where: { itemId },
  });

  if (collectionIds.length > 0) {
    await prisma.itemCollection.createMany({
      data: collectionIds.map((collectionId) => ({
        itemId,
        collectionId,
      })),
    });
  }

  return true;
}

export async function addItemToCollections(
  itemId: string,
  userId: string,
  collectionIds: string[]
): Promise<boolean> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) return false;

  if (collectionIds.length === 0) return true;

  const existing = await prisma.itemCollection.findMany({
    where: {
      itemId,
      collectionId: { in: collectionIds },
    },
    select: { collectionId: true },
  });

  const existingSet = new Set(existing.map((e) => e.collectionId));
  const newIds = collectionIds.filter((id) => !existingSet.has(id));

  if (newIds.length > 0) {
    await prisma.itemCollection.createMany({
      data: newIds.map((collectionId) => ({
        itemId,
        collectionId,
      })),
    });
  }

  return true;
}

export async function removeItemFromCollections(
  itemId: string,
  userId: string,
  collectionIds: string[]
): Promise<boolean> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) return false;

  if (collectionIds.length === 0) return true;

  await prisma.itemCollection.deleteMany({
    where: {
      itemId,
      collectionId: { in: collectionIds },
    },
  });

  return true;
}

export async function getItemCollectionIds(
  itemId: string,
  userId: string
): Promise<string[] | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) return null;

  const relations = await prisma.itemCollection.findMany({
    where: { itemId },
    select: { collectionId: true },
  });

  return relations.map((r) => r.collectionId);
}
