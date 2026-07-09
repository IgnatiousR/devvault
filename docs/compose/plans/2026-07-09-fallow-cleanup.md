# Fallow Code Quality Cleanup Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 55 dead code issues, reduce duplication, and lower complexity in the top refactoring targets identified by `npx fallow`.

**Architecture:** Three phases — dead code removal (safe deletions), duplication reduction (extract shared logic), and complexity reduction (split large functions). All changes are mechanical refactors with no behavior changes.

**Tech Stack:** TypeScript, React, Vitest

## Global Constraints
- No behavior changes — all refactors must produce identical output
- Run `npx tsc --noEmit` after each task to verify type safety
- Run `npm test` after each task to verify tests pass
- Do NOT modify files under `generated/prisma/` (auto-generated)
- Do NOT modify files under `scripts/` (one-off utilities)

---

## Phase 1: Dead Code Removal

### Task 1: Fix stale fallow suppressions

**Files:**
- Modify: `src/components/ui/separator.tsx:2`
- Modify: `src/lib/mock-data.ts:1`
- Modify: `src/types/index.ts:1`

**Steps:**

- [ ] **Step 1: Fix suppression comment syntax in separator.tsx**

Replace line 2:
```diff
-// fallow-ignore-next-line unused-files
+// fallow-ignore-next-line unused-file
```

- [ ] **Step 2: Fix suppression comment syntax in mock-data.ts**

Replace line 1:
```diff
-// fallow-ignore-next-line unused-files
+// fallow-ignore-next-line unused-file
```

- [ ] **Step 3: Fix suppression comment syntax in types/index.ts**

Replace line 1:
```diff
-// fallow-ignore-next-line unused-files
+// fallow-ignore-next-line unused-file
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 2: Remove unused files

**Files:**
- Delete: `src/lib/mock-data.ts`
- Delete: `src/types/index.ts`
- Delete: `src/components/ui/separator.tsx`

**Steps:**

- [ ] **Step 1: Verify no live imports reference these files**

Run: `rg "from.*@/types/index|from.*@/types\"" src/ --include="*.tsx" --include="*.ts" | grep -v "types/dashboard"`
Expected: No results (only `types/dashboard.ts` should be imported)

Run: `rg "from.*mock-data" src/ --include="*.tsx" --include="*.ts"`
Expected: No results

Run: `rg "from.*separator" src/ --include="*.tsx" --include="*.ts"`
Expected: No results

- [ ] **Step 2: Delete the files**

```bash
Remove-Item -Path "src/lib/mock-data.ts" -Force
Remove-Item -Path "src/types/index.ts" -Force
Remove-Item -Path "src/components/ui/separator.tsx" -Force
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

Run: `npm test`
Expected: All tests pass

---

### Task 3: Remove unused dependency

**Files:**
- Modify: `package.json`

**Steps:**

- [ ] **Step 1: Remove @aws-sdk/s3-request-presigner**

Run: `npm uninstall @aws-sdk/s3-request-presigner`

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

Run: `npm test`
Expected: All tests pass

---

### Task 4: Remove unused exports from select.tsx

**Files:**
- Modify: `src/components/ui/select.tsx`

**Steps:**

- [ ] **Step 1: Remove unused component definitions**

The following exports are unused: `SelectGroup`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectValue`.

Remove the function definitions and their exports. Keep only: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

Run: `npm test`
Expected: All tests pass

---

## Phase 2: Duplication Reduction

### Task 5: Extract shared logic in collections.ts

**Files:**
- Modify: `src/lib/db/collections.ts`

**Steps:**

- [ ] **Step 1: Read the full file to identify duplicate blocks**

Read `src/lib/db/collections.ts` fully. The fallow report shows 2 clone groups (19 lines) in this file — likely repeated type-counting or icon-deduplication logic between `getSidebarCollections` and `getDashboardCollections`.

- [ ] **Step 2: Extract shared helper functions**

Create private helper functions at the top of the file:
```typescript
function countTypesByItem(items: { itemType: { id: string; name: string; icon: string; color: string } }[]) {
  const typeCount = new Map<string, { name: string; icon: string; color: string; count: number }>();
  for (const item of items) {
    const t = item.itemType;
    const existing = typeCount.get(t.id);
    if (existing) {
      existing.count++;
    } else {
      typeCount.set(t.id, { name: t.name, icon: t.icon, color: t.color, count: 1 });
    }
  }
  return typeCount;
}

