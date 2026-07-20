"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { toast } from "sonner";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { usePromptOptimization } from "@/components/ui/use-prompt-optimization";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface PromptOptimizeViewerProps {
  itemId: string;
  content: string;
  aiAccess: boolean;
}

export function PromptOptimizeViewer({
  itemId,
  content,
  aiAccess,
}: PromptOptimizeViewerProps) {
  const {
    optimized,
    isOptimizing,
    isSaving,
    activeView,
    setActiveView,
    optimize,
    applyOptimized,
  } = usePromptOptimization(itemId);

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleOptimize = () => {
    optimize(content);
  };

  const handleUseOptimized = () => {
    if (optimized) {
      applyOptimized(optimized);
    }
  };

  const showOptimized = activeView === "optimized" && optimized && aiAccess;

  const headerControls = aiAccess ? (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors"
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "14px",
            fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16',
            transform: "scale(0.75)",
            display: "inline-block",
          }}
        >
          content_copy
        </span>
        Copy
      </button>
      {optimized ? (
        <button
          type="button"
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "14px",
              fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16',
              transform: "scale(0.75)",
              display: "inline-block",
            }}
          >
            {isOptimizing ? "progress_activity" : "refresh"}
          </span>
          Regenerate
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "14px",
              fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16',
              transform: "scale(0.75)",
              display: "inline-block",
            }}
          >
            {isOptimizing ? "progress_activity" : "auto_awesome"}
          </span>
          {isOptimizing ? "Optimizing..." : "Optimize"}
        </button>
      )}
    </div>
  ) : (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            disabled
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] opacity-50 cursor-not-allowed"
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "14px",
                fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16',
                transform: "scale(0.75)",
                display: "inline-block",
              }}
            >
              workspace_premium
            </span>
          </button>
        }
      />
      <TooltipContent side="bottom">
        AI features require Pro subscription
      </TooltipContent>
    </Tooltip>
  );

  const viewTabs =
    optimized && aiAccess ? (
      <div className="flex border-b border-border bg-[#252526]">
        <button
          type="button"
          onClick={() => setActiveView("original")}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            activeView === "original"
              ? "text-[#cccccc] border-b-2 border-[#cccccc]"
              : "text-[#858585] hover:text-[#cccccc]"
          }`}
        >
          Original
        </button>
        <button
          type="button"
          onClick={() => setActiveView("optimized")}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            activeView === "optimized"
              ? "text-[#cccccc] border-b-2 border-[#cccccc]"
              : "text-[#858585] hover:text-[#cccccc]"
          }`}
        >
          Optimized
        </button>
        {showOptimized && (
          <div className="ml-auto flex items-center pr-3">
            <button
              type="button"
              onClick={handleUseOptimized}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1 rounded text-xs bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4c4c4c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "14px",
                  fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16',
                  transform: "scale(0.75)",
                  display: "inline-block",
                }}
              >
                {isSaving ? "progress_activity" : "check"}
              </span>
              {isSaving ? "Saving..." : "Use this"}
            </button>
          </div>
        )}
      </div>
    ) : undefined;

  return (
    <MarkdownEditor
      value={content}
      readOnly
      headerControls={headerControls}
      viewTabs={viewTabs}
      hideFloatingCopy={aiAccess}
      customContent={
        showOptimized ? (
          <div className="p-4 bg-[#1e1e1e] text-sm text-[#d4d4d4] leading-relaxed markdown-preview min-h-[200px]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {optimized}
            </ReactMarkdown>
          </div>
        ) : undefined
      }
    />
  );
}
