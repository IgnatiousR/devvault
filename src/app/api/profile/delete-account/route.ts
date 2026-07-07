import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, getIpFromHeaders } from "@/lib/rate-limit"

export async function DELETE() {
  try {
    const headerList = await headers()
    const ip = getIpFromHeaders(headerList)
    const rl = await rateLimit(ip, 3, "1 h")
    if (!rl.success) {
      const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      )
    }

    const session = await auth.api.getSession({
      headers: headerList,
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

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