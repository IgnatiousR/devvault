"use client"

import { useProfile } from "@/hooks/use-profile"
import { ProfileContentSkeleton } from "@/components/ui/dashboard-skeletons"
import { Button } from "@/components/ui/button"
import { ProfileUserInfo } from "./profile-user-info"
import { ProfileStats } from "./profile-stats"
import { ProfileItemTypes } from "./profile-item-types"

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return email[0].toUpperCase()
}

export function ProfileContent() {
  const { data: profile, isLoading, error, refetch } = useProfile()

  if (isLoading) {
    return <ProfileContentSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const { user, stats } = profile
  const initials = getInitials(user.name, user.email)
  const creationDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-8">
      <ProfileUserInfo user={user} initials={initials} creationDate={creationDate} />
      
      <ProfileStats totalItems={stats.totalItems} totalCollections={stats.totalCollections} />
      
      <ProfileItemTypes itemTypes={stats.itemTypeBreakdown} />
    </div>
  )
}
