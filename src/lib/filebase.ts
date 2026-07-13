import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

export const filebaseClient = new S3Client({
  endpoint: process.env.FILEBASE_ENDPOINT || "https://s3.filebase.io",
  region: "auto",
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY!,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY!,
  },
})

export const FILEBASE_BUCKET = process.env.FILEBASE_BUCKET!

export function getFilebaseKey(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
  return `uploads/${userId}/${timestamp}-${sanitized}`
}

export async function streamS3File(key: string): Promise<{ data: Uint8Array; contentType: string | undefined }> {
  const command = new GetObjectCommand({
    Bucket: FILEBASE_BUCKET,
    Key: key,
  })

  const response = await filebaseClient.send(command)

  if (!response.Body) {
    throw new Error("File not found")
  }

  const chunks: Uint8Array[] = []
  const reader = response.Body.transformToWebStream().getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const data = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    data.set(chunk, offset)
    offset += chunk.length
  }

  return {
    data,
    contentType: response.ContentType,
  }
}

export function extractS3Key(fileUrl: string): string {
  const urlParts = new URL(fileUrl)
  return urlParts.pathname.slice(1)
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_FILE_SIZE = 10 * 1024 * 1024

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

export function validateFileUpload(
  file: File | null,
  type: string | null
): { error?: string } {
  if (!file) {
    return { error: "No file provided" }
  }

  if (!type || !["image", "file"].includes(type)) {
    return { error: "Invalid type" }
  }

  const allowedTypes = type === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES
  if (!allowedTypes.includes(file.type)) {
    return { error: `Invalid file type: ${file.type}` }
  }

  const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
  if (file.size > maxSize) {
    return { error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` }
  }
  return {}
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
