"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ItemCard, ListItem } from "@/components/items/item-card";
import { ImageCard } from "@/components/items/image-card";
import { FileRow } from "@/components/items/file-row";
import { ItemDrawer } from "@/components/items/drawer";
import { Button } from "@/components/ui/button";
import { useItemDetail } from "@/hooks/use-item-detail";
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog";
import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog";
import { toggleCollectionFavoriteAction } from "@/actions/collections";
import { toast } from "sonner";
import type { DashboardItem, CollectionWithStats } from "@/types/dashboard";

function ViewToggle({ mode, onChange }: { mode: "grid" | "list"; onChange: (mode: "grid" | "list") => void }) {
  return (
    <div className="inline-flex items-center bg-muted/50 p-1 rounded-lg border border-border">
      <Button
        variant="ghost"
        onClick={() => onChange("grid")}
        className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wide rounded transition-colors ${
          mode === "grid"
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Grid
      </Button>
      <Button
        variant="ghost"
        onClick={() => onChange("list")}
        className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wide rounded transition-colors ${
          mode === "list"
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        List
      </Button>
    </div>
  );
}

interface CollectionDetailContentProps {
  collection: CollectionWithStats;
  items: DashboardItem[];
}

const FIXED_LAYOUT_TYPES = ["image", "file"];

export function CollectionDetailContent({ collection: initialCollection, items }: CollectionDetailContentProps) {
  const router = useRouter();
  const [collection, setCollection] = useState(initialCollection);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data: selectedItem, isLoading: isDrawerLoading, error: drawerError, open: openDrawer, close: closeDrawer, isOpen: isDrawerOpen } = useItemDetail();

  const itemTypes = [...new Set(items.map((item) => item.itemType.name.toLowerCase()))];
  const showViewToggle = !itemTypes.some((t) => FIXED_LAYOUT_TYPES.includes(t));

  const handleFavoriteToggle = async () => {
    const result = await toggleCollectionFavoriteAction({ id: collection.id });

    if (result.success) {
      setCollection((prev) => ({ ...prev, isFavorite: result.isFavorite ?? false }));
      toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update favorite");
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{collection.name}</h1>
          {collection.description && (
            <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 ${collection.isFavorite ? "text-yellow-500" : "text-muted-foreground"}`}
            onClick={handleFavoriteToggle}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={collection.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              star
            </span>
            <span className="text-xs">Favorite</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => setEditOpen(true)}
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            <span className="text-xs">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            <span className="text-xs">Delete</span>
          </Button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No items in this collection yet.</p>
        </div>
      ) : itemTypes.includes("image") && !itemTypes.some((t) => t !== "image") ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ImageCard key={item.id} item={item} onItemClick={openDrawer} />
          ))}
        </div>
      ) : itemTypes.includes("file") && !itemTypes.some((t) => t !== "file") ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <FileRow key={item.id} item={item} onItemClick={openDrawer} />
          ))}
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
          {items.map((item) =>
            viewMode === "grid" ? (
              <ItemCard key={item.id} item={item} onItemClick={openDrawer} />
            ) : (
              <ListItem key={item.id} item={item} onItemClick={openDrawer} />
            )
          )}
        </div>
      )}
      {showViewToggle && items.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      )}
      <ItemDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        item={selectedItem}
        isLoading={isDrawerLoading}
        error={drawerError}
      />
      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collectionId={collection.id}
        collectionName={collection.name}
      />
    </div>
  );
}
