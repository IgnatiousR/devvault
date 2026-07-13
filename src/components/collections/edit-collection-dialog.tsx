"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { updateCollectionAction } from "@/actions/collections";

interface EditCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: {
    id: string;
    name: string;
    description: string | null;
  };
}

export function EditCollectionDialog({
  open,
  onOpenChange,
  collection,
}: EditCollectionDialogProps) {
  const router = useRouter();
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenChange = (value: boolean) => {
    if (value) {
      setName(collection.name);
      setDescription(collection.description || "");
    }
    onOpenChange(value);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const result = await updateCollectionAction({
      id: collection.id,
      name,
      description: description || null,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success("Collection updated");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update collection");
    }
  };

  const handleClose = (value: boolean) => {
    if (!isSaving) {
      handleOpenChange(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Update the name and description of your collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-collection-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-collection-name"
              placeholder="My Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-collection-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="edit-collection-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              className="min-h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="gap-2"
          >
            {isSaving && <Spinner size="sm" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
