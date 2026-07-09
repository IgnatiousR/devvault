import { Input } from "@/components/ui/input";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { formatFileSize } from "@/lib/format-utils";
import {
  EDITABLE_TYPES,
  CODE_TYPES,
  LANGUAGE_TYPES,
  URL_TYPES,
  FILE_TYPES,
  IMAGE_TYPES,
} from "@/lib/item-types";
import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "../types";

interface ContentSectionProps {
  item: ItemDetail;
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
}

export function ContentSection({
  item,
  isEditing,
  editData,
  setEditData,
}: ContentSectionProps) {
  return (
    <>
      {/* Code Content */}
      {EDITABLE_TYPES.includes(item.itemType.name) && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Content</h3>
          {isEditing ? (
            CODE_TYPES.includes(item.itemType.name) ? (
              <CodeEditor
                value={editData.content}
                onChange={(v) => setEditData({ ...editData, content: v })}
                language={item.language || "plaintext"}
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
              <CodeEditor
                value={item.content}
                language={item.language || "plaintext"}
                readOnly
              />
            ) : (
              <MarkdownEditor value={item.content} readOnly />
            )
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No content
            </p>
          )}
        </div>
      )}

      {/* Language */}
      {LANGUAGE_TYPES.includes(item.itemType.name) && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Language</h3>
          {isEditing ? (
            <Input
              value={editData.language}
              onChange={(e) =>
                setEditData({ ...editData, language: e.target.value })
              }
              placeholder="e.g., javascript, python"
            />
          ) : item.language ? (
            <span className="text-sm text-muted-foreground">
              {item.language}
            </span>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No language
            </p>
          )}
        </div>
      )}

      {/* URL */}
      {URL_TYPES.includes(item.itemType.name) && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">URL</h3>
          {isEditing ? (
            <Input
              value={editData.url}
              onChange={(e) =>
                setEditData({ ...editData, url: e.target.value })
              }
              placeholder="https://..."
            />
          ) : item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline break-all"
            >
              {item.url}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">No URL</p>
          )}
        </div>
      )}

      {/* File/Image Preview */}
      {(FILE_TYPES.includes(item.itemType.name) ||
        IMAGE_TYPES.includes(item.itemType.name)) &&
        item.fileUrl && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              {IMAGE_TYPES.includes(item.itemType.name) ? "Image" : "File"}
            </h3>
            {IMAGE_TYPES.includes(item.itemType.name) ? (
              <div className="rounded-md border border-border overflow-hidden">
                <img
                  src={`/api/items/${item.id}/download?inline=true`}
                  alt={item.fileName || "Image"}
                  className="max-w-full h-auto"
                />
              </div>
            ) : (
              <div className="rounded-md border border-border bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-muted-foreground">
                    description
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.fileName}
                    </p>
                    {item.fileSize && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.fileSize)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
    </>
  );
}
