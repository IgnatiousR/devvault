import { parseTags, shouldIncludeContent, hasLanguage, isUrlType } from "@/lib/item-helpers";
import { ITEM_TYPE_OPTIONS } from "@/lib/item-types";
import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "@/components/items/drawer/types";

export function buildItemEditPayload(item: ItemDetail, editData: EditData) {
  return {
    itemId: item.id,
    title: editData.title,
    description: editData.description || null,
    content: shouldIncludeContent(item.itemType.name)
      ? editData.content || null
      : undefined,
    language: hasLanguage(item.itemType.name)
      ? editData.language || null
      : undefined,
    url: isUrlType(item.itemType.name)
      ? editData.url || null
      : undefined,
    tags: parseTags(editData.tags),
  };
}

export function buildItemCreatePayload(
  selectedType: string,
  title: string,
  description: string,
  content: string,
  language: string,
  url: string,
  tags: string,
  uploadedFile: { fileUrl: string; fileName: string; fileSize: number } | null,
  selectedCollectionIds: string[]
) {
  const itemType = ITEM_TYPE_OPTIONS.find((t) => t.id === selectedType);

  return {
    title,
    description: description || null,
    content: shouldIncludeContent(selectedType) ? content || null : null,
    language: hasLanguage(selectedType) ? language || null : null,
    url: isUrlType(selectedType) ? url || null : null,
    fileUrl: uploadedFile?.fileUrl || null,
    fileName: uploadedFile?.fileName || null,
    fileSize: uploadedFile?.fileSize || null,
    tags: parseTags(tags),
    itemTypeId: itemType?.id || "snippet",
    collectionIds: selectedCollectionIds,
  };
}
