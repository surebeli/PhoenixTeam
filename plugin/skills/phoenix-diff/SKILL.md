---
name: phoenix-diff
description: "View structured git diff for .phoenix/ documents grouped by collaborator. Supports --last, --commit=abc123, --against=origin/main for flexible diff ranges. Highlights DIVERGENCES.md state transitions (open→proposed→resolved). Shows collaboration impact analysis."
user-invocable: true
argument-hint: "[--last | --commit=abc123 | --against=origin/main]"
---

# Skill: diff (Diff Awareness)

View precise document changes with collaborator attribution and divergence state tracking.

## Parameters

- `$ARGUMENTS`: Optional diff range specifier:
  - `--last` or no argument: `HEAD~1..HEAD -- .phoenix/`
  - `--commit=abc123`: `abc123~1..abc123 -- .phoenix/`
  - `--against=origin/main`: `origin/main..HEAD -- .phoenix/`

## Execution Steps

1. Read `git config phoenix.member-code` to determine current identity. Apply identity guard.
2. Read `.phoenix/COLLABORATORS.md` to determine collaborator directory mapping.
3. Parse `$ARGUMENTS` to determine the git diff range. Default: `HEAD~1..HEAD -- .phoenix/`.
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
2. Output a dedicated **【分歧状态变更】** section:
   ```
   ### 分歧状态变更
   - D-001: `open` → `proposed` 🟡 (alice 提议: 采用 REST API)
   - D-002: `proposed` → `resolved` ✅ (bob 确认, 决策: Kubernetes 部署)
   - D-003: `proposed` → `open` 🔴 (alice 的提议被 bob 拒绝)
   ```
3. If no DIVERGENCES.md changes in the diff, skip this section.

### Step 7 — Collaboration impact analysis

Output:
- Whose documents were affected by whose changes
- Potential conflicts or synergies between collaborators
- Whether any changes conflict with THESIS.md
- Whether any changes affect open/proposed divergences (e.g., "alice 修改了 design/alice/api.md，该文件涉及 D-001 (open)")
