import { ITEMS_PER_PAGE } from "@/lib/constants";

export interface ItemTypeRef {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function parsePagination(
  options?: { page?: number; limit?: number },
  defaultLimit: number = ITEMS_PER_PAGE
) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? defaultLimit;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}


