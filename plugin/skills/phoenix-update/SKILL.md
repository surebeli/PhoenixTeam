---
name: phoenix-update
short-description: "Sync source documents into .phoenix/"
description: "Sync updated source design documents into .phoenix/design/{code}/. Detects changes via file hash comparison (last-sync.json), handles new/modified/deleted files incrementally, checks divergence impact (open/proposed/resolved), and triggers parse after sync. Use this when your source design documents have changed since the last init or update."
user-invocable: true
argument-hint: "[--dry-run | --force]"
triggers: [phoenix-parse]
callable-by: []
estimated-tokens:
  context: 2500
  skill: 2100
  data-read: variable
  output: 800
  total: ~5400+ (plus ~4700 for auto-triggered parse)
---

# Skill: update

Detect and sync source document changes into the PhoenixTeam workspace.

## Parameters

- `$ARGUMENTS`: Optional flags:
  - `--dry-run` — show what would change without actually syncing
  - `--force` — skip divergence impact confirmation and sync all changes

## State file: `last-sync.json`

Written and maintained exclusively by this skill. Format:

```json
{
  "synced_at": "<ISO timestamp>",
  "member_code": "<code>",
  "source_dirs": ["./design", "./docs/alice"],
  "files": {
    "./design/spec.md": {
      "hash": "<sha256 of file content>",
      "synced_to": ".phoenix/design/alice/spec.md",
      "synced_at": "<ISO timestamp>"
    }
  }
}
```

## Execution Steps

### Step 1 — Identity & pre-flight

1. Read `git config phoenix.member-code` to determine current identity (`{me}`). Apply identity guard.
2. Run `git status` and display the result.
3. Read `.phoenix/COLLABORATORS.md` to get `{me}`'s source directories.

### Step 2 — Detect source changes

1. Read `.phoenix/last-sync.json` if it exists. If not, treat all source files as new (first update).
2. For each file in source directories, compute its content hash.
3. Compare with hashes stored in `last-sync.json`:
   - **New file** (not in last-sync.json) → needs sync
   - **Modified file** (hash changed) → needs sync
   - **Deleted file** (in last-sync.json but no longer exists) → needs removal from `.phoenix/design/{me}/`
   - **Unchanged file** (same hash) → skip
4. Output a change summary:

```
## Source Document Change Detection

New: {N} file(s)
Modified: {N} file(s)
Deleted: {N} file(s)
Unchanged: {N} file(s)

Changes:
+ ./design/new-feature.md (new)
~ ./design/spec.md (modified)
- ./design/old-draft.md (deleted)
```

5. If no changes → output `"✅ No source document changes. .phoenix/ is up to date."` and stop.

### Step 3 — Divergence impact check

1. Read `.phoenix/DIVERGENCES.md` if it exists.
2. For each **modified or deleted** file, check if it is referenced in any divergence entry (match against `design/{me}/{filename}`):

   **`open` divergence impact**:
   ```
   ⚠️ Modified file affects unresolved divergence:
   - ./design/spec.md → references D-001: API style choice (open, blocking)
     File content will change after sync. Recommend re-running /phoenix-review after sync.
   ```

   **`proposed` divergence impact**:
   ```
   ⚠️ Modified file affects a pending proposal:
   - ./design/api.md → references D-002: Interface design (proposed, you are the proposer)
     Your document has been updated; existing proposal may no longer be accurate.
     Recommend withdrawing the proposal after sync, then re-proposing with updated documents.
   ```

   **`resolved` divergence impact**:
   ```
   ℹ️ Modified file affects a resolved divergence:
   - ./design/arch.md → references D-003: Architecture selection (resolved)
     Please verify this change aligns with the decision direction and does not contradict the THESIS Decision Log.
   ```

3. If `--force` flag → skip confirmation, proceed to Step 4.
4. If there are `proposed` divergence impacts → **stop and wait for confirmation**:

   ```
   Continue with sync?
   1. Continue (I understand the impact)
   2. Cancel (I want to handle the divergence first)
   ```

   - User confirms → proceed.
   - User cancels → stop, suggest `/phoenix-align D-{N}`.

