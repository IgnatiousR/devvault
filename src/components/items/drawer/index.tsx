"use client";

import { useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getItemColorClasses } from "@/lib/item-helpers";
import { DrawerSkeleton } from "./drawer-skeleton";
import { DrawerHeader } from "./drawer-header";
import { DrawerActionBar } from "./drawer-action-bar";
import { DrawerContentSections } from "./drawer-content-sections";
import { DrawerDeleteDialog } from "./drawer-delete-dialog";
import { useDrawerState } from "@/hooks/use-drawer-state";
import { useAutoTags } from "@/hooks/use-auto-tags";
import { useAutoDescription } from "@/hooks/use-auto-description";
import { parseTags } from "@/lib/item-helpers";
import type { ItemDrawerProps } from "./types";

function DrawerError({ error }: { error: string }) {
  return (
    <div className="p-6 text-center text-destructive">
      <p>{error}</p>
    </div>
  );
}

function DrawerContent({
  item,
  itemWithFavorite,
  itemWithPin,
  colors,
  isEditing,
  editData,
  setEditData,
  isSaving,
  collections,
  aiAccess,
  isSuggesting,
  suggestions,
  isGeneratingDescription,
  handleCancel,
  handleSave,
  handleToggleFavorite,
  handleTogglePin,
  handleCopy,
  handleSuggestTags,
  handleAcceptTag,
  handleRejectTag,
  handleGenerateDescription,
  setIsEditing,
  onDelete,
}: {
  item: NonNullable<ItemDrawerProps["item"]>;
  itemWithFavorite: ReturnType<typeof useDrawerState>["itemWithFavorite"];
  itemWithPin: ReturnType<typeof useDrawerState>["itemWithPin"];
  colors: ReturnType<typeof getItemColorClasses>;
  isEditing: boolean;
  editData: ReturnType<typeof useDrawerState>["editData"];
  setEditData: ReturnType<typeof useDrawerState>["setEditData"];
  isSaving: boolean;
  collections: ReturnType<typeof useDrawerState>["collections"];
  aiAccess: boolean;
  isSuggesting: boolean;
  suggestions: string[];
  isGeneratingDescription: boolean;
  handleCancel: () => void;
  handleSave: () => void;
  handleToggleFavorite: () => void;
  handleTogglePin: () => void;
  handleCopy: () => void;
  handleSuggestTags: () => void;
  handleAcceptTag: (tag: string) => void;
  handleRejectTag: (tag: string) => void;
  handleGenerateDescription: () => void;
  setIsEditing: (v: boolean) => void;
  onDelete: () => void;
}) {
  return (
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
        onCancel={() => { handleCancel(); }}
        onSave={handleSave}
        onDelete={onDelete}
        onToggleFavorite={handleToggleFavorite}
        onTogglePin={handleTogglePin}
        onCopy={handleCopy}
      />
      <div className="border-t border-border" />
      <DrawerContentSections
        item={item}
        isEditing={isEditing}
        editData={editData}
        setEditData={setEditData}
        collections={collections}
        aiAccess={aiAccess}
        isSuggesting={isSuggesting}
        suggestions={suggestions}
        onSuggestTags={handleSuggestTags}
        onAcceptSuggestion={handleAcceptTag}
        onRejectSuggestion={handleRejectTag}
        isGeneratingDescription={isGeneratingDescription}
        onGenerateDescription={handleGenerateDescription}
      />
    </>
  );
}

export function ItemDrawer({
  isOpen,
  onClose,
  item,
  isLoading,
  error,
  aiAccess,
}: ItemDrawerProps) {
  const colors = item ? getItemColorClasses(item.itemType.name) : null;
  const drawerState = useDrawerState(item, onClose);
  const {
    isSuggesting,
    suggestions,
    suggestTags,
    removeTag,
    clearSuggestions,
  } = useAutoTags();
  const {
    isGenerating: isGeneratingDescription,
    generate,
  } = useAutoDescription();

  useEffect(() => {
    clearSuggestions();
  }, [item?.id, drawerState.isEditing, clearSuggestions]);

  const handleSuggestTags = () => {
    suggestTags({
      title: drawerState.editData.title,
      content: drawerState.editData.content || undefined,
      itemType: item?.itemType.name,
      existingTags: parseTags(drawerState.editData.tags),
    });
  };

  const handleAcceptTag = (tag: string) => {
    removeTag(tag);
    const currentTags = parseTags(drawerState.editData.tags);
    if (!currentTags.includes(tag)) {
      drawerState.setEditData({
        ...drawerState.editData,
        tags: drawerState.editData.tags ? `${drawerState.editData.tags}, ${tag}` : tag,
      });
    }
  };

  const handleGenerateDescription = async () => {
    const description = await generate({
      title: drawerState.editData.title,
      content: drawerState.editData.content || undefined,
      itemType: item?.itemType.name,
      language: drawerState.editData.language || undefined,
      url: drawerState.editData.url || undefined,
      tags: parseTags(drawerState.editData.tags),
    });
    if (description) {
      drawerState.setEditData({ ...drawerState.editData, description });
    }
  };

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            drawerState.setIsEditing(false);
            clearSuggestions();
            onClose();
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-150 data-[side=right]:sm:max-w-150 p-0 gap-0"
          showCloseButton={!drawerState.isEditing}
        >
          <div key={item?.id || "no-item"} className="flex-1 overflow-y-auto">
            {isLoading && <DrawerSkeleton />}
            {error && <DrawerError error={error} />}
            {!isLoading && !error && item && colors && (
              <DrawerContent
                item={item}
                itemWithFavorite={drawerState.itemWithFavorite}
                itemWithPin={drawerState.itemWithPin}
                colors={colors}
                isEditing={drawerState.isEditing}
                editData={drawerState.editData}
                setEditData={drawerState.setEditData}
                isSaving={drawerState.isSaving}
                collections={drawerState.collections}
                aiAccess={aiAccess ?? false}
                isSuggesting={isSuggesting}
                suggestions={suggestions}
                isGeneratingDescription={isGeneratingDescription}
                handleCancel={drawerState.handleCancel}
                handleSave={drawerState.handleSave}
                handleToggleFavorite={drawerState.handleToggleFavorite}
                handleTogglePin={drawerState.handleTogglePin}
                handleCopy={drawerState.handleCopy}
                handleSuggestTags={handleSuggestTags}
                handleAcceptTag={handleAcceptTag}
                handleRejectTag={removeTag}
                handleGenerateDescription={handleGenerateDescription}
                setIsEditing={drawerState.setIsEditing}
                onDelete={() => drawerState.setIsDeleteDialogOpen(true)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      {item && (
        <DrawerDeleteDialog
          isOpen={drawerState.isDeleteDialogOpen}
          onOpenChange={drawerState.setIsDeleteDialogOpen}
          itemTitle={item.title}
          isDeleting={drawerState.isDeleting}
          onDelete={drawerState.handleDelete}
        />
      )}
    </>
  );
}
