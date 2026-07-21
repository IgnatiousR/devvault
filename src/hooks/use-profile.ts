"use client"

import { ProfileData } from "@/types/profile"
import { useFetch } from "@/hooks/use-fetch"

interface UseProfileReturn {
  data: ProfileData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useProfile(): UseProfileReturn {
  const { data, isLoading, error, refetch } = useFetch<ProfileData>("/api/profile");
  return { data, isLoading, error, refetch };
}