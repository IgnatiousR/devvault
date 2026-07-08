"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { updateItemAction, deleteItemAction } from "@/actions/items";
import type { ItemDetail } from "@/types/dashboard";

function getItemColorClasses(typeName: string) {
  const map: Record<string, { bg: string; text: string; iconBg: string }> = {
    Snippet: {
      bg: "bg-[var(--color-brand-red)]/10",
      text: "text-[var(--color-brand-red)]",
      iconBg: "bg-[var(--color-brand-red)]/20",
    },
    Prompt: {
      bg: "bg-orange-500/10",
      text: "text-orange-500",
      iconBg: "bg-orange-500/20",
    },
    Command: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      iconBg: "bg-amber-500/20",
    },
    Note: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      iconBg: "bg-yellow-500/20",
    },
    Link: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      iconBg: "bg-emerald-500/20",
    },
  };
  return (
    map[typeName] || {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      iconBg: "bg-blue-500/20",
    }
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const EDITABLE_TYPES = ["Snippet", "Prompt", "Command", "Note"];
const CODE_TYPES = ["Snippet", "Command"];
const LANGUAGE_TYPES = ["Snippet", "Command"];
const URL_TYPES = ["Link"];

function DrawerSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

interface ItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDetail | null;
  isLoading: boolean;
  error: string | null;
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
  const [editData, setEditData] = useState(() => ({
    title: item?.title || "",
    description: item?.description || "",
    content: item?.content || "",
    language: item?.language || "",
    url: item?.url || "",
    tags: item?.tags.join(", ") || "",
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
      });
    }
  }, [item, isEditing]);

  const handleCancel = () => {
    if (item) {
      setEditData({
        title: item.title,
        description: item.description || "",
        content: item.content || "",
        language: item.language || "",
        url: item.url || "",
        tags: item.tags.join(", "),
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

    const result = await updateItemAction({
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
    });

    setIsSaving(false);

    if (result.success) {
      toast.success("Item updated successfully");
      setIsEditing(false);
      router.refresh();
      onClose();
    } else {
      toast.error(result.error || "Failed to update item");
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
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
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

            {!isLoading && !error && item && (
              <>
                {/* Header: Icon + Title + Tags */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${colors?.iconBg} flex items-center justify-center shrink-0`}
                    >
                      <span
                        className={`material-symbols-outlined ${colors?.text}`}
                      >
                        {item.itemType.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <Input
                          value={editData.title}
                          onChange={(e) =>
                            setEditData({ ...editData, title: e.target.value })
                          }
                          className="text-lg font-bold h-auto py-0 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                          placeholder="Title"
                        />
                      ) : (
                        <SheetTitle className="text-lg font-bold leading-tight">
                          {item.title}
                        </SheetTitle>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs font-medium">
                          {item.itemType.name}
                        </span>
                        {!isEditing && item.language && (
                          <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs font-medium">
                            {item.language}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-6 pb-4 flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <span className="material-symbols-outlined text-lg">
                          close
                        </span>
                        <span className="text-xs">Cancel</span>
                      </Button>
                      <div className="flex-1" />
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={handleSave}
                        disabled={isSaving || !editData.title.trim()}
                      >
                        <span className="material-symbols-outlined text-lg">
                          check
                        </span>
                        <span className="text-xs">
                          {isSaving ? "Saving..." : "Save"}
                        </span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-1.5 ${item.isFavorite ? "text-yellow-500" : "text-muted-foreground"}`}
                      >
                        <span
                          className="material-symbols-outlined text-lg"
                          style={
                            item.isFavorite
                              ? { fontVariationSettings: "'FILL' 1" }
                              : undefined
                          }
                        >
                          star
                        </span>
                        <span className="text-xs">Favorite</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                      >
                        <span className="material-symbols-outlined text-lg">
                          push_pin
                        </span>
                        <span className="text-xs">Pin</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                      >
                        <span className="material-symbols-outlined text-lg">
                          content_copy
                        </span>
                        <span className="text-xs">Copy</span>
                      </Button>
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                        onClick={() => setIsEditing(true)}
                      >
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                        <span className="text-xs">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </Button>
                    </>
                  )}
                </div>

                <div className="border-t border-border" />

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">
                      Description
                    </h3>
                    {isEditing ? (
                      <Textarea
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        className="min-h-[80px] resize-none"
                        placeholder="Add a description..."
                      />
                    ) : item.description ? (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">
                        No description
                      </p>
                    )}
                  </div>

                  {/* Code Content */}
                  {EDITABLE_TYPES.includes(item.itemType.name) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-foreground">
                        Content
                      </h3>
                      {isEditing ? (
                        CODE_TYPES.includes(item.itemType.name) ? (
                          <CodeEditor
                            value={editData.content}
                            onChange={(v) =>
                              setEditData({
                                ...editData,
                                content: v,
                              })
                            }
                            language={item.language || "plaintext"}
                            placeholder="Add content..."
                          />
                        ) : (
                          <MarkdownEditor
                            value={editData.content}
                            onChange={(v) =>
                              setEditData({
                                ...editData,
                                content: v,
                              })
                            }
                            placeholder="Add content..."
                          />
                        )
                      ) : item.content ? (
                        CODE_TYPES.includes(item.itemType.name) ? (
                          <CodeEditor
                            value={item.content}
                            language={item.language || "plaintext"}
                            readOnly
                          />
                        ) : (
                          <MarkdownEditor
                            value={item.content}
                            readOnly
                          />
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground/50 italic">
                          No content
                        </p>
                      )}
                    </div>
                  )}

                  {/* Language */}
                  {LANGUAGE_TYPES.includes(item.itemType.name) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-foreground">
                        Language
                      </h3>
                      {isEditing ? (
                        <Input
                          value={editData.language}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              language: e.target.value,
                            })
                          }
                          placeholder="e.g., javascript, python"
                        />
                      ) : item.language ? (
                        <span className="text-sm text-muted-foreground">
                          {item.language}
                        </span>
                      ) : (
                        <p className="text-sm text-muted-foreground/50 italic">
                          No language
                        </p>
                      )}
                    </div>
                  )}

                  {/* URL */}
                  {URL_TYPES.includes(item.itemType.name) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-foreground">
                        URL
                      </h3>
                      {isEditing ? (
                        <Input
                          value={editData.url}
                          onChange={(e) =>
                            setEditData({ ...editData, url: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      ) : item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {item.url}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground/50 italic">
                          No URL
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-muted-foreground">
                        tag
                      </span>
                      <h3 className="text-sm font-medium text-foreground">
                        Tags
                      </h3>
                    </div>
                    {isEditing ? (
                      <Input
                        value={editData.tags}
                        onChange={(e) =>
                          setEditData({ ...editData, tags: e.target.value })
                        }
                        placeholder="Comma-separated tags"
                      />
                    ) : item.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">
                        No tags
                      </p>
                    )}
                  </div>

                  {/* Collections (read-only) */}
                  {item.collections.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-muted-foreground">
                          folder
                        </span>
                        <h3 className="text-sm font-medium text-foreground">
                          Collections
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.collections.map((collection) => (
                          <span
                            key={collection.id}
                            className="px-2.5 py-1 rounded bg-secondary text-secondary-foreground text-xs font-medium"
                          >
                            {collection.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Details (read-only) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-muted-foreground">
                        info
                      </span>
                      <h3 className="text-sm font-medium text-foreground">
                        Details
                      </h3>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span className="text-foreground">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated</span>
                        <span className="text-foreground">
                          {formatDate(item.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{item?.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
