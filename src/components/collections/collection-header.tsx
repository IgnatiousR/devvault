"use client";

import { Button } from "@/components/ui/button";
import type { CollectionWithStats } from "@/types/dashboard";

interface CollectionHeaderProps {
  collection: CollectionWithStats;
  itemCount: number;
  onFavoriteToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CollectionHeader({
  collection,
  itemCount,
  onFavoriteToggle,
  onEdit,
  onDelete,
}: CollectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{collection.name}</h1>
        {collection.description && (
          <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 ${collection.isFavorite ? "text-yellow-500" : "text-muted-foreground"}`}
          onClick={onFavoriteToggle}
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
          onClick={onEdit}
        >
          <span className="material-symbols-outlined text-lg">edit</span>
          <span className="text-xs">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-destructive"
          onClick={onDelete}
        >
          <span className="material-symbols-outlined text-lg">delete</span>
          <span className="text-xs">Delete</span>
        </Button>
      </div>
    </div>
  );
}
