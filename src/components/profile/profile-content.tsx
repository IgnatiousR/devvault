"use client"

import { useState } from "react"
import { useProfile } from "@/hooks/use-profile"
import { ProfileContentSkeleton } from "@/components/ui/dashboard-skeletons"
import { Button } from "@/components/ui/button"
import { Key, Trash } from "@phosphor-icons/react"
import { ProfileUserInfo } from "./profile-user-info"
import { ProfileStats } from "./profile-stats"
import { ProfileItemTypes } from "./profile-item-types"
import { ChangePasswordDialog } from "./change-password-dialog"
import { DeleteAccountDialog } from "./delete-account-dialog"

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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)

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

      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Account Actions</h2>
        <div className="flex flex-wrap gap-4">
          {user.hasPassword && (
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(true)}
              className="flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Change Password
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => setIsDeleteAccountOpen(true)}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash className="w-4 h-4" />
            Delete Account
          </Button>
        </div>
      </section>

      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />

      <DeleteAccountDialog
        open={isDeleteAccountOpen}
        onOpenChange={setIsDeleteAccountOpen}
        userEmail={user.email}
      />
    </div>
  )
}
