export enum ItemType {
  Snippet = "Snippet",
  Prompt = "Prompt",
  Command = "Command",
  Note = "Note",
  Link = "Link",
}

export interface Collection {
  id: string;
  name: string;
  resourceCount: number;
  isFavorite?: boolean;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  itemType: ItemType;
  collectionId: string;
  tags: string[];
  updatedAt: Date;
  relativeTime: string;
  typeColor?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  role: "admin" | "user";
}
