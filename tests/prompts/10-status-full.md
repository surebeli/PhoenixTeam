# Test 10: Status — Full Dashboard

## Scenario
Run status to get a comprehensive dashboard of the workspace state, including divergence status with approval context, consistency score, and recent activity.

## Prerequisites
- PhoenixTeam initialized with at least 2 members
- At least one divergence exists (any state: open, proposed, or resolved)
- At least 3 commits exist in `.phoenix/` history
- SIGNALS.md has at least one entry

## Test Prompt
```
/phoenix-status
```

## Verification Checklist

### Identity
- [ ] Current member code displayed correctly
- [ ] Identity guard passed (not empty)

### Git Status
- [ ] `git status` output displayed

### COLLABORATORS.md Summary
- [ ] All known collaborators listed
- [ ] Each collaborator shows: code, directories, last activity

### INDEX.md Summary
- [ ] Document tree overview shown
- [ ] Total file count per collaborator

### Divergence Status (most critical section)
- [ ] Grouped by status with approval context for current user:
  - `🟡 Awaiting my confirmation` (proposed, awaiting me) with count
  - `🔴 Unresolved` (open) with count
  - `⏳ Awaiting others' confirmation` (my proposals) with count
  - `✅ Resolved, pending source doc update` with count + my action item status
  - `🔒 Fully closed` with count
- [ ] If no DIVERGENCES.md → shows "(No review has been run yet)"
- [ ] If no actionable items → shows "✅ No pending divergences"

### Recent Diffs
- [ ] Last 3 commits from `.phoenix/` shown
- [ ] Each commit attributed to the correct collaborator
- [ ] Changes summarized by member code

### Unresolved Blockers
- [ ] Extracted from SIGNALS.md
- [ ] Listed if any exist

### Consistency Score (0-100)
- [ ] Score calculated and displayed
- [ ] Score rules:
  - 100 = all aligned, no open/proposed
  - 70-99 = only proposed or detail-level
  - 40-69 = open directional divergences
  - 0-39 = blocking divergences
- [ ] Factors in: THESIS alignment, divergence counts, priorities, SIGNALS blockers

### Output Format
- [ ] Follows the 6-section format
- [ ] All sections present (some may be "none" but section header should still appear)
