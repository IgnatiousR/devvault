import { CODE_TYPES, EDITABLE_TYPES } from "@/lib/item-types";
import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "../types";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { CodeExplainViewer } from "./code-explain-viewer";
import { PromptOptimizeViewer } from "./prompt-optimize-viewer";

interface EditorContentProps {
  item: ItemDetail;
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
  aiAccess?: boolean;
}

export function EditorContent({
  item,
  isEditing,
  editData,
  setEditData,
  aiAccess,
}: EditorContentProps) {
  if (!EDITABLE_TYPES.includes(item.itemType.name)) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Content</h3>
      {isEditing ? (
        CODE_TYPES.includes(item.itemType.name) ? (
          <CodeEditor
            value={editData.content}
            onChange={(v) => setEditData({ ...editData, content: v })}
            language={editData.language || "plaintext"}
            placeholder="Add content..."
          />
        ) : (
          <MarkdownEditor
            value={editData.content}
            onChange={(v) => setEditData({ ...editData, content: v })}
            placeholder="Add content..."
          />
        )
      ) : item.content ? (
        CODE_TYPES.includes(item.itemType.name) ? (
          <CodeExplainViewer
            itemId={item.id}
            itemType={item.itemType.name as "Snippet" | "Command"}
            content={item.content}
            language={item.language || undefined}
            aiAccess={aiAccess ?? false}
          />
        ) : item.itemType.name === "Prompt" ? (
          <PromptOptimizeViewer
            itemId={item.id}
            content={item.content}
            aiAccess={aiAccess ?? false}
          />
        ) : (
          <MarkdownEditor value={item.content} readOnly />
        )
      ) : (
        <p className="text-sm text-muted-foreground/50 italic">No content</p>
      )}
    </div>
  );
}
