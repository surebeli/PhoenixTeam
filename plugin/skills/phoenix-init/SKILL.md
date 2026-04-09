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

### Step 0 — Detect first-init vs join

Check whether `.phoenix/` directory already exists:
- If **NOT exists** → this is a **first init** (founder mode). Continue to Step 1.
- If **exists** → this is a **join** (collaborator mode). Skip to Step 1 but mark `{is_founder} = false`.

### Step 1 — Ask for member code

Run `git config user.name` and capture the output as `{git_name}`.

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
- **Persist identity locally**: Run `git config --local phoenix.member-code {code}` to save the member code into `.git/config`. This is machine-local and not committed to the repo, so each collaborator's clone has their own identity.

### Step 2 — Ask for project goal (founder mode only)

**Only if `{is_founder} = true`（.phoenix/ 不存在）**, output the following block **verbatim**, then **stop and wait**:

---

**【PhoenixTeam init – 第二步：设定项目目标】**

您是本项目第一个初始化 PhoenixTeam 的人。请简要描述这次协作的**需求目标 / 任务使命**（1-3 句话）。
这将写入 THESIS.md 作为 North Star，所有后续协作者都会以此为对齐基准。

示例：
- "重构 NECallKit 的呼叫流程，统一 iOS/Android 端的信令时序"
- "设计 PhoenixTeam 的 MVP 产品方案，3 个月内上线"

---

Save the user's reply as `{project_goal}`.

**If `{is_founder} = false`（join 模式）**, skip this step. The existing THESIS.md already contains the project goal.

### Step 3 — Ask for source directories

Output the following block **verbatim**, then **stop and wait**:

---

**【PhoenixTeam init – {第二步 if join / 第三步 if founder}：指定文档目录】**

请提供您本地设计文档所在目录（可以是 1 个或多个目录，用逗号分隔）。
示例：`./design`、`./docs/alice-proposal`、`./superpowers-output`
这些文档可以是 plan 生成的、superpowers plugin 生成的，或 spec-driven-dev 规则生成的。
回复后我将按您的代号规范化到 `.phoenix/design/{代号}/`，并建立完整映射。

---

### Step 4 — Show existing THESIS (join mode only)

**Only if `{is_founder} = false`**, read `.phoenix/THESIS.md` and display:

---

**【项目目标确认】**

当前项目 North Star（由 {founder_code} 设定）：

> {THESIS.md 中的 North Star 内容}

请确认您已了解项目目标。您的文档将以此为对齐基准。

---

(This is informational — no need to wait for confirmation, proceed immediately.)

### Step 5 — Execute initialization

1. Run `git status` and display the result.
2. Create `.phoenix/` directory if it doesn't exist.
3. Create/update `.phoenix/COLLABORATORS.md` with:
   - Current user's member code appended to the shared registry
   - Source directory → `.phoenix/design/{code}/` mapping
   - Format (shared file, do NOT include "current session" — identity is in git config):
     ```markdown
     # PhoenixTeam Collaborators

     ## Members
     | Code | Source Directories | Phoenix Path | Joined |
     |------|-------------------|--------------|--------|
     | {code} | {dirs} | .phoenix/design/{code}/ | {date} |
     ```
4. For each source directory, copy all `.md` files into `.phoenix/design/{code}/` (preserve relative paths, max 2 levels):
   - Keep original filenames
   - Prepend `<!-- Phoenix Normalized Document -->` header to each file
   - Extract title and key decision points from design proposals
5. Create/update core files:
   - `.phoenix/THESIS.md`:
     - **Founder mode**: Write `{project_goal}` as the North Star section
     - **Join mode**: Keep existing content, do not overwrite
   - `.phoenix/RULES.md` — Code conventions (create if not exists)
   - `.phoenix/SIGNALS.md` — Runtime status (create if not exists)
6. Run `git add .phoenix/` and commit:
   - Founder: `"[PhoenixTeam] init - {code} 创建项目并规范化设计文档"`
   - Join: `"[PhoenixTeam] init - {code} 加入协作并规范化设计文档"`
7. **Automatically trigger `/phoenix-parse`** (execute the parse skill inline).
8. Output:
   - Founder: `"初始化完成！您是本项目的发起者。项目目标已写入 THESIS.md，文档已规范化到 .phoenix/design/{code}/，Git diff 基线已建立。"`
   - Join: `"初始化完成！您已加入协作。身份已记录为 {code}，文档已规范化到 .phoenix/design/{code}/。项目目标请参阅 THESIS.md。"`
