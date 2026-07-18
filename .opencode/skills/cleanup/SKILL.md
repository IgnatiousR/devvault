---
name: cleanup
description: Audit a repository for housekeeping issues and, only after explicit user selection, apply targeted cleanup fixes with verification.
compatibility: opencode
metadata:
  audience: maintainers
  workflow: repository-cleanup
---

# Repository cleanup

## When to use

Use this skill when the user asks to audit, check, clean up, or fix repository housekeeping issues.

Loading this skill does not grant permission to edit files. The selected mode and the user's explicit approval determine whether changes are allowed.

## Modes

### `check` — default

Use `check` when no mode is supplied or the requested mode is `check`.

- Inspect the repository and report findings only.
- Do not modify, create, move, rename, or delete files.
- Do not run commands that rewrite files, including formatters with write flags.
- Describe the minimal cleanup that would resolve each finding.

### `run` or `fix`

Use this mode when the requested mode is `run` or `fix`.

1. Complete the same read-only audit as `check`.
2. Report actionable findings as individually numbered items.
3. Ask exactly:

   `Which items would you like me to fix? (enter numbers like 1,3,5 or 'all' or 'none')`

4. Stop and wait for the user's response. Do not make changes in the same turn as the audit.
5. Apply only the items the user selects.

If the user has already selected numbered findings from a previous cleanup audit, do not ask again. Revalidate those findings and apply only the selected work.

For any other mode, report:

`Usage: /cleanup [check|run]`

Do not continue the audit until a supported mode is used.

## Safety requirements

Before auditing:

- Read applicable repository guidance such as `AGENTS.md`, `README.md`, contribution docs, and nested instruction files.
- Inspect `git status --short` when Git is available. Treat existing changes as user work and do not overwrite or revert them.
- Detect the project's language, framework, package manager, generated directories, and available lint/typecheck/test scripts.

During the audit and any approved fixes:

- Prefer repository-native tools and existing scripts. Do not install dependencies or change tool configuration merely to perform the audit.
- Do not create branches or commits.
- Do not expose secret values from environment files. Compare and report variable names only.
- Exclude dependency, build, cache, coverage, generated, and vendored directories unless repository guidance explicitly includes them.
- Treat static-analysis results as evidence, not proof. Account for dynamic imports, framework conventions, code generation, CLI entry points, tests, scripts, and configuration references.
- Preserve runtime behavior unless the selected cleanup item explicitly requires a behavior change.
- Keep fixes minimal and scoped. Do not perform unrelated formatting or refactoring.

## Audit procedure

### 1. Current-feature history order

If `context/current-feature.md` exists:

- Identify its history, changelog, timeline, or progress entries.
- Verify that dated entries are ordered from oldest to newest.
- Use explicit dates and repository evidence; do not guess dates from prose.
- Report the exact entries that are out of order and the proposed ordering.

If the file or a history section does not exist, mark this check as not applicable. Do not create either one automatically.

### 2. Unnecessary console logging

Search source directories, especially `src/`, for `console.*` calls.

- Distinguish temporary debugging output from intentional warnings, errors, telemetry, CLI output, tests, and development-only diagnostics.
- Report only calls that have evidence of being unnecessary or inappropriate for the surrounding runtime.
- Include file, line, call type, and why it appears removable or should use the project's logger.

### 3. Unused imports

Use the strongest existing signal available, such as the configured linter, compiler, language server diagnostics, or repository-native analysis scripts.

- Confirm findings against source usage, type-only usage, re-exports, JSX transforms, decorators, macros, generated code, and framework conventions.
- Do not report imports solely because a plain text search found no match.
- Record the tool or evidence that identified each import.

### 4. Stale TODO-family comments

Search for `TODO`, `FIXME`, `HACK`, `XXX`, and equivalent project conventions.

Consider a comment stale only when evidence supports it, for example:

- the referenced work is already complete;
- the referenced file, issue, API, or behavior no longer exists;
- the comment contradicts current code;
- version history shows the surrounding workaround is obsolete.

Age alone is not enough. Include the comment, location, evidence, and proposed action.

### 5. Orphaned or unused files

Build evidence from imports/references, routes, manifests, exports, package scripts, tests, framework discovery rules, and configuration.

- Classify each candidate as `high`, `medium`, or `low` confidence.
- Do not propose automatic deletion for medium- or low-confidence candidates.
- Check for dynamic loading, convention-based entry points, assets referenced outside source code, migration files, fixtures, public files, and tooling inputs.

### 6. Context documentation drift

Compare files under `context/` with the actual repository state.

Check concrete claims such as:

- file paths and component names;
- commands and package scripts;
- schema, API, or configuration descriptions;
- current feature status and completed work;
- architecture or dependency references.

Report the exact statement that is stale, the repository evidence, and the smallest documentation update needed.

### 7. Environment variable parity

When `.env` and `.env.production` exist, compare variable names in both directions.

- Ignore blank lines and comments.
- Handle optional `export ` prefixes.
- Report keys present in `.env` but missing from `.env.production`.
- Report keys present in `.env.production` but missing from `.env`.
- Never print, compare, summarize, or otherwise reveal values.

If either file is absent, report that fact without creating it. Treat example/template files separately unless the repository explicitly defines them as the source of truth.

### 8. Potentially stale `@ts-ignore`

Find all `@ts-ignore` directives and inspect the suppressed statement.

- Determine whether the directive is still required using the existing TypeScript configuration and typecheck command when available.
- Prefer a real type-safe fix over changing suppression comments.
- Where suppression is still intentional, consider whether `@ts-expect-error` with a brief reason would be safer, but do not change it without approval.
- Report location, suppressed error or reason, evidence, and proposed action.

## Reporting format

Start with the mode and repository scope examined. Then report:

### Findings

Use one stable number per actionable finding:

1. **Category — concise title**
   - Location: `path:line` or relevant file
   - Evidence: what demonstrates the issue
   - Proposed cleanup: the minimal action
   - Confidence/risk: when relevant

Do not combine unrelated edits into one numbered item. This lets the user approve fixes precisely.

### Clean or not applicable

Briefly identify audit categories with no findings or that could not be evaluated, including the reason.

### Validation limits

State any checks that could not be run because tools, dependencies, configuration, or files were unavailable.

In `run`/`fix` mode, end with the exact approval question and no changes.

## Applying approved fixes

After the user selects items:

1. Re-check each selected finding against the current working tree.
2. Explain and skip any item that is no longer valid or conflicts with user changes.
3. Make only the selected, minimal edits.
4. Do not silently expand scope. Ask before making a newly discovered dependent change that is not essential for correctness.
5. Run the narrowest relevant validation available, followed by broader existing checks when reasonable:
   - targeted tests;
   - typecheck;
   - lint;
   - repository test suite;
   - `git diff --check`.
6. Review the final diff for accidental secret exposure, generated-file churn, unrelated formatting, or unselected changes.

Report:

- selected items completed, skipped, or blocked;
- files changed;
- validation commands and results;
- any remaining risks or manual follow-up.
