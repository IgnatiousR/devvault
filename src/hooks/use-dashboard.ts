"use client";

import { useState, useEffect } from "react";
import type { DashboardData } from "@/types/dashboard";

interface UseDashboardResult {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const result = await response.json();
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred");
          setIsLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
