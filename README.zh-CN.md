# PhoenixTeam

分布式 AI 团队文档协作插件 — 纯 Prompt，零代码，即装即用。

> English docs: [README.md](./README.md)

## 概述

PhoenixTeam 将协作实现为纯 Prompt Skill，让 AI 编码工具（Claude Code、Codex CLI）充当"协作插件"，在多人 AI 团队中管理设计文档。所有操作通过自然语言命令触发 — AI 自动调用 Git、读写文件和解析文档。无需编写代码。

## 安装

### Claude Code — `.claude/commands/`（推荐）

```bash
git clone https://github.com/surebeli/PhoenixTeam.git /tmp/phoenix-team

# 安装到当前项目
mkdir -p .claude/commands
for skill in /tmp/phoenix-team/plugin/skills/*/SKILL.md; do
  cp "$skill" ".claude/commands/$(basename $(dirname $skill)).md"
done

# 或全局安装（适用于所有项目）
mkdir -p ~/.claude/commands
for skill in /tmp/phoenix-team/plugin/skills/*/SKILL.md; do
  cp "$skill" ~/.claude/commands/$(basename $(dirname $skill)).md
done
```

### Claude Code — `/plugin` 市场

```bash
/plugin marketplace add surebeli/PhoenixTeam
/plugin install p-team@PhoenixTeam
```

### Codex CLI

```bash
git clone https://github.com/surebeli/PhoenixTeam.git ~/.codex/skills/phoenix-team
```

### 任意 AI 工具 — 独立 Prompt 模式

将 `PHOENIXTEAM.md` 复制到项目根目录，然后告诉你的 AI 工具：

```
You are now the PhoenixTeam Plugin. Follow all rules in ./PHOENIXTEAM.md strictly.
Skill: init
```

## 快速上手

### 极简记忆法

```
日常三板斧:     pull → (update) → push
出现分歧时:     review → align
不确定时:       status 或 suggest
```

### 核心工作流

```
                        ┌─────────────────────────────────┐
                        │        首次使用（一次性）          │
                        │        /phoenix-init            │
                        │   创建 .phoenix/、绑定身份、       │
                        │   写入 THESIS、归一化文档          │
                        └──────────────┬──────────────────┘
                                       │
                  ┌────────────────────────────────────────┐
                  │            日常协作循环                  │
                  │                                        │
   ┌──────────────▼───────────────┐                        │
   │  /phoenix-pull               │                        │
   │  拉取远端 + 自动 parse        │                        │
   └──────────────┬───────────────┘                        │
                  │                                        │
                  ▼                                        │
        ┌─── 本地源文档有变更？                               │
        │                                                  │
       YES                  NO                             │
        │                    │                             │
        ▼                    │                             │
   /phoenix-update           │                             │
   同步到 .phoenix/           │                             │
   （自动触发 parse）          │                             │
        │                    │                             │
        └────────┬───────────┘                             │
                 │                                         │
                 ▼                                         │
        ┌─── 多人提案存在分歧？                               │
        │                                                  │
       YES                  NO                             │
        │                    │                             │
        ▼                    │                             │
   /phoenix-review           │                             │
   检测分歧 → DIVERGENCES.md  │                             │
        │                    │                             │
        ▼                    │                             │
   /phoenix-align            │                             │
   Propose → Approve         │                             │
        │                    │                             │
        └────────┬───────────┘                             │
                 │                                         │
                 ▼                                         │
          /phoenix-push                                    │
          提交 + 推送到远端                                  │
                 │                                         │
                 └─────────────────────────────────────────┘
```

### 核心 Skill（7 个）

| Skill | 职责 | 触发时机 |
|-------|------|---------|
| **init** | 创建工作区、绑定身份、设定 THESIS | 项目首次使用 / 新人加入 |
| **pull** | 拉取远端 + 按协作者分组展示变更 | 开始工作前 |
| **update** | 本地源文档 → `.phoenix/design/{me}/` | 源文档有修改后 |
| **parse** | 扫描文档 → 生成 INDEX.md | **通常不需要手动调用**，被 pull/update/init 自动触发 |
| **review** | 对比各方提案，生成 DIVERGENCES.md | 多人提案更新后，需要检测冲突时 |
| **align** | 两阶段解决分歧：Propose → Approve | review 发现分歧后 |
| **push** | diff 审查 + divergence 门禁 + 推送 | 准备分享变更时 |

