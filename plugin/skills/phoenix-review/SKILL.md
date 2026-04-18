---
name: phoenix-review
short-description: "Analyze divergences between collaborators"
description: "Analyze divergence between collaborators' documents. Compares all members' proposals against THESIS (North Star), identifies conflicts, overlaps, and gaps, and produces a structured divergence report. Writes results to DIVERGENCES.md with stable IDs (D-001, D-002…). Read-only on design docs — does not modify any collaborator files."
user-invocable: true
argument-hint: "[topic or specific file to focus on]"
triggers: []
callable-by: []
estimated-tokens:
  context: 2500
  skill: 2100
  data-read: variable
  output: 1500
  total: ~6100+
---

# Skill: review

Structured divergence analysis across collaborators. Writes to `.phoenix/DIVERGENCES.md`.

## Parameters

- `$ARGUMENTS`: Optional topic or file path to focus the review on. If omitted, review all documents.

## Execution Steps

### Step 1 — Identity & pre-flight

1. Read `git config phoenix.member-code` to determine current identity. Apply identity guard.
2. Run `git status` and display the result.
3. Read `.phoenix/COLLABORATORS.md` to get all known collaborators and their directories.

### Step 2 — Determine review scope (anchor-based)

1. Read `.phoenix/last-review.json` if it exists. It has the structure:
   ```json
   {
     "reviewed_at": "<ISO timestamp>",
     "head_commit": "<hash>",
     "per_collaborator": {
       "<code>": {
         "commit": "<last-seen commit hash for their design dir>",
         "source_hashes": {
           "./design/spec.md": "<hash at review time>"
         }
       }
     }
   }
   ```
2. For each collaborator, run `git log --oneline -1 -- .phoenix/design/{code}/` to get their latest commit.
3. Also read `.phoenix/last-sync.json` for the current user's source file hashes.
4. Compare against stored hashes — a collaborator needs re-analysis if ANY of the following:
   - **New collaborator** (not in last-review.json) → full analysis
   - **Commit changed** in `.phoenix/design/{code}/` → re-analyze
   - **Source files changed** since last review (compare current source hashes vs `per_collaborator[me].source_hashes`) → re-analyze (source drift since last review means .phoenix/ may be stale)
   - **No change** in both commit and source hashes → skip
5. If `last-review.json` does not exist → treat all collaborators as new (full review).
6. Output:
   ```
   Review scope:
     - alice: re-analyze (new commits in design/)
     - bob: re-analyze (source files changed since last review)
     - carol: skip (no new commits, no source file changes)
   ```

### Step 3 — Load baseline and existing divergences

1. Read `.phoenix/THESIS.md` — alignment baseline (North Star).
2. Read `.phoenix/INDEX.md` for document overview.
3. Read `.phoenix/DIVERGENCES.md` if it exists.
   - Extract all existing divergence IDs (D-001, D-002, …) and their statuses.
   - Note the highest existing ID number to continue auto-increment.
   - `resolved` divergences are **not re-opened** even if similar issues appear again.
   - `proposed` divergences are carried forward unchanged — they are in the approval pipeline and should not be disrupted by a new review.
   - `open` divergences for collaborators not being re-analyzed are carried forward unchanged.

### Step 4 — Analyze (only for collaborators in scope)

For each in-scope collaborator, read their documents under `.phoenix/design/{code}/`.

Determine diff range for recent change context:
- If `last-review.json` exists and contains `head_commit` → `git diff {head_commit}..HEAD -- .phoenix/` (anchored to last review)
- Otherwise → `git diff HEAD~3..HEAD -- .phoenix/` (fallback)

Perform the following checks:

**A. Against THESIS**: Does this collaborator's proposal align with the North Star?

**B. Against other collaborators**: For each pair of in-scope collaborators, and between in-scope and out-of-scope collaborators using current docs:
- Identify conflicts (contradictory decisions)
- Identify overlaps (same ground, different approach)
- Identify gaps (only one side covers this)

