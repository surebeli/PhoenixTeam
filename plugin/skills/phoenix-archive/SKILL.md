---
name: phoenix-archive
description: "Archive a design proposal by moving it from .phoenix/design/ to .phoenix/archive/{timestamp}/, updating THESIS.md decision log, and committing with diff. Use this to freeze a decision."
user-invocable: true
argument-hint: "<member-code/filename.md>"
---

# Skill: archive

Archive (freeze) a design proposal and record the decision.

## Parameters

- `$ARGUMENTS`: **Required.** The proposal file path relative to `.phoenix/design/`, including the member code prefix. Example: `alice/proposal.md`

## Execution Steps

1. Read `.phoenix/COLLABORATORS.md` to determine current identity.
2. Run `git status` and display the result.
3. Validate that `.phoenix/design/$ARGUMENTS` exists. If not, list available files and ask the user to specify.
4. Create the archive directory: `.phoenix/archive/{YYYYMMDD}/`
5. Move the file: `.phoenix/design/$ARGUMENTS` → `.phoenix/archive/{YYYYMMDD}/{filename}`
6. Update `.phoenix/THESIS.md`:
   - Add a decision log entry:
     ```markdown
     ## Decision Log
     - [{date}] Archived `{member-code}/{filename}` — {reason/summary extracted from the proposal}
     ```
7. Run `git add .phoenix/` and commit with message: `"[PhoenixTeam] archive - {code}/{filename} 决策冻结"`
8. Output: archive result + new diff (preserving member code attribution).
