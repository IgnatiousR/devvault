import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { CODE_TYPES } from "@/lib/item-types";

interface ContentFieldProps {
  selectedType: string;
  content: string;
  language: string;
  onChange: (value: string) => void;
}

export function ContentField({
  selectedType,
  content,
  language,
  onChange,
}: ContentFieldProps) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        Content
      </label>
      {CODE_TYPES.includes(selectedType) ? (
        <CodeEditor
          value={content}
          onChange={onChange}
          language={language || "plaintext"}
          placeholder="Enter content"
        />
      ) : (
        <MarkdownEditor
          value={content}
          onChange={onChange}
          placeholder="Enter content"
        />
      )}
    </div>
  );
}
