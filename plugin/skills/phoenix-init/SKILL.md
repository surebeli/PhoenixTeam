---
name: phoenix-init
description: "Initialize PhoenixTeam: set up collaborator identity, normalize design documents into .phoenix/, create core files, and establish Git diff baseline. Use this when starting PhoenixTeam for the first time or onboarding a new collaborator."
user-invocable: true
argument-hint: "[--branch=phoenix-docs | --submodule]"
---

# Skill: init

Initialize the PhoenixTeam workspace for the current collaborator.

## Parameters

- `$ARGUMENTS`: Optional repo mode flag (`--branch=phoenix-docs` or `--submodule`). Default: Mode A (dedicated branch `phoenix-docs`).

## Execution Steps (follow strictly in order)

### Step 1 — Ask for member code

Before asking, run `git config user.name` and capture the output as `{git_name}`.

Output the following block **verbatim** (substituting `{git_name}`), then **stop and wait** for the user to reply:

---

**【PhoenixTeam init – 第一步】**

请提供您的协作者代号（nickname / member code，例如 alice、bob、dev-007）。
这个代号将用于区分不同协作者的文档。
（直接回车跳过将自动使用 Git 用户名：`{git_name}`）

---

After the user replies:
- If the reply is **empty or whitespace**, use `{git_name}` (from `git config user.name`) as the member code.
- If `git config user.name` is also empty, fall back to the output of `git config user.email`, stripping the `@...` domain part.
- Sanitize the final code: lowercase, replace spaces with `-`, keep only `[a-z0-9_-]`.

### Step 2 — Receive member code, ask for source directories

After the member code is determined, continue. Output the following block **verbatim**, then **stop and wait**:

---

**【PhoenixTeam init – 第二步】**

请提供您本地设计文档所在目录（可以是 1 个或多个目录，用逗号分隔）。
示例：`./design`、`./docs/alice-proposal`、`./superpowers-output`
这些文档可以是 plan 生成的、superpowers plugin 生成的，或 spec-driven-dev 规则生成的。
回复后我将按您的代号规范化到 `.phoenix/design/{代号}/`，并建立完整映射。

---

### Step 3 — Execute initialization

After the user replies with directories:

1. Run `git status` and display the result.
2. Create `.phoenix/` directory if it doesn't exist.
3. Create/update `.phoenix/COLLABORATORS.md` with:
   - Current user's member code
   - Source directory → `.phoenix/design/{code}/` mapping
   - Known collaborators list (initially just the current user)
   - Format:
     ```markdown
     # PhoenixTeam Collaborators

     ## Current Session
     - Active user: {code}

     ## Members
     | Code | Source Directories | Phoenix Path | Joined |
     |------|-------------------|--------------|--------|
     | {code} | {dirs} | .phoenix/design/{code}/ | {date} |
     ```
4. For each source directory, copy all `.md` files into `.phoenix/design/{code}/` (preserve relative paths, max 2 levels):
   - Keep original filenames
   - Prepend `<!-- Phoenix Normalized Document -->` header to each file
   - Extract title and key decision points from design proposals
5. Create core files if they don't exist:
   - `.phoenix/THESIS.md` — Project design constitution (extract North Star from source docs if possible, otherwise leave with a placeholder)
   - `.phoenix/RULES.md` — Code conventions (initial template)
   - `.phoenix/SIGNALS.md` — Runtime status (initial template with empty blockers section)
6. Run `git add .phoenix/` and commit with message: `"[PhoenixTeam] init - {code} 规范化设计文档"`
7. **Automatically trigger `/phoenix-parse`** (execute the parse skill inline).
8. Output: `"初始化完成！您的身份已记录为 {code}，文档已规范化到 .phoenix/design/{code}/，Git diff 基线已建立。"`
