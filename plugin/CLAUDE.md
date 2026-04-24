# SpecTeam Workflow — Claude Code Platform Context

> **Shared context**: See [SHARED-CONTEXT.md](./SHARED-CONTEXT.md) for core principles, directory layout, and output format.
> This file only contains Claude Code specific overrides.

## Commit Policy (read this first)

- **English only.** The `.githooks/commit-msg` hook rejects any commit whose message contains CJK (Chinese / Japanese / Korean) characters. Run `git config core.hooksPath .githooks` once after cloning so it's active locally.
- **No prefix is required.** Developer commits can use any conventional style (`feat:`, `fix:`, plain prose, etc.). Do not force a `[SpecTeam]` prefix onto hand-written commits.
- **Skill-generated commits are different.** When a skill (e.g. `/spec-push`, `/spec-align`, `/spec-review`) produces a commit automatically, it uses a `[SpecTeam] {category} — …` label as a workflow convention. Keep those templates as specified in each SKILL.md.

## Platform: Claude Code

### Skill Invocation Format
All skills are invoked via **slash commands**:
- `/spec-init`, `/spec-whoami`, `/spec-pull`, `/spec-push`
- `/spec-review`, `/spec-align`, `/spec-diff`
- `/spec-parse`, `/spec-update`, `/spec-status`
- `/spec-suggest`, `/spec-archive`, `/spec-import`

### Identity Guard Message
```
⚠️ Identity not bound on this machine. Please run `/spec-whoami` to bind identity before continuing.
```

### Branch Guard Recovery Message
```
⚠️ SpecTeam main branch not bound locally, and no record found in COLLABORATORS.md.
Please run `/spec-init` to re-initialize and recover branch binding.
```

### Next Step Format
Use slash command format in recommendations:
- `"Recommended next step: /spec-status"`
- `"Run /spec-push to push changes"`