### 辅助 Skill（5 个）

**`/phoenix-status`** — 全景仪表盘

> 场景：早上开工、隔了几天没碰、想快速看看有没有 pending 的 approval。
> 展示：身份、协作者、分歧面板（哪些等你审批）、最近 3 次变更、阻塞项、一致性评分 (0-100)。

**`/phoenix-diff`** — 精确变更查看

> 场景：需要看特定范围的 diff，而不是 pull/parse 自动给的摘要。
> 参数：`--last`（本地未推送的变更）、`--commit=abc123`（某次提交）、`--against=origin/main`（本地相对远端的全部差异）。

**`/phoenix-suggest`** — AI 协作建议

> 场景：不确定下一步该做什么，让 AI 基于实际 diff 和分歧状态给建议。
> 优先级：待你审批的 proposed > 待你更新源文档的 resolved > open blocking > diff 洞察。

**`/phoenix-whoami`** — 身份绑定

> 场景：换机器、新 clone、多设备协作。
> 身份存在 `.git/config`（机器本地），换设备后需要重新绑定。

**`/phoenix-archive`** — 冻结提案

> 场景：某个设计提案已过时或在 align 后被取代。
> 移动到 `.phoenix/archive/{日期}/`，自动检查是否关联未解决的分歧并警告。

## Skill 参考

| 命令 | 功能 | 参数 |
|------|------|------|
| `/phoenix-init` | 初始化（创始人设定目标 → 其他人确认并加入） | 交互式 |
| `/phoenix-whoami` | 查看/绑定机器身份（多机器支持） | 交互式 |
| `/phoenix-pull` | 拉取 + 解析 + diff 摘要 | — |
| `/phoenix-push` | 推送（diff 检查 + 未解决分歧软门控 + 源文档漂移检测） | 可选提交信息 |
| `/phoenix-parse` | 扫描文档，生成 INDEX.md | — |
| `/phoenix-status` | 全局状态 + 分歧面板 + 一致性评分（0-100） | — |
| `/phoenix-suggest` | 基于 diff 的协作建议 | 可选问题 |
| `/phoenix-diff` | diff 详情（按协作者分组） | `--last` / `--commit=<hash>` / `--against=origin/main` |
| `/phoenix-review` | 分歧分析，结果写入 DIVERGENCES.md（含提交锚点；跳过无新提交的协作者） | 可选关注主题 |
| `/phoenix-align` | 两阶段分歧收敛：提议者提交（proposed），另一方确认后生效（resolved） | `D-001` / 关键词 / `all` |
| `/phoenix-archive` | 提案归档 + 决策冻结（归档前检查分歧引用） | `<code/filename>` |
| `/phoenix-update` | 源文档增量同步：基于哈希的变更检测、分歧影响评估、触发解析 | `--dry-run` / `--force` |

## 协作流程

```
Alice（Claude Code）                    Bob（Codex CLI）
       │                                     │
 /phoenix-init（创始人）              /phoenix-init（加入）
 设定项目目标 → THESIS.md             审阅目标 → 加入
       │                                     │
 编辑 .phoenix/design/alice/          编辑 .phoenix/design/bob/
       │                                     │
 /phoenix-push ──────► Git ◄───────── /phoenix-push
       │                                     │
 /phoenix-pull                        /phoenix-pull
       │                                     │
       └──────────── 发现分歧 ───────────────┘
                          │
                  /phoenix-review
                  分析文档 vs THESIS → 生成 D-001
                  写入 DIVERGENCES.md + 提交锚点
                          │
  ┌───────────────────────┴────────────────────┐
  │                                            │
  Alice: /phoenix-align D-001                  │
  选择解决方案 → proposed 🟡                  │
  ⚠️ THESIS 尚未更新                           │
  /phoenix-push                                │
  │                                            │
  │                              Bob: /phoenix-pull
  │                              🟡 "D-001 等待你的确认"
  │                              Bob: /phoenix-align D-001
  │                              ✅ 同意 → resolved
  │                              生成 decisions/D-001.md
  │                              更新 THESIS 决策日志
  │                              /phoenix-push
  │                                            │
  └────────────────────────────────────────────┘
                          │
       ╔══════════════════╧══════════════════════════════════════════╗
       ║  [旁路流程] 将决策应用于源文档                                 ║
       ║                                                              ║
       ║  decisions/D-001.md 包含各方指令块                            ║
       ║  （背景 / 需要的变更 / 验收标准）                               ║
       ║                                                              ║
       ║  Alice                            Bob                        ║
       ║  阅读 decisions/D-001.md          阅读 decisions/D-001.md    ║
       ║  传给自己的模型 →                  传给自己的模型 →             ║
       ║  模型编辑源文档                    模型编辑源文档               ║
       ║       │                                │                     ║
       ║  /phoenix-update                  /phoenix-update            ║
       ║  AI 验证验收标准                   AI 验证验收标准             ║
       ║  ✅ 通过                            ✅ 通过                   ║
       ║       │                                │                     ║
       ║       └─────────── 全部 ✅ ────────────┘                     ║
       ║                        │                                     ║
       ║               D-001 fully-closed 🔒                          ║
       ╚══════════════════╤══════════════════════════════════════════╝
                          │
              /phoenix-push（无 open/proposed，直接推送）
```

