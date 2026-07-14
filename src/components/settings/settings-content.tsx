"use client"

import { useState } from "react"
import Link from "next/link"
import { useProfile } from "@/hooks/use-profile"
import { ProfileContentSkeleton } from "@/components/ui/dashboard-skeletons"
import { Button } from "@/components/ui/button"
import { Key, Trash, Warning } from "@phosphor-icons/react"
import { UserAvatar } from "@/components/auth/user-avatar"
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog"
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog"

export function SettingsContent() {
  const { data: profile, isLoading, error, refetch } = useProfile()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)

  if (isLoading) {
    return <ProfileContentSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load settings: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const { user } = profile

  return (
    <div className="space-y-8">
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Account
        </h2>
        <div className="flex items-center gap-4">
          <UserAvatar user={user} className="w-16 h-16 rounded-xl" />
          <div>
            <p className="text-lg font-medium text-foreground">
              {user.name || "No name set"}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.isPro && (
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-brand-red/10 text-brand-red">
                Pro
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Account Actions
        </h2>
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

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <Warning className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Need to reset your password?{" "}
              <Link
                href="/forgot-password"
                className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
              >
                Reset password
              </Link>
            </p>
          </div>
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
