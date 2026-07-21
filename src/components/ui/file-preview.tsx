"use client"

import { X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "@/lib/format-file-size"

interface FilePreviewProps {
  type: "image" | "file"
  currentFile: { fileUrl: string; fileName: string; fileSize: number }
  onClear: () => void
  disabled?: boolean
}

export function FilePreview({
  type,
  currentFile,
  onClear,
  disabled,
}: FilePreviewProps) {
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
