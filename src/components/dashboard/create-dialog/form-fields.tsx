import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { LanguageSelect } from "@/components/ui/language-select"
import { FILE_TYPES } from "@/lib/item-types"
import { ContentField } from "./content-field"

interface FormFieldsProps {
  selectedType: string
  title: string
  description: string
  content: string
  language: string
  url: string
  tags: string
  uploadedFile: { fileUrl: string; fileName: string; fileSize: number } | null
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onContentChange: (v: string) => void
  onLanguageChange: (v: string) => void
  onUrlChange: (v: string) => void
  onTagsChange: (v: string) => void
  onFileUpload: (file: { fileUrl: string; fileName: string; fileSize: number }) => void
  onFileClear: () => void
}

export function FormFields({
  selectedType,
  title,
  description,
  content,
  language,
  url,
  tags,
  uploadedFile,
  onTitleChange,
  onDescriptionChange,
  onContentChange,
  onLanguageChange,
  onUrlChange,
  onTagsChange,
  onFileUpload,
  onFileClear,
}: FormFieldsProps) {
  const showContent = ["snippet", "prompt", "command", "note"].includes(selectedType)
  const showLanguage = ["snippet", "command"].includes(selectedType)
  const showUrl = selectedType === "link"
  const showFileUpload = FILE_TYPES.includes(selectedType)

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
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
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Optional description"
          className="min-h-[80px] resize-none"
        />
      </div>

      {/* Language */}
      {showLanguage && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Language
          </label>
          <LanguageSelect
            value={language}
            onChange={onLanguageChange}
          />
        </div>
      )}

      {/* Content */}
      {showContent && (
        <ContentField
          selectedType={selectedType}
          content={content}
          language={language}
          onChange={onContentChange}
        />
      )}

      {/* URL */}
      {showUrl && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            URL <span className="text-destructive">*</span>
          </label>
          <Input
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      {/* File Upload */}
      {showFileUpload && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            {selectedType === "image" ? "Image" : "File"} <span className="text-destructive">*</span>
          </label>
          <FileUpload
            type={selectedType === "image" ? "image" : "file"}
            onUpload={onFileUpload}
            onClear={onFileClear}
            currentFile={uploadedFile}
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
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="Comma-separated tags"
        />
      </div>
    </div>
  )
}
