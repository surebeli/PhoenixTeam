---
name: phoenix-align
description: "Resolve divergence between collaborators. Interactive skill: shows conflicting proposals side-by-side, proposes a merged resolution, asks for human approval, then updates THESIS.md and archives superseded proposals."
user-invocable: true
argument-hint: "<divergence topic or 'all'>"
---

# Skill: align

Facilitate convergence on a specific divergence. Interactive, human-in-the-loop.

## Parameters

- `$ARGUMENTS`: **Required.** The divergence topic to resolve (from `/phoenix-review` output), or `all` to iterate through all divergences.

## Execution Steps

### Step 1 — Load context

1. Read `.phoenix/COLLABORATORS.md` to determine current identity.
2. Run `git status` and display the result.
3. Read `.phoenix/THESIS.md` (current North Star).
4. Read all relevant documents under `.phoenix/design/`.

### Step 2 — Present the divergence

For the specified topic, output:

---

**【对齐决策 – {topic}】**

**当前分歧：**

| | {code-1} | {code-2} |
|--|----------|----------|
| 方案 | {code-1 的具体方案摘要} | {code-2 的具体方案摘要} |
| 优势 | {优势分析} | {优势分析} |
| 风险 | {风险分析} | {风险分析} |
| THESIS 对齐度 | {评估} | {评估} |

**AI 推荐方案：**

> {基于 THESIS 和两方文档的分析，提出合并或择优的建议方案，说明理由}

请选择：
1. 采纳 {code-1} 的方案
2. 采纳 {code-2} 的方案
3. 采纳 AI 推荐的合并方案
4. 自定义决策（请描述）
5. 跳过，暂不处理

---

**Stop and wait for the user to reply.**

### Step 3 — Execute the decision

Based on the user's choice:

1. **Update `.phoenix/THESIS.md`**:
   - Add a decision record to the Decision Log section:
     ```markdown
     ## Decision Log
     - [{date}] **{topic}**: {选择的方案摘要}。决策人: {current_code}。
       - 备选方案来自: {code-1}, {code-2}
       - 决策理由: {用户选择的理由或 AI 推荐理由}
     ```
   - If the decision changes the North Star, update the North Star section accordingly.

2. **Archive superseded proposals** (optional):
   - If a collaborator's entire proposal document is superseded, move it to `.phoenix/archive/{YYYYMMDD}/`
   - If only part of a document is superseded, add a `<!-- SUPERSEDED by THESIS decision {date}: {topic} -->` comment to the relevant section

3. **Update `.phoenix/SIGNALS.md`**:
   - Remove the divergence from blockers (if listed)
   - Add a resolved entry: `- [{date}] ✅ {topic} — 已对齐`

4. Run `git add .phoenix/` and commit: `"[PhoenixTeam] align - {topic} 决策达成"`

5. If `$ARGUMENTS` is `all`, repeat Step 2-3 for the next divergence.

### Step 4 — Summary

Output:
- Decisions made in this session
- Updated THESIS.md preview (North Star + Decision Log)
- Files archived (if any)
- Recommend `/phoenix-push` to share the alignment with other collaborators
