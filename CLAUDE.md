# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo actually is

SpecTeam is a **prompt-first product**: the deliverable is a set of 14 Markdown "skills" (prompt files with YAML frontmatter) that AI coding tools execute. There is no runtime — all business logic lives inside `plugin/skills/spec-*/SKILL.md`. The two Node packages (`cli/`, `vscode-extension/`) are deliberately thin surfaces around the prompts; they parse `.spec/` files and shell out, but never reimplement skill logic.

When changing behavior, you almost always edit a `SKILL.md`, not code. Treat prompt edits as you would a code change: read the surrounding skill in full, preserve the 6-section output format defined in `plugin/SHARED-CONTEXT.md`, and keep `triggers` / `callable-by` frontmatter symmetric (CI enforces this).

## Three distribution channels (must stay in sync)

The same skill content is shipped four ways. Version bumps and structural changes must propagate to all of them:

1. **Claude Code plugin** — `.claude-plugin/marketplace.json` + `plugin/skills/` (slash commands)
2. **Codex CLI plugin** — `.codex-plugin/plugin.json` + `plugin/skills/`
3. **Standalone prompt** — `SPECTEAM.md` (single-file embedding of the whole workflow, used when no plugin host is available)
4. **specteam-cli** — `cli/` Node package, which copies `plugin/skills/*/SKILL.md` into `.claude/commands/`

CI (`.github/workflows/validate.yml`) fails if `marketplace.json` and `.codex-plugin/plugin.json` versions diverge, or if `SPECTEAM.md`'s major.minor doesn't match. When bumping versions, update all four plus `cli/package.json` and `vscode-extension/package.json`.

## Skill anatomy and invariants

Every `plugin/skills/spec-*/SKILL.md` declares frontmatter consumed by the host (`name`, `short-description ≤80 chars`, `description`, `user-invocable`, `argument-hint`, `triggers`, `callable-by`, `estimated-tokens`). The skill body is the prompt the AI will execute.

Cross-cutting rules in `plugin/SHARED-CONTEXT.md` apply to **every** skill body — when authoring or editing skills, do not silently drop them:

- **Identity guard** first (`git config spec.member-code`), then **branch guard** (`git config spec.main-branch`), then **role guard** (read role from `COLLABORATORS.md`).
- Single source of truth: skills only write under `.spec/`. User source documents are read-only.
- All errors use `[PX-EXXX]` codes from `plugin/ERRORS.md`.
- Output follows the 6-section structure: Execution Log → Current Identity → Diff-Aware Summary → Result Summary → Key Suggestions → Recommended Next Skill.
- Two-phase divergence resolution (Propose → Approve): `align` on `open` produces `proposed` without updating `THESIS.md`; the other party must approve.

Platform-specific overrides live in `plugin/CLAUDE.md` (slash-command form) and `plugin/AGENTS.md` (Codex form). Keep both in sync when changing user-visible messages.

## Commit policy (enforced)

`.githooks/commit-msg` rejects any commit message containing CJK characters. Activate it once per clone:

```bash
git config core.hooksPath .githooks
```

- **English only.** No prefix is required for hand-written commits.
- The `[SpecTeam] {category} — …` prefix is a *skill-generated* convention (used by `/spec-push`, `/spec-align`, `/spec-review` when they auto-commit). Do not retrofit it onto manual commits.

## Common commands

```bash
# Install skills as Claude Code slash commands (project-local)
mkdir -p .claude/commands
for skill in plugin/skills/*/SKILL.md; do
  cp "$skill" ".claude/commands/$(basename $(dirname $skill)).md"
done

# Run the E2E assertion suite (requires a workspace already initialized with .spec/)
bash tests/run-e2e.sh --setup        # scaffold a temp workspace under /tmp
bash tests/run-e2e.sh --assert-only  # assert against current cwd (must contain .spec/)
bash tests/run-e2e.sh --test review-conflict   # run a single test

# Validate divergence/transcript fixtures (used by run-e2e.sh and CI)
node tests/validate-divergences.js tests/fixtures/divergences-proposed.md proposed

# CLI (thin Node companion in cli/)
cd cli && npm install
node bin/spec.js status              # render DIVERGENCES.md summary
node bin/spec.js install [--global]  # copy plugin/skills/ to .claude/commands/

# VS Code extension
cd vscode-extension && npm install
npm run compile        # tsc one-shot → out/
npm run watch          # tsc --watch
```

There is no top-level test command — tests are the bash assertion runner above plus `node --test` per-package, and the heavy validation lives in CI.

## CI gates worth knowing about

`.github/workflows/validate.yml` runs four jobs that you'll trip over if you skip the conventions:

- **validate-structure** — every `spec-*/` has SKILL.md with required frontmatter; `short-description` ≤ 80 chars; ≥13 skills; all manifest versions agree.
- **validate-tests** — expects every `tests/prompts/NN-*.md` listed in the workflow plus `tests/mock-scenarios/demo-{1,2,3}-*` fixtures; each test prompt must contain `## Scenario`, `## Prerequisites`, `## Test Prompt`, `## Verification Checklist`.
- **validate-triggers** — if skill A's frontmatter lists `triggers: [B]`, then B's `callable-by` must include A. Edit both sides together.
- **validate-locale** — no CJK in `plugin/skills/**`, `plugin/SHARED-CONTEXT.md`, `plugin/CLAUDE.md`, `plugin/AGENTS.md`, `plugin/ERRORS.md`, or PR commit messages. Chinese content lives only in `*.zh-CN.md` translation files.

## When adding a new skill

1. Create `plugin/skills/spec-{name}/SKILL.md` with full frontmatter (mirror an existing skill like `spec-init`).
2. If it triggers another skill, add to that target's `callable-by` list — and vice versa.
3. Add `tests/prompts/NN-{name}.md` with the four required sections and ≥3 checklist items; update `tests/prompts/README.md`.
4. Add the slash command to the table in `README.md` / `README.zh-CN.md` and the dependency graph if relevant.
5. Update `SPECTEAM.md` (standalone bundle), `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`, and `CHANGELOG.md`.
6. If the skill writes `.spec/` artifacts, extend `tests/run-e2e.sh` with assertions.

## Useful pointers

- `SPECTEAM.md` — the standalone all-in-one prompt; mirrors `plugin/skills/` content. Treat changes here as a release artifact.
- `plugin/ERRORS.md` — canonical error catalog (`PX-EXXX` / `PX-WXXX` / `PX-IXXX`). New error states must be registered here before referencing in skills.
- `tests/mock-scenarios/` — fixture data for the three demo flows; `demo-1-conflict` (alice REST vs bob GraphQL) is also the README's 1-minute demo.
- `docs/design/` — product/PRD/architecture docs. They're informational, not consumed by skills at runtime.
