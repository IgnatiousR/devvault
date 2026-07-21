"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { generateAutoTags } from "@/actions/ai";

interface SuggestTagsInput {
  title: string;
  content?: string;
  itemType?: string;
  existingTags?: string[];
}

export function useAutoTags() {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const suggestTags = useCallback(async (input: SuggestTagsInput) => {
    if (!input.title.trim()) {
      toast.error("Enter a title first to get tag suggestions");
      return;
    }

    setIsSuggesting(true);
    setError(null);

    const result = await generateAutoTags({
      title: input.title,
      content: input.content,
      itemType: input.itemType,
      existingTags: input.existingTags,
    });

    setIsSuggesting(false);

    if (result.success) {
      setSuggestions(result.tags);
    } else {
      setError(result.error);
      toast.error(result.error);
    }
  }, []);

  const removeTag = useCallback((tag: string) => {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    isSuggesting,
    suggestions,
    error,
    suggestTags,
    removeTag,
    clearSuggestions,
  };
}
