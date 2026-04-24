# SpecTeam Workflow — Codex CLI Platform Context

> **Shared context**: See [SHARED-CONTEXT.md](./SHARED-CONTEXT.md) for core principles, directory layout, and output format.
> This file only contains Codex CLI specific overrides.

## Commit Policy (read this first)

- **English only.** The `.githooks/commit-msg` hook rejects any commit whose message contains CJK (Chinese / Japanese / Korean) characters. Run `git config core.hooksPath .githooks` once after cloning so it's active locally.
- **No prefix is required.** Developer commits can use any conventional style (`feat:`, `fix:`, plain prose, etc.). Do not force a `[SpecTeam]` prefix onto hand-written commits.
- **Skill-generated commits are different.** When a skill (e.g. `spec-team:spec-push`, `spec-team:spec-align`, `spec-team:spec-review`) produces a commit automatically, it uses a `[SpecTeam] {category} — …` label as a workflow convention. Keep those templates as specified in each SKILL.md.

## Platform: Codex CLI

### Skill Invocation Format
All skills are invoked via **plugin:skill** syntax:
- `spec-team:spec-init`, `spec-team:spec-whoami`, `spec-team:spec-pull`, `spec-team:spec-push`
- `spec-team:spec-review`, `spec-team:spec-align`, `spec-team:spec-diff`
- `spec-team:spec-parse`, `spec-team:spec-update`, `spec-team:spec-status`
- `spec-team:spec-suggest`, `spec-team:spec-archive`, `spec-team:spec-import`

### Identity Guard Message
```
⚠️ Identity not bound on this machine. Please run `spec-team:spec-whoami` to bind identity before continuing.
```

### Branch Guard Recovery Message
```
⚠️ SpecTeam main branch not bound locally, and no record found in COLLABORATORS.md.
Please run `spec-team:spec-init` to re-initialize and recover branch binding.
```

### Next Step Format
Use Codex CLI format in recommendations:
- `"Recommended next step: spec-team:spec-status"`
- `"Run spec-team:spec-push to push changes"`
