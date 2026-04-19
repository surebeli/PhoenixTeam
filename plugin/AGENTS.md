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
⚠️ Identity not bound on this machine. Please run `p-team:phoenix-whoami` to bind identity before continuing.
```

### Branch Guard Recovery Message
```
⚠️ PhoenixTeam main branch not bound locally, and no record found in COLLABORATORS.md.
Please run `p-team:phoenix-init` to re-initialize and recover branch binding.
```

### Next Step Format
Use Codex CLI format in recommendations:
- `"Recommended next step: p-team:phoenix-status"`
- `"Run p-team:phoenix-push to push changes"`
