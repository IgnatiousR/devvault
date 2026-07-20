"use client";

import { X, Check } from "lucide-react";

interface TagSuggestionsProps {
  suggestions: string[];
  onAccept: (tag: string) => void;
  onReject: (tag: string) => void;
}

export function TagSuggestions({
  suggestions,
  onAccept,
  onReject,
}: TagSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 text-primary text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => onAccept(tag)}
            className="ml-0.5 hover:text-green-500 transition-colors"
            aria-label={`Accept ${tag}`}
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onReject(tag)}
            className="hover:text-destructive transition-colors"
            aria-label={`Reject ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
