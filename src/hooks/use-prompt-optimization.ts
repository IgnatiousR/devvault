"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { optimizePrompt, updateItemContent } from "@/actions/ai";

export function usePromptOptimization(itemId?: string) {
  const router = useRouter();
  const [optimized, setOptimized] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"original" | "optimized">(
    "original"
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setOptimized(null);
    setError(null);
    setActiveView("original");
    setIsOptimizing(false);
    setIsSaving(false);
  }, [itemId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const optimize = useCallback(async (content: string) => {
    if (!content.trim()) {
      toast.error("No content to optimize");
      return;
    }

    setIsOptimizing(true);
    setError(null);

    const result = await optimizePrompt({ content });

    setIsOptimizing(false);

    if (result.success) {
      setOptimized(result.optimized);
      setActiveView("optimized");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }, []);

  const applyOptimized = useCallback(
    async (content: string) => {
      if (!itemId || !content.trim()) {
        toast.error("Cannot apply optimized content");
        return;
      }

      setIsSaving(true);

      const result = await updateItemContent({
        itemId,
        content,
      });

      setIsSaving(false);

      if (result.success) {
        toast.success("Optimized content applied");
        setOptimized(null);
        setActiveView("original");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to apply optimized content");
      }
    },
    [itemId, router]
  );

  const clear = useCallback(() => {
    setOptimized(null);
    setError(null);
    setActiveView("original");
    setIsOptimizing(false);
    setIsSaving(false);
  }, []);

  return {
    optimized,
    isOptimizing,
    isSaving,
    error,
    activeView,
    setActiveView,
    optimize,
    applyOptimized,
    clear,
  };
}
