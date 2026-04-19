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
⚠️ Identity not bound on this machine. Please run `/phoenix-whoami` to bind identity before continuing.
```

### Branch Guard Recovery Message
```
⚠️ PhoenixTeam main branch not bound locally, and no record found in COLLABORATORS.md.
Please run `/phoenix-init` to re-initialize and recover branch binding.
```

### Next Step Format
Use slash command format in recommendations:
- `"Recommended next step: /phoenix-status"`
- `"Run /phoenix-push to push changes"`
