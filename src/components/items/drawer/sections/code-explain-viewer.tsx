"use client";

import { CodeEditor } from "@/components/ui/code-editor";
import { useCodeViewer } from "@/hooks/use-code-viewer";
import {
  AiButton,
  AiPremiumTooltip,
  AiResponseMarkdown,
  AiUseOptimizedButton,
  AiOptimizedTabButton,
} from "@/components/ui/ai-response-view";

interface CodeExplainViewerProps {
  itemId: string;
  itemType: "Snippet" | "Command";
  content: string;
  language?: string;
  aiAccess: boolean;
}

function CodeExplainHeader({
  aiAccess,
  isExplaining,
  isOptimizing,
  optimized,
  explanation,
  handleCopy,
  handleOptimize,
  handleExplain,
}: {
  aiAccess: boolean;
  isExplaining: boolean;
  isOptimizing: boolean;
  optimized: string | null;
  explanation: string | null;
  handleCopy: () => void;
  handleOptimize: () => void;
  handleExplain: () => void;
}) {
  if (!aiAccess) return <AiPremiumTooltip />;

  return (
    <div className="flex items-center gap-1">
      <AiButton icon="content_copy" label="Copy" onClick={handleCopy} />
      <AiButton
        icon={optimized ? "refresh" : "auto_awesome"}
        label={optimized ? "Regenerate" : "Optimize"}
        loadingLabel="Optimizing..."
        isLoading={isOptimizing}
        onClick={handleOptimize}
      />
      <AiButton
        icon={explanation ? "refresh" : "auto_awesome"}
        label={explanation ? "Regenerate" : "Explain"}
        loadingLabel="Explaining..."
        isLoading={isExplaining}
        onClick={handleExplain}
      />
    </div>
  );
}

function CodeExplainTabs({
  showExplain,
  showOptimized,
  optimized,
  explanation,
  isSaving,
  setExplainView,
  setOptimizeView,
  handleUseOptimized,
}: {
  showExplain: boolean;
  showOptimized: boolean;
  optimized: string | null;
  explanation: string | null;
  isSaving: boolean;
  setExplainView: (view: "code" | "explain") => void;
  setOptimizeView: (view: "original" | "optimized") => void;
  handleUseOptimized: () => void;
}) {
  if (!showExplain && !showOptimized) return undefined;

  return (
    <div className="flex border-b border-border bg-[#252526]">
      <AiOptimizedTabButton
        isActive={!showExplain && !showOptimized}
        label="Code"
        onClick={() => { setExplainView("code"); setOptimizeView("original"); }}
      />
      {explanation && (
        <AiOptimizedTabButton
          isActive={!!showExplain}
          label="Explain"
          onClick={() => { setExplainView("explain"); setOptimizeView("original"); }}
        />
      )}
      {optimized && (
        <AiOptimizedTabButton
          isActive={!!showOptimized}
          label="Optimized"
          onClick={() => { setOptimizeView("optimized"); setExplainView("code"); }}
        />
      )}
      {showOptimized && (
        <AiUseOptimizedButton isSaving={isSaving} onClick={handleUseOptimized} />
      )}
    </div>
  );
}

function CodeExplainContent({
  showExplain,
  showOptimized,
  explanation,
  optimized,
}: {
  showExplain: boolean | string;
  showOptimized: boolean | string;
  explanation: string | null;
  optimized: string | null;
}) {
  if (showExplain) return <AiResponseMarkdown content={explanation} />;
  if (showOptimized) return <AiResponseMarkdown content={optimized} />;
  return undefined;
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
    optimized,
    isOptimizing,
    isSaving,
    setExplainView,
    setOptimizeView,
    showExplain,
    showOptimized,
    handleCopy,
    handleOptimize,
    handleExplain,
    handleUseOptimized,
  } = useCodeViewer({ itemId, content, aiAccess, itemType, language });

  return (
    <CodeEditor
      value={content}
      language={language || "plaintext"}
      readOnly
      headerControls={
        <CodeExplainHeader
          aiAccess={aiAccess}
          isExplaining={isExplaining}
          isOptimizing={isOptimizing}
          optimized={optimized}
          explanation={explanation}
          handleCopy={handleCopy}
          handleOptimize={handleOptimize}
          handleExplain={handleExplain}
        />
      }
      viewTabs={
        <CodeExplainTabs
          showExplain={!!showExplain}
          showOptimized={!!showOptimized}
          optimized={optimized}
          explanation={explanation}
          isSaving={isSaving}
          setExplainView={setExplainView}
          setOptimizeView={setOptimizeView}
          handleUseOptimized={handleUseOptimized}
        />
      }
      hideFloatingCopy={aiAccess}
      customContent={showExplain || showOptimized ? (
        <CodeExplainContent
          showExplain={!!showExplain}
          showOptimized={!!showOptimized}
          explanation={explanation}
          optimized={optimized}
        />
      ) : undefined}
    />
  );
}
