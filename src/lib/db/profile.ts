import { prisma } from "@/lib/prisma"
import { ItemTypeCount } from "@/types/profile"

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      isPro: true,
      accounts: {
        select: {
          providerId: true,
        },
      },
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    isPro: user.isPro,
    hasPassword: user.accounts.some((acc) => acc.providerId === "credential"),
  }
}

export async function getUserStats(userId: string) {
  const [totalItems, totalCollections, itemTypeBreakdown] = await Promise.all([
    prisma.item.count({
      where: { userId },
    }),
    prisma.collection.count({
      where: { userId },
    }),
    prisma.item.groupBy({
      by: ["itemTypeId"],
      where: { userId },
      _count: {
        id: true,
      },
    }),
  ])

  const itemTypeIds = itemTypeBreakdown.map((item) => item.itemTypeId)

  const itemTypes = await prisma.itemType.findMany({
    where: {
      id: { in: itemTypeIds },
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },
  })

  const itemTypeMap = new Map(itemTypes.map((type) => [type.id, type]))

  const breakdown: ItemTypeCount[] = itemTypeBreakdown.map((item) => {
    const type = itemTypeMap.get(item.itemTypeId)
    return {
      id: item.itemTypeId,
      name: type?.name || "Unknown",
      icon: type?.icon || "help",
      color: type?.color || "#6b7280",
      count: item._count.id,
    }
  })

  return {
    totalItems,
    totalCollections,
    itemTypeBreakdown: breakdown,
  }
}