import { formatFileSize } from "@/lib/format-utils";
import { FILE_TYPES, IMAGE_TYPES } from "@/lib/item-types";
import type { ItemDetail } from "@/types/dashboard";

interface FilePreviewProps {
  item: ItemDetail;
}

export function FilePreview({ item }: FilePreviewProps) {
  const isImage = IMAGE_TYPES.includes(item.itemType.name);
  const isFile = FILE_TYPES.includes(item.itemType.name);

  if (!(isImage || isFile) || !item.fileUrl) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">
        {isImage ? "Image" : "File"}
      </h3>
      {isImage ? (
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
  );
}
