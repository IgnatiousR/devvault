import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { streamS3File, extractS3Key } from "@/lib/filebase"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const inline = request.nextUrl.searchParams.get("inline") === "true"

    const item = await prisma.item.findUnique({
      where: { id },
      select: { fileUrl: true, fileName: true, userId: true },
    })

    if (!item || item.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (!item.fileUrl) {
      return NextResponse.json({ error: "No file attached" }, { status: 400 })
    }

    const key = extractS3Key(item.fileUrl)
    const { data: fileData, contentType } = await streamS3File(key)

    const contentDisposition = inline
      ? `inline; filename="${item.fileName || "file"}"`
      : `attachment; filename="${item.fileName || "download"}"`

    return new NextResponse(fileData as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Content-Disposition": contentDisposition,
        "Content-Length": fileData.length.toString(),
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    )
  }
}
