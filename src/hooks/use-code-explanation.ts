"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { explainCode } from "@/actions/ai";

export function useCodeExplanation(itemId?: string) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"code" | "explain">("code");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setExplanation(null);
    setError(null);
    setActiveView("code");
    setIsExplaining(false);
  }, [itemId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const explain = useCallback(
    async (itemType: "Snippet" | "Command", content: string, language?: string) => {
      if (!content.trim()) {
        toast.error("No content to explain");
        return;
      }

      setIsExplaining(true);
      setError(null);

      const result = await explainCode({
        itemType,
        content,
        language,
      });

      setIsExplaining(false);

      if (result.success) {
        setExplanation(result.explanation);
        setActiveView("explain");
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setExplanation(null);
    setError(null);
    setActiveView("code");
    setIsExplaining(false);
  }, []);

  return {
    explanation,
    isExplaining,
    error,
    activeView,
    setActiveView,
    explain,
    clear,
  };
}
