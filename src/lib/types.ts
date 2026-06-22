export const Prompt = "Prompt" as const;
export const Command = "Command" as const;
export const Note = "Note" as const;
export const Link = "Link" as const;
export const Snippet = "Snippet" as const;

export interface Item {
  id: string;
  title: string;
  description: string;
  itemType: ItemType;
  collectionId: string;
  tags: string[];
  updatedAt: Date;
  relativeTime: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  role: "admin" | "user";
}

export interface Collection {
  id: string;
  name: string;
  resourceCount: number;
  isFavorite?: boolean;
}

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
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  role: "admin" | "user";
}
