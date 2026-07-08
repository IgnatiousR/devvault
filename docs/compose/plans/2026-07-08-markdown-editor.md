# Markdown Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a MarkdownEditor component with Write/Preview tabs, dark theme styling, and replace Textarea for notes/prompts in ItemDrawer and CreateItemDialog.

**Architecture:** Single MarkdownEditor component with tabbed Write/Preview interface using react-markdown + remark-gfm. Custom CSS class `.markdown-preview` for dark mode styling. Integrated into existing ItemDrawer and CreateItemDialog components.

**Tech Stack:** react-markdown, remark-gfm, Tailwind CSS

## Global Constraints

- Match existing dark theme: `bg-[#1e1e1e]` container, `bg-[#252526]` header
- Copy button style matches CodeEditor (`src/components/ui/code-editor.tsx`)
- Fluid height with max 400px, matching CodeEditor behavior
- Keep CodeEditor for snippets/commands unchanged

---

## File Structure

- **Create:** `src/components/ui/markdown-editor.tsx` — MarkdownEditor component
- **Modify:** `src/app/globals.css` — Add `.markdown-preview` styles
- **Modify:** `src/components/items/item-drawer.tsx` — Replace Textarea for notes/prompts
- **Modify:** `src/components/dashboard/create-item-dialog.tsx` — Replace Textarea for notes/prompts

---

### Task 1: Install Dependencies

**Covers:** (none — scaffolding)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install react-markdown and remark-gfm**

```bash
npm install react-markdown remark-gfm
```

- [ ] **Step 2: Verify installation**

```bash
npm ls react-markdown remark-gfm
```

Expected: Both packages listed without errors

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add react-markdown and remark-gfm"
```

---

### Task 2: Create MarkdownEditor Component

**Covers:** [S1, S2, S3]

**Files:**
- Create: `src/components/ui/markdown-editor.tsx`

**Interfaces:**
- Consumes: None (standalone component)
- Produces: `<MarkdownEditor value onChange readOnly placeholder />` — used by ItemDrawer and CreateItemDialog

- [ ] **Step 1: Create MarkdownEditor component**

```tsx
"use client"

import { useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"

interface MarkdownEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  placeholder?: string
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">(
    readOnly ? "preview" : "write"
  )
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setIsCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-border">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {readOnly ? (
            <span className="text-xs text-[#858585] font-mono">Preview</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  activeTab === "write"
                    ? "text-[#cccccc] bg-[#3c3c3c]"
                    : "text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c]"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                  activeTab === "preview"
                    ? "text-[#cccccc] bg-[#3c3c3c]"
                    : "text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c]"
                }`}
              >
                Preview
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              {isCopied ? "check" : "content_copy"}
            </span>
            {isCopied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto code-editor-scrollbar">
        {readOnly ? (
          <div className="p-4 markdown-preview">
            {value ? (
              <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">No content</p>
            )}
          </div>
        ) : activeTab === "write" ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder || "Write your markdown here..."}
            className="w-full min-h-[300px] p-4 bg-transparent text-sm text-[#cccccc] font-mono resize-none focus:outline-none placeholder:text-[#858585]"
          />
        ) : (
          <div className="p-4 markdown-preview min-h-[300px]">
            {value ? (
              <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">Nothing to preview</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify component compiles**

```bash
npx tsc --noEmit src/components/ui/markdown-editor.tsx
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/markdown-editor.tsx
git commit -m "feat: add MarkdownEditor component with Write/Preview tabs"
```

---

### Task 3: Add Markdown Preview CSS

**Covers:** [S4]

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add .markdown-preview styles**

Add the following after the `.code-editor-scrollbar` styles block (after line 166):

```css
.markdown-preview {
  color: #cccccc;
  font-size: 14px;
  line-height: 1.6;
}

.markdown-preview h1 {
  font-size: 1.75em;
  font-weight: 700;
  margin: 1em 0 0.5em;
  color: #e0e0e0;
  border-bottom: 1px solid #3c3c3c;
  padding-bottom: 0.3em;
}

.markdown-preview h2 {
  font-size: 1.5em;
  font-weight: 600;
  margin: 1em 0 0.5em;
  color: #e0e0e0;
  border-bottom: 1px solid #3c3c3c;
  padding-bottom: 0.3em;
}

.markdown-preview h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin: 1em 0 0.5em;
  color: #e0e0e0;
}

.markdown-preview h4 {
  font-size: 1.1em;
  font-weight: 600;
  margin: 1em 0 0.5em;
  color: #e0e0e0;
}

.markdown-preview h5 {
  font-size: 1em;
  font-weight: 600;
  margin: 1em 0 0.5em;
  color: #e0e0e0;
}

