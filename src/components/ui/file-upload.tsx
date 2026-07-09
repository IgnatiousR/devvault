"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, X, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileUpload({
  type,
  onUpload,
  onClear,
  currentFile,
  disabled,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
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
        setError(`File too large. Max size: ${formatFileSize(maxSize)}`)
        return
      }

      setIsUploading(true)
      setProgress(0)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)

        // Simulate progress (XHR not easily available with fetch)
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        uploadFile(file)
      }
    },
    [uploadFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        uploadFile(file)
      }
      // Reset input so same file can be selected again
      e.target.value = ""
    },
    [uploadFile]
  )

  if (currentFile) {
    return (
      <div className="rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
        <div className="flex items-center gap-3">
          {type === "image" ? (
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-[var(--border)]">
              <img
                src={currentFile.fileUrl}
                alt={currentFile.fileName}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-primary)]">
              <FileText className="h-8 w-8 text-[var(--text-muted)]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text)]">
              {currentFile.fileName}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {formatFileSize(currentFile.fileSize)}
            </p>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text)]"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
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
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5"
            : "border-[var(--border)] hover:border-[var(--text-muted)]",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {isUploading ? (
          <div className="w-full">
            <div className="mb-2 flex items-center justify-center gap-2">
              {type === "image" ? (
                <ImageIcon className="h-5 w-5 text-[var(--text-muted)]" />
              ) : (
                <FileText className="h-5 w-5 text-[var(--text-muted)]" />
              )}
              <span className="text-sm text-[var(--text-muted)]">Uploading...</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
              <div
                className="h-full bg-[var(--color-brand)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-[var(--text-muted)]" />
            <p className="mb-1 text-sm text-[var(--text)]">
              Drop a {type} here or click to browse
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Max size: {formatFileSize(maxSize)}
            </p>
          </>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
