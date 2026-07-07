"use client";

import { useState, useEffect, useCallback } from "react";
import type { ItemDetail } from "@/types/dashboard";

interface UseItemDetailResult {
  data: ItemDetail | null;
  isLoading: boolean;
  error: string | null;
  open: (itemId: string) => void;
  close: () => void;
  isOpen: boolean;
  itemId: string | null;
}

export function useItemDetail(): UseItemDetailResult {
  const [data, setData] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);

  const fetchItem = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const open = useCallback((id: string) => {
    setItemId(id);
    setIsOpen(true);
    fetchItem(id);
  }, [fetchItem]);

  const close = useCallback(() => {
    setIsOpen(false);
    setItemId(null);
    setData(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      setData(null);
      setError(null);
    };
  }, []);

  return { data, isLoading, error, open, close, isOpen, itemId };
}
