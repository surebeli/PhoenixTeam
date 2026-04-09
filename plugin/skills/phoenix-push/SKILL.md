---
name: phoenix-push
description: "Push .phoenix/ document changes to remote with mandatory diff review and divergence check. Warns distinctly for open vs proposed divergences before pushing. Shows what you're about to push grouped by collaborator."
user-invocable: true
argument-hint: "[commit message]"
---

# Skill: push

Push document changes with enforced diff review and divergence gate.

## Parameters

- `$ARGUMENTS`: Optional custom commit message. Default: `"[PhoenixTeam] {current code} 文档更新"`

## Execution Steps

### Step 1 — Identity & pre-flight

1. Read `git config phoenix.member-code` to determine current identity (`{me}`). Apply identity guard.
2. Run `git status` and display the result.

### Step 2 — Divergence gate

1. Read `.phoenix/DIVERGENCES.md` if it exists.
2. Count and classify divergences:
   - `open` — unresolved
   - `proposed` awaiting `{me}` — pending my approval
   - `proposed` awaiting others — pending their approval
3. Output status summary and handle accordingly:

**If `proposed` items await `{me}`:**
```
🟡 有 {N} 个分歧提议等待您确认:

| ID | 标题 | 提议者 | 提议决策 |
|----|------|--------|----------|
| D-{N} | {title} | {proposer} | {summary} |

建议先运行 /phoenix-align D-{N} 完成确认后再推送。
是否仍要继续推送？(yes / 先确认)
```

**If `open` items exist:**
```
🔴 存在 {N} 个未解决分歧:

| ID | 标题 | 优先级 |
|----|------|--------|
| D-{N} | {title} | {priority} |

推送后其他协作者 pull 时将看到这些未解决的分歧。
是否继续推送？(yes / 先解决)
```

**If `proposed` items await others (already pushed by me):**
```
⏳ {N} 个分歧提议等待对方确认: {list}
（推送后对方 pull 时会收到确认提醒）
```
→ Proceed without blocking.

4. If user chooses to resolve first → suggest the appropriate align command and stop.
5. If user confirms or no actionable divergences → proceed to Step 3.
6. If DIVERGENCES.md does not exist → proceed silently.

### Step 3 — Diff review

1. Run `git diff -- .phoenix/` and output a **【Diff 感知摘要】** grouped by member code:
   - Changed files per collaborator
   - Lines added/deleted with key content highlights
2. If no changes and nothing staged → inform and skip push.

### Step 4 — Commit and push

1. Run `git add .phoenix/**/*.md`.
2. Also add `.phoenix/DIVERGENCES.md`, `.phoenix/last-review.json` if changed.
3. Commit with the provided message or default: `"[PhoenixTeam] {code} 文档更新"`.
4. Run `git push`.
5. Output: push result + commit hash + this push's diff summary.

## Important

- **Never push non-.phoenix/ files.**
- The divergence gate is a **soft warning** — user can always choose to push.
- Pending approvals awaiting `{me}` get higher priority warning than open divergences.
