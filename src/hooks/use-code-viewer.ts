"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { usePromptOptimization } from "@/hooks/use-prompt-optimization";
import { useCodeExplanation } from "@/hooks/use-code-explanation";

interface UseCodeViewerOptions {
  itemId: string;
  content: string;
  aiAccess: boolean;
  itemType?: "Snippet" | "Command";
  language?: string;
}

export function useCodeViewer({
  itemId,
  content,
  aiAccess,
  itemType,
  language,
}: UseCodeViewerOptions) {
  const {
    optimized,
    isOptimizing,
    isSaving,
    activeView: optimizeView,
    setActiveView: setOptimizeView,
    optimize,
    applyOptimized,
  } = usePromptOptimization(itemId);

  const {
    explanation,
    isExplaining,
    activeView: explainView,
    setActiveView: setExplainView,
    explain,
  } = useCodeExplanation(itemId);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }, [content]);

  const handleOptimize = useCallback(() => {
    if (itemType) {
      setExplainView("code");
    }
    optimize(content);
  }, [content, itemType, optimize, setExplainView]);

  const handleExplain = useCallback(() => {
    if (itemType) {
      setOptimizeView("original");
      explain(itemType, content, language);
    }
  }, [content, itemType, language, explain, setOptimizeView]);

  const handleUseOptimized = useCallback(() => {
    if (optimized) {
      applyOptimized(optimized);
    }
  }, [optimized, applyOptimized]);

  const showExplain = explainView === "explain" && explanation && aiAccess;
  const showOptimized = optimizeView === "optimized" && optimized && aiAccess;

  return {
    explanation,
    isExplaining,
    optimized,
    isOptimizing,
    isSaving,
    explainView,
    optimizeView,
    setExplainView,
    setOptimizeView,
    showExplain,
    showOptimized,
    handleCopy,
    handleOptimize,
    handleExplain,
    handleUseOptimized,
  };
}

// fallow-ignore-next-line unused-type
export type UseCodeViewerReturn = ReturnType<typeof useCodeViewer>;
