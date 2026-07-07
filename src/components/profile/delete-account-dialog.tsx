"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
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
import { Warning } from "@phosphor-icons/react"
import { Spinner } from "@/components/ui/spinner"

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail: string
}

export function DeleteAccountDialog({ open, onOpenChange, userEmail }: DeleteAccountDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  const isDeleteConfirmationValid = deleteConfirmation === userEmail

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
      onOpenChange(false)
      setDeleteConfirmation("")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              To confirm, type <span className="font-medium text-foreground">{userEmail}</span> in the box below
            </p>
            <Input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder={userEmail}
              className="mt-2"
              disabled={isDeleting}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting || !isDeleteConfirmationValid}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {isDeleting && <Spinner size="sm" />}
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
