---
name: research
description: Execute a named repository research prompt, gather evidence from code, data, MCP tools, and authoritative external sources, then write documentation without changing source code.
compatibility: opencode
metadata:
  category: documentation
  workflow: repository-research
---

# Repository Research

## Purpose

Use this skill to execute a structured research task defined in `context/research/<prompt-name>.md` and write the findings to the documentation path declared by that prompt.

This workflow produces documentation only. It must not implement features, refactor code, change runtime configuration, or alter application data.

## Input

Obtain a single `<prompt-name>` from the current user request or the command that loaded this skill.

- The value is the file stem, not a path.
- A trailing `.md` may be removed.
- Reject values containing `/`, `\\`, `..`, or a null byte.
- If no usable value is provided, stop and report exactly:

  `Usage: /research <prompt-name>`

Resolve the research prompt as:

`context/research/<prompt-name>.md`

If it does not exist, stop and report exactly:

`Prompt file not found at context/research/<prompt-name>.md`

## Research Prompt Contract

Read the entire prompt file before starting. It should define these Markdown sections:

- `Output` — destination file for the finished documentation.
- `Research` — questions or topics to investigate.
- `Include` — required details, comparisons, examples, or evidence.
- `Sources` — files, directories, systems, databases, MCP servers, or external references to inspect.

If a section is missing, state which section is missing. Continue only when the remaining instructions make the intended research and output unambiguous; otherwise stop with a concise error.

## Workflow

### 1. Resolve and validate the output

- Treat relative paths as relative to the repository root.
- Prefer destinations under `docs/`.
- Respect another location only when the prompt explicitly specifies it.
- If no output is specified, use `docs/research/<prompt-name>.md`.
- Reject absolute paths and paths that escape the repository.
- Read an existing output file before replacing it so useful structure or prior evidence is not lost accidentally.

### 2. Build an evidence plan

Translate the `Research`, `Include`, and `Sources` sections into a small checklist of verifiable questions. Identify which evidence can come from:

- repository files and generated artifacts;
- schema, migrations, constants, configuration, tests, and components;
- read-only database or MCP queries;
- dependency or upstream documentation;
- authoritative external sources.

Do not treat assumptions as findings.

### 3. Inspect the repository

Use OpenCode's native tools deliberately:

- `glob` to locate candidate files;
- `grep` to find symbols, strings, routes, fields, and usage patterns;
- `read` to inspect relevant files with surrounding context;
- `lsp` when available for definitions, references, and call relationships;
- `bash` only for read-only inspection commands when native tools are insufficient.

Follow references far enough to explain actual behavior, not merely declarations. Check tests, migrations, generated types, and call sites when they affect the conclusion.

### 4. Query connected systems only when needed

When the prompt requests database or service evidence, use the installed MCP tools, such as a Neon MCP server, in read-only mode.

- Discover the available MCP tool names instead of assuming a fixed prefix.
- Prefer metadata and `SELECT`-style queries.
- Never run migrations, writes, deletes, schema changes, or administrative mutations.
- Do not expose secrets, credentials, tokens, or unnecessary personal data in the output.

### 5. Research external material when required

Use `websearch`, `webfetch`, or the built-in `scout` subagent when the task depends on current or upstream information.

- Prefer official documentation, specifications, source repositories, and primary research.
- Record the source URL or canonical reference and access date when facts may change.
- Clearly distinguish external facts from repository-specific observations.

### 6. Use subagents selectively

For broad tasks, use the Task tool to parallelize independent lines of inquiry:

- `explore` for fast, read-only repository searches;
- `scout` for external documentation and dependency research;
- `general` only when a more complex independent investigation is necessary.

Give each subagent a narrow question and required evidence format. Do not delegate final synthesis, output-path validation, or the documentation-only constraints.

### 7. Evaluate evidence

For every material conclusion:

- cite the supporting repository path and line range when practical;
- cite database query results by table/view and query purpose;
- cite external sources with stable references;
- label inferences explicitly;
- note conflicting evidence, stale artifacts, and unresolved gaps.

Prefer observed runtime paths and active configuration over comments, abandoned files, or naming alone.

### 8. Write the documentation

Write only to the validated output file. Follow any structure required by the research prompt. Otherwise use:

1. `# <Research title>`
2. `## Summary`
3. `## Scope and method`
4. `## Findings`
5. `## Evidence`
6. `## Gaps and uncertainties`
7. `## Recommendations` — documentation or follow-up research only
8. `## Sources`

Make the document self-contained, precise, and useful to a reader who did not watch the investigation. Avoid dumping raw search results. Include concise tables when they improve comparison.

If the output already exists, update it coherently rather than appending duplicate sections.

### 9. Verify before finishing

Confirm that:

- every requested item in `Include` is addressed;
- important claims have evidence;
- the output path is correct;
- no source code, configuration, migrations, or application data changed;
- no branch or commit was created;
- no temporary research files remain outside the documentation output.

## Hard Constraints

- Produce documentation only.
- Do not modify source code or runtime configuration.
- Do not create or switch branches.
- Do not create commits, tags, or pull requests.
- Do not mutate databases or external services.
- Do not fabricate findings when evidence is unavailable.
- Do not write outside the repository.

## Completion Response

After writing the document, report:

- the output path;
- the most important findings;
- unresolved gaps or assumptions;
- the principal evidence sources inspected.