.markdown-preview h6 {
  font-size: 0.9em;
  font-weight: 600;
  margin: 1em 0 0.5em;
  color: #e0e0e0;
}

.markdown-preview p {
  margin: 0.75em 0;
}

.markdown-preview code {
  background: #2d2d2d;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
}

.markdown-preview pre {
  background: #1a1a1a;
  border: 1px solid #3c3c3c;
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-preview pre code {
  background: transparent;
  padding: 0;
  font-size: 0.875em;
  color: #cccccc;
}

.markdown-preview blockquote {
  border-left: 4px solid #ef4444;
  padding-left: 1em;
  margin: 1em 0;
  color: #a0a0a0;
  font-style: italic;
}

.markdown-preview ul,
.markdown-preview ol {
  margin: 0.75em 0;
  padding-left: 2em;
}

.markdown-preview ul {
  list-style-type: disc;
}

.markdown-preview ol {
  list-style-type: decimal;
}

.markdown-preview li {
  margin: 0.25em 0;
}

.markdown-preview a {
  color: #60a5fa;
  text-decoration: none;
}

.markdown-preview a:hover {
  text-decoration: underline;
}

.markdown-preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-preview th,
.markdown-preview td {
  border: 1px solid #3c3c3c;
  padding: 0.5em 0.75em;
  text-align: left;
}

.markdown-preview th {
  background: #2d2d2d;
  font-weight: 600;
}

.markdown-preview hr {
  border: none;
  border-top: 1px solid #3c3c3c;
  margin: 1.5em 0;
}

.markdown-preview img {
  max-width: 100%;
  border-radius: 6px;
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add markdown-preview CSS for dark mode"
```

---

### Task 4: Integrate into ItemDrawer

**Covers:** [S5]

**Files:**
- Modify: `src/components/items/item-drawer.tsx:405-453`

**Interfaces:**
- Consumes: `<MarkdownEditor value onChange readOnly placeholder />`
- Produces: Updated ItemDrawer with markdown support for notes/prompts

- [ ] **Step 1: Add MarkdownEditor import**

In `src/components/items/item-drawer.tsx`, add import after line 9:

```tsx
import { MarkdownEditor } from "@/components/ui/markdown-editor";
```

- [ ] **Step 2: Replace Textarea for notes/prompts in edit mode**

Replace lines 424-434 (the Textarea in edit mode for non-code types) with:

```tsx
                          <MarkdownEditor
                            value={editData.content}
                            onChange={(v) =>
                              setEditData({
                                ...editData,
                                content: v,
                              })
                            }
                            placeholder="Add content..."
                          />
```

- [ ] **Step 3: Replace readonly content display for notes/prompts**

Replace lines 436-446 (the readonly content div for non-code types) with:

```tsx
                        <MarkdownEditor
                          value={item.content}
                          readOnly
                        />
```

- [ ] **Step 4: Verify TypeScript passes**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/components/items/item-drawer.tsx
git commit -m "feat: use MarkdownEditor for notes/prompts in item drawer"
```

---

### Task 5: Integrate into CreateItemDialog

**Covers:** [S5]

**Files:**
- Modify: `src/components/dashboard/create-item-dialog.tsx:196-210`

**Interfaces:**
- Consumes: `<MarkdownEditor value onChange placeholder />`
- Produces: Updated CreateItemDialog with markdown support for notes/prompts

- [ ] **Step 1: Add MarkdownEditor import**

In `src/components/dashboard/create-item-dialog.tsx`, add import after line 8:

```tsx
import { MarkdownEditor } from "@/components/ui/markdown-editor";
```

- [ ] **Step 2: Replace Textarea for notes/prompts**

Replace lines 204-209 (the Textarea for non-code types) with:

```tsx
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Enter content"
                />
```

- [ ] **Step 3: Verify TypeScript passes**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/create-item-dialog.tsx
git commit -m "feat: use MarkdownEditor for notes/prompts in create dialog"
```

---

### Task 6: Final Verification

**Covers:** (verification)

**Files:** None

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Run dev server and test**

```bash
npm run dev
```

Test manually:
1. Create a new Note item — verify Write/Preview tabs work
2. Create a new Prompt item — verify Write/Preview tabs work
3. Open a Note/Prompt in drawer view — verify markdown renders
4. Edit a Note/Prompt in drawer — verify Write/Preview tabs work
5. Verify CodeEditor still works for Snippets/Commands

- [ ] **Step 3: Commit any final fixes**

```bash
git add -A
git commit -m "feat: complete markdown editor integration"
```
