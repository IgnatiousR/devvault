"use client";

import type { ReactNode } from "react";

interface MarkdownEditorHeaderProps {
  readOnly: boolean;
  activeTab: "write" | "preview";
  onTabChange: (tab: "write" | "preview") => void;
  isCopied: boolean;
  onCopy: () => void;
  headerControls?: ReactNode;
}

export function MarkdownEditorHeader({
  readOnly,
  activeTab,
  onTabChange,
  isCopied,
  onCopy,
  headerControls,
}: MarkdownEditorHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-border">
      <div className="flex items-center gap-1">
        {readOnly ? (
          <span className="text-xs text-[#858585] font-mono">Preview</span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onTabChange("write")}
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
              onClick={() => onTabChange("preview")}
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

      {headerControls ? (
        <div className="flex items-center gap-2">{headerControls}</div>
      ) : !readOnly ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              {isCopied ? "check" : "content_copy"}
            </span>
            {isCopied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
