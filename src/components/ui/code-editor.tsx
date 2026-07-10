"use client"

import { useRef, useState } from "react"
import Editor, { type OnMount } from "@monaco-editor/react"
import { toast } from "sonner"

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  readOnly?: boolean
  placeholder?: string
}

export function CodeEditor({
  value,
  onChange,
  language = "plaintext",
  readOnly = false,
  placeholder,
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const handleCopy = async () => {
    const text = editorRef.current?.getValue() || value
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const displayLanguage = language === "plaintext" ? "text" : language

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-border">
        {/* Language */}
        <span className="text-xs text-[#858585] font-mono">
          {displayLanguage}
        </span>
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
          {/* Linux window controls */}
          <div className="flex items-center gap-1.5 ml-1">
            <span className="w-3 h-3 rounded-full bg-[#2d2d2d] border border-[#555] hover:bg-[#3c3c3c] transition-colors" />
            <span className="w-3 h-3 rounded-full bg-[#2d2d2d] border border-[#555] hover:bg-[#3c3c3c] transition-colors" />
            <span className="w-3 h-3 rounded-full bg-[#2d2d2d] border border-[#555] hover:bg-[#ef4444] hover:border-[#ef4444] transition-colors" />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-h-[600px] overflow-y-auto code-editor-scrollbar">
        <Editor
          height="300px"
          language={language}
          value={value}
          onChange={(v) => onChange?.(v || "")}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
            lineNumbers: "on",
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderLineHighlight: "none",
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            padding: { top: 12, bottom: 12 },
            placeholder: placeholder || "",
          }}
        />
      </div>
    </div>
  )
}
