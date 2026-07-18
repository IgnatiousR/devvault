---
description: Audit repository housekeeping, or select targeted cleanup fixes
---

Load and follow the `cleanup` skill.

Requested mode: `$1`
Full command arguments: `$ARGUMENTS`

Interpret the mode as follows:

- No argument or `check`: perform the read-only cleanup audit.
- `run` or `fix`: perform the read-only audit, number every actionable finding, ask which numbered items to fix, and stop before editing.
- Any other first argument: output `Usage: /cleanup [check|run]` and stop.

Do not treat `run` or `fix` as approval to modify files. Changes are allowed only after the user responds with specific finding numbers or `all`.
