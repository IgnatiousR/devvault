import { S3Client } from "@aws-sdk/client-s3"

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

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
