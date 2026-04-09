---
name: phoenix-align
description: "Resolve divergence between collaborators via two-phase Propose → Approve workflow. Reads open/proposed divergences from DIVERGENCES.md. Proposer picks a resolution (status becomes proposed); the other party approves or rejects (status becomes resolved or reverts to open). THESIS.md is only updated after both parties agree."
user-invocable: true
argument-hint: "<D-001 | topic keyword | 'all'>"
---

# Skill: align

Facilitate convergence on specific divergences. Two-phase: **Propose → Approve**.

- Proposer chooses a resolution → divergence becomes `proposed`
- Other party confirms or rejects → divergence becomes `resolved` or reverts to `open`
- THESIS.md Decision Log is **only updated after approval**, not at proposal time.

## Parameters

- `$ARGUMENTS`: **Required.** One of:
  - `D-{N}` — resolve a specific divergence by ID (e.g. `D-002`)
  - `{topic keyword}` — fuzzy match against divergence titles in DIVERGENCES.md
  - `all` — iterate through all actionable divergences (open + proposed awaiting current user)

## Execution Steps

### Step 1 — Load context

1. Read `git config phoenix.member-code` to determine current identity (`{me}`). Apply identity guard.
2. Run `git status` and display the result.
3. Read `.phoenix/COLLABORATORS.md`.
4. Read `.phoenix/THESIS.md` (current North Star).

### Step 2 — Load divergence list from DIVERGENCES.md

1. Read `.phoenix/DIVERGENCES.md`.
   - If the file does not exist or has no actionable items:
     Output: `✅ 当前无需要处理的分歧。如需重新分析，请先运行 /phoenix-review。`
     Stop.
2. Parse all divergences. Classify each by what `{me}` can do:
   - **`open`** → `{me}` can propose a resolution (Mode A)
   - **`proposed` by someone else, awaiting `{me}`** → `{me}` can approve/reject (Mode B)
   - **`proposed` by `{me}`, awaiting other party** → inform and skip (or allow withdrawal)
   - **`resolved`** → skip
3. Match `$ARGUMENTS` against actionable items:
   - If `all` → queue all actionable items: Mode B items first (pending approvals), then Mode A items (open).
   - If `D-{N}` → select that specific divergence.
   - If keyword → fuzzy-match titles; if ambiguous, list and ask. **Stop and wait.**
   - If no match → show actionable list and ask user to specify. **Stop and wait.**

### Step 3A — Mode A: Propose resolution (divergence is `open`)

Read the relevant collaborator documents under `.phoenix/design/` for current content.

Output:

---

**【提议对齐 — {D-N}: {title}】**

**分歧摘要** (from DIVERGENCES.md):
- 涉及方: {code-1} vs {code-2}
- 性质: {技术选型 / 架构方向 / 优先级}
- 发现于: {date}

**当前各方方案对比：**

| | {code-1} | {code-2} |
|--|----------|----------|
| 方案 | {summary from design/{code-1}/...} | {summary from design/{code-2}/...} |
| 优势 | {advantage} | {advantage} |
| 风险 | {risk} | {risk} |
| THESIS 对齐度 | {assessment} | {assessment} |

**AI 推荐方案：**

> {Merged or best-choice resolution with reasoning based on THESIS}

请选择您的提议：
1. 采纳 {code-1} 的方案
2. 采纳 {code-2} 的方案
3. 采纳 AI 推荐的合并方案
4. 自定义决策（请描述）
5. 跳过，暂不处理此分歧

---

**Stop and wait for the user to reply.**

After user chooses (skip option 5 to next):

1. **Update `.phoenix/DIVERGENCES.md`** — change status from `open` to `proposed`:
   ```markdown
   ### D-{N}: {title}

   **状态**: `proposed` 🟡
   **涉及方**: {code-1}, {code-2}
   **性质**: {classification}
   **优先级**: {priority}
   **发现于**: review @ `{original_commit}` ({date})
   **提议者**: {me}
   **提议于**: align @ `{current_commit}` ({date})
   **提议决策**: {chosen resolution summary}
   **提议理由**: {reasoning}

   _等待 {other_party} 确认_
   ```
2. **Do NOT update THESIS.md** — it is only updated after approval.
3. Commit: `"[PhoenixTeam] align — D-{N}: {title} 提议由 {me} 提交，等待 {other} 确认"`

Output: `"✅ 提议已提交。{other_party} 下次 pull 后运行 /phoenix-align D-{N} 即可确认或拒绝。"`

