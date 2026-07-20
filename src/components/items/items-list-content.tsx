"use client";

import { useState } from "react";
import { ItemCard, ListItem } from "@/components/items/item-card";
import { ImageCard } from "@/components/items/image-card";
import { FileRow } from "@/components/items/file-row";
import { ItemDrawer } from "@/components/items/drawer";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { useItemDetail } from "@/hooks/use-item-detail";
import { useAiAccess } from "@/hooks/use-ai-access";
import type { DashboardItem } from "@/types/dashboard";

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

interface ItemsListContentProps {
  typeName: string;
  items: DashboardItem[];
  currentPage: number;
  totalPages: number;
}

const FIXED_LAYOUT_TYPES = ["image", "file"];

export function ItemsListContent({ typeName, items, currentPage, totalPages }: ItemsListContentProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { data: selectedItem, isLoading: isDrawerLoading, error: drawerError, open: openDrawer, close: closeDrawer, isOpen: isDrawerOpen } = useItemDetail();
  const aiAccess = useAiAccess();
  const showViewToggle = !FIXED_LAYOUT_TYPES.includes(typeName.toLowerCase());

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight capitalize">{typeName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        {showViewToggle && <ViewToggle mode={viewMode} onChange={setViewMode} />}
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No items found for this type.</p>
        </div>
      ) : typeName.toLowerCase() === "image" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <ImageCard key={item.id} item={item} onItemClick={openDrawer} />
          ))}
        </div>
      ) : typeName.toLowerCase() === "file" ? (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <FileRow key={item.id} item={item} onItemClick={openDrawer} />
          ))}
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/items/${typeName}`}
      />
      <ItemDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        item={selectedItem}
        isLoading={isDrawerLoading}
        error={drawerError}
        aiAccess={aiAccess}
      />
    </div>
  );
}
