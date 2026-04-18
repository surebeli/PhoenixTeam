---
name: phoenix-status
short-description: "Show workspace status and consistency score"
description: "Show full PhoenixTeam workspace status: Git state, current identity, collaborator map, INDEX summary, divergence panel (open/proposed/resolved with approval context), recent diffs by collaborator, unresolved blockers, and team consistency score (0-100)."
user-invocable: true
triggers: []
callable-by: []
estimated-tokens:
  context: 2500
  skill: 600
  data-read: 500
  output: 800
  total: ~4400
---

# Skill: status

Display comprehensive workspace status.

## Parameters

None.

## Execution Steps

1. Read `git config phoenix.member-code` to determine current identity (`{me}`). Apply identity guard.
2. Run `git status` and display the result.
3. Output the following sections:

   **[Current Identity]** Current member code + role

   **[COLLABORATORS.md Summary]** All known collaborators, their directories, last activity

   **[INDEX.md Summary]** Document tree overview, total file count per collaborator

   **[Divergence Status]** Read `.phoenix/DIVERGENCES.md`:
   - Group by status, with approval context for `{me}`:
     ```
     🟡 Awaiting my confirmation ({count}):
       D-{N}: {title} — {proposer} proposes: {summary} ({date})

     🔴 Unresolved ({count}):
       D-{N}: {title} — {parties} — Priority: {priority}

     ⏳ Awaiting others' confirmation ({count}):
       D-{N}: {title} — my proposal awaiting {other}

     ✅ Resolved, pending source doc update ({count}):
       D-{N}: {title} — decision reached, {parties} need to update source docs
       My Action Item: {⏳ Pending update / ✅ Complete}

     🔒 Fully closed ({count}):
       D-{N}: {title} — all source documents updated per decision
     ```
   - If no DIVERGENCES.md: `(No review has been run yet)`
   - If no open/proposed items: `✅ No pending divergences`

   **[Recent 3 Diff Summaries]** (grouped by member code):
   - Run `git log --oneline -3 -- .phoenix/`
   - For each commit, summarize what changed and who changed it

   **[Unresolved Blockers]** Extract from SIGNALS.md any unresolved blockers

   **[Consistency Score (0-100)]** Evaluate team context consistency:
   - 100 = All aligned, no open/proposed divergences
   - 70-99 = Only proposed (awaiting confirmation) or detail-level divergences
   - 40-69 = Open directional divergences, action needed
   - 0-39 = Blocking divergences present, immediate attention required
   - Factor in: THESIS alignment, DIVERGENCES.md (open count, proposed count, priorities), SIGNALS blockers
