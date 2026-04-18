# PhoenixTeam Plugin — Claude Code Platform Context

> **Shared context**: See [SHARED-CONTEXT.md](./SHARED-CONTEXT.md) for core principles, directory layout, and output format.
> This file only contains Claude Code specific overrides.

## Platform: Claude Code

### Skill Invocation Format
All skills are invoked via **slash commands**:
- `/phoenix-init`, `/phoenix-whoami`, `/phoenix-pull`, `/phoenix-push`
- `/phoenix-review`, `/phoenix-align`, `/phoenix-diff`
- `/phoenix-parse`, `/phoenix-update`, `/phoenix-status`
- `/phoenix-suggest`, `/phoenix-archive`, `/phoenix-import`

### Identity Guard Message
```
⚠️ 本机尚未绑定身份，请先运行 `/phoenix-whoami` 完成身份绑定后再继续。
```

### Branch Guard Recovery Message
```
⚠️ 本机未绑定 PhoenixTeam 主分支，且 COLLABORATORS.md 中无记录。
请运行 `/phoenix-init` 重新完成初始化以恢复分支绑定。
```

### Next Step Format
Use slash command format in recommendations:
- `"建议下一步：/phoenix-status"`
- `"运行 /phoenix-push 推送变更"`
