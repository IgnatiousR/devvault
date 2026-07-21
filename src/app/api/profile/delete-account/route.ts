import { NextResponse } from "next/server"
import { requireAuth, checkRateLimit } from "@/lib/api-utils"
import { prisma } from "@/lib/prisma"

export async function DELETE() {
  try {
    const rl = await checkRateLimit(3, "1 h")
    if (rl) return rl

    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    // Delete user data in the correct order (due to foreign key constraints)
    await prisma.$transaction([
      // Delete item-collection relations
      prisma.itemCollection.deleteMany({
        where: { item: { userId } },
      }),
      
      // Delete items
      prisma.item.deleteMany({
        where: { userId },
      }),
      
      // Delete collections
      prisma.collection.deleteMany({
        where: { userId },
      }),
      
      // Delete tags that are not used by any items
      prisma.tag.deleteMany({
        where: {
          items: {
            none: {},
          },
        },
      }),
      
      // Delete sessions
      prisma.session.deleteMany({
        where: { userId },
      }),
      
      // Delete accounts
      prisma.account.deleteMany({
        where: { userId },
      }),
      
      // Delete user
      prisma.user.delete({
        where: { id: userId },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}