import { Button } from "@/components/ui/button";
import type { ItemDetail } from "@/types/dashboard";

interface DrawerActionBarProps {
  item: ItemDetail;
  isEditing: boolean;
  isSaving: boolean;
  editTitle: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
}

export function DrawerActionBar({
  item,
  isEditing,
  isSaving,
  editTitle,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onToggleFavorite,
  onTogglePin,
}: DrawerActionBarProps) {
  return (
    <div className="px-6 pb-4 flex items-center gap-1">
      {isEditing ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={onCancel}
            disabled={isSaving}
          >
            <span className="material-symbols-outlined text-lg">
              close
            </span>
            <span className="text-xs">Cancel</span>
          </Button>
          <div className="flex-1" />
          <Button
            size="sm"
            className="gap-1.5"
            onClick={onSave}
            disabled={isSaving || !editTitle.trim()}
          >
            <span className="material-symbols-outlined text-lg">
              check
            </span>
            <span className="text-xs">
              {isSaving ? "Saving..." : "Save"}
            </span>
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 ${item.isFavorite ? "text-yellow-500" : "text-muted-foreground"}`}
            onClick={onToggleFavorite}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={
                item.isFavorite
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              star
            </span>
            <span className="text-xs">Favorite</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 ${item.isPinned ? "text-blue-500" : "text-muted-foreground"}`}
            onClick={onTogglePin}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={
                item.isPinned
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              push_pin
            </span>
            <span className="text-xs">Pin</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
          >
            <span className="material-symbols-outlined text-lg">
              content_copy
            </span>
            <span className="text-xs">Copy</span>
          </Button>
          {item.fileUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => {
                window.open(`/api/items/${item.id}/download`, "_blank");
              }}
            >
              <span className="material-symbols-outlined text-lg">
                download
              </span>
              <span className="text-xs">Download</span>
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={onEdit}
          >
            <span className="material-symbols-outlined text-lg">
              edit
            </span>
            <span className="text-xs">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={onDelete}
          >
            <span className="material-symbols-outlined text-lg">
              delete
            </span>
          </Button>
        </>
      )}
    </div>
  );
}
