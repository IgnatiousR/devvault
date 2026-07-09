import { Input } from "@/components/ui/input";
import { SheetTitle } from "@/components/ui/sheet";
import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "./types";

interface DrawerHeaderProps {
  item: ItemDetail;
  colors: { bg: string; text: string; iconBg: string };
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
}

export function DrawerHeader({
  item,
  colors,
  isEditing,
  editData,
  setEditData,
}: DrawerHeaderProps) {
  return (
    <div className="p-6 pb-4">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center shrink-0`}
        >
          <span
            className={`material-symbols-outlined ${colors.text}`}
          >
            {item.itemType.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="text-lg font-bold h-auto py-0 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              placeholder="Title"
            />
          ) : (
            <SheetTitle className="text-lg font-bold leading-tight">
              {item.title}
            </SheetTitle>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs font-medium">
              {item.itemType.name}
            </span>
            {!isEditing && item.language && (
              <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs font-medium">
                {item.language}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
