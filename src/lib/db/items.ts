import { prisma } from "@/lib/prisma";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { filebaseClient, FILEBASE_BUCKET } from "@/lib/filebase";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export interface UpdateItemData {
  title: string;
  description?: string | null;
  content?: string | null;
  language?: string | null;
  url?: string | null;
  tags: string[];
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  language: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isPinned: boolean;
  isFavorite: boolean;
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
  tags: string[];
  collections: { id: string; name: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
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
    content: item.content,
    url: item.url,
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
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
    content: item.content,
    url: item.url,
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
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

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
}

export async function getItemsByType(
  userId: string,
  typeName: string,
  options?: { page?: number; limit?: number }
): Promise<PaginatedResult<DashboardItem>> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? ITEMS_PER_PAGE;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    itemType: { name: { equals: typeName, mode: "insensitive" as const } },
  };

  const [rawItems, totalCount] = await Promise.all([
    prisma.item.findMany({
      where,
      include: {
        itemType: true,
        tags: true,
        collections: {
          include: { collection: true },
          take: 1,
        },
      },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.item.count({ where }),
  ]);

  const items = rawItems.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
  }));

  return { items, totalCount };
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

export async function getItemById(itemId: string, userId: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: { collection: true },
      },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    language: item.language,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    itemType: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.name),
    collections: item.collections.map((ic) => ({
      id: ic.collection.id,
      name: ic.collection.name,
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function updateItem(
  itemId: string,
  userId: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) return null;

  // Disconnect all existing tags and connect-or-create new ones
  const tagOperations = data.tags.map((tagName) =>
    prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    })
  );

  const tags = await Promise.all(tagOperations);
  const tagIds = tags.map((tag) => tag.id);

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      language: data.language ?? null,
      url: data.url ?? null,
      tags: {
        set: tagIds.map((id) => ({ id })),
      },
    },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: { collection: true },
      },
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    description: updated.description,
    content: updated.content,
    language: updated.language,
    url: updated.url,
    fileUrl: updated.fileUrl,
    fileName: updated.fileName,
    fileSize: updated.fileSize,
    isPinned: updated.isPinned,
    isFavorite: updated.isFavorite,
    itemType: {
      name: updated.itemType.name,
      icon: updated.itemType.icon,
      color: updated.itemType.color,
    },
    tags: updated.tags.map((t) => t.name),
    collections: updated.collections.map((ic) => ({
      id: ic.collection.id,
      name: ic.collection.name,
    })),
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

export async function deleteItem(
  itemId: string,
  userId: string
): Promise<boolean> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) return false;

  // Delete file from Filebase if attached
  if (item.fileUrl) {
    try {
      const urlParts = new URL(item.fileUrl);
      const key = urlParts.pathname.slice(1);
      await filebaseClient.send(
        new DeleteObjectCommand({
          Bucket: FILEBASE_BUCKET,
          Key: key,
        })
      );
    } catch (error) {
      console.error("Failed to delete file from Filebase:", error);
      // Continue with DB delete even if file deletion fails
    }
  }

  await prisma.item.delete({ where: { id: itemId } });
  return true;
}

export interface CreateItemData {
  title: string;
  description?: string | null;
  content?: string | null;
  language?: string | null;
  url?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  tags: string[];
  itemTypeId: string;
  collectionIds?: string[];
}

export interface SearchItem {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
  collectionName: string | null;
}

export async function getAllSearchItems(userId: string): Promise<SearchItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    include: {
      itemType: true,
      collections: {
        include: { collection: true },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    itemType: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    collectionName: item.collections[0]?.collection.name ?? null,
  }));
}

export async function getFavoriteItems(userId: string): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isFavorite: true },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: { collection: true },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
  }));
}

export async function toggleItemFavorite(
  itemId: string,
  userId: string
): Promise<boolean | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) return null;

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: { isFavorite: !item.isFavorite },
  });

  return updated.isFavorite;
}

export async function toggleItemPin(
  itemId: string,
  userId: string
): Promise<boolean | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) return null;

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: { isPinned: !item.isPinned },
  });

  return updated.isPinned;
}

export async function createItem(
  userId: string,
  data: CreateItemData
): Promise<ItemDetail | null> {
  const itemType = await prisma.itemType.findFirst({
    where: { id: data.itemTypeId },
  });

  if (!itemType) return null;

  const tagOperations = data.tags.map((tagName) =>
    prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    })
  );

  const tags = await Promise.all(tagOperations);
  const tagIds = tags.map((tag) => tag.id);

  const collectionIds = data.collectionIds ?? [];

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      language: data.language ?? null,
      url: data.url ?? null,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      userId,
      itemTypeId: data.itemTypeId,
      tags: {
        connect: tagIds.map((id) => ({ id })),
      },
      collections: {
        create: collectionIds.map((collectionId) => ({
          collectionId,
        })),
      },
    },
    include: {
      itemType: true,
      tags: true,
      collections: {
        include: { collection: true },
      },
    },
  });

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    language: item.language,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    itemType: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    tags: item.tags.map((t) => t.name),
    collections: item.collections.map((ic) => ({
      id: ic.collection.id,
      name: ic.collection.name,
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
