"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { createItemAction } from "@/actions/items"
import { ITEM_TYPE_OPTIONS, FILE_TYPES } from "@/lib/item-types"
import { TypeSelector } from "./type-selector"
import { FormFields } from "./form-fields"

function getDefaultType(pathname: string): string {
  const match = pathname.match(/^\/items\/([^/]+)/)
  if (match) {
    const routeType = match[1]
    if (ITEM_TYPE_OPTIONS.some((t) => t.id === routeType)) {
      return routeType
    }
  }
  return "snippet"
}

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateItemDialog({ open, onOpenChange }: CreateItemDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedType, setSelectedType] = useState(() => getDefaultType(pathname))
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string
    fileName: string
    fileSize: number
  } | null>(null)

  const showContent = ["snippet", "prompt", "command", "note"].includes(selectedType)
  const showLanguage = ["snippet", "command"].includes(selectedType)
  const showUrl = selectedType === "link"
  const showFileUpload = FILE_TYPES.includes(selectedType)

  const resetForm = () => {
    setSelectedType(getDefaultType(pathname))
    setTitle("")
    setDescription("")
    setContent("")
    setLanguage("")
    setUrl("")
    setTags("")
    setUploadedFile(null)
  }

  const handleCreate = async () => {
    setIsCreating(true)

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const itemType = ITEM_TYPE_OPTIONS.find((t) => t.id === selectedType)

    const result = await createItemAction({
      title,
      description: description || null,
      content: showContent ? content || null : null,
      language: showLanguage ? language || null : null,
      url: showUrl ? url || null : null,
      fileUrl: uploadedFile?.fileUrl || null,
      fileName: uploadedFile?.fileName || null,
      fileSize: uploadedFile?.fileSize || null,
      tags: tagsArray,
      itemTypeId: itemType?.id || "snippet",
    })

    setIsCreating(false)

    if (result.success) {
      toast.success("Item created successfully")
      resetForm()
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to create item")
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
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Select a type and fill in the details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 min-h-0 scrollbar-none">
          <TypeSelector value={selectedType} onChange={setSelectedType} />
          <FormFields
            selectedType={selectedType}
            title={title}
            description={description}
            content={content}
            language={language}
            url={url}
            tags={tags}
            uploadedFile={uploadedFile}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onContentChange={setContent}
            onLanguageChange={setLanguage}
            onUrlChange={setUrl}
            onTagsChange={setTags}
            onFileUpload={setUploadedFile}
            onFileClear={() => setUploadedFile(null)}
          />
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
            disabled={isCreating || !title.trim() || (showUrl && !url.trim()) || (showFileUpload && !uploadedFile)}
            className="gap-2"
          >
            {isCreating && <Spinner size="sm" />}
            {isCreating ? "Creating..." : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
