---
name: phoenix-push
short-description: "Push changes with diff review and divergence gate"
description: "Push .phoenix/ document changes to remote with mandatory diff review and divergence check. Warns distinctly for open vs proposed divergences before pushing. Shows what you're about to push grouped by collaborator."
user-invocable: true
argument-hint: "[commit message]"
triggers: []
callable-by: []
estimated-tokens:
  context: 2500
  skill: 1300
  data-read: 500
  output: 600
  total: ~4900
---

# Skill: push

Push document changes with enforced diff review and divergence gate.

## Parameters

- `$ARGUMENTS`: Optional custom commit message. Default: `"[PhoenixTeam] {code} document update"`

## Execution Steps

### Step 1 — Identity & pre-flight

1. Read `git config phoenix.member-code` to determine current identity (`{me}`). Apply identity guard.
2. Run `git status` and display the result.

### Step 2 — Source drift check

1. Read `.phoenix/last-sync.json` if it exists.
2. For each source file recorded in `last-sync.json`, check if the current file hash differs.
3. If any source files have changed since last sync:

```
⚠️ Source drift detected: {N} source file(s) changed but not synced

  ~ ./design/spec.md (modified)
  + ./design/new-api.md (new)

Recommend running /phoenix-update to sync source documents before pushing.
Continue pushing anyway? (yes / sync first)
```

**Stop and wait for confirmation.**
- User confirms → proceed to Step 3.
- User chooses to sync first → stop, suggest `/phoenix-update`.

4. If no `last-sync.json` or no drift → proceed silently.

### Step 3 — Divergence gate

1. Read `.phoenix/DIVERGENCES.md` if it exists.
2. Count and classify divergences:
   - `open` — unresolved
   - `proposed` awaiting `{me}` — pending my approval
   - `proposed` awaiting others — pending their approval
3. Output status summary and handle accordingly:

**If `proposed` items await `{me}`:**
```
🟡 {N} divergence proposal(s) awaiting your confirmation:

| ID | Title | Proposer | Proposed decision |
|----|-------|----------|-------------------|
| D-{N} | {title} | {proposer} | {summary} |

Recommend running /phoenix-align D-{N} to confirm before pushing.
Continue pushing anyway? (yes / confirm first)
```

**If `open` items exist:**
```
🔴 {N} unresolved divergence(s):

| ID | Title | Priority |
|----|-------|----------|
| D-{N} | {title} | {priority} |

Other collaborators will see these unresolved divergences after pulling.
Continue pushing? (yes / resolve first)
```

**If `proposed` items await others (already pushed by me):**
```
⏳ {N} divergence proposal(s) awaiting others' confirmation: {list}
(They will receive a confirmation reminder after pulling)
```
→ Proceed without blocking.

4. If user chooses to resolve first → suggest the appropriate align command and stop.
5. If user confirms or no actionable divergences → proceed to Step 3.
6. If DIVERGENCES.md does not exist → proceed silently.

### Step 4 — Diff review (handles pre-committed changes)

1. Run `git diff -- .phoenix/` (unstaged) and `git diff --cached -- .phoenix/` (staged) to check for uncommitted changes.
2. Run `git log @{u}..HEAD --oneline -- .phoenix/` (or `git log origin/{branch}..HEAD --oneline -- .phoenix/` if upstream not set) to check for **committed but unpushed** .phoenix/ changes.
3. Combine both sources into a **【Diff 感知摘要】** grouped by member code:
   - Uncommitted changes: files per collaborator, lines added/deleted
   - Unpushed commits: list each commit with summary
4. If no uncommitted changes AND no unpushed commits → inform and skip push.
5. If only unpushed commits exist (user already committed manually) → skip to Step 5.3 (push only, no new commit needed).

### Step 5 — Commit and push (staging isolation)

1. **Staging area isolation**: Before staging, check `git diff --cached --name-only` for files outside `.phoenix/`. If any non-.phoenix/ files are already staged:
   ```
   ⚠️ Detected {N} staged file(s) outside .phoenix/:
     {file list}
   These will NOT be included in the PhoenixTeam commit.
   ```
   Run `git stash push --staged --message "phoenix-push: isolate non-phoenix staged files"` to temporarily save them, then restore after commit with `git stash pop`.
   If no non-.phoenix/ files staged → proceed directly (no stash needed).

2. Run `git add .phoenix/**/*.md`.
3. Also add `.phoenix/DIVERGENCES.md`, `.phoenix/last-review.json`, `.phoenix/last-parse.json`, `.phoenix/last-sync.json` if changed.
4. Commit with the provided message or default: `"[PhoenixTeam] {code} document update"`.
   - **Skip commit if Step 4.5 determined only unpushed commits exist** (nothing new to commit).
5. Run `git push`.
6. Output: push result + commit hash(es) + this push's diff summary.

## Important

- **Never push non-.phoenix/ files.**
- Source drift check and divergence gate are both **soft warnings** — user can always choose to push.
- Warning priority: source drift → pending approvals → open divergences.
