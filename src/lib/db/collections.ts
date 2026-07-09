import { prisma } from "@/lib/prisma";

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
