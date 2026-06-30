"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import { useProfile } from "@/hooks/use-profile"
import { ProfileContentSkeleton } from "@/components/ui/dashboard-skeletons"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { 
  Key, 
  Trash, 
  Calendar, 
  Envelope,
  ShieldCheck,
  Warning
} from "@phosphor-icons/react"

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
  const router = useRouter()
  const { data: session } = useSession()
  const { data: profile, isLoading, error, refetch } = useProfile()
  
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

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

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsChangingPassword(true)

    try {
      // Note: Better Auth doesn't have a direct change password method in the client
      // We'll need to use the API route or a custom implementation
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to change password")
      }

      toast.success("Password changed successfully")
      setIsChangePasswordOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch("/api/profile/delete-account", {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete account")
      }

      toast.success("Account deleted successfully")
      await signOut()
      router.push("/")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account")
    } finally {
      setIsDeleting(false)
      setIsDeleteAccountOpen(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* User Info Card */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
            <AvatarFallback className="text-2xl font-semibold bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {user.name || "No name set"}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mb-2">
              <Envelope className="w-4 h-4" />
              {user.email}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Member since {creationDate}
            </p>
          </div>
          
          {user.isPro && (
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-red/10 text-brand-red rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Pro</span>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Usage Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Items</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalItems}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Collections</p>
            <p className="text-3xl font-bold text-foreground">{stats.totalCollections}</p>
          </div>
        </div>
      </section>

      {/* Item Type Breakdown */}
      {stats.itemTypeBreakdown.length > 0 && (
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Items by Type</h2>
          <div className="space-y-3">
            {stats.itemTypeBreakdown.map((itemType) => (
              <div
                key={itemType.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${itemType.color}20` }}
                  >
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ color: itemType.color }}
                    >
                      {itemType.icon}
                    </span>
                  </div>
                  <span className="font-medium text-foreground">{itemType.name}</span>
                </div>
                <span className="text-muted-foreground font-medium">{itemType.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Account Actions */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Account Actions</h2>
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

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Alert Dialog */}
      <AlertDialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Warning className="w-5 h-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
              All your data, including items, collections, and settings will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}