---
name: phoenix-parse
description: "Core skill: scan .phoenix/design/ documents, generate INDEX.md with directory tree and summaries, detect changes via git diff, and provide collaboration suggestions. This is the intelligence layer of PhoenixCollab."
user-invocable: true
---

# Skill: parse (Core)

Scan all normalized documents, build the index, and detect changes.

## Parameters

None.

## Execution Steps (fixed rules)

1. Read `.phoenix/COLLABORATORS.md` to determine current identity and known collaborators.
2. Scan `.phoenix/design/` directory tree (organized by member code subdirectories).
3. Generate/update `.phoenix/INDEX.md` with:
   - Complete directory tree (grouped by collaborator)
   - One-line summary for each file (AI extracts core content)
   - THESIS.md North Star summary
   - SIGNALS.md latest blockers/progress
   - Format:
     ```markdown
     # PhoenixCollab INDEX

     ## North Star
     {extracted from THESIS.md}

     ## Signals
     {latest from SIGNALS.md}

     ## Document Tree
     ### {code-1}
     - `design/{code-1}/file.md` — {one-line summary}

     ### {code-2}
     - `design/{code-2}/file.md` — {one-line summary}

     ### shared (if exists)
     - `design/shared/file.md` — {one-line summary}
     ```
4. Run `git log --oneline -3 -- .phoenix/` and `git diff HEAD~1..HEAD -- .phoenix/` (if commits exist). Generate **diff summary grouped by member code**.
5. Compare with `.phoenix/last-parse.json` (previous parse record). Output **"变更内容"**:
   - Files added / modified / deleted since last parse
   - Key collaboration suggestions (based on real diff, must cite specific collaborator and diff content)
   - Example: `"发现 alice 的提案新增了 GraphQL 方案，与 THESIS 中 REST 优先策略冲突，建议触发 archive + 仲裁"`
6. Save current parse state to `.phoenix/last-parse.json` (JSON with file list, timestamps, content hashes).
7. Output: INDEX.md preview + 【Diff 感知摘要】 + suggestions.
