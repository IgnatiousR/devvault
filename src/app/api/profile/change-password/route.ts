import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { requireAuth, checkRateLimit } from "@/lib/api-utils"
import { auth } from "@/lib/auth"
import { changePasswordSchema } from "@/lib/schemas"

export async function POST(request: Request) {
  try {
    const rl = await checkRateLimit(5, "15 m")
    if (rl) return rl

    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = changePasswordSchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = result.data

    // Use Better Auth to update password
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Failed to change password. Please check your current password." },
      { status: 500 }
    )
  }
}