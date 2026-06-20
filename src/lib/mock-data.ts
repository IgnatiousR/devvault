// Import the dashboard types for alignment
import { Collection, Item, ItemType, User } from "./constants/types";

export const collections: Collection[] = [
  { id: "1", name: "Web Utilities", resourceCount: 12, isFavorite: true },
  { id: "2", name: "ML Prompts", resourceCount: 8, isFavorite: false },
  { id: "3", name: "CLI Tools", resourceCount: 5, isFavorite: true },
];

export const items: Item[] = [
  {
    id: "item-1",
    title: "Tailwind Config",
    description:
      "Enterprise level configuration including custom theme tokens for responsive layouts",
    itemType: ItemType.Snippet,
    collectionId: "1",
    tags: ["#tailwind", "#css"],
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    relativeTime: "2h ago",
  },
  {
    id: "item-2",
    title: "System Architect Prompt",
    description:
      "Specialized prompt for designing distributed microservices architecture",
    itemType: ItemType.Prompt,
    collectionId: "2",
    tags: ["#ml-prompts", "#architecture"],
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    relativeTime: "5h ago",
  },
  {
    id: "item-3",
    title: "Docker Cleanup",
    description:
      "Shell script to purge unused docker containers and dangling images",
    itemType: ItemType.Command,
    collectionId: "3",
    tags: ["#docker", "#bash"],
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    relativeTime: "Yesterday",
  },
  {
    id: "item-4",
    title: "React Query Notes",
    description:
      "Best practices for mutation handling and automatic query invalidation",
    itemType: ItemType.Note,
    collectionId: "1",
    tags: ["#react", "#javascript"],
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    relativeTime: "Sep 12",
  },
  {
    id: "item-5",
    title: "Design System Link",
    description:
      "Master Figma file for the corporate design system and UI components",
    itemType: ItemType.Link,
    collectionId: "1",
    tags: ["#ui", "#figma"],
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    relativeTime: "Sep 10",
  },
];

export const currentUser: User = {
  id: "user-1",
  name: "Alex Rivera",
  email: "alex.dev@devvault.com",
  image:
    "https://images.unsplash.com/photo-1472099645b8af2f34a0a95e950c25d?w=100&h=100&fit=crop",
  role: "user",
};

export const mockData: {
  user: User;
  collections: Collection[];
  items: Item[];
} = { user: currentUser, collections: collections, items: items };
