"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateItemAction, deleteItemAction } from "@/actions/items";
import { updateItemCollectionsAction } from "@/actions/collections";
import {
  EDITABLE_TYPES,
  LANGUAGE_TYPES,
  URL_TYPES,
} from "@/lib/item-types";
import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "./types";

interface Collection {
  id: string;
  name: string;
}

function buildItemEditPayload(item: ItemDetail, editData: EditData) {
  const tagsArray = editData.tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return {
    itemId: item.id,
    title: editData.title,
    description: editData.description || null,
    content: EDITABLE_TYPES.includes(item.itemType.name)
      ? editData.content || null
      : undefined,
    language: LANGUAGE_TYPES.includes(item.itemType.name)
      ? editData.language || null
      : undefined,
    url: URL_TYPES.includes(item.itemType.name)
      ? editData.url || null
      : undefined,
    tags: tagsArray,
  };
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
  const [editData, setEditData] = useState<EditData>(() => ({
    title: item?.title || "",
    description: item?.description || "",
    content: item?.content || "",
    language: item?.language || "",
    url: item?.url || "",
    tags: item?.tags.join(", ") || "",
    collections: item?.collections.map((c) => c.id) || [],
  }));

  useEffect(() => {
    if (item && !isEditing) {
      setEditData({
        title: item.title,
        description: item.description || "",
        content: item.content || "",
        language: item.language || "",
        url: item.url || "",
        tags: item.tags.join(", "),
        collections: item.collections.map((c) => c.id),
      });
    }
  }, [item, isEditing]);

  useEffect(() => {
    if (item) {
      fetch("/api/collections")
        .then((res) => res.json())
        .then((data) => setCollections(data))
        .catch(() => setCollections([]));
    }
  }, [item]);

  const handleCancel = () => {
    if (item) {
      setEditData({
        title: item.title,
        description: item.description || "",
        content: item.content || "",
        language: item.language || "",
        url: item.url || "",
        tags: item.tags.join(", "),
        collections: item.collections.map((c) => c.id),
      });
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
    const result = await deleteItemAction({ itemId: item.id });
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
  };
}
