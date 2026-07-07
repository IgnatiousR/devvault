"use client";

import { useState } from "react";
import { ItemCard, ListItem } from "@/components/items/item-card";
import { ItemDrawer } from "@/components/items/item-drawer";
import { useItemDetail } from "@/hooks/use-item-detail";
import type { DashboardItem } from "@/types/dashboard";

function ViewToggle({ mode, onChange }: { mode: "grid" | "list"; onChange: (mode: "grid" | "list") => void }) {
  return (
    <div className="inline-flex items-center bg-muted/50 p-1 rounded-lg border border-border">
      <button
        onClick={() => onChange("grid")}
        className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wide rounded transition-colors ${
          mode === "grid"
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => onChange("list")}
        className={`px-3 py-1 text-[11px] font-medium uppercase tracking-wide rounded transition-colors ${
          mode === "list"
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        List
      </button>
    </div>
  );
}

interface ItemsListContentProps {
  typeName: string;
  items: DashboardItem[];
}

export function ItemsListContent({ typeName, items }: ItemsListContentProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { data: selectedItem, isLoading: isDrawerLoading, error: drawerError, open: openDrawer, close: closeDrawer, isOpen: isDrawerOpen } = useItemDetail();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight capitalize">{typeName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No items found for this type.</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
          {items.map(item => (
            viewMode === "grid" ? (
              <ItemCard key={item.id} item={item} onItemClick={openDrawer} />
            ) : (
              <ListItem key={item.id} item={item} onItemClick={openDrawer} />
            )
          ))}
        </div>
      )}
      <ItemDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        item={selectedItem}
        isLoading={isDrawerLoading}
        error={drawerError}
      />
    </div>
  );
}
