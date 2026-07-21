"use client";

import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { useCodeViewer } from "@/hooks/use-code-viewer";
import {
  AiButton,
  AiPremiumTooltip,
  AiResponseMarkdown,
  AiUseOptimizedButton,
  AiOptimizedTabButton,
} from "@/components/ui/ai-response-view";

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
    optimizeView,
    setOptimizeView,
    showOptimized,
    handleCopy,
    handleOptimize,
    handleUseOptimized,
  } = useCodeViewer({ itemId, content, aiAccess });

  const headerControls = aiAccess ? (
    <div className="flex items-center gap-1">
      <AiButton icon="content_copy" label="Copy" onClick={handleCopy} />
      {optimized ? (
        <AiButton
          icon="refresh"
          label="Regenerate"
          isLoading={isOptimizing}
          onClick={handleOptimize}
        />
      ) : (
        <AiButton
          icon="auto_awesome"
          label="Optimize"
          loadingLabel="Optimizing..."
          isLoading={isOptimizing}
          onClick={handleOptimize}
        />
      )}
    </div>
  ) : (
    <AiPremiumTooltip />
  );

  const viewTabs =
    optimized && aiAccess ? (
      <div className="flex border-b border-border bg-[#252526]">
        <AiOptimizedTabButton
          isActive={optimizeView === "original"}
          label="Original"
          onClick={() => setOptimizeView("original")}
        />
        <AiOptimizedTabButton
          isActive={optimizeView === "optimized"}
          label="Optimized"
          onClick={() => setOptimizeView("optimized")}
        />
        {showOptimized && (
          <AiUseOptimizedButton isSaving={isSaving} onClick={handleUseOptimized} />
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
        showOptimized ? <AiResponseMarkdown content={optimized} /> : undefined
      }
    />
  );
}