**C. Match against existing open divergences**:
- If an existing open divergence (e.g., D-002) is now resolved by the new commits (one side withdrew their position) → mark it `auto-resolved` and note why.
- If an existing open divergence is unchanged → carry it forward, do not create a duplicate.
- Only create a new D-xxx ID for genuinely new divergences not present in DIVERGENCES.md.

### Step 5 — Output divergence report

```
## Divergence Report

### New divergences

#### D-{N}: {title}

**Parties**: {code-1} vs {code-2}
**{code-1}'s position**: {specific summary, cite doc path and key passage}
**{code-2}'s position**: {specific summary, cite doc path and key passage}
**THESIS alignment**:
  - {code-1}: {aligned / diverged / unrelated} — {reason}
  - {code-2}: {aligned / diverged / unrelated} — {reason}
**Nature**: {technology choice / architecture direction / priority / scope}
**Priority**: {blocking / directional / detail}

### Proposals awaiting confirmation (no action)

- D-{N}: {title} — `proposed` 🟡 by {proposer}, awaiting {other}

### Known divergences (no new commits, status unchanged)

- D-{N}: {title} — `open` ({code} has no new commits)

### Auto-resolved divergences

- D-{N}: {title} — `auto-resolved` — {reason}

## Consensus areas
{Areas where collaborators agree}

## Gap areas
{Topics covered by only one collaborator or implied by THESIS but uncovered}

## Recommended handling priority
1. Blocking: D-{N}, D-{N}
2. Directional: D-{N}
3. Detail: D-{N}
```

### Step 6 — Write DIVERGENCES.md

Write/update `.phoenix/DIVERGENCES.md` with the following format:

```markdown
# PhoenixTeam Divergence Registry

_Last reviewed: {ISO timestamp} @ {head_commit} by {current_code}_

## Open

### D-{N}: {title}

**Status**: `open` 🔴
**Parties**: {code-1}, {code-2}
**Nature**: {technology choice / architecture direction / priority}
**Priority**: {blocking / directional / detail}
**Found at**: review @ `{commit_hash}` ({date})

- **{code-1}** (`design/{code-1}/{file}`): {one-line summary of position}
- **{code-2}** (`design/{code-2}/{file}`): {one-line summary of position}
- **THESIS**: {alignment note}

---

## Resolved

### D-{N}: {title} ✅

**Status**: `resolved`
**Resolved at**: {align / auto-resolved} @ `{commit_hash}` ({date})
**Decision**: {summary of decision}
**Decided by**: {code}
```

Rules:
- Never delete resolved entries — they are the audit trail.
- New divergences are appended to the `## Open` section.
- Auto-resolved divergences move from Open to Resolved automatically.
- If `## Open` section becomes empty, write: `_(No unresolved divergences)_`

### Step 7 — Write last-review.json and commit

1. Write `.phoenix/last-review.json`:
   ```json
   {
     "reviewed_at": "<ISO timestamp>",
     "head_commit": "<current HEAD hash>",
     "per_collaborator": {
       "<code>": {
         "commit": "<latest commit hash for their design dir or null if no commits>",
         "source_hashes": {
           "<source file path>": "<hash>"
         }
       }
     }
   }
   ```
   For the current user (`{me}`), populate `source_hashes` from `.phoenix/last-sync.json` (if exists) — records the source file state at review time for future drift detection. For other collaborators, omit `source_hashes` (their source files are not locally accessible).
2. Run `git add .phoenix/DIVERGENCES.md .phoenix/last-review.json` and commit:
   `"[PhoenixTeam] review — {N} new divergences, {M} known divergences"`

### Step 8 — Next step recommendation

- If blocking divergences exist → recommend `/phoenix-align <D-N>` (Claude Code) / `p-team:phoenix-align` (Codex CLI)
- If only minor divergences → recommend `/phoenix-suggest`
- If well-aligned or all resolved → recommend `/phoenix-push`
