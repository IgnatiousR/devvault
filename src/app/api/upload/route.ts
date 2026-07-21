import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { requireAuth } from "@/lib/api-utils"
import { filebaseClient, FILEBASE_BUCKET, getFilebaseKey, validateFileUpload } from "@/lib/filebase"
import { requireProForFeature } from "@/lib/usage-limits"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      await requireProForFeature(user.id, "fileUpload")
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Pro subscription required" },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string | null

    const validation = validateFileUpload(file, type)
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const key = getFilebaseKey(user.id, file!.name)
    const buffer = Buffer.from(await file!.arrayBuffer())

    await filebaseClient.send(
      new PutObjectCommand({
        Bucket: FILEBASE_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file!.type,
      })
    )

    const fileUrl = `https://${FILEBASE_BUCKET}.s3.filebase.io/${key}`

    return NextResponse.json({
      fileUrl,
      fileName: file!.name,
      fileSize: file!.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
