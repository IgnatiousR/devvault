"use client";

import { ItemCard, ListItem } from "@/components/items/item-card";
import { ImageCard } from "@/components/items/image-card";
import { FileRow } from "@/components/items/file-row";
import { ViewToggle } from "@/components/ui/view-toggle";
import type { DashboardItem } from "@/types/dashboard";

interface CollectionItemsGridProps {
  items: DashboardItem[];
  itemTypes: string[];
  viewMode: "grid" | "list";
  showViewToggle: boolean;
  onViewModeChange: (mode: "grid" | "list") => void;
  onItemClick: (itemId: string) => void;
}

export function CollectionItemsGrid({
  items,
  itemTypes,
  viewMode,
  showViewToggle,
  onViewModeChange,
  onItemClick,
}: CollectionItemsGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No items in this collection yet.</p>
      </div>
    );
  }

  if (itemTypes.includes("image") && !itemTypes.some((t) => t !== "image")) {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ImageCard key={item.id} item={item} onItemClick={onItemClick} />
          ))}
        </div>
      </>
    );
  }

  if (itemTypes.includes("file") && !itemTypes.some((t) => t !== "file")) {
    return (
      <>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <FileRow key={item.id} item={item} onItemClick={onItemClick} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
        {items.map((item) =>
          viewMode === "grid" ? (
            <ItemCard key={item.id} item={item} onItemClick={onItemClick} />
          ) : (
            <ListItem key={item.id} item={item} onItemClick={onItemClick} />
          )
        )}
      </div>
      {showViewToggle && (
        <div className="fixed bottom-6 right-6">
          <ViewToggle mode={viewMode} onChange={onViewModeChange} />
        </div>
      )}
    </>
  );
}
