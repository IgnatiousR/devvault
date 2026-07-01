import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { changePasswordSchema } from "@/lib/schemas"

export async function POST(request: Request) {
  try {
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