"use client";

import { ItemCard, ListItem } from "@/components/items/item-card";
import { ImageCard } from "@/components/items/image-card";
import { FileRow } from "@/components/items/file-row";
import { Button } from "@/components/ui/button";
import type { DashboardItem } from "@/types/dashboard";

interface CollectionItemsGridProps {
  items: DashboardItem[];
  itemTypes: string[];
  viewMode: "grid" | "list";
  showViewToggle: boolean;
  onViewModeChange: (mode: "grid" | "list") => void;
  onItemClick: (itemId: string) => void;
}

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
