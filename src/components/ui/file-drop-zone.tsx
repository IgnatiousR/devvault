"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/format-file-size"

interface FileDropZoneProps {
  type: "image" | "file"
  isUploading: boolean
  progress: number
  error: string | null
  maxSize: number
  disabled?: boolean
  onFileDrop: (file: File) => void
  onClick: () => void
}

export function FileDropZone({
  type,
  isUploading,
  progress,
  error,
  maxSize,
  disabled,
  onFileDrop,
  onClick,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        onFileDrop(file)
      }
    },
    [onFileDrop]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={onClick}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-(--color-brand `bg-(--color-brand)/5"
            : "`border-(--border) `hover:border-(--text-muted",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {isUploading ? (
          <div className="w-full">
            <div className="mb-2 flex items-center justify-center gap-2">
              {type === "image" ? (
                <ImageIcon className="h-5 w-5 `text-(--text-muted)" />
              ) : (
                <FileText className="h-5 w-5 `text-(--text-muted)" />
              )}
              <span className="text-sm text-(--text-muted">Uploading...</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full `bg-(--bg-secondary)">
              <div
                className="h-full bg-(--color-brand) transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 `text-(--text-muted)" />
            <p className="mb-1 text-sm `text-(--text)">
              Drop a {type} here or click to browse
            </p>
            <p className="text-xs `text-(--text-muted)">
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