function findMostUsedType(typeCount: Map<string, { name: string; icon: string; color: string; count: number }>) {
  let mostUsedType: { name: string; icon: string; color: string } | null = null;
  let maxCount = 0;
  for (const t of typeCount.values()) {
    if (t.count > maxCount) {
      maxCount = t.count;
      mostUsedType = { name: t.name, icon: t.icon, color: t.color };
    }
  }
  return mostUsedType;
}

function deduplicateTypeIcons(typeCount: Map<string, { name: string; icon: string; color: string; count: number }>) {
  const seen = new Set<string>();
  const typeIcons: { icon: string; color: string }[] = [];
  for (const t of typeCount.values()) {
    if (!seen.has(t.icon)) {
      seen.add(t.icon);
      typeIcons.push({ icon: t.icon, color: t.color });
    }
  }
  return typeIcons;
}
```

- [ ] **Step 3: Refactor both functions to use the helpers**

Replace the inline loops in `getSidebarCollections` and `getDashboardCollections` with calls to `countTypesByItem`, `findMostUsedType`, and `deduplicateTypeIcons`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

Run: `npm test`
Expected: All tests pass

---

## Phase 3: Complexity Reduction

### Task 6: Split drawer-content-sections.tsx

**Files:**
- Create: `src/components/items/drawer/sections/description-section.tsx`
- Create: `src/components/items/drawer/sections/content-section.tsx`
- Create: `src/components/items/drawer/sections/metadata-section.tsx`
- Modify: `src/components/items/drawer/drawer-content-sections.tsx`

**Steps:**

- [ ] **Step 1: Create description-section.tsx**

Extract the Description section (lines ~33-64) into a focused component:

```tsx
import { Textarea } from "@/components/ui/textarea";
import type { EditData } from "../types";

interface DescriptionSectionProps {
  description: string;
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
}

export function DescriptionSection({ description, isEditing, editData, setEditData }: DescriptionSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Description</h3>
      {isEditing ? (
        <Textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          className="min-h-[80px] resize-none"
          placeholder="Add a description..."
        />
      ) : description ? (
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      ) : (
        <p className="text-sm text-muted-foreground/50 italic">No description</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create content-section.tsx**

Extract the Content/Language/URL/File sections (lines ~66-175) into a focused component. This handles the type-conditional rendering of CodeEditor, MarkdownEditor, Language input, URL input, and File/Image preview.

- [ ] **Step 3: Create metadata-section.tsx**

Extract the Tags/Collections/Details sections (lines ~177-296) into a focused component.

- [ ] **Step 4: Refactor drawer-content-sections.tsx to compose the sections**

```tsx
import { DescriptionSection } from "./sections/description-section";
import { ContentSection } from "./sections/content-section";
import { MetadataSection } from "./sections/metadata-section";

export function DrawerContentSections({ item, isEditing, editData, setEditData }: DrawerContentSectionsProps) {
  return (
    <div className="p-6 space-y-6">
      <DescriptionSection
        description={item.description || ""}
        isEditing={isEditing}
        editData={editData}
        setEditData={setEditData}
      />
      <ContentSection item={item} isEditing={isEditing} editData={editData} setEditData={setEditData} />
      <MetadataSection item={item} isEditing={isEditing} editData={editData} setEditData={setEditData} />
    </div>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

Run: `npm test`
Expected: All tests pass

---

### Task 7: Split create-dialog/index.tsx

**Files:**
- Create: `src/components/dashboard/create-dialog/form-fields.tsx`
- Modify: `src/components/dashboard/create-dialog/index.tsx`

**Steps:**

- [ ] **Step 1: Create form-fields.tsx**

Extract the form field rendering (Title, Description, Language, URL, Tags, FileUpload) into a separate component. This reduces the main dialog from ~200 lines to ~80 lines.

```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";

interface FormFieldsProps {
  selectedType: string;
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
  uploadedFile: { fileUrl: string; fileName: string; fileSize: number } | null;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onTagsChange: (v: string) => void;
  onFileUpload: (file: { fileUrl: string; fileName: string; fileSize: number }) => void;
  onFileClear: () => void;
}
```

- [ ] **Step 2: Refactor index.tsx to use FormFields**

Replace the inline form field JSX with `<FormFields ... />`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

Run: `npm test`
Expected: All tests pass

---

## Verification

After all tasks complete:

- [ ] Run `npx fallow` and verify:
  - Dead files: 0 (was 4)
  - Dead exports: reduced (was 6 in select.tsx)
  - Unused dependencies: 0 (was 1)
  - Stale suppressions: 0 (was 4)
  - `drawer-content-sections.tsx` complexity: reduced (was CRITICAL)
  - `create-dialog/index.tsx` complexity: reduced (was CRITICAL)

- [ ] Run `npm test` — all tests pass
- [ ] Run `npm run build` — build succeeds
