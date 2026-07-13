"use client"

import { useCallback, useState, useRef } from "react"
import { FilePreview } from "./file-preview"
import { FileDropZone } from "./file-drop-zone"

interface FileUploadProps {
  type: "image" | "file"
  onUpload: (data: { fileUrl: string; fileName: string; fileSize: number }) => void
  onClear: () => void
  currentFile: { fileUrl: string; fileName: string; fileSize: number } | null
  disabled?: boolean
}

const ACCEPTED_IMAGE_TYPES = ".png,.jpg,.jpeg,.gif,.webp,.svg"
const ACCEPTED_FILE_TYPES = ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini"
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function FileUpload({
  type,
  onUpload,
  onClear,
  currentFile,
  disabled,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE
  const accept = type === "image" ? ACCEPTED_IMAGE_TYPES : ACCEPTED_FILE_TYPES

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null)

      if (file.size > maxSize) {
        setError(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`)
        return
      }

      setIsUploading(true)
      setProgress(0)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)

        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90))
        }, 200)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Upload failed")
        }

        const data = await response.json()
        setProgress(100)
        onUpload(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setIsUploading(false)
        setProgress(0)
      }
    },
    [type, maxSize, onUpload]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        uploadFile(file)
      }
      e.target.value = ""
    },
    [uploadFile]
  )

  if (currentFile) {
    return (
      <FilePreview
        type={type}
        currentFile={currentFile}
        onClear={onClear}
        disabled={disabled}
      />
    )
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      <FileDropZone
        type={type}
        isUploading={isUploading}
        progress={progress}
        error={error}
        maxSize={maxSize}
        disabled={disabled}
        onFileDrop={uploadFile}
        onClick={() => inputRef.current?.click()}
      />
    </div>
  )
}
