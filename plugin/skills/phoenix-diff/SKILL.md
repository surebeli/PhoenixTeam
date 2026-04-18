---
name: phoenix-diff
short-description: "View structured diff grouped by collaborator"
description: "View structured git diff for .phoenix/ documents grouped by collaborator. Supports --last, --commit=abc123, --against=origin/main for flexible diff ranges. Highlights DIVERGENCES.md state transitions (open→proposed→resolved). Shows collaboration impact analysis."
user-invocable: true
argument-hint: "[--last | --commit=abc123 | --against=origin/main]"
triggers: []
callable-by: []
estimated-tokens:
  context: 2500
  skill: 800
  data-read: variable
  output: 600
  total: ~3900+
---

# Skill: diff (Diff Awareness)

View precise document changes with collaborator attribution and divergence state tracking.

## Parameters

- `$ARGUMENTS`: Optional diff range specifier:
  - `--last` or no argument: Smart default (see Step 3)
  - `--commit=abc123`: `abc123~1..abc123 -- .phoenix/`
  - `--against=origin/main`: `origin/main..HEAD -- .phoenix/`

## Execution Steps

1. Read `git config phoenix.member-code` to determine current identity. Apply identity guard.
2. Read `.phoenix/COLLABORATORS.md` to determine collaborator directory mapping.
3. Parse `$ARGUMENTS` to determine the git diff range:
   - If `--commit` or `--against` specified → use that range directly.
   - If `--last` or no argument → **smart default**:
     1. Check `git log @{u}..HEAD --oneline -- .phoenix/` for unpushed .phoenix/ commits.
     2. If unpushed commits exist → use `@{u}..HEAD -- .phoenix/` (all local changes not yet pushed — most useful default).
     3. If no upstream or no unpushed commits → fallback to `HEAD~1..HEAD -- .phoenix/`.
     4. Display which range was used: `📎 Diff range: {range}`.
4. Run the corresponding `git diff` command.
5. Output a **structured diff summary grouped by member code**:
   ```
   ### {code-1}
   - `design/{code-1}/file.md`: +{added} / -{deleted} lines
     Key changes: {summary of important content changes}

   ### {code-2}
   - (no changes)

   ### Core files
   - `THESIS.md`: +{added} / -{deleted} lines
     Key changes: {summary}
   ```

### Step 6 — Divergence state transitions

If `DIVERGENCES.md` appears in the diff:

1. Parse the before/after content to detect state transitions.
2. Output a dedicated **[Divergence State Transitions]** section:
   ```
   ### Divergence State Transitions
   - D-001: `open` → `proposed` 🟡 (alice proposes: adopt REST API)
   - D-002: `proposed` → `resolved` ✅ (bob confirmed, decision: Kubernetes deployment)
   - D-003: `proposed` → `open` 🔴 (alice's proposal rejected by bob)
   ```
3. If no DIVERGENCES.md changes in the diff, skip this section.

### Step 7 — Collaboration impact analysis

Output:
- Whose documents were affected by whose changes
- Potential conflicts or synergies between collaborators
- Whether any changes conflict with THESIS.md
- Whether any changes affect open/proposed divergences (e.g., "alice modified design/alice/api.md, which is referenced in D-001 (open)")
