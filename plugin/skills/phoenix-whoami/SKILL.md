---
name: phoenix-whoami
short-description: "Show or set collaborator identity"
description: "Show or set your PhoenixTeam identity on this machine. Use this when switching machines, cloning on a new device, or logging in from multiple machines. Reads existing collaborators from COLLABORATORS.md and lets you bind to your existing member code."
user-invocable: true
triggers: []
callable-by: []
estimated-tokens:
  context: 2500
  skill: 800
  data-read: 200
  output: 300
  total: ~3800
---

# Skill: whoami

Show or bind the current machine's PhoenixTeam identity.

## Execution Steps

### Step 1 — Check current identity

Run `git config phoenix.member-code` and capture output as `{current_code}`.

**If `{current_code}` is set**, output:

---

**【PhoenixTeam 当前身份】**

本机绑定的代号：`{current_code}`

如需切换，请回复新的代号或从以下协作者中选择；直接回车保持不变。

{列出 COLLABORATORS.md 中所有成员，格式见下}

---

**Stop and wait for the user to reply.**
- If the user presses Enter (empty reply) → keep `{current_code}`, output "身份未变更：`{current_code}`" and exit.
- If the user replies with a code → proceed to Step 2.

---

**If `{current_code}` is NOT set (new machine / first clone)**, read `.phoenix/COLLABORATORS.md` and list all known members:

---

**【PhoenixTeam 身份绑定】**

本机尚未绑定协作者身份。请选择您的代号：

{从 COLLABORATORS.md 读取的成员列表，格式：}
1. `alice` — .phoenix/design/alice/（加入于 2026-04-08）
2. `bob`   — .phoenix/design/bob/（加入于 2026-04-08）
3. 我是新协作者，使用新代号

请输入序号或直接输入代号：

---

**Stop and wait for the user to reply.**

### Step 2 — Bind identity

After the user replies:

- If reply is a number matching a listed member → use that member's code.
- If reply is "3" or indicates a new collaborator → ask for a new code (same flow as `phoenix-init` Step 1).
- If reply is a raw string → sanitize: lowercase, spaces→`-`, keep only `[a-z0-9_-]`.

Run:
```
git config --local phoenix.member-code {code}
```

### Step 3 — Also bind main branch if missing

After binding member-code, check `git config phoenix.main-branch`:

- **Already set** → skip, nothing to do.
- **Empty** → attempt auto-recovery:
  1. Read `Main Branch` field from `.phoenix/COLLABORATORS.md`.
  2. If found → run `git config --local phoenix.main-branch {main_branch}` and note it in the confirmation output.
  3. If not found → note that main branch is unbound; suggest running `/phoenix-init`.

### Step 4 — Confirm

Output:

---

**【身份绑定完成】**

本机已绑定为：`{code}`

- 来源：`.git/config`（仅本机有效，不进 git 仓库）
- 主分支：`{main_branch}`（已绑定） / ⚠️ 未绑定，请运行 `/phoenix-init`
- 后续所有 skill（pull / push / review / align 等）将以此身份执行

建议下一步：`/phoenix-status` 查看当前工作区状态。

---
