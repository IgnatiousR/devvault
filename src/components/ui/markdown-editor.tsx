"use client"

import { useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import { toast } from "sonner"

interface MarkdownEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  placeholder?: string
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
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
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-border">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {readOnly ? (
            <span className="text-xs text-[#858585] font-mono">Preview</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  activeTab === "write"
                    ? "text-[#cccccc] bg-[#3c3c3c]"
                    : "text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c]"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  activeTab === "preview"
                    ? "text-[#cccccc] bg-[#3c3c3c]"
                    : "text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c]"
                }`}
              >
                Preview
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy button */}
          {!readOnly && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                {isCopied ? "check" : "content_copy"}
              </span>
              {isCopied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto code-editor-scrollbar">
        {readOnly ? (
          <div className="p-4 prose prose-invert prose-sm max-w-none">
            {value ? (
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{value}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">No content</p>
            )}
          </div>
        ) : activeTab === "write" ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || "Write your markdown here..."}
            className="w-full min-h-[300px] p-4 bg-transparent text-sm text-[#cccccc] font-mono resize-none focus:outline-none placeholder:text-[#858585]"
          />
        ) : (
          <div className="p-4 prose prose-invert prose-sm max-w-none min-h-[300px]">
            {value ? (
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{value}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">Nothing to preview</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
