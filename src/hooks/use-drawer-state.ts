"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateItemAction, deleteItemAction, toggleItemFavoriteAction, toggleItemPinAction } from "@/actions/items";
import { updateItemCollectionsAction } from "@/actions/collections";
import { buildEditDataFromItem, buildItemEditPayload } from "@/lib/item-edit-utils";
import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "@/components/items/drawer/types";

interface Collection {
  id: string;
  name: string;
}

export function useDrawerState(
  item: ItemDetail | null,
  onClose: () => void
) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isFavorite, setIsFavorite] = useState(item?.isFavorite ?? false);
  const [isPinned, setIsPinned] = useState(item?.isPinned ?? false);
  const [editData, setEditData] = useState<EditData>(() =>
    item ? buildEditDataFromItem(item) : {
      title: "",
      description: "",
      content: "",
      language: "",
      url: "",
      tags: "",
      collections: [],
    }
  );

  useEffect(() => {
    if (item) {
      setIsFavorite(item.isFavorite);
      setIsPinned(item.isPinned);
      fetch("/api/collections")
        .then((res) => res.json())
        .then((data) => setCollections(data))
        .catch(() => setCollections([]));
    }
  }, [item]);

  useEffect(() => {
    if (item && !isEditing) {
      setEditData(buildEditDataFromItem(item));
    }
  }, [item, isEditing]);

  const handleCancel = () => {
    if (item) {
      setEditData(buildEditDataFromItem(item));
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!item) return;

    setIsSaving(true);

    const payload = buildItemEditPayload(item, editData);

    const [itemResult, collectionsResult] = await Promise.all([
      updateItemAction(payload),
      updateItemCollectionsAction({
        itemId: item.id,
        collectionIds: editData.collections,
      }),
    ]);

    setIsSaving(false);

    if (itemResult.success && collectionsResult.success) {
      toast.success("Item updated successfully");
      setIsEditing(false);
      router.refresh();
      onClose();
    } else {
      toast.error(itemResult.error || collectionsResult.error || "Failed to update item");
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    setIsDeleting(true);
    const result = await deleteItemAction({ id: item.id });
    setIsDeleting(false);

    if (result.success) {
      toast.success("Item deleted successfully");
      setIsDeleteDialogOpen(false);
      router.refresh();
      onClose();
    } else {
      toast.error(result.error || "Failed to delete item");
    }
  };

  const handleToggleFavorite = async () => {
    if (!item) return;

    const result = await toggleItemFavoriteAction({ id: item.id });

    if (result.success) {
      setIsFavorite(result.isFavorite ?? false);
      toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update favorite");
    }
  };

  const handleTogglePin = async () => {
    if (!item) return;

    const result = await toggleItemPinAction({ id: item.id });

    if (result.success) {
      setIsPinned(result.isPinned ?? false);
      toast.success(result.isPinned ? "Item pinned" : "Item unpinned");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update pin");
    }
  };

  const handleCopy = async () => {
    if (!item) return;

    const textToCopy = item.content || item.url || item.fileUrl || "";
    if (!textToCopy) {
      toast.error("Nothing to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const itemWithFavorite = item ? { ...item, isFavorite } : null;
  const itemWithPin = item ? { ...item, isPinned } : null;

  return {
    editData,
    setEditData,
    isEditing,
    setIsEditing,
    isSaving,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    collections,
    handleCancel,
    handleSave,
    handleDelete,
    handleToggleFavorite,
    handleTogglePin,
    handleCopy,
    itemWithFavorite,
    itemWithPin,
  };
}