5. If only `open` or `resolved` impacts → proceed without blocking (warn only).

### Step 4 — Execute sync

If `--dry-run` → output the planned changes and stop (no files written).

For each changed file:

**New or modified files**:
1. Copy source file to `.phoenix/design/{me}/{relative_path}` (preserve relative paths, max 2 levels).
2. If the file didn't previously exist in `.phoenix/design/{me}/`, prepend `<!-- Phoenix Normalized Document -->` header.
3. If the file existed (modified), update content while preserving the `<!-- Phoenix Normalized Document -->` header.

**Deleted files**:
1. Remove `.phoenix/design/{me}/{filename}` from the workspace.
2. Do NOT move to archive (deletion is tracked by git diff).

### Step 5 — Post-sync: divergence annotations + Action Items verification

**A. Proposed divergence annotation** (unchanged behavior):

For each modified file that is part of a `proposed` divergence where `{me}` is the proposer:
- Add a note to the divergence entry in `DIVERGENCES.md`:
  ```
  **⚠️ 注意**: 提议者 {me} 的文档 `{file}` 已于 {date} 更新，现有提议可能不再准确。
  建议提议者确认或撤回并重新提议。
  ```

**B. Action Items verification** (new):

For each modified file, check if it appears in any `resolved` divergence's **源文档更新待办** table where `{me}` has a `⏳ 待更新` status:

1. Read the current `.phoenix/design/{me}/{file}` content (just synced).
2. Read `.phoenix/decisions/D-{N}.md` — locate the **【{me}】变更指令** block and extract the **验收标准** field (primary criterion) and **需要的变更** (detail).
3. AI evaluates: does the updated content satisfy the **验收标准**?

   **If satisfied** → update the Action Item row status in DIVERGENCES.md:
   ```
   | {me} | `{source path}` | ✅ 已更新 ({date}) |
   ```

   **If not satisfied** → output a specific warning referencing the criterion:
   ```
   ⚠️ D-{N} Action Item 未完成:
   验收标准: {acceptance criterion from 变更指令}
   当前文档仍包含: {specific content that violates the criterion}
   建议: {concrete edit suggestion}
   ```
   Keep the Action Item as `⏳ 待更新`.

4. After all Action Items for this divergence are `✅ 已更新` (all parties complete):
   - Update the divergence status in DIVERGENCES.md from `resolved` to `fully-closed` 🔒:
     ```markdown
     **状态**: `fully-closed` 🔒
     **关闭于**: update @ `{commit}` ({date}) — 所有源文档已按决议更新
     ```
   - Add to SIGNALS.md: `- [{date}] 🔒 D-{N}: {title} — 源文档已全部更新，分歧完全关闭`

### Step 6 — Update last-sync.json

Write updated `.phoenix/last-sync.json` with:
- Current timestamp
- All source files and their new hashes (including unchanged files)
- Remove entries for deleted files

### Step 7 — Commit and trigger parse

1. Run `git add .phoenix/design/{me}/ .phoenix/last-sync.json .phoenix/DIVERGENCES.md` (if modified).
2. Commit: `"[PhoenixTeam] update — {me} 源文档同步: +{added} ~{modified} -{deleted}"`
3. **Automatically trigger `/phoenix-parse`** to update INDEX.md.

### Step 8 — Output and next steps

```
## Sync Result

✅ Synced {N} file change(s):
  + design/{me}/new-feature.md
  ~ design/{me}/spec.md
  - design/{me}/old-draft.md

Divergence impact:
  ⚠️ D-001 (open): affected — recommend re-running review
  ⚠️ D-002 (proposed): your proposal may need updating

Commit: {hash}
```

**Next step recommendations**:
- If files affected open divergences → recommend `/phoenix-review`
- If files affected proposed divergences where `{me}` is proposer → recommend `/phoenix-align D-{N}` to withdraw and re-propose
- Otherwise → recommend `/phoenix-push` to share updates
