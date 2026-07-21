"use client";

import { useFetch } from "@/hooks/use-fetch";
import type { ProfileData } from "@/types/profile";

export function useAiAccess() {
  const { data } = useFetch<ProfileData>("/api/profile");
  return data?.user?.isPro ?? false;
}
