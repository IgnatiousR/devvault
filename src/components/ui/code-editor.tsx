"use client"

import { useRef, useState } from "react"
import Editor, { type OnMount, type BeforeMount } from "@monaco-editor/react"
import { toast } from "sonner"
import { useEditorPreferences } from "@/contexts/editor-preferences-context"

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  readOnly?: boolean
  placeholder?: string
  headerControls?: React.ReactNode
  viewTabs?: React.ReactNode
  hideFloatingCopy?: boolean
  customContent?: React.ReactNode
}

const defineMonokaiTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editor.lineHighlightBackground": "#3e3d32",
      "editor.selectionBackground": "#49483e",
      "editorCursor.foreground": "#f8f8f0",
      "editorWhitespace.foreground": "#3b3a32",
      "editorIndentGuide.background": "#404040",
      "editorIndentGuide.activeBackground": "#707070",
    },
  })
}

const defineGithubDarkTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "editor.lineHighlightBackground": "#161b22",
      "editor.selectionBackground": "#264f78",
      "editorCursor.foreground": "#c9d1d9",
      "editorWhitespace.foreground": "#484f58",
      "editorIndentGuide.background": "#21262d",
      "editorIndentGuide.activeBackground": "#484f58",
    },
  })
}

function CopyButton({
  isCopied,
  onCopy,
  className = "",
}: {
  isCopied: boolean
  onCopy: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className={className}
    >
      <span className="material-symbols-outlined text-sm">
        {isCopied ? "check" : "content_copy"}
      </span>
      {isCopied ? "Copied" : "Copy"}
    </button>
  )
}

function EditorHeader({
  displayLanguage,
  readOnly,
  isCopied,
  onCopy,
  headerControls,
}: {
  displayLanguage: string
  readOnly: boolean
  isCopied: boolean
  onCopy: () => void
  headerControls?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-border">
      <span className="text-xs text-[#858585] font-mono">
        {displayLanguage}
      </span>
      <div className="flex items-center gap-2">
        {!readOnly && (
          <CopyButton
            isCopied={isCopied}
            onCopy={onCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors"
          />
        )}
        {headerControls}
        <div className="flex items-center gap-1.5 ml-1">
          <span className="w-3 h-3 rounded-full bg-[#2d2d2d] border border-[#555] hover:bg-[#3c3c3c] transition-colors" />
          <span className="w-3 h-3 rounded-full bg-[#2d2d2d] border border-[#555] hover:bg-[#3c3c3c] transition-colors" />
          <span className="w-3 h-3 rounded-full bg-[#2d2d2d] border border-[#555] hover:bg-[#ef4444] hover:border-[#ef4444] transition-colors" />
        </div>
      </div>
    </div>
  )
}

export function CodeEditor({
  value,
  onChange,
  language = "plaintext",
  readOnly = false,
  placeholder,
  headerControls,
  viewTabs,
  hideFloatingCopy = false,
  customContent,
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const { preferences } = useEditorPreferences()

  const handleBeforeMount: BeforeMount = (monaco) => {
    defineMonokaiTheme(monaco)
    defineGithubDarkTheme(monaco)
  }

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
  const editorOptions: import("@monaco-editor/react").EditorProps["options"] = {
    readOnly,
    minimap: { enabled: preferences.minimap },
    scrollBeyondLastLine: false,
    fontSize: preferences.fontSize,
    tabSize: preferences.tabSize,
    wordWrap: preferences.wordWrap ? "on" : "off",
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
  }

  return (
    <div className="group/editor relative rounded-lg border border-border overflow-hidden bg-[#1e1e1e]">
      <EditorHeader
        displayLanguage={displayLanguage}
        readOnly={readOnly}
        isCopied={isCopied}
        onCopy={handleCopy}
        headerControls={headerControls}
      />

      {viewTabs}

      {customContent ? (
        <div className="max-h-[600px] overflow-y-auto code-editor-scrollbar">
          {customContent}
        </div>
      ) : (
        <div className="relative max-h-[600px] overflow-y-auto code-editor-scrollbar">
          <Editor
            height="300px"
            language={language}
            value={value}
            onChange={(v) => onChange?.(v || "")}
            beforeMount={handleBeforeMount}
            onMount={handleEditorMount}
            theme={preferences.theme}
            options={editorOptions}
          />

          {readOnly && !hideFloatingCopy && (
            <CopyButton
              isCopied={isCopied}
              onCopy={handleCopy}
              className="absolute bottom-3 right-3 p-2 rounded-md bg-[#2d2d2d] border border-[#555] text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] opacity-0 group-hover/editor:opacity-100 transition-opacity z-10"
            />
          )}
        </div>
      )}
    </div>
  )
}
