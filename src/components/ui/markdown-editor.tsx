"use client"

import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { MarkdownEditorHeader } from "./markdown-editor-header"
import { MarkdownEditorContent } from "./markdown-editor-content"

interface MarkdownEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  headerControls?: ReactNode
  viewTabs?: ReactNode
  hideFloatingCopy?: boolean
  customContent?: ReactNode
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
  headerControls,
  viewTabs,
  hideFloatingCopy = false,
  customContent,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">(
    readOnly ? "preview" : "write"
  )
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setIsCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-[#1e1e1e]">
      <MarkdownEditorHeader
        readOnly={readOnly}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCopied={isCopied}
        onCopy={handleCopy}
        headerControls={headerControls}
      />
      {viewTabs}
      {hideFloatingCopy ? (
        <div className="max-h-[400px] overflow-y-auto code-editor-scrollbar">
          {customContent}
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto code-editor-scrollbar">
          <MarkdownEditorContent
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            activeTab={activeTab}
            placeholder={placeholder}
          />
        </div>
      )}
    </div>
  )
}
