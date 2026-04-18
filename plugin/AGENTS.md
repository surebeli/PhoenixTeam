# PhoenixTeam Plugin — Codex CLI Platform Context

> **Shared context**: See [SHARED-CONTEXT.md](./SHARED-CONTEXT.md) for core principles, directory layout, and output format.
> This file only contains Codex CLI specific overrides.

## Platform: Codex CLI

### Skill Invocation Format
All skills are invoked via **plugin:skill** syntax:
- `p-team:phoenix-init`, `p-team:phoenix-whoami`, `p-team:phoenix-pull`, `p-team:phoenix-push`
- `p-team:phoenix-review`, `p-team:phoenix-align`, `p-team:phoenix-diff`
- `p-team:phoenix-parse`, `p-team:phoenix-update`, `p-team:phoenix-status`
- `p-team:phoenix-suggest`, `p-team:phoenix-archive`, `p-team:phoenix-import`

### Identity Guard Message
```
⚠️ 本机尚未绑定身份，请先运行 `p-team:phoenix-whoami` 完成身份绑定后再继续。
```

### Branch Guard Recovery Message
```
⚠️ 本机未绑定 PhoenixTeam 主分支，且 COLLABORATORS.md 中无记录。
请运行 `p-team:phoenix-init` 重新完成初始化以恢复分支绑定。
```

### Next Step Format
Use Codex CLI format in recommendations:
- `"建议下一步：p-team:phoenix-status"`
- `"运行 p-team:phoenix-push 推送变更"`
