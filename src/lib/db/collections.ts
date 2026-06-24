import { prisma } from "@/lib/prisma";

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

    const typeCount = new Map<string, { name: string; icon: string; color: string; count: number }>();
    for (const item of items) {
      const t = item.itemType;
      const existing = typeCount.get(t.id);
      if (existing) {
        existing.count++;
      } else {
        typeCount.set(t.id, { name: t.name, icon: t.icon, color: t.color, count: 1 });
      }
    }

    let mostUsedType: CollectionWithStats["mostUsedType"] = null;
    let maxCount = 0;
    for (const t of typeCount.values()) {
      if (t.count > maxCount) {
        maxCount = t.count;
        mostUsedType = { name: t.name, icon: t.icon, color: t.color };
      }
    }

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
      mostUsedType,
      typeIcons,
    };
  });
}
