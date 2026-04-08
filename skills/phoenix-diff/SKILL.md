---
name: phoenix-diff
description: "View structured git diff for .phoenix/ documents grouped by collaborator. Supports --last, --commit=abc123, --against=origin/main for flexible diff ranges. Shows collaboration impact analysis."
user-invocable: true
argument-hint: "[--last | --commit=abc123 | --against=origin/main]"
---

# Skill: diff (Diff Awareness)

View precise document changes with collaborator attribution.

## Parameters

- `$ARGUMENTS`: Optional diff range specifier:
  - `--last` or no argument: `HEAD~1..HEAD -- .phoenix/`
  - `--commit=abc123`: `abc123~1..abc123 -- .phoenix/`
  - `--against=origin/main`: `origin/main..HEAD -- .phoenix/`

## Execution Steps

1. Read `.phoenix/COLLABORATORS.md` to determine current identity and collaborator directory mapping.
2. Parse `$ARGUMENTS` to determine the git diff range. Default: `HEAD~1..HEAD -- .phoenix/`.
3. Run the corresponding `git diff` command.
4. Output a **structured diff summary grouped by member code**:
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
5. Output **collaboration impact analysis**:
   - Whose documents were affected by whose changes
   - Potential conflicts or synergies between collaborators
   - Whether any changes conflict with THESIS.md
