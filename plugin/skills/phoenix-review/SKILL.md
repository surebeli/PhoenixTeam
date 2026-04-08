---
name: review
description: "Analyze divergence between collaborators' documents. Compares all members' proposals against THESIS (North Star), identifies conflicts, overlaps, and gaps, and produces a structured divergence report. Read-only — does not modify any files."
user-invocable: true
argument-hint: "[topic or specific file to focus on]"
---

# Skill: review

Structured divergence analysis across collaborators. Read-only.

## Parameters

- `$ARGUMENTS`: Optional topic or file path to focus the review on. If omitted, review all documents.

## Execution Steps

1. Read `.phoenix/COLLABORATORS.md` to determine current identity and all known collaborators.
2. Run `git status` and display the result.
3. Read `.phoenix/THESIS.md` — this is the **alignment baseline** (North Star).
4. Read `.phoenix/INDEX.md` for document overview.
5. For each collaborator, read all documents under `.phoenix/design/{code}/`.
6. Run `git log --oneline -5 -- .phoenix/` and `git diff HEAD~3..HEAD -- .phoenix/` for recent change context.

## Analysis (output all of the following)

### 【分歧报告】

For each identified divergence between collaborators:

```
#### 分歧 {N}: {简要标题}

**涉及方**: {code-1} vs {code-2}
**{code-1} 的观点**: {具体摘要，引用文档路径和关键段落}
**{code-2} 的观点**: {具体摘要，引用文档路径和关键段落}
**与 THESIS 的对齐度**:
  - {code-1}: {对齐/偏离/无关} — {原因}
  - {code-2}: {对齐/偏离/无关} — {原因}
**分歧性质**: {技术选型 / 架构方向 / 优先级 / 范围定义 / 其他}
**影响范围**: {影响哪些模块/决策}
```

### 【共识区域】

List areas where collaborators agree (to anchor the conversation).

### 【空白区域】

Topics covered by only one collaborator, or not covered at all but implied by THESIS.

### 【建议处理优先级】

Rank divergences by urgency:
1. **阻塞性分歧** — Must resolve before any work continues
2. **方向性分歧** — Different approaches, either could work, need decision
3. **细节性分歧** — Minor differences, can defer

### 【下一步推荐】

Based on the analysis:
- If blocking divergences exist → recommend `/phoenix-align`
- If only minor divergences → recommend `/phoenix-suggest`
- If well-aligned → recommend `/phoenix-push`
