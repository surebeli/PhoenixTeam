---
name: phoenix-suggest
description: "Generate 3 prioritized collaboration suggestions based on recent git diffs, THESIS alignment, and cross-collaborator document analysis. Each suggestion cites specific collaborator diffs."
user-invocable: true
argument-hint: "[specific question or topic]"
---

# Skill: suggest (Diff-based)

Provide intelligent collaboration suggestions grounded in real changes.

## Parameters

- `$ARGUMENTS`: Optional specific question or topic to focus suggestions on.

## Execution Steps

1. Read `.phoenix/COLLABORATORS.md` to determine current identity and all collaborators.
2. Run `git diff HEAD~5..HEAD -- .phoenix/` to get recent changes, grouped by member code.
3. Read the following files:
   - `.phoenix/THESIS.md` (North Star / design constitution)
   - `.phoenix/RULES.md` (code conventions)
   - `.phoenix/INDEX.md` (current document index)
   - `.phoenix/COLLABORATORS.md` (member map)
4. Based on all the above, generate **3 collaboration suggestions** (priority ordered):
   - Each suggestion **must** cite a specific collaborator's diff as evidence
   - Format: `"基于 {code} 的 diff（{具体变更}），建议..."`
   - Consider: THESIS conflicts, redundant proposals, missing coverage, blocking dependencies, opportunities for merge
5. If `$ARGUMENTS` provides a specific question, focus all 3 suggestions on that topic.
