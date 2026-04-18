---
name: phoenix-pull
short-description: "Pull remote changes with diff analysis"
description: "Pull remote changes and auto-analyze diffs by collaborator. Fetches latest from remote, shows what each team member changed, triggers a parse, and alerts if any proposed divergences are awaiting your approval."
user-invocable: true
triggers: [phoenix-parse]
callable-by: []
estimated-tokens:
  context: 2500
  skill: 1100
  data-read: 500
  output: 800
  total: ~4900 (plus ~4700 for auto-triggered parse)
---

# Skill: pull

Pull remote changes and provide collaborator-aware diff analysis.

## Parameters

None.

## Execution Steps

1. Read `git config phoenix.member-code` to determine current identity (`{me}`). Apply identity guard.
2. Run `git status` and display the result.
3. **Pull with pre-pull anchor**:
   1. Record the current HEAD hash: `git rev-parse HEAD` → `{before}`.
   2. Run `git pull --rebase` (or `git submodule update --remote` if in submodule mode).
   3. Record the new HEAD hash: `git rev-parse HEAD` → `{after}`.

4. **Smart diff — resilient to prior `git pull`**:

   Determine the correct diff range using this priority:

   | Condition | Diff command | Explanation |
   |-----------|-------------|-------------|
   | `{before}` ≠ `{after}` | `git diff {before}..{after} -- .phoenix/` | Normal case: pull brought new commits |
   | `{before}` = `{after}` (already up-to-date) | Use reflog fallback (see below) | User already ran `git pull` manually |

   **Reflog fallback** (when pull is a no-op):
   1. Search reflog for the most recent pull/rebase entry:
      `git reflog --format='%H %gs' -n 20` and find the first line containing `pull` or `rebase (finish)`.
   2. The hash on that line is the **post-pull** HEAD; the **next** reflog entry is the **pre-pull** HEAD.
      Alternatively: `git reflog -n 20 --format='%H'` — find the index of the pull entry, take the hash at index+1 as `{pre_pull}`.
   3. Run `git diff {pre_pull}..HEAD -- .phoenix/`.
   4. If reflog search finds nothing (e.g., fresh clone with no prior pull), fall back to `git diff HEAD~1..HEAD -- .phoenix/` and note that the range is approximate.
   5. Display which diff range was used so the user knows:
      ```
      📎 Diff range: {pre_pull_short}..{after_short} (recovered from reflog — prior git pull detected)
      ```

   Generate a summary **grouped by member code**:
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
🟡 {N} divergence proposal(s) awaiting your confirmation:

  D-{N}: {title} — {proposer} proposes: {summary}
  D-{N}: {title} — {proposer} proposes: {summary}

Run /phoenix-align D-{N} to review details and confirm or reject.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

4. Also note any new `open` divergences and any divergences that moved to `resolved` (requiring source doc updates) since last pull.
5. For `resolved` divergences with pending Action Items for `{me}`, output a prompt:
   ```
   📋 {N} resolved divergence(s) require source document updates from you:
     D-{N}: {title} — update `{source file}`: {change description}
   Run /phoenix-update to sync and auto-verify.
   ```

### Step 7 — Source drift hint

1. Read `.phoenix/last-sync.json` if it exists.
2. For each source file, check if its current hash differs from the stored hash.
3. If source files have changed locally since last sync, output a soft hint:

```
💡 Source drift detected: {N} local source file(s) changed since last sync.
   Run /phoenix-update to sync changes into the workspace.
```

4. This is informational only — does not block.

8. Output: pull result + diff summary (by collaborator) + parse changes + approval alerts + source drift hint.
