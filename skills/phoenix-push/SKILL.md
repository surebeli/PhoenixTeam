---
name: phoenix-push
description: "Push .phoenix/ document changes to remote with mandatory diff review. Shows what you're about to push grouped by collaborator, commits only .phoenix/ markdown files, and pushes."
user-invocable: true
argument-hint: "[commit message]"
---

# Skill: push

Push document changes with enforced diff review.

## Parameters

- `$ARGUMENTS`: Optional custom commit message. Default: `"[PhoenixCollab] {current code} 文档更新"`

## Execution Steps (forced diff check)

1. Read `.phoenix/COLLABORATORS.md` to determine current identity (member code).
2. Run `git status` and display the result.
3. Run `git diff -- .phoenix/` and output a **【Diff 感知摘要】** grouped by member code:
   - Changed files per collaborator
   - Lines added/deleted with key content highlights
4. If there are uncommitted changes, run `git add .phoenix/**/*.md`.
5. Commit with the provided message or default: `"[PhoenixCollab] {code} 文档更新"`.
6. Run `git push`.
7. Output: push result + commit hash + this push's diff summary.

## Important

- **Never push non-.phoenix/ files.** Only `git add .phoenix/**/*.md`.
- If `git diff -- .phoenix/` shows no changes, inform the user and skip push.
