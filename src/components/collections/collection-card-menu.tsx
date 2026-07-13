"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog";
import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog";
import { toggleCollectionFavoriteAction } from "@/actions/collections";
import { toast } from "sonner";
import type { CollectionWithStats } from "@/types/dashboard";

interface CollectionCardMenuProps {
  collection: CollectionWithStats;
  onFavoriteToggle?: (isFavorite: boolean) => void;
}

export function CollectionCardMenu({ collection, onFavoriteToggle }: CollectionCardMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await toggleCollectionFavoriteAction({ id: collection.id });

    if (result.success) {
      toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
      onFavoriteToggle?.(result.isFavorite ?? false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update favorite");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <span className="material-symbols-outlined text-muted-foreground hover:text-foreground transition-colors">
            more_vert
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} destructive>
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFavorite}>
            <span
              className="material-symbols-outlined text-sm"
              style={collection.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              star
            </span>
            {collection.isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  );
}
