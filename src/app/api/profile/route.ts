import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-utils"
import { getUserProfile, getUserStats } from "@/lib/db/profile"

export async function GET() {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [profile, stats] = await Promise.all([
      getUserProfile(user.id),
      getUserStats(user.id),
    ])

    return NextResponse.json({ user: profile, stats })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}