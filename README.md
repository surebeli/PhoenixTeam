# PhoenixTeam

纯 Prompt 实现的分布式 AI 团队文档协作插件 — 零代码、零开发、立即可用。

## 简介

PhoenixTeam 以纯 Prompt Skill 的形式，让 AI 编码工具（Claude Code、Codex CLI）直接扮演"协作插件"，管理多人 AI 团队的设计文档。所有操作通过自然语言指令触发，AI 自动调用 Git、读写文件、解析文档，无需写任何代码。

## 安装

### Claude Code — `.claude/commands/`（推荐）

```bash
git clone https://github.com/surebeli/PhoenixTeam.git /tmp/phoenix-team

# 安装到当前项目
mkdir -p .claude/commands
for skill in /tmp/phoenix-team/plugin/skills/*/SKILL.md; do
  cp "$skill" ".claude/commands/$(basename $(dirname $skill)).md"
done

# 或全局安装（对所有项目生效）
mkdir -p ~/.claude/commands
for skill in /tmp/phoenix-team/plugin/skills/*/SKILL.md; do
  cp "$skill" ~/.claude/commands/$(basename $(dirname $skill)).md
done
```

### Claude Code — `/plugin` marketplace

```bash
/plugin marketplace add surebeli/PhoenixTeam
/plugin install p-team@PhoenixTeam
```

### Codex CLI

```bash
git clone https://github.com/surebeli/PhoenixTeam.git ~/.codex/skills/phoenix-team
```

### 任意 AI 工具 — 独立 Prompt

将 `PHOENIXTEAM.md` 复制到项目根目录，在 AI 工具中输入：

```
你现在是 PhoenixTeam Plugin v1.4，完全遵循 ./PHOENIXTEAM.md 中的所有规则。
Skill: init
```

## 使用

```bash
/phoenix-init      # 初始化（首人设定项目目标，后续者确认并加入）
/phoenix-whoami    # 查看/绑定本机身份（换机器或多机登录时使用）
/phoenix-status    # 查看全局状态与一致性评分
/phoenix-pull      # 拉取远程变更 + 自动 diff 解读
/phoenix-push      # 推送文档变更（强制 diff 检查）
/phoenix-parse     # 重新解析文档、更新索引
/phoenix-suggest   # 获取基于 diff 的协作建议
/phoenix-diff      # 查看精确变更（按协作者分组）
/phoenix-review    # 多人分歧分析（只读）
/phoenix-align     # 分歧收敛（交互式决策）
/phoenix-archive   # 归档并冻结提案
```

## Skill 列表

| 命令 | 功能 | 参数 |
|------|------|------|
| `/phoenix-init` | 初始化（首人设目标 → 后续者确认加入） | 交互式 |
| `/phoenix-whoami` | 查看/绑定本机身份（换机器/多机时用） | 交互式 |
| `/phoenix-pull` | 拉取 + 解析 + diff 摘要 | — |
| `/phoenix-push` | 推送（含强制 diff 检查） | 可选 commit message |
| `/phoenix-parse` | 扫描文档、生成 INDEX.md | — |
| `/phoenix-status` | 全局状态 + 一致性评分 (0-100) | — |
| `/phoenix-suggest` | 基于 diff 的协作建议 | 可选问题 |
| `/phoenix-diff` | diff 详情（按协作者分组） | `--last` / `--commit=<hash>` / `--against=origin/main` |
| `/phoenix-review` | 分歧分析（对比多人文档 vs THESIS） | 可选聚焦主题 |
| `/phoenix-align` | 分歧收敛（提案对比 → 决策 → 更新 THESIS） | 分歧主题 或 `all` |
| `/phoenix-archive` | 提案归档 + 决策冻结 | `<代号/文件名>` |

## 协作流程

```
Alice (Claude Code)                    Bob (Codex CLI)
       │                                     │
 /phoenix-init (founder)              /phoenix-init (join)
 设定项目目标 → THESIS.md             确认目标 → 加入协作
       │                                     │
 编辑 .phoenix/design/alice/          编辑 .phoenix/design/bob/
       │                                     │
 /phoenix-push ──────► Git ◄───────── /phoenix-push
       │                                     │
 /phoenix-pull                        /phoenix-pull
       │                                     │
       └──────── 发现分歧 ────────────────────┘
                    │
            /phoenix-review
            "alice 主张 REST，bob 主张 GraphQL,
             与 THESIS 对比分析..."
                    │
            /phoenix-align
            对比方案 → 人类决策 → 更新 THESIS
                    │
            /phoenix-push（同步对齐结果）
```

## .phoenix/ 目录结构

插件运行后在目标项目中生成：

```
.phoenix/
├── COLLABORATORS.md    # 协作者身份映射
├── THESIS.md           # 项目设计宪法（North Star）
├── RULES.md            # 代码规范
├── SIGNALS.md          # 运行时状态与阻塞项
├── INDEX.md            # 自动生成的文档索引
├── design/
│   ├── alice/          # 协作者 alice 的规范化文档
│   ├── bob/
│   └── shared/         # 共同维护（可选）
└── archive/            # 已冻结的提案
```

## 仓库结构

```
PhoenixTeam/
├── .claude-plugin/
│   ├── marketplace.json          # marketplace 清单
│   └── plugin.json               # Claude Code 插件定义
├── .codex-plugin/plugin.json     # Codex CLI 插件清单
├── plugin/                       # 插件本体
│   ├── skills/                   # 10 个 Skill（两平台共用）
│   │   ├── phoenix-init/         # 初始化（首人设目标）
│   │   ├── phoenix-pull/         # 拉取 + diff
│   │   ├── phoenix-push/         # 推送（diff 检查）
│   │   ├── phoenix-parse/        # 文档索引
│   │   ├── phoenix-status/       # 状态概览
│   │   ├── phoenix-suggest/      # 协作建议
│   │   ├── phoenix-diff/         # diff 详情
│   │   ├── phoenix-review/       # 分歧分析
│   │   ├── phoenix-align/        # 分歧收敛
│   │   └── phoenix-archive/      # 提案归档
│   ├── CLAUDE.md                 # 共享上下文（Claude Code）
│   └── AGENTS.md                 # 共享上下文（Codex CLI）
├── PHOENIXTEAM.md                # 独立 Prompt 版（手动模式）
└── docs/design/                  # 示例设计文档
```

## License

MIT
