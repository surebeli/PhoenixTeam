---
name: phoenix-status
description: "Show full PhoenixTeam workspace status: Git state, current identity, collaborator map, INDEX summary, divergence panel (open/proposed/resolved with approval context), recent diffs by collaborator, unresolved blockers, and team consistency score (0-100)."
user-invocable: true
---

# Skill: status

Display comprehensive workspace status.

## Parameters

None.

## Execution Steps

1. Read `git config phoenix.member-code` to determine current identity (`{me}`). Apply identity guard.
2. Run `git status` and display the result.
3. Output the following sections:

   **【当前身份】** Current member code + role

   **【COLLABORATORS.md 摘要】** All known collaborators, their directories, last activity

   **【INDEX.md 摘要】** Document tree overview, total file count per collaborator

   **【分歧状态】** Read `.phoenix/DIVERGENCES.md`:
   - Group by status, with approval context for `{me}`:
     ```
     🟡 等待我确认 ({count}):
       D-{N}: {title} — {proposer} 提议: {summary} ({date})

     🔴 未解决 ({count}):
       D-{N}: {title} — {parties} — 优先级: {priority}

     ⏳ 等待对方确认 ({count}):
       D-{N}: {title} — 我的提议等待 {other} 确认

     ✅ 已解决 ({count}):
       D-{N}: {title} — {date}
     ```
   - If no DIVERGENCES.md: `（尚未执行 review）`
   - If no open/proposed items: `✅ 当前无待处理分歧`

   **【最近 3 次 diff 摘要】** (grouped by member code):
   - Run `git log --oneline -3 -- .phoenix/`
   - For each commit, summarize what changed and who changed it

   **【未决阻塞项】** Extract from SIGNALS.md any unresolved blockers

   **【一致性评分 (0-100)】** Evaluate team context consistency:
   - 100 = All aligned, no open/proposed divergences
   - 70-99 = Only proposed (awaiting confirmation) or detail-level divergences
   - 40-69 = Open directional divergences, action needed
   - 0-39 = Blocking divergences present, immediate attention required
   - Factor in: THESIS alignment, DIVERGENCES.md (open count, proposed count, priorities), SIGNALS blockers
