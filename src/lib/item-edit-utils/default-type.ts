import { ITEM_TYPE_OPTIONS } from "@/lib/item-types";

export function getDefaultType(pathname: string): string {
  const match = pathname.match(/^\/items\/([^/]+)/);
  if (match) {
    const routeType = match[1];
    if (ITEM_TYPE_OPTIONS.some((t) => t.id === routeType)) {
      return routeType;
    }
  }
  return "snippet";
}
