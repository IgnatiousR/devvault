"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { TypeSelector } from "./type-selector"
import { FormFields } from "./form-fields"
import { CollectionSelector } from "@/components/ui/collection-selector"
import { useCreateItem } from "./use-create-item"

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  aiAccess?: boolean
}

export function CreateItemDialog({ open, onOpenChange, aiAccess }: CreateItemDialogProps) {
  const pathname = usePathname()
  const {
    selectedType,
    setSelectedType,
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    language,
    setLanguage,
    url,
    setUrl,
    tags,
    setTags,
    selectedCollectionIds,
    setSelectedCollectionIds,
    collections,
    isCreating,
    uploadedFile,
    setUploadedFile,
    showContent,
    showLanguage,
    showUrl,
    showFileUpload,
    resetForm,
    handleCreate,
    isSuggesting,
    suggestions,
    handleSuggestTags,
    handleAcceptTag,
    handleRejectTag,
    isGeneratingDescription,
    handleGenerateDescription,
  } = useCreateItem({ pathname, onOpenChange })

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
            aiAccess={aiAccess}
            isSuggesting={isSuggesting}
            suggestions={suggestions}
            onSuggestTags={handleSuggestTags}
            onAcceptSuggestion={handleAcceptTag}
            onRejectSuggestion={handleRejectTag}
            isGeneratingDescription={isGeneratingDescription}
            onGenerateDescription={handleGenerateDescription}
          />

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Collections
            </label>
            <CollectionSelector
              collections={collections}
              selectedIds={selectedCollectionIds}
              onChange={setSelectedCollectionIds}
              placeholder="Add to collections..."
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
