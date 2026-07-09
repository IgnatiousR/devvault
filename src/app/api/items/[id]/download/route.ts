import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@/lib/auth"
import { filebaseClient, FILEBASE_BUCKET } from "@/lib/filebase"
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

    // Extract key from URL: https://bucket.s3.filebase.io/uploads/userId/timestamp-filename
    const urlParts = new URL(item.fileUrl)
    const key = urlParts.pathname.slice(1) // Remove leading /

    const command = new GetObjectCommand({
      Bucket: FILEBASE_BUCKET,
      Key: key,
    })

    const response = await filebaseClient.send(command)

    if (!response.Body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const chunks: Uint8Array[] = []
    const reader = response.Body.transformToWebStream().getReader()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    const fileBuffer = Buffer.concat(chunks)

    const contentDisposition = inline
      ? `inline; filename="${item.fileName || "file"}"`
      : `attachment; filename="${item.fileName || "download"}"`

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Disposition": contentDisposition,
        "Content-Length": fileBuffer.length.toString(),
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
