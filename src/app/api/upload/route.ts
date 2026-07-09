import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@/lib/auth"
import { filebaseClient, FILEBASE_BUCKET, getFilebaseKey } from "@/lib/filebase"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
]

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string | null // "image" or "file"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!type || !["image", "file"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = type === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}` },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    const key = getFilebaseKey(session.user.id, file.name)
    const buffer = Buffer.from(await file.arrayBuffer())

    await filebaseClient.send(
      new PutObjectCommand({
        Bucket: FILEBASE_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    )

    const fileUrl = `https://${FILEBASE_BUCKET}.s3.filebase.io/${key}`

    return NextResponse.json({
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
