# Plan: Create `refactor-scanner` Subagent

## Context
The codebase has significant code duplication across folders (actions, components, lib, hooks, api). A dedicated subagent is needed to scan a given folder, identify duplicate patterns, and recommend specific extractions into shared utilities, components, or hooks.

## Agent File
**Path:** `.opencode/agents/refactor-scanner.md`

## Agent Structure

### YAML Frontmatter
```yaml
---
description: Scans a folder for duplicated code patterns and recommends extractions into shared utilities, components, or hooks
mode: subagent
temperature: 0.1
permission:
  "*": deny
  read: allow
  glob: allow
  grep: allow
---
```

### Prompt Sections

1. **Role Definition** — Refactoring analyst for Next.js/TypeScript codebases
2. **Task** — Scan the specified folder, identify duplication, recommend extractions
3. **Folder-Specific Rules** — Tailored scanning heuristics per folder type:
   - `actions/` — Auth boilerplate, validation patterns, result types, error handling
   - `components/` — Dialog action patterns, rendering logic, state management
   - `lib/` — Overlapping utilities, validation systems, DB query patterns
   - `hooks/` — Fetching boilerplate, shared state patterns
   - `api/` — Auth checks, rate limiting, error response formatting
4. **What to Look For** — Specific duplication patterns per folder type
5. **Output Format** — Structured report with severity, file paths, line numbers, extraction recommendations

## Key Duplication Patterns to Detect

### `actions/`
- Auth check boilerplate (`getSessionUserId()` + guard)
- AI action try/catch blocks (OpenRouter call + error mapping)
- Zod schema definitions (inline vs shared)
- Result type interfaces (structurally identical per-function)
- Rate limiting patterns

### `components/`
- Dialog action pattern (loading/success/error toast flow)
- Duplicate rendering logic (card/list views)
- Color class computation overlap
- Empty state handling patterns

### `lib/`
- Validation system overlap (manual vs Zod vs adapter)
- DB include/map patterns
- Type-count aggregation logic
- Format utility overlap

### `hooks/`
- Fetching hook boilerplate (useState + useEffect + fetch)
- Missing hooks (AI hooks in wrong directory)

### `api/`
- Auth check boilerplate (session retrieval + 401)
- Rate limit response pattern
- Error response formatting

## Output Format

```markdown
## Refactor Scan: `src/{folder}`

### Summary
- Files scanned: N
- Duplication patterns found: N
- Estimated lines removable: N

### Findings

#### [HIGH] Pattern Name
- **Files:** list of files with duplication
- **Lines:** line ranges
- **Current:** brief description of what's duplicated
- **Extract to:** suggested path and name
- **Signature:** proposed function/component signature
- **Impact:** how many files would use the extraction

#### [MEDIUM] ...
#### [LOW] ...
```

## Verification
1. After creating the agent file, invoke it with `@refactor-scanner src/actions` to test
2. Verify the structured report output matches the format
3. Check that findings are actionable with specific file paths and line numbers
