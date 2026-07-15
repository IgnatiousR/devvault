"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getItemColorClasses } from "@/lib/item-helpers";
import { DrawerSkeleton } from "./drawer-skeleton";
import { DrawerHeader } from "./drawer-header";
import { DrawerActionBar } from "./drawer-action-bar";
import { DrawerContentSections } from "./drawer-content-sections";
import { DrawerDeleteDialog } from "./drawer-delete-dialog";
import { useDrawerState } from "./use-drawer-state";
import type { ItemDrawerProps } from "./types";

export function ItemDrawer({
  isOpen,
  onClose,
  item,
  isLoading,
  error,
}: ItemDrawerProps) {
  const colors = item ? getItemColorClasses(item.itemType.name) : null;
  const {
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
    itemWithFavorite,
    itemWithPin,
  } = useDrawerState(item, onClose);

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
          className="w-full sm:w-150 data-[side=right]:sm:max-w-150 p-0 gap-0"
          showCloseButton={!isEditing}
        >
          <div key={item?.id || "no-item"} className="flex-1 overflow-y-auto">
            {isLoading && <DrawerSkeleton />}

            {error && (
              <div className="p-6 text-center text-destructive">
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && item && colors && (
              <>
                <DrawerHeader
                  item={itemWithFavorite ?? item}
                  colors={colors}
                  isEditing={isEditing}
                  editData={editData}
                  setEditData={setEditData}
                />

                <DrawerActionBar
                  item={itemWithPin ?? itemWithFavorite ?? item}
                  isEditing={isEditing}
                  isSaving={isSaving}
                  editTitle={editData.title}
                  onEdit={() => setIsEditing(true)}
                  onCancel={handleCancel}
                  onSave={handleSave}
                  onDelete={() => setIsDeleteDialogOpen(true)}
                  onToggleFavorite={handleToggleFavorite}
                  onTogglePin={handleTogglePin}
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
