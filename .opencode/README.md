# OpenCode Custom Subagents

Read-only OpenCode subagents for automated code and UI review.

## Included Agents

- `code-scanner.md` — scans for security, reliability, performance, accessibility, and code-quality issues.
- `refactor-scanner.md` — identifies verified duplication and focused refactoring opportunities.
- `ui-reviewer.md` — reviews a running interface with a Playwright MCP server.

## Install

Place the agent files in the project-level OpenCode agents directory:

```text
.opencode/agents/
├── code-scanner.md
├── refactor-scanner.md
└── ui-reviewer.md
```

OpenCode derives each agent name from its filename. The files use `mode: subagent`, so they can be called manually with an `@` mention or selected automatically by another agent.

Examples:

```text
@code-scanner scan src/app for security and performance problems
@refactor-scanner find duplicated formatting and validation logic
@ui-reviewer review http://localhost:3000 at mobile, tablet, and desktop sizes
```

## Why the Frontmatter Changed

These agents use OpenCode's current `permission` object instead of Claude Code's comma-separated `tools` string. The legacy OpenCode `tools` setting expects a boolean object and is deprecated in favor of `permission`.

Each agent starts with:

```yaml
permission:
  "*": deny
```

Required tools are then explicitly allowed. This keeps the review agents read-only.

The `model: sonnet` entries were removed. In OpenCode, model IDs use `provider/model-id`; without an override, a subagent inherits the model used by the invoking primary agent. To pin a model, first run:

```powershell
opencode models anthropic
```

Then add the exact returned identifier, for example:

```yaml
model: anthropic/<exact-model-id>
```

## Refactor Scanner: LSP

Claude Code's `mcp__ide__getDiagnostics` tool is not an OpenCode agent tool name. The migrated agent allows OpenCode's `lsp` tool instead.

Enable built-in LSP servers in the project `opencode.json` or `opencode.jsonc`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": true
}
```

The callable LSP tool is currently experimental. In PowerShell, enable it for the current terminal before starting OpenCode:

```powershell
$env:OPENCODE_EXPERIMENTAL_LSP_TOOL = "true"
opencode
```

OpenCode can still use enabled LSP servers for diagnostic feedback even when the experimental callable tool is not enabled.

## UI Reviewer: Playwright MCP

The UI reviewer expects an MCP server configured with the exact OpenCode server name `playwright`. MCP tools are registered with the server name as a prefix, so the permission rule is:

```yaml
"playwright_*": allow
```

Add or inspect MCP servers with:

```powershell
opencode mcp add
opencode mcp list
```

If your configured server has another name, change the wildcard in `ui-reviewer.md`. For example, a server named `browser` requires:

```yaml
"browser_*": allow
```

## Troubleshooting

Validate these points if OpenCode still reports an invalid configuration:

1. The files are under `.opencode/agents/`, not `.claude/agents/`.
2. `permission` is a YAML object, not a quoted comma-separated string.
3. Permission values are `allow`, `ask`, or `deny`.
4. MCP wildcards use the OpenCode server-name prefix, such as `playwright_*`.
5. Any explicit model uses the full `provider/model-id` format.
