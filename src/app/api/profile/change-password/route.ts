import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { changePasswordSchema } from "@/lib/schemas"
import { rateLimit, getIpFromHeaders } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const ip = getIpFromHeaders(await headers())
    const rl = await rateLimit(ip, 5, "15 m")
    if (!rl.success) {
      const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      )
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
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