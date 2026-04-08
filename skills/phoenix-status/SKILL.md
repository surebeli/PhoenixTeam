---
name: phoenix-status
description: "Show full PhoenixCollab workspace status: Git state, current identity, collaborator map, INDEX summary, recent diffs by collaborator, unresolved blockers, and team consistency score (0-100)."
user-invocable: true
---

# Skill: status

Display comprehensive workspace status.

## Parameters

None.

## Execution Steps

1. Read `.phoenix/COLLABORATORS.md` to determine current identity.
2. Run `git status` and display the result.
3. Output the following sections:

   - **当前身份**: Current member code + role
   - **COLLABORATORS.md 摘要**: All known collaborators, their directories, last activity
   - **INDEX.md 摘要**: Document tree overview, total file count per collaborator
   - **最近 3 次 diff 摘要** (grouped by member code):
     - Run `git log --oneline -3 -- .phoenix/`
     - For each commit, summarize what changed and who changed it
   - **未决阻塞项**: Extract from SIGNALS.md any unresolved blockers
   - **一致性评分 (0-100)**: Evaluate team context consistency:
     - 100 = All collaborators' docs align with THESIS, no conflicts
     - 70-99 = Minor divergences, suggestions available
     - 40-69 = Significant conflicts, action needed
     - 0-39 = Critical misalignment, immediate attention required
     - Base the score on: THESIS alignment, inter-collaborator conflicts, SIGNALS blockers, recent diff divergence