## 分歧处理

### 四种分歧状态

| 状态 | 含义 | 可操作方 |
|------|------|----------|
| `open` 🔴 | 未解决 | 任意一方均可提议 |
| `proposed` 🟡 | 一方已提议，等待另一方确认 | 另一方确认/拒绝/修改；提议方可撤回 |
| `resolved` ✅ | 双方已达成一致，源文档待更新 | 各方运行 update 完成源文档更新 |
| `fully-closed` 🔒 | 所有源文档已按决策更新 | 只读，完全归档 |

### DIVERGENCES.md — 分歧注册表

由 `review` 写入，由 `align` 读写，由 `push`/`status` 读取：

```markdown
## Open

### D-001: API 风格选择
Status: open 🔴 | Parties: alice vs bob | Priority: blocking

## Proposed

### D-002: 部署策略
Status: proposed 🟡 | Proposer: alice | Awaiting bob's confirmation
Proposed decision: 采用 Kubernetes（bob 的方案） | Reasoning: ...

## Resolved

### D-003: 数据模型 ✅
Status: resolved | Proposer: alice | Confirmer: bob
Decision: 采用 NoSQL | Resolved at: 2026-04-09
Change instructions: See .phoenix/decisions/D-003.md
```

### 提议 → 确认两阶段

`align` 根据分歧状态自动切换行为：

- **分歧为 open** → 展示对比表 + AI 推荐；用户选择解决方案 → 状态变为 `proposed`，THESIS **尚未更新**
- **分歧为 proposed，等待我确认** → 展示提议者的解决方案和理由：
  - ✅ 同意 → `resolved`；AI 生成各方变更指令块（含验收标准）；更新 THESIS 决策日志
  - ❌ 拒绝（附理由）→ 恢复为 `open`
  - 🔄 修改并反提议 → 仍为 `proposed`，提议者改为我
- **分歧为 proposed，我是提议者** → 展示等待状态；可选择撤回

### decisions/ — 决策指令文件

当 `align` 确认解决方案时，会创建 `.phoenix/decisions/D-{N}.md`，包含：
- 完整决策 + 理由
- 各方变更指令块：需要修改什么、在哪个文件、以及供 `update` 自动验证的**验收标准**

用户可将 `decisions/D-001.md` 直接传给自己的模型来执行源文档变更。

### review 提交锚点去重

`last-review.json` 记录每个协作者上次分析时的提交哈希：
- 有新提交 → 重新分析
- 无新提交 → 跳过
- `resolved` / `proposed` → 不受影响

### pull 自动提醒

拉取后：检测等待你确认的 `proposed` 分歧，以及你有待处理 Action Items 的 `resolved` 分歧。

### push 分歧软门控

推送前，区分：
- 🟡 等待我确认的提议 → 建议先确认
- 🔴 未解决的分歧 → 警告并等待
- ⏳ 等待对方确认 → 告知（非阻塞）

## 源文档同步

### 背景

`init` 进行一次性复制。如果源文档（如 `./design/spec.md`）后续发生变更，`.phoenix/design/{code}/` 中的副本不会自动更新。

### phoenix-update 解决方案

