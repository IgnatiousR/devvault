import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TagSuggestions } from "@/components/ui/tag-suggestions";
import { formatDate } from "@/lib/item-helpers";
import { CollectionSelector } from "@/components/ui/collection-selector";
import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "../types";

interface Collection {
  id: string;
  name: string;
}

interface MetadataSectionProps {
  item: ItemDetail;
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
  collections: Collection[];
  aiAccess?: boolean;
  isSuggesting?: boolean;
  suggestions?: string[];
  onSuggestTags?: () => void;
  onAcceptSuggestion?: (tag: string) => void;
  onRejectSuggestion?: (tag: string) => void;
}

export function MetadataSection({
  item,
  isEditing,
  editData,
  setEditData,
  collections,
  aiAccess,
  isSuggesting,
  suggestions = [],
  onSuggestTags,
  onAcceptSuggestion,
  onRejectSuggestion,
}: MetadataSectionProps) {
  return (
    <>
      {/* Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-muted-foreground">
              tag
            </span>
            <h3 className="text-sm font-medium text-foreground">Tags</h3>
          </div>
          {isEditing && aiAccess && onSuggestTags && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSuggestTags}
              disabled={isSuggesting || !editData.title.trim()}
              className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              {isSuggesting ? (
                <Spinner size="sm" />
              ) : (
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
              )}
              {isSuggesting ? "Suggesting..." : "Suggest Tags"}
            </Button>
          )}
        </div>
        {isEditing ? (
          <>
            <Input
              value={editData.tags}
              onChange={(e) =>
                setEditData({ ...editData, tags: e.target.value })
              }
              placeholder="Comma-separated tags"
            />
            {onAcceptSuggestion && onRejectSuggestion && (
              <TagSuggestions
                suggestions={suggestions}
                onAccept={onAcceptSuggestion}
                onReject={onRejectSuggestion}
              />
            )}
          </>
        ) : item.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">No tags</p>
        )}
      </div>

      {/* Collections */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-muted-foreground">
            folder
          </span>
          <h3 className="text-sm font-medium text-foreground">
            Collections
          </h3>
        </div>
        {isEditing ? (
          <CollectionSelector
            collections={collections}
            selectedIds={editData.collections}
            onChange={(ids) => setEditData({ ...editData, collections: ids })}
            placeholder="Add to collections..."
          />
        ) : item.collections.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {item.collections.map((collection) => (
              <span
                key={collection.id}
                className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground text-xs font-medium"
              >
                {collection.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">
            No collections
          </p>
        )}
      </div>

      {/* Details (read-only) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-muted-foreground">
            info
          </span>
          <h3 className="text-sm font-medium text-foreground">Details</h3>
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground">
              {formatDate(item.createdAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated</span>
            <span className="text-foreground">
              {formatDate(item.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
