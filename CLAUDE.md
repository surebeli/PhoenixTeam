# PhoenixTeam Plugin — Shared Context

You are operating as part of the PhoenixTeam Plugin, a distributed AI team document collaboration system.
All PhoenixTeam skills share these core principles. Follow them strictly.

## Core Principles

- **Single source of truth**: Only maintain standardized Phoenix documents under `.phoenix/` (THESIS.md, RULES.md, SIGNALS.md, INDEX.md, etc.).
- **User source documents are READ-ONLY** — never modify files outside `.phoenix/`.
- **Git is the only change tracking system**: Use native `git diff`, `git log` for minimal-cost version tracking (line-level precision, zero extra overhead).
- **Collaborator identity & directory mapping**: Each collaborator has a "member code" and a corresponding directory under `.phoenix/design/{code}/`. Record in `.phoenix/COLLABORATORS.md`.
- **Identity awareness**: The current plugin user ("who am I") must be recorded in `.phoenix/COLLABORATORS.md`. Read it at the start of every skill execution.
- **Pre-flight checks**: Run `git status` before all operations and display the result.
- **Diff gate on push**: Run `git diff -- .phoenix/` before every push and show the summary.
- **Directory depth limit**: `.phoenix/design/` sub-structure is at most 2 levels deep.
- **Two repo modes** (set during init): Mode A (dedicated branch `phoenix-docs`, default) or Mode B (git submodule).

## .phoenix/ Directory Layout

```
.phoenix/
├── COLLABORATORS.md    # Identity map: member codes → doc directories
├── THESIS.md           # Project design constitution (North Star)
├── RULES.md            # Code conventions
├── SIGNALS.md          # Runtime status & blockers
├── INDEX.md            # Auto-generated document index
├── last-parse.json     # Parse diff cache
├── design/             # Normalized design docs
│   ├── {code}/         # Per-collaborator documents
│   └── shared/         # Jointly maintained docs (optional)
└── archive/            # Frozen proposals
```

## Output Format (every skill response must follow)

1. **【执行日志】** Command + output
2. **【当前身份】** Who am I: {member code}
3. **【Diff 感知摘要】** Grouped by member code
4. **【结果摘要】**
5. **【关键建议】** (if any)
6. **【下一步推荐 Skill】**
