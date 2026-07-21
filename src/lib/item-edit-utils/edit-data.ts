import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "@/components/items/drawer/types";

export function buildEditDataFromItem(item: ItemDetail): EditData {
  return {
    title: item.title,
    description: item.description || "",
    content: item.content || "",
    language: item.language || "",
    url: item.url || "",
    tags: item.tags.join(", "),
    collections: item.collections.map((c) => c.id),
  };
}
