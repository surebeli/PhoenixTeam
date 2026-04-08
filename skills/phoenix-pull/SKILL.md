---
name: phoenix-pull
description: "Pull remote changes and auto-analyze diffs by collaborator. Fetches latest from remote, shows what each team member changed, and triggers a parse to update INDEX.md."
user-invocable: true
---

# Skill: pull

Pull remote changes and provide collaborator-aware diff analysis.

## Parameters

None.

## Execution Steps

1. Read `.phoenix/COLLABORATORS.md` to determine current identity (member code).
2. Run `git status` and display the result.
3. Run `git pull --rebase` (or `git submodule update --remote` if in submodule mode).
4. Run `git diff HEAD~1..HEAD -- .phoenix/` and generate a summary **grouped by member code**:
   - Which collaborator's files changed
   - Files added/modified/deleted
   - Key content changes (line additions/deletions)
5. **Automatically trigger `/phoenix-parse`** (execute the parse skill inline).
6. Output: pull result + diff summary (by collaborator) + parse changes.
