import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { LanguageSelect } from "@/components/ui/language-select"
import { TagSuggestions } from "@/components/ui/tag-suggestions"
import { AiGhostButton } from "@/components/ui/ai-response-view"
import { FILE_TYPES } from "@/lib/item-types"
import { ContentField } from "./content-field"

interface FormFieldValues {
  title: string
  description: string
  content: string
  language: string
  url: string
  tags: string
}

interface FormFieldCallbacks {
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onContentChange: (v: string) => void
  onLanguageChange: (v: string) => void
  onUrlChange: (v: string) => void
  onTagsChange: (v: string) => void
}

interface FileUploadState {
  uploadedFile: { fileUrl: string; fileName: string; fileSize: number } | null
  onFileUpload: (file: { fileUrl: string; fileName: string; fileSize: number }) => void
  onFileClear: () => void
}

interface AiFeatures {
  aiAccess?: boolean
  isSuggesting?: boolean
  suggestions?: string[]
  onSuggestTags?: () => void
  onAcceptSuggestion?: (tag: string) => void
  onRejectSuggestion?: (tag: string) => void
  isGeneratingDescription?: boolean
  onGenerateDescription?: () => void
}

interface FormFieldsProps {
  selectedType: string
  values: FormFieldValues
  callbacks: FormFieldCallbacks
  fileUpload: FileUploadState
  ai?: AiFeatures
}

function TitleField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        Title <span className="text-destructive">*</span>
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter title"
      />
    </div>
  )
}

function DescriptionField({
  value,
  onChange,
  ai,
}: {
  value: string
  onChange: (v: string) => void
  ai?: AiFeatures
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">
          Description
        </label>
        <AiGhostButton
          show={!!(ai?.aiAccess && ai.onGenerateDescription)}
          onClick={ai?.onGenerateDescription ?? (() => {})}
          isLoading={!!ai?.isGeneratingDescription}
          disabled={!value.trim()}
          label="Generate"
          loadingLabel="Generating..."
        />
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Optional description"
        className="min-h-[80px] resize-none"
      />
    </div>
  )
}

function LanguageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        Language
      </label>
      <LanguageSelect value={value} onChange={onChange} />
    </div>
  )
}

function UrlField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        URL <span className="text-destructive">*</span>
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
      />
    </div>
  )
}

function FileUploadField({
  selectedType,
  fileUpload,
}: {
  selectedType: string
  fileUpload: FileUploadState
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        {selectedType === "image" ? "Image" : "File"} <span className="text-destructive">*</span>
      </label>
      <FileUpload
        type={selectedType === "image" ? "image" : "file"}
        onUpload={fileUpload.onFileUpload}
        onClear={fileUpload.onFileClear}
        currentFile={fileUpload.uploadedFile}
      />
    </div>
  )
}

function TagsField({
  value,
  onChange,
  ai,
}: {
  value: string
  onChange: (v: string) => void
  ai?: AiFeatures
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">
          Tags
        </label>
        <AiGhostButton
          show={!!(ai?.aiAccess && ai.onSuggestTags)}
          onClick={ai?.onSuggestTags ?? (() => {})}
          isLoading={!!ai?.isSuggesting}
          disabled={!value.trim()}
          label="Suggest Tags"
          loadingLabel="Suggesting..."
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Comma-separated tags"
      />
      {ai?.onAcceptSuggestion && ai.onRejectSuggestion && (
        <TagSuggestions
          suggestions={ai.suggestions || []}
          onAccept={ai.onAcceptSuggestion}
          onReject={ai.onRejectSuggestion}
        />
      )}
    </div>
  )
}

export function FormFields({
  selectedType,
  values,
  callbacks,
  fileUpload,
  ai,
}: FormFieldsProps) {
  const showContent = ["snippet", "prompt", "command", "note"].includes(selectedType)
  const showLanguage = ["snippet", "command"].includes(selectedType)
  const showUrl = selectedType === "link"
  const showFileUpload = FILE_TYPES.includes(selectedType)

  return (
    <div className="space-y-4">
      <TitleField value={values.title} onChange={callbacks.onTitleChange} />
      <DescriptionField value={values.description} onChange={callbacks.onDescriptionChange} ai={ai} />
      {showLanguage && <LanguageField value={values.language} onChange={callbacks.onLanguageChange} />}
      {showContent && (
        <ContentField
          selectedType={selectedType}
          content={values.content}
          language={values.language}
          onChange={callbacks.onContentChange}
        />
      )}
      {showUrl && <UrlField value={values.url} onChange={callbacks.onUrlChange} />}
      {showFileUpload && <FileUploadField selectedType={selectedType} fileUpload={fileUpload} />}
      <TagsField value={values.tags} onChange={callbacks.onTagsChange} ai={ai} />
    </div>
  )
}
