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

function EditorInput({
  itemTypeName,
  editData,
  setEditData,
}: {
  itemTypeName: string;
  editData: EditData;
  setEditData: (data: EditData) => void;
}) {
  if (CODE_TYPES.includes(itemTypeName)) {
    return (
      <CodeEditor
        value={editData.content}
        onChange={(v) => setEditData({ ...editData, content: v })}
        language={editData.language || "plaintext"}
        placeholder="Add content..."
      />
    );
  }
  return (
    <MarkdownEditor
      value={editData.content}
      onChange={(v) => setEditData({ ...editData, content: v })}
      placeholder="Add content..."
    />
  );
}

function ReadOnlyContent({
  item,
  aiAccess,
  content,
}: {
  item: ItemDetail;
  aiAccess: boolean;
  content: string;
}) {
  if (CODE_TYPES.includes(item.itemType.name)) {
    return (
      <CodeExplainViewer
        itemId={item.id}
        itemType={item.itemType.name as "Snippet" | "Command"}
        content={content}
        language={item.language || undefined}
        aiAccess={aiAccess}
      />
    );
  }
  if (item.itemType.name === "Prompt") {
    return (
      <PromptOptimizeViewer
        itemId={item.id}
        content={content}
        aiAccess={aiAccess}
      />
    );
  }
  return <MarkdownEditor value={content} readOnly />;
}

export function EditorContent({
  item,
  isEditing,
  editData,
  setEditData,
  aiAccess,
}: EditorContentProps) {
  if (!EDITABLE_TYPES.includes(item.itemType.name)) return null;

  const itemContent = item.content ?? "";

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Content</h3>
      {isEditing ? (
        <EditorInput
          itemTypeName={item.itemType.name}
          editData={editData}
          setEditData={setEditData}
        />
      ) : item.content ? (
        <ReadOnlyContent item={item} aiAccess={aiAccess ?? false} content={itemContent} />
      ) : (
        <p className="text-sm text-muted-foreground/50 italic">No content</p>
      )}
    </div>
  );
}
