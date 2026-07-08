"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CodeEditor } from "@/components/ui/code-editor"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { createItemAction } from "@/actions/items"

const ITEM_TYPES = [
  { id: "snippet", name: "Snippet", icon: "code", color: "text-[var(--color-brand-red)]" },
  { id: "prompt", name: "Prompt", icon: "auto_awesome", color: "text-orange-500" },
  { id: "command", name: "Command", icon: "terminal", color: "text-amber-500" },
  { id: "note", name: "Note", icon: "description", color: "text-yellow-500" },
  { id: "link", name: "Link", icon: "link", color: "text-emerald-500" },
]

const CODE_TYPES = ["snippet", "command"]

function getDefaultType(pathname: string): string {
  const match = pathname.match(/^\/items\/([^/]+)/)
  if (match) {
    const routeType = match[1]
    if (ITEM_TYPES.some((t) => t.id === routeType)) {
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

  const showContent = ["snippet", "prompt", "command", "note"].includes(selectedType)
  const showLanguage = ["snippet", "command"].includes(selectedType)
  const showUrl = selectedType === "link"

  const resetForm = () => {
    setSelectedType(getDefaultType(pathname))
    setTitle("")
    setDescription("")
    setContent("")
    setLanguage("")
    setUrl("")
    setTags("")
  }

  const handleCreate = async () => {
    setIsCreating(true)

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const itemType = ITEM_TYPES.find((t) => t.id === selectedType)

    const result = await createItemAction({
      title,
      description: description || null,
      content: showContent ? content || null : null,
      language: showLanguage ? language || null : null,
      url: showUrl ? url || null : null,
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

        <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1">
          {/* Type Selector */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Type
            </label>
            <Select value={selectedType} onValueChange={(v) => v && setSelectedType(v)}>
              <SelectTrigger className="w-full">
                {(() => {
                  const selected = ITEM_TYPES.find((t) => t.id === selectedType)
                  return selected ? (
                    <span className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-xs ${selected.color}`}>
                        {selected.icon}
                      </span>
                      {selected.name}
                    </span>
                  ) : (
                    "Select a type"
                  )
                })()}
              </SelectTrigger>
              <SelectContent>
                {ITEM_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <span className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-xs ${type.color}`}>
                        {type.icon}
                      </span>
                      {type.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Content */}
          {showContent && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Content
              </label>
              {CODE_TYPES.includes(selectedType) ? (
                <CodeEditor
                  value={content}
                  onChange={setContent}
                  language={language || "plaintext"}
                  placeholder="Enter content"
                />
              ) : (
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Enter content"
                />
              )}
            </div>
          )}

          {/* Language */}
          {showLanguage && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Language
              </label>
              <Input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g., javascript, python"
              />
            </div>
          )}

          {/* URL */}
          {showUrl && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                URL <span className="text-destructive">*</span>
              </label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Tags
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags"
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
            disabled={isCreating || !title.trim() || (showUrl && !url.trim())}
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
