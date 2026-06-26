export interface DashboardUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface DashboardItemType {
  name: string;
  icon: string;
  color: string;
}

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  itemType: DashboardItemType;
  tags: string[];
  updatedAt: string;
  collectionName: string | null;
}

export interface ItemTypeCount {
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface CollectionWithStats {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  resourceCount: number;
  mostUsedType: DashboardItemType | null;
  typeIcons: { icon: string; color: string }[];
}

export interface DashboardData {
  user: DashboardUser;
  collections: CollectionWithStats[];
  pinnedItems: DashboardItem[];
  recentItems: DashboardItem[];
  itemCounts: {
    totalItems: number;
    favoriteItems: number;
  };
  itemTypesByCount: ItemTypeCount[];
  favoriteCollections: number;
  totalCollections: number;
}
