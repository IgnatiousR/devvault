import { LanguageSelect } from "@/components/ui/language-select";
import { LANGUAGE_TYPES } from "@/lib/item-types";
import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "../types";

interface LanguageFieldProps {
  item: ItemDetail;
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
}

export function LanguageField({
  item,
  isEditing,
  editData,
  setEditData,
}: LanguageFieldProps) {
  if (!LANGUAGE_TYPES.includes(item.itemType.name)) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Language</h3>
      {isEditing ? (
        <LanguageSelect
          value={editData.language}
          onChange={(v) => setEditData({ ...editData, language: v })}
        />
      ) : item.language ? (
        <span className="text-sm text-muted-foreground">{item.language}</span>
      ) : (
        <p className="text-sm text-muted-foreground/50 italic">No language</p>
      )}
    </div>
  );
}
