---
name: phoenix-review
description: "Analyze divergence between collaborators' documents. Compares all members' proposals against THESIS (North Star), identifies conflicts, overlaps, and gaps, and produces a structured divergence report. Writes results to DIVERGENCES.md with stable IDs (D-001, D-002…). Read-only on design docs — does not modify any collaborator files."
user-invocable: true
argument-hint: "[topic or specific file to focus on]"
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
       "<code>": "<last-seen commit hash for their design dir>"
     }
   }
   ```
2. For each collaborator, run `git log --oneline -1 -- .phoenix/design/{code}/` to get their latest commit.
3. Compare against stored hashes:
   - **New collaborator** (not in last-review.json) → full analysis
   - **Commit changed** → re-analyze this collaborator's documents
   - **No change** → skip re-analysis; carry forward their existing divergences from DIVERGENCES.md
4. If `last-review.json` does not exist → treat all collaborators as new (full review).
5. Output: `"📋 本次 review 范围: {list of collaborators being re-analyzed} (其余无新提交，跳过)"`

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

Run `git diff HEAD~3..HEAD -- .phoenix/` for recent change context.

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
## 【分歧报告】

### 新发现的分歧

#### D-{N}: {简要标题}

**涉及方**: {code-1} vs {code-2}
**{code-1} 的观点**: {具体摘要，引用文档路径和关键段落}
**{code-2} 的观点**: {具体摘要，引用文档路径和关键段落}
**与 THESIS 的对齐度**:
  - {code-1}: {对齐/偏离/无关} — {原因}
  - {code-2}: {对齐/偏离/无关} — {原因}
**分歧性质**: {技术选型 / 架构方向 / 优先级 / 范围定义}
**优先级**: {阻塞性 / 方向性 / 细节性}

### 等待确认的提议（不干预）

- D-{N}: {title} — `proposed` 🟡 由 {proposer} 提议，等待 {other} 确认

### 已知分歧（无新提交，状态不变）

- D-{N}: {title} — `open` （{code} 未有新提交）

### 自动解决的分歧

- D-{N}: {title} — `auto-resolved` — {原因}

## 【共识区域】
{Areas where collaborators agree}

## 【空白区域】
{Topics covered by only one collaborator or implied by THESIS but uncovered}

## 【建议处理优先级】
1. 阻塞性: D-{N}, D-{N}
2. 方向性: D-{N}
3. 细节性: D-{N}
```

### Step 6 — Write DIVERGENCES.md

Write/update `.phoenix/DIVERGENCES.md` with the following format:

```markdown
# PhoenixTeam Divergence Registry

_Last reviewed: {ISO timestamp} @ {head_commit} by {current_code}_

## Open

### D-{N}: {title}

**状态**: `open` 🔴
**涉及方**: {code-1}, {code-2}
**性质**: {技术选型 / 架构方向 / 优先级}
**优先级**: {阻塞性 / 方向性 / 细节性}
**发现于**: review @ `{commit_hash}` ({date})

- **{code-1}** (`design/{code-1}/{file}`): {one-line summary of position}
- **{code-2}** (`design/{code-2}/{file}`): {one-line summary of position}
- **THESIS**: {alignment note}

---

## Resolved

### D-{N}: {title} ✅

**状态**: `resolved`
**解决于**: {align / auto-resolved} @ `{commit_hash}` ({date})
**决策**: {summary of decision}
**决策人**: {code}
```

Rules:
- Never delete resolved entries — they are the audit trail.
- New divergences are appended to the `## Open` section.
- Auto-resolved divergences move from Open to Resolved automatically.
- If `## Open` section becomes empty, write: `_（当前无未解决分歧）_`

### Step 7 — Write last-review.json and commit

1. Write `.phoenix/last-review.json`:
   ```json
   {
     "reviewed_at": "<ISO timestamp>",
     "head_commit": "<current HEAD hash>",
     "per_collaborator": {
       "<code>": "<latest commit hash for their design dir or null if no commits>"
     }
   }
   ```
2. Run `git add .phoenix/DIVERGENCES.md .phoenix/last-review.json` and commit:
   `"[PhoenixTeam] review — 发现 {N} 个新分歧, {M} 个已知分歧"`

### Step 8 — Next step recommendation

- If blocking divergences exist → recommend `/phoenix-align <D-N>` (Claude Code) / `p-team:phoenix-align` (Codex CLI)
- If only minor divergences → recommend `/phoenix-suggest`
- If well-aligned or all resolved → recommend `/phoenix-push`
