---
name: list-components
description: Create a read-only inventory of React component and component-support files, optionally scoped to a component subdirectory, with repository-relative paths and evidence-based descriptions.
compatibility: opencode
metadata:
  category: codebase-navigation
  mode: read-only
---

# List Components

## Purpose

Inventory React component source files without modifying the repository.

Use this skill when the user asks to list, discover, inventory, or summarize components in a project or a component subdirectory.

## Inputs

The user may provide an optional component scope in their request.

Examples:

- No scope: inspect every recognized component root.
- `ui`: inspect the `ui` directory under every matching component root.
- `src/components/forms`: inspect that explicit repository-relative component path.

The skill itself does not receive command placeholders. A companion OpenCode command may pass user arguments in its prompt.

## Rules

- This is a read-only task.
- Do not create, edit, rename, move, or delete files.
- Do not install packages or run formatters, generators, builds, or tests.
- Report paths relative to the repository root using `/` separators.
- Never search outside the current Git worktree.
- Do not follow a symlink that resolves outside the worktree.
- Do not claim behavior that is not supported by the filename or inspected source.

## Discovery Procedure

### 1. Determine the repository root

Use the Git worktree root when available. Otherwise, use the current working directory.

### 2. Find component roots

First honor component locations documented by the repository itself, such as contributor docs, aliases, framework configuration, or established imports.

When no project-specific location is documented, check common roots including:

- `components/`
- `src/components/`
- `app/components/`
- `src/app/components/`
- `apps/*/components/`
- `apps/*/src/components/`
- `packages/*/components/`
- `packages/*/src/components/`

A directory is a component root only when it exists inside the worktree.

Do not search dependency, cache, generated-output, or build directories such as:

- `.git/`
- `.next/`
- `node_modules/`
- `dist/`
- `build/`
- `out/`
- `coverage/`
- `vendor/`

### 3. Resolve the optional scope

If no scope is supplied, inspect all discovered component roots.

If a scope is supplied:

1. Normalize it as a repository-relative path.
2. Reject absolute paths and traversal outside the worktree.
3. If it names an existing path inside a component root, inspect that path.
4. Otherwise, treat it as a path relative to each discovered component root and inspect every match.
5. Do not silently fall back to an unscoped search when the requested scope does not exist.

### 4. Enumerate files

Include regular source files with these extensions:

- `.tsx`
- `.ts`
- `.jsx`
- `.js`

Include support modules located inside the component tree, such as providers, hooks, helpers, schemas, constants, and barrel files. Describe them accurately rather than calling every file a visual component.

Exclude obvious non-source artifacts and generated files. Include tests, stories, and examples only when they are physically inside the requested component tree; label their role clearly in the description.

Prefer repository-aware file listing tools such as `rg --files`. Fall back to `find` when necessary.

### 5. Inspect and describe

Read enough of each file to identify its primary role. Use, in descending order of confidence:

1. Primary exported component, function, hook, provider, or constant.
2. JSX structure, props, and imported domain modules.
3. Filename and directory context.

Keep each description to one line. Use cautious wording such as “appears to” only when the role remains ambiguous after inspection.

### 6. Sort and report

Sort files lexicographically by repository-relative path for deterministic output.

## Output Format

Use this exact structure:

```text
1. `relative/path/Component.tsx` — One-line description.
2. `relative/path/helper.ts` — One-line description.

Summary: 2 files found.
```

For multiple component roots, the summary may also state how many roots were searched.

When no matching files exist, output exactly:

```text
No components found.
```
