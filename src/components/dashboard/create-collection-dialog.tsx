"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { createCollectionAction } from "@/actions/collections"

interface CreateCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCollectionDialog({ open, onOpenChange }: CreateCollectionDialogProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const resetForm = () => {
    setName("")
    setDescription("")
  }

  const handleCreate = async () => {
    setIsCreating(true)

    const result = await createCollectionAction({
      name,
      description: description || null,
    })

    setIsCreating(false)

    if (result.success) {
      toast.success("Collection created successfully")
      resetForm()
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to create collection")
    }
  }

  const handleClose = (value: boolean) => {
    if (!isCreating) {
      resetForm()
      onOpenChange(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Add a new collection to organize your items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="collection-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="collection-name"
              placeholder="My Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="collection-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="collection-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
              className="min-h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            className="gap-2"
          >
            {isCreating && <Spinner size="sm" />}
            {isCreating ? "Creating..." : "Create Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
