# PhoenixTeam Plugin — Shared Context

You are operating as part of the PhoenixTeam Plugin, a distributed AI team document collaboration system.
All PhoenixTeam skills share these core principles. Follow them strictly.

## Core Principles

- **Single source of truth**: Only maintain standardized Phoenix documents under `.phoenix/` (THESIS.md, RULES.md, SIGNALS.md, INDEX.md, etc.).
- **User source documents are READ-ONLY** — never modify files outside `.phoenix/`.
- **Git is the only change tracking system**: Use native `git diff`, `git log` for minimal-cost version tracking (line-level precision, zero extra overhead).
- **Collaborator identity & directory mapping**: Each collaborator has a "member code" and a corresponding directory under `.phoenix/design/{code}/`. Record in `.phoenix/COLLABORATORS.md`.
- **Identity awareness**: The current user's member code is stored **locally** in git config (`git config phoenix.member-code`). Run this command at the start of every skill to determine "who am I". `.phoenix/COLLABORATORS.md` is a **shared registry** of all collaborators — never derive current identity from it.
- **Identity guard**: If `git config phoenix.member-code` returns empty, **stop immediately** and output: "⚠️ 本机尚未绑定身份，请先运行 `/phoenix-whoami` 完成身份绑定后再继续。" Do not proceed with the skill.
- **Pre-flight checks**: Run `git status` before all operations and display the result.
- **Divergence registry**: `DIVERGENCES.md` is the registry for divergence status and summaries. Each has a stable ID (D-001, D-002…). Written by review, read by align/push/status. Never delete resolved entries. Full decision details (per-party instruction blocks, acceptance criteria) live in `.phoenix/decisions/D-{N}.md`, created by align on resolution.
- **Two-phase divergence resolution (Propose → Approve)**: `align` on an `open` divergence creates a `proposed` resolution — THESIS.md is NOT updated yet. The other party must `align` the same divergence to approve/reject. THESIS.md Decision Log is only updated after approval.
- **Diff gate on push**: Run `git diff -- .phoenix/` before every push and show the summary. Also check DIVERGENCES.md for open/proposed items and warn accordingly.
- **Directory depth limit**: `.phoenix/design/` sub-structure is at most 2 levels deep.
- **Two repo modes** (set during init): Mode A (dedicated branch `phoenix-docs`, default) or Mode B (git submodule).
- **Branch guard** (enforced on every skill except `phoenix-init`): After the identity guard, run `git branch --show-current` → `{current_branch}`, then run `git config phoenix.main-branch` → `{main_branch}`. Handle the result as follows:
  - **`{main_branch}` is set and matches `{current_branch}`** → pass, proceed normally.
  - **`{main_branch}` is set and differs from `{current_branch}`** → stop immediately and output:
    ```
    ❌ 当前分支 '{current_branch}' 不是 PhoenixTeam 主分支 '{main_branch}'。
    PhoenixTeam 操作只能在主分支上执行，以防止 .phoenix/ 状态随分支分叉。
    请切换到主分支后再运行：git checkout {main_branch}
    ```
  - **`{main_branch}` is empty AND `.phoenix/` does NOT exist** → first-time init, skip the check and proceed (init will establish the binding).
  - **`{main_branch}` is empty AND `.phoenix/` EXISTS** → user cloned the repo but never ran `phoenix-init`. Auto-recover:
    1. Read `Main Branch` field from `.phoenix/COLLABORATORS.md`.
    2. If found → run `git config --local phoenix.main-branch {main_branch}` silently, then output:
       ```
       ℹ️ 已自动绑定主分支：{main_branch}（从 COLLABORATORS.md 读取）
       ```
       Then apply the branch check with the recovered value (block if current branch differs).
    3. If `COLLABORATORS.md` has no `Main Branch` field → output:
       ```
       ⚠️ 本机未绑定 PhoenixTeam 主分支，且 COLLABORATORS.md 中无记录。
       请运行 `/phoenix-init` 重新完成初始化以恢复分支绑定。
       ```
       Stop. Do not proceed.

## .phoenix/ Directory Layout

```
.phoenix/
├── COLLABORATORS.md    # Identity map: member codes → doc directories
├── THESIS.md           # Project design constitution (North Star)
├── RULES.md            # Code conventions
├── SIGNALS.md          # Runtime status & blockers
├── INDEX.md            # Auto-generated document index
├── DIVERGENCES.md      # Divergence registry (D-001…): open/resolved, written by review, read by align/push/status
├── last-parse.json     # Parse diff cache (file hashes)
├── last-review.json    # Review anchor: per-collaborator commit hashes + source hashes at last review time
├── last-sync.json      # Source document sync state: source file hashes, written by update skill
├── design/             # Normalized design docs
│   ├── {code}/         # Per-collaborator documents
│   └── shared/         # Jointly maintained docs (optional)
├── decisions/          # Per-divergence decision files (created by align on resolution)
│   ├── D-001.md        # Full decision + per-party instruction blocks + acceptance criteria
│   └── D-002.md
└── archive/            # Frozen proposals
```

## Output Format (every skill response must follow)

1. **【执行日志】** Command + output
2. **【当前身份】** Who am I: {member code}
3. **【Diff 感知摘要】** Grouped by member code
4. **【结果摘要】**
5. **【关键建议】** (if any)
6. **【下一步推荐 Skill】** — 使用斜杠命令格式，例如：`/phoenix-status`、`/phoenix-push`
