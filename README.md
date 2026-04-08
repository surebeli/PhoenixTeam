# PhoenixCollab

> 纯 Prompt 实现的分布式 AI 团队文档协作插件 — 零代码、零开发、立即可用。

## 什么是 PhoenixCollab？

PhoenixCollab 是 PhoenixTeam 产品的 Demo 实现。它以纯 Prompt Skill 的形式，让 AI 编码工具直接扮演"协作插件"，实现多人 AI 团队的文档协作管理。

**核心理念**：把"插件"定义为一套 Skill Prompt 集合，AI 在编码工具里直接扮演 "PhoenixCollab Agent"。所有操作通过自然语言指令触发，AI 自动调用 Git、读写文件、解析文档，完全不需要写一行代码。

灵感来源：[yetone/voice-input-src](https://github.com/yetone/voice-input-src)

## 安装

### Claude Code（推荐）

```bash
# 添加 marketplace
/plugin marketplace add owner/PhoenixTeam

# 安装插件
/plugin install phoenix-collab@PhoenixTeam
```

或通过交互 UI：

```bash
/plugin
# → Discover tab → phoenix-collab → Install
```

安装后即可使用 `/phoenix-init`、`/phoenix-status` 等 slash command。

### Codex CLI

```bash
# 从 GitHub 安装所有 skills
cd ~/.codex/skills/
git clone https://github.com/owner/PhoenixTeam.git phoenix-collab
```

或使用内置 skill installer（如可用）：

```bash
scripts/install-skill-from-github.py --repo owner/PhoenixTeam --path skills/phoenix-init
scripts/install-skill-from-github.py --repo owner/PhoenixTeam --path skills/phoenix-pull
# ... 对每个 skill 重复
```

### 手动安装（任何支持 Prompt 的 AI 工具）

将 `PHOENIXCOLLAB.md` 复制到项目根目录，在 AI 工具中输入：

```
你现在是 PhoenixCollab Plugin v1.3，完全遵循 ./PHOENIXCOLLAB.md 中的所有规则。
Skill: init
```

## 快速开始

```bash
# 1. 初始化（交互式：问代号 → 问目录 → 自动规范化）
/phoenix-init

# 2. 查看状态
/phoenix-status

# 3. 编辑 .phoenix/design/{你的代号}/ 下的文档...

# 4. 推送变更
/phoenix-push

# 5. 拉取他人变更
/phoenix-pull

# 6. 获取协作建议
/phoenix-suggest

# 7. 查看精确 diff
/phoenix-diff

# 8. 归档已冻结的提案
/phoenix-archive alice/old-proposal.md
```

## 8 个 Skill

| Skill | 命令 | 功能 | 参数 |
|-------|------|------|------|
| init | `/phoenix-init` | 初始化：问代号 → 问目录 → 规范化 → 建索引 | 交互式 |
| pull | `/phoenix-pull` | 拉取 + 自动解析 + diff 摘要 | 无 |
| push | `/phoenix-push` | 文档推送（强制 diff 检查） | 可选 commit message |
| parse | `/phoenix-parse` | 扫描目录、生成 INDEX.md、diff 感知 | 无 |
| status | `/phoenix-status` | 全局状态 + 一致性评分 (0-100) | 无 |
| suggest | `/phoenix-suggest` | 基于 THESIS + diff 的协作建议 | 可选问题 |
| diff | `/phoenix-diff` | 精确 diff（按协作者分组） | `--last` / `--commit=xxx` / `--against=origin/main` |
| archive | `/phoenix-archive` | 提案归档 + 决策冻结 | 提案文件名 |

## 项目结构

```
PhoenixTeam/
├── .claude-plugin/
│   └── plugin.json           # Claude Code 插件清单
├── .codex-plugin/
│   └── plugin.json           # Codex CLI 插件清单
├── skills/                   # 8 个 Skill（两平台共用）
│   ├── phoenix-init/
│   │   └── SKILL.md
│   ├── phoenix-pull/
│   │   └── SKILL.md
│   ├── phoenix-push/
│   │   └── SKILL.md
│   ├── phoenix-parse/
│   │   └── SKILL.md
│   ├── phoenix-status/
│   │   └── SKILL.md
│   ├── phoenix-suggest/
│   │   └── SKILL.md
│   ├── phoenix-diff/
│   │   └── SKILL.md
│   └── phoenix-archive/
│       └── SKILL.md
├── CLAUDE.md                 # 共享上下文（Claude Code 自动加载）
├── AGENTS.md                 # 共享上下文（Codex CLI 自动加载）
├── PHOENIXCOLLAB.md          # 独立 Prompt 版（手动模式）
├── docs/design/              # Demo 示例文档
└── README.md
```

## .phoenix/ 运行时目录

插件运行后会在目标项目中创建：

```
.phoenix/
├── COLLABORATORS.md    # 协作者身份映射表
├── THESIS.md           # 项目设计宪法 (North Star)
├── RULES.md            # 代码规范
├── SIGNALS.md          # 运行时状态 & 阻塞项
├── INDEX.md            # 自动生成的文档索引
├── last-parse.json     # parse 对比缓存
├── design/             # 规范化后的设计文档
│   ├── alice/          # 协作者 alice 的文档
│   ├── bob/            # 协作者 bob 的文档
│   └── shared/         # 共同维护的文档（可选）
└── archive/            # 已冻结的归档提案
```

## 多人协作流程

```
Alice (Claude Code)                    Bob (Codex CLI)
       │                                     │
  /phoenix-init                         /phoenix-init
  代号: alice                            代号: bob
  目录: ./docs/alice-design              目录: ./docs/bob-proposal
       │                                     │
  编辑 .phoenix/design/alice/           编辑 .phoenix/design/bob/
       │                                     │
  /phoenix-push ────────► Git ◄──────── /phoenix-push
       │                                     │
  /phoenix-pull ◄───── diff 摘要         /phoenix-pull
  "bob 新增了 GraphQL 提案,                    │
   与 THESIS REST 优先冲突"              /phoenix-suggest
       │                            "基于 alice 的 diff, 建议..."
  /phoenix-suggest                            │
  "建议触发 archive + 仲裁"                     │
```

## 设计原则

1. **纯 Prompt，零代码** — 插件即 Prompt，AI 即运行时
2. **Git 原生** — diff/log/status 就是最好的协作感知系统
3. **协作者感知** — 每个操作都知道"我是谁"，每个 diff 都按代号分组
4. **只读源文档** — 从不污染用户原始设计文档
5. **跨平台兼容** — Claude Code + Codex CLI 双平台插件系统原生支持

## Demo 测试

本仓库 `docs/design/` 包含示例设计文档，安装插件后可直接运行 `/phoenix-init` 测试完整流程。

## License

MIT
