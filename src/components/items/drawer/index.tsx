"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { updateItemAction, deleteItemAction } from "@/actions/items";
import { updateItemCollectionsAction } from "@/actions/collections";
import { getItemColorClasses } from "@/lib/item-helpers";
import {
  EDITABLE_TYPES,
  LANGUAGE_TYPES,
  URL_TYPES,
} from "@/lib/item-types";
import { DrawerSkeleton } from "./drawer-skeleton";
import { DrawerHeader } from "./drawer-header";
import { DrawerActionBar } from "./drawer-action-bar";
import { DrawerContentSections } from "./drawer-content-sections";
import { DrawerDeleteDialog } from "./drawer-delete-dialog";
import type { ItemDrawerProps, EditData } from "./types";

interface Collection {
  id: string;
  name: string;
}

export function ItemDrawer({
  isOpen,
  onClose,
  item,
  isLoading,
  error,
}: ItemDrawerProps) {
  const router = useRouter();
  const colors = item ? getItemColorClasses(item.itemType.name) : null;
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
    if (isOpen) {
      fetch("/api/collections")
        .then((res) => res.json())
        .then((data) => setCollections(data))
        .catch(() => setCollections([]));
    }
  }, [isOpen]);

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
    const tagsArray = editData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const [itemResult, collectionsResult] = await Promise.all([
      updateItemAction({
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
      }),
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

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          onClose();
        }
      }}>
        <SheetContent
          side="right"
          className="w-full sm:w-[600px] data-[side=right]:sm:max-w-[600px] p-0 gap-0"
          showCloseButton={!isEditing}
        >
          <div className="flex-1 overflow-y-auto">
            {isLoading && <DrawerSkeleton />}

            {error && (
              <div className="p-6 text-center text-destructive">
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && item && colors && (
              <>
                <DrawerHeader
                  item={item}
                  colors={colors}
                  isEditing={isEditing}
                  editData={editData}
                  setEditData={setEditData}
                />

                <DrawerActionBar
                  item={item}
                  isEditing={isEditing}
                  isSaving={isSaving}
                  editTitle={editData.title}
                  onEdit={() => setIsEditing(true)}
                  onCancel={handleCancel}
                  onSave={handleSave}
                  onDelete={() => setIsDeleteDialogOpen(true)}
                />

                <div className="border-t border-border" />

                <DrawerContentSections
                  item={item}
                  isEditing={isEditing}
                  editData={editData}
                  setEditData={setEditData}
                  collections={collections}
                />
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {item && (
        <DrawerDeleteDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          itemTitle={item.title}
          isDeleting={isDeleting}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
