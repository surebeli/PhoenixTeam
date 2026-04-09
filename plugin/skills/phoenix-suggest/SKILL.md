---
name: phoenix-suggest
description: "Generate 3 prioritized collaboration suggestions based on recent git diffs, THESIS alignment, divergence state (DIVERGENCES.md), and cross-collaborator document analysis. Divergence-aware: prioritizes open/proposed divergences in suggestions."
user-invocable: true
argument-hint: "[specific question or topic]"
---

# Skill: suggest (Diff-based, Divergence-aware)

Provide intelligent collaboration suggestions grounded in real changes and divergence state.

## Parameters

- `$ARGUMENTS`: Optional specific question or topic to focus suggestions on.

## Execution Steps

1. Read `git config phoenix.member-code` to determine current identity (`{me}`). Apply identity guard.
2. Run `git diff HEAD~5..HEAD -- .phoenix/` to get recent changes, grouped by member code.
3. Read the following files:
   - `.phoenix/THESIS.md` (North Star / design constitution)
   - `.phoenix/RULES.md` (code conventions)
   - `.phoenix/INDEX.md` (current document index)
   - `.phoenix/COLLABORATORS.md` (member map)
   - `.phoenix/DIVERGENCES.md` (divergence registry, if exists)

### Step 4 — Divergence-aware suggestion generation

Generate **3 collaboration suggestions** (priority ordered).

**Priority rules** — divergence state takes precedence over diff-only insights:

1. **Highest priority**: `proposed` divergences awaiting `{me}` → suggest confirming/rejecting
   - E.g., `"🟡 D-002 等待您确认: bob 提议采用 GraphQL。建议运行 /phoenix-align D-002 查看详情并做出决策。"`

2. **High priority**: `open` blocking divergences → suggest initiating align
   - E.g., `"🔴 D-001 (阻塞性) alice vs bob 在 API 风格上分歧未解决。基于 alice 的最新 diff（新增了 REST endpoint 文档），建议尽快运行 /phoenix-align D-001 提出方案。"`

3. **Normal priority**: Diff-based insights (THESIS conflicts, redundant proposals, missing coverage, merge opportunities)
   - E.g., `"基于 bob 的 diff（重构了部署方案），发现与 THESIS 中'单机部署'目标偏离，建议确认 THESIS 是否需要更新。"`

**Each suggestion must**:
- Cite a specific collaborator's diff OR a specific divergence ID as evidence
- Format: `"基于 {code} 的 diff（{具体变更}）/ 基于 D-{N} ({状态})，建议..."`
- Include a concrete next action (which skill to run, with parameters)

5. If `$ARGUMENTS` provides a specific question, focus all 3 suggestions on that topic but still incorporate divergence awareness.
6. If no DIVERGENCES.md exists, fall back to pure diff-based suggestions (original behavior).
