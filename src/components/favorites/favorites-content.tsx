"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ItemDrawer } from "@/components/items/drawer";
import { useItemDetail } from "@/hooks/use-item-detail";
import { useAiAccess } from "@/hooks/use-ai-access";
import { getColorTextClass, getColorBgAlphaClass } from "@/lib/color-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { DashboardItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/collections";

interface FavoritesContentProps {
  items: DashboardItem[];
  collections: FavoriteCollection[];
}

type SortOption = "newest" | "oldest" | "alpha-asc" | "alpha-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alpha-asc", label: "A → Z" },
  { value: "alpha-desc", label: "Z → A" },
];

function sortItems(items: DashboardItem[], sort: SortOption): DashboardItem[] {
  const sorted = [...items];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case "oldest":
      return sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    case "alpha-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "alpha-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return sorted;
  }
}

function sortCollections(collections: FavoriteCollection[], sort: SortOption): FavoriteCollection[] {
  const sorted = [...collections];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case "oldest":
      return sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    case "alpha-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "alpha-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function ItemRow({
  item,
  onClick,
}: {
  item: DashboardItem;
  onClick: () => void;
}) {
  const iconColorClass = getColorTextClass(item.itemType.color);
  const badgeBgClass = getColorBgAlphaClass(item.itemType.color);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent/50 transition-colors group"
    >
      <span
        className={`material-symbols-outlined text-sm shrink-0 ${iconColorClass}`}
      >
        {item.itemType.icon}
      </span>
      <span className="text-sm font-medium text-foreground truncate flex-1 font-mono">
        {item.title}
      </span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${badgeBgClass} ${iconColorClass}`}>
        {item.itemType.name}
      </span>
      <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">
        {formatDate(item.updatedAt)}
      </span>
    </button>
  );
}

function CollectionRow({
  collection,
}: {
  collection: FavoriteCollection;
}) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent/50 transition-colors group"
    >
      <span className="material-symbols-outlined text-sm shrink-0 text-muted-foreground">
        folder
      </span>
      <span className="text-sm font-medium text-foreground truncate flex-1 font-mono">
        {collection.name}
      </span>
      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider bg-muted text-muted-foreground">
        {collection.resourceCount} items
      </span>
      <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">
        {formatDate(collection.updatedAt)}
      </span>
    </Link>
  );
}

function SortSelect({
  value,
  onValueChange,
}: {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
    >
      <SelectTrigger size="sm" className="h-6 text-xs">
        {SORT_OPTIONS.find((o) => o.value === value)?.label}
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FavoritesContent({ items, collections }: FavoritesContentProps) {
  const { data: selectedItem, isLoading, error, open, close, isOpen } = useItemDetail();
  const aiAccess = useAiAccess();
  const [itemSort, setItemSort] = useState<SortOption>("newest");
  const [collectionSort, setCollectionSort] = useState<SortOption>("newest");

  const sortedItems = useMemo(() => sortItems(items, itemSort), [items, itemSort]);
  const sortedCollections = useMemo(() => sortCollections(collections, collectionSort), [collections, collectionSort]);

  if (items.length === 0 && collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-4xl text-muted-foreground/50 mb-4">
          star
        </span>
        <h3 className="text-sm font-medium text-foreground mb-1">
          No favorites yet
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          Star items and collections to see them here. Click the star icon on any
          item or collection to add it to your favorites.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {items.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 px-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-muted-foreground">
                  star
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Items
                </h2>
                <span className="text-xs text-muted-foreground/60">
                  {items.length}
                </span>
              </div>
              <SortSelect value={itemSort} onValueChange={setItemSort} />
            </div>
            <div className="border border-border rounded-md divide-y divide-border">
              {sortedItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onClick={() => open(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {collections.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 px-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-muted-foreground">
                  folder
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Collections
                </h2>
                <span className="text-xs text-muted-foreground/60">
                  {collections.length}
                </span>
              </div>
              <SortSelect value={collectionSort} onValueChange={setCollectionSort} />
            </div>
            <div className="border border-border rounded-md divide-y divide-border">
              {sortedCollections.map((collection) => (
                <CollectionRow key={collection.id} collection={collection} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ItemDrawer
        isOpen={isOpen}
        onClose={close}
        item={selectedItem}
        isLoading={isLoading}
        error={error}
        aiAccess={aiAccess}
      />
    </>
  );
}
