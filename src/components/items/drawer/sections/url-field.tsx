import { Input } from "@/components/ui/input";
import { URL_TYPES } from "@/lib/item-types";
import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "../types";

interface UrlFieldProps {
  item: ItemDetail;
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
}

export function UrlField({
  item,
  isEditing,
  editData,
  setEditData,
}: UrlFieldProps) {
  if (!URL_TYPES.includes(item.itemType.name)) return null;

  return (
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
  );
}