### Step 3B — Mode B: Review and approve/reject (divergence is `proposed`, awaiting `{me}`)

Read the relevant collaborator documents and the proposal details from DIVERGENCES.md.

Output:

---

**【确认对齐 — {D-N}: {title}】**

**原始分歧：**
- 涉及方: {code-1} vs {code-2}
- 性质: {classification}

**{proposer} 的提议：**
> 决策: {proposed resolution}
> 理由: {reasoning}
> 提议于: {date}

**原始方案对比：**

| | {code-1} | {code-2} |
|--|----------|----------|
| 方案 | {summary} | {summary} |
| THESIS 对齐度 | {assessment} | {assessment} |

请选择：
1. ✅ 同意此提议
2. ❌ 拒绝，恢复为 open（请说明拒绝理由）
3. 🔄 在此基础上修改（提出您的修改版本，将变为您的新提议）
4. ⏭ 暂不处理

---

**Stop and wait for the user to reply.**

Based on user's choice:

**Option 1 — Approve:**
1. Update DIVERGENCES.md — move from Open to Resolved:
   ```markdown
   ### D-{N}: {title} ✅

   **状态**: `resolved`
   **涉及方**: {code-1}, {code-2}
   **提议者**: {proposer} | **确认者**: {me}
   **解决于**: align @ `{current_commit}` ({date})
   **决策**: {resolution summary}
   **决策人**: {proposer} (提议), {me} (确认)
   **理由**: {reasoning}
   ```
2. **Now update `.phoenix/THESIS.md`** Decision Log:
   ```markdown
   ## Decision Log
   - [{date}] **D-{N}: {title}**: {resolution summary}。
     - 提议: {proposer} | 确认: {me}
     - 理由: {reasoning}
   ```
3. Archive superseded proposals if applicable (move to `.phoenix/archive/{YYYYMMDD}/`).
4. Update `.phoenix/SIGNALS.md` — remove blocker, add resolved entry.
5. Commit: `"[PhoenixTeam] align — D-{N}: {title} 决策达成 ({proposer}提议, {me}确认)"`

**Option 2 — Reject:**
1. Update DIVERGENCES.md — revert to `open`, append rejection note:
   ```markdown
   ### D-{N}: {title}

   **状态**: `open` 🔴
   **涉及方**: {code-1}, {code-2}
   ...original fields...

   **历史提议**:
   - [{date}] {proposer} 提议: {resolution} — ❌ 被 {me} 拒绝，理由: {rejection reason}
   ```
2. Commit: `"[PhoenixTeam] align — D-{N}: {title} 提议被 {me} 拒绝"`

**Option 3 — Modify and counter-propose:**
1. Update DIVERGENCES.md — keep as `proposed` but change proposer to `{me}`:
   ```markdown
   **提议者**: {me}
   **提议于**: align @ `{current_commit}` ({date})
   **提议决策**: {modified resolution}
   **提议理由**: {new reasoning}

   _等待 {original_proposer} 确认_

   **历史提议**:
   - [{date}] {original_proposer} 提议: {original resolution} — 🔄 被 {me} 修改
   ```
2. Commit: `"[PhoenixTeam] align — D-{N}: {title} 修改提议由 {me} 提交，等待 {original_proposer} 确认"`

### Step 3C — Proposed by `{me}`, awaiting other party

Output:
```
⏳ D-{N}: {title} — 您的提议等待 {other_party} 确认中。
   提议内容: {summary}
   提议于: {date}

   可选操作:
   1. 撤回提议（恢复为 open）
   2. 跳过
```

If user chooses to withdraw:
1. Revert status to `open` in DIVERGENCES.md, append withdrawal note.
2. Commit: `"[PhoenixTeam] align — D-{N}: {title} 提议被 {me} 撤回"`

### Step 4 — Continue or summarize

- If `$ARGUMENTS` is `all` and more actionable items remain → go back to Step 3 for the next one.
- Output summary:

```
## 【对齐摘要】

本次处理:
- 🟡 D-{N}: {title} — 已提议，等待 {other} 确认
- ✅ D-{N}: {title} — 已确认通过
- ❌ D-{N}: {title} — 已拒绝，恢复为 open
- ⏭ D-{N}: {title} — 已跳过

剩余状态:
- open: {count} 个
- proposed (等待他人确认): {count} 个
```

- If proposed items exist → recommend push to notify the other party
- If all resolved → recommend push
- If open items remain → recommend next align
