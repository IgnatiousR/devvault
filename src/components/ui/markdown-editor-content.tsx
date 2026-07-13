"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownEditorContentProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly: boolean;
  activeTab: "write" | "preview";
  placeholder?: string;
}

export function MarkdownEditorContent({
  value,
  onChange,
  readOnly,
  activeTab,
  placeholder,
}: MarkdownEditorContentProps) {
  if (readOnly) {
    return (
      <div className="p-4 prose prose-invert prose-sm max-w-none">
        {value ? (
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{value}</Markdown>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">No content</p>
        )}
      </div>
    );
  }

  if (activeTab === "write") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder || "Write your markdown here..."}
        className="w-full min-h-[300px] p-4 bg-transparent text-sm text-[#cccccc] font-mono resize-none focus:outline-none placeholder:text-[#858585]"
      />
    );
  }

  return (
    <div className="p-4 prose prose-invert prose-sm max-w-none min-h-[300px]">
      {value ? (
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{value}</Markdown>
      ) : (
        <p className="text-sm text-muted-foreground/50 italic">Nothing to preview</p>
      )}
    </div>
  );
}
