"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ItemDrawer } from "@/components/items/drawer";
import { useItemDetail } from "@/hooks/use-item-detail";
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog";
import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog";
import { toggleCollectionFavoriteAction } from "@/actions/collections";
import { toast } from "sonner";
import type { DashboardItem, CollectionWithStats } from "@/types/dashboard";
import { CollectionHeader } from "./collection-header";
import { CollectionItemsGrid } from "./collection-items-grid";

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
      <CollectionHeader
        collection={collection}
        itemCount={items.length}
        onFavoriteToggle={handleFavoriteToggle}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />
      <CollectionItemsGrid
        items={items}
        itemTypes={itemTypes}
        viewMode={viewMode}
        showViewToggle={showViewToggle}
        onViewModeChange={setViewMode}
        onItemClick={openDrawer}
      />
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
