---
name: phoenix-archive
short-description: "Freeze and archive a design proposal"
description: "Archive a design proposal by moving it from .phoenix/design/ to .phoenix/archive/{timestamp}/. Checks DIVERGENCES.md for references — warns if the file is part of an open/proposed divergence. Updates THESIS.md decision log and commits with diff."
user-invocable: true
argument-hint: "<member-code/filename.md>"
triggers: []
callable-by: []
estimated-tokens:
  context: 2500
  skill: 700
  data-read: 300
  output: 400
  total: ~3900
---

# Skill: archive

Archive (freeze) a design proposal and record the decision.

## Parameters

- `$ARGUMENTS`: **Required.** The proposal file path relative to `.phoenix/design/`, including the member code prefix. Example: `alice/proposal.md`

## Execution Steps

1. Read `git config phoenix.member-code` to determine current identity. Apply identity guard.
2. Run `git status` and display the result.
3. Validate that `.phoenix/design/$ARGUMENTS` exists. If not, list available files and ask the user to specify.

### Step 4 — Divergence reference check

1. Read `.phoenix/DIVERGENCES.md` if it exists.
2. Search for references to the file being archived (match against `design/{member-code}/{filename}` in divergence entries).
3. If the file is referenced in an **`open` or `proposed`** divergence:

   ```
   ⚠️ This file is referenced in the following unresolved divergences:

   - D-{N}: {title} ({status}) — {parties}

   Archiving may require re-evaluation of these divergences.
   Continue with archive? (yes / cancel)
   ```

   **Stop and wait for confirmation.**

   - If user confirms → proceed to Step 5.
   - If user cancels → stop and suggest running align first.

4. If the file is referenced in a **`resolved`** divergence → no warning, proceed (the decision was already made).
5. If no reference in DIVERGENCES.md → proceed silently.

### Step 5 — Execute archive

1. Create the archive directory: `.phoenix/archive/{YYYYMMDD}/`
2. Move the file: `.phoenix/design/$ARGUMENTS` → `.phoenix/archive/{YYYYMMDD}/{filename}`
3. Update `.phoenix/THESIS.md`:
   - Add a decision log entry:
     ```markdown
     ## Decision Log
     - [{date}] Archived `{member-code}/{filename}` — {reason/summary extracted from the proposal}
     ```
4. If the file was part of an open/proposed divergence and user confirmed:
   - Add a note to the divergence entry in DIVERGENCES.md:
     ```
     **Note**: Referenced file `{path}` was archived ({date}). This divergence may need re-review.
     ```
5. Run `git add .phoenix/` and commit: `"[PhoenixTeam] archive - {code}/{filename} 决策冻结"`
6. Output: archive result + new diff (preserving member code attribution).
