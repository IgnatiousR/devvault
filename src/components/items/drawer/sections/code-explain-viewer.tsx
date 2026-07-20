"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { toast } from "sonner";
import { CodeEditor } from "@/components/ui/code-editor";
import { useCodeExplanation } from "@/components/ui/use-code-explanation";
import { usePromptOptimization } from "@/components/ui/use-prompt-optimization";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface CodeExplainViewerProps {
  itemId: string;
  itemType: "Snippet" | "Command";
  content: string;
  language?: string;
  aiAccess: boolean;
}

export function CodeExplainViewer({
  itemId,
  itemType,
  content,
  language,
  aiAccess,
}: CodeExplainViewerProps) {
  const {
    explanation,
    isExplaining,
    activeView: explainView,
    setActiveView: setExplainView,
    explain,
  } = useCodeExplanation(itemId);

  const {
    optimized,
    isOptimizing,
    isSaving,
    activeView: optimizeView,
    setActiveView: setOptimizeView,
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

  const handleExplain = () => {
    setOptimizeView("original");
    explain(itemType, content, language);
  };

  const handleOptimize = () => {
    setExplainView("code");
    optimize(content);
  };

  const handleUseOptimized = () => {
    if (optimized) {
      applyOptimized(optimized);
    }
  };

  const showExplain = explainView === "explain" && explanation && aiAccess;
  const showOptimized = optimizeView === "optimized" && optimized && aiAccess;

  const headerControls = aiAccess ? (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16', transform: "scale(0.75)", display: "inline-block" }}>content_copy</span>
        Copy
      </button>
      {optimized ? (
        <button
          type="button"
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16', transform: "scale(0.75)", display: "inline-block" }}>
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
          <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16', transform: "scale(0.75)", display: "inline-block" }}>
            {isOptimizing ? "progress_activity" : "auto_awesome"}
          </span>
          {isOptimizing ? "Optimizing..." : "Optimize"}
        </button>
      )}
      {explanation ? (
        <button
          type="button"
          onClick={handleExplain}
          disabled={isExplaining}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16', transform: "scale(0.75)", display: "inline-block" }}>
            {isExplaining ? "progress_activity" : "refresh"}
          </span>
          Regenerate
        </button>
      ) : (
        <button
          type="button"
          onClick={handleExplain}
          disabled={isExplaining}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16', transform: "scale(0.75)", display: "inline-block" }}>
            {isExplaining ? "progress_activity" : "auto_awesome"}
          </span>
          {isExplaining ? "Explaining..." : "Explain"}
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
            <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16', transform: "scale(0.75)", display: "inline-block" }}>
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

  const viewTabs = (explanation || optimized) && aiAccess ? (
    <div className="flex border-b border-border bg-[#252526]">
      <button
        type="button"
        onClick={() => { setExplainView("code"); setOptimizeView("original"); }}
        className={`px-4 py-1.5 text-xs font-medium transition-colors ${
          !showExplain && !showOptimized
            ? "text-[#cccccc] border-b-2 border-[#cccccc]"
            : "text-[#858585] hover:text-[#cccccc]"
        }`}
      >
        Code
      </button>
      {explanation && (
        <button
          type="button"
          onClick={() => { setExplainView("explain"); setOptimizeView("original"); }}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            showExplain
              ? "text-[#cccccc] border-b-2 border-[#cccccc]"
              : "text-[#858585] hover:text-[#cccccc]"
          }`}
        >
          Explain
        </button>
      )}
      {optimized && (
        <button
          type="button"
          onClick={() => { setOptimizeView("optimized"); setExplainView("code"); }}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            showOptimized
              ? "text-[#cccccc] border-b-2 border-[#cccccc]"
              : "text-[#858585] hover:text-[#cccccc]"
          }`}
        >
          Optimized
        </button>
      )}
      {showOptimized && (
        <div className="ml-auto flex items-center pr-3">
          <button
            type="button"
            onClick={handleUseOptimized}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1 rounded text-xs bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4c4c4c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16', transform: "scale(0.75)", display: "inline-block" }}>
              {isSaving ? "progress_activity" : "check"}
            </span>
            {isSaving ? "Saving..." : "Use this"}
          </button>
        </div>
      )}
    </div>
  ) : undefined;

  return (
    <CodeEditor
      value={content}
      language={language || "plaintext"}
      readOnly
      headerControls={headerControls}
      viewTabs={viewTabs}
      hideFloatingCopy={aiAccess}
      customContent={
        showExplain ? (
          <div className="p-4 bg-[#1e1e1e] text-sm text-[#d4d4d4] leading-relaxed markdown-preview min-h-[200px]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {explanation}
            </ReactMarkdown>
          </div>
        ) : showOptimized ? (
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
