"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { generateDescription } from "@/actions/ai";

interface GenerateDescInput {
  title: string;
  content?: string;
  itemType?: string;
  language?: string;
  url?: string;
  tags?: string[];
}

export function useAutoDescription() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (input: GenerateDescInput) => {
    if (!input.title.trim()) {
      toast.error("Enter a title first to generate a description");
      return null;
    }

    setIsGenerating(true);
    setError(null);

    const result = await generateDescription({
      title: input.title,
      content: input.content,
      itemType: input.itemType,
      language: input.language,
      url: input.url,
      tags: input.tags,
    });

    setIsGenerating(false);

    if (result.success) {
      return result.description;
    } else {
      setError(result.error);
      toast.error(result.error);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isGenerating,
    error,
    generate,
    clearError,
  };
}
