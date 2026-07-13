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

export interface SearchCollection {
  id: string;
  name: string;
  itemCount: number;
}

export async function getAllSearchCollections(userId: string): Promise<SearchCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    itemCount: collection._count.items,
  }));
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

export async function getCollectionById(
  collectionId: string,
  userId: string
): Promise<CollectionWithStats | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
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
  });

  if (!collection) return null;

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
}

export async function getItemsByCollectionId(
  collectionId: string,
  userId: string
) {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!collection) return null;

  const relations = await prisma.itemCollection.findMany({
    where: { collectionId },
    include: {
      item: {
        include: {
          itemType: true,
          tags: true,
          collections: {
            include: { collection: true },
            take: 1,
          },
        },
      },
    },
  });

  return relations.map((rel) => ({
    id: rel.item.id,
    title: rel.item.title,
    description: rel.item.description,
    content: rel.item.content,
    url: rel.item.url,
    isPinned: rel.item.isPinned,
    isFavorite: rel.item.isFavorite,
    itemType: {
      name: rel.item.itemType.name,
      icon: rel.item.itemType.icon,
      color: rel.item.itemType.color,
    },
    tags: rel.item.tags.map((t) => t.name),
    updatedAt: rel.item.updatedAt,
    collectionName: rel.item.collections[0]?.collection.name ?? null,
    fileUrl: rel.item.fileUrl,
    fileName: rel.item.fileName,
    fileSize: rel.item.fileSize,
  }));
}

export async function updateCollection(
  collectionId: string,
  userId: string,
  data: { name?: string; description?: string | null }
): Promise<{ id: string; name: string; description: string | null } | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!collection) return null;

  const updated = await prisma.collection.update({
    where: { id: collectionId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
  };
}

export async function deleteCollection(
  collectionId: string,
  userId: string
): Promise<boolean> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!collection) return false;

  await prisma.collection.delete({
    where: { id: collectionId },
  });

  return true;
}

export async function toggleCollectionFavorite(
  collectionId: string,
  userId: string
): Promise<boolean | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!collection) return null;

  const updated = await prisma.collection.update({
    where: { id: collectionId },
    data: { isFavorite: !collection.isFavorite },
  });

  return updated.isFavorite;
}
