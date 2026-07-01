"use client"

import { useState, useEffect } from "react"
import { ProfileData } from "@/types/profile"

interface UseProfileReturn {
  data: ProfileData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useProfile(): UseProfileReturn {
  const [data, setData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/profile")

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const profileData = await response.json()
      setData(profileData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      await fetchProfile()
    }

    load()

    return () => {
      controller.abort()
    }
  }, [])

  const refetch = () => {
    fetchProfile()
  }

  return { data, isLoading, error, refetch }
}