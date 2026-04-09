---
name: phoenix-pull
description: "Pull remote changes and auto-analyze diffs by collaborator. Fetches latest from remote, shows what each team member changed, triggers a parse, and alerts if any proposed divergences are awaiting your approval."
user-invocable: true
---

# Skill: pull

Pull remote changes and provide collaborator-aware diff analysis.

## Parameters

None.

## Execution Steps

1. Read `git config phoenix.member-code` to determine current identity (`{me}`). Apply identity guard.
2. Run `git status` and display the result.
3. Run `git pull --rebase` (or `git submodule update --remote` if in submodule mode).
4. Run `git diff HEAD~1..HEAD -- .phoenix/` and generate a summary **grouped by member code**:
   - Which collaborator's files changed
   - Files added/modified/deleted
   - Key content changes (line additions/deletions)
5. **Automatically trigger `/phoenix-parse`** (execute the parse skill inline).

### Step 6 — Pending approval alert

1. Read `.phoenix/DIVERGENCES.md` if it exists.
2. Find all divergences with status `proposed` where the awaiting party is `{me}`.
3. If any found, output a prominent alert:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟡 有 {N} 个分歧提议等待您确认:

  D-{N}: {title} — {proposer} 提议: {summary}
  D-{N}: {title} — {proposer} 提议: {summary}

运行 /phoenix-align D-{N} 查看详情并确认或拒绝。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

4. Also note any new `open` divergences added since last pull (compare with previous DIVERGENCES.md state in the diff).

7. Output: pull result + diff summary (by collaborator) + parse changes + approval alerts.
