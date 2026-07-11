import type { ItemDetail } from "@/types/dashboard";

export interface EditData {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
  collections: string[];
}

export interface ItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDetail | null;
  isLoading: boolean;
  error: string | null;
}