`update` 在 `last-sync.json` 中记录源文件哈希，每次运行时增量检测变更：

```bash
/phoenix-update           # 检测并同步所有变更
/phoenix-update --dry-run # 预览变更但不写入
/phoenix-update --force   # 跳过分歧确认，强制同步
```

### 决策后的源文档更新（Action Items）

当 `align` 确认解决方案时，AI 分析双方文档与决策的关系，生成 Action Items 写入 `decisions/D-{N}.md`：

```markdown
## Source Document Action Items
| Collaborator | Source file | Required changes | Status |
|--------------|-------------|-----------------|--------|
| alice | ./design/api.md | 保持现有 REST 设计不变 | ✅ No changes needed |
| bob | ./design/api-proposal.md | 将 GraphQL 替换为 REST，更新接口示例 | ⏳ Pending update |
```

每方更新源文档并运行 `update` 后，AI 自动根据**验收标准**验证：
- ✅ 满足 → Action Item 标记为完成
- ⚠️ 不满足 → 具体指导（如"第 3 节仍存在 GraphQL 描述"）
- 全部完成 → 分歧升级为 `fully-closed` 🔒

### 分支保护

`init` 将当前分支记录为受保护的 PhoenixTeam 主分支（`git config phoenix.main-branch`）。所有其他 Skill 强制执行**分支守卫** — 在非主分支上的操作将被拒绝：

```
❌ 当前分支 'feature-x' 不是 PhoenixTeam 主分支 'main'。
   请切换：git checkout main
```

> **安全场景**：如果你从主分支创建了新分支，且该分支与主分支内容完全一致（如 `git checkout -b feature-x main` 后未进行任何 PhoenixTeam 操作），则两个分支的 `.phoenix/` 状态是一致的，可安全切回主分支继续工作。分支守卫确保 `.phoenix/` 文档历史始终线性。

## .phoenix/ 目录结构

初始化后在目标项目中生成：

```
.phoenix/
├── COLLABORATORS.md    # 身份映射：成员代码 → 文档目录；主分支元数据
├── THESIS.md           # 项目设计宪法（北极星）+ 决策日志
├── RULES.md            # 代码规范
├── SIGNALS.md          # 运行时状态与阻塞项
├── INDEX.md            # 自动生成的文档索引
├── DIVERGENCES.md      # 分歧注册表（D-001… 状态摘要）：由 review 写入，align/push/status 读取
├── last-parse.json     # 解析缓存（文件哈希）
├── last-review.json    # Review 锚点：每个协作者的提交哈希 + 上次 review 时的源文件哈希
├── last-sync.json      # 源文档同步状态：源文件哈希，由 update skill 维护
├── design/
│   ├── alice/          # alice 的规范化文档
│   ├── bob/
│   └── shared/         # 共同维护（可选）
├── decisions/          # 各分歧决策文件（由 align 在解决时创建）
│   ├── D-001.md        # 完整决策 + 各方变更指令块 + 验收标准
│   └── D-002.md
└── archive/            # 冻结的提案
```

## 仓库结构

```
PhoenixTeam/
├── .claude-plugin/
│   ├── marketplace.json          # 市场清单
│   └── plugin.json               # Claude Code 插件定义
├── .codex-plugin/plugin.json     # Codex CLI 插件清单
├── plugin/                       # 插件核心
│   ├── skills/                   # 12 个 Skill（跨平台共享）
│   │   ├── phoenix-init/
│   │   ├── phoenix-whoami/
│   │   ├── phoenix-pull/
│   │   ├── phoenix-push/
│   │   ├── phoenix-update/
│   │   ├── phoenix-parse/
│   │   ├── phoenix-status/
│   │   ├── phoenix-suggest/
│   │   ├── phoenix-diff/
│   │   ├── phoenix-review/
│   │   ├── phoenix-align/
│   │   └── phoenix-archive/
│   ├── CLAUDE.md                 # 共享上下文（Claude Code）
│   └── AGENTS.md                 # 共享上下文（Codex CLI）
├── PHOENIXTEAM.md                # 独立 Prompt 版本（手动模式）
├── README.md                     # 英文文档
├── README.zh-CN.md               # 中文文档（本文件）
└── docs/design/                  # 示例设计文档
```

## 许可证

MIT
