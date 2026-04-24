# Contributing to SpecTeam

Thank you for your interest in contributing to SpecTeam! This guide will help you get started.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Skill Development Guide](#skill-development-guide)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs
- Use GitHub Issues with the `bug` label
- Include: steps to reproduce, expected vs actual behavior, which AI tool you're using (Claude Code / Codex CLI / other)

### Suggesting Features
- Use GitHub Issues with the `enhancement` label
- Describe the use case, not just the solution
- Check existing issues first to avoid duplicates

### Writing New Skills
- See [Skill Development Guide](#skill-development-guide) below
- Each new skill needs: SKILL.md, test prompt, and mock scenario data

### Improving Documentation
- README improvements (English or Chinese)
- New mock scenarios for edge cases
- Tutorial / walkthrough content

## Development Setup

### Prerequisites
- Git 2.30+
- An AI coding tool: Claude Code, Codex CLI, Gemini CLI, or any LLM with tool-use capability
- Node 18+ only if you want to hack on the `cli/` or `vscode-extension/` surfaces —
  the core workflow is pure prompts and needs no runtime dependencies.

### Quick Start
```bash
git clone https://github.com/surebeli/SpecTeam.git
cd SpecTeam

# Enable git hooks (enforces English-only commit messages)
git config core.hooksPath .githooks

# For Claude Code: install skills as slash commands
mkdir -p .claude/commands
for skill in plugin/skills/*/SKILL.md; do
  cp "$skill" ".claude/commands/$(basename $(dirname $skill)).md"
done

# For Codex CLI: link the plugin
ln -s $(pwd)/plugin ~/.codex/skills/spec-team

# For any tool: use SPECTEAM.md as a standalone prompt
```

### Verify Installation
```
/spec-init
# Follow the interactive prompts
/spec-status
# Should show the full dashboard
```

## Project Structure

```
SpecTeam/
├── plugin/                        # Prompt skill package
│   ├── SHARED-CONTEXT.md          # Common context for all platforms
│   ├── CLAUDE.md                  # Claude Code specific overrides
│   ├── AGENTS.md                  # Codex CLI specific overrides
│   └── skills/                    # Skill definitions (14 spec-* skills)
│       └── spec-{name}/
│           └── SKILL.md           # Skill prompt definition
├── cli/                           # specteam-cli (Node) — thin local surface
├── vscode-extension/              # VS Code divergence tree view
├── tests/
│   ├── prompts/                   # Structured test scenarios
│   └── mock-scenarios/            # Mock data (3 demos)
├── docs/
│   ├── design/                    # PRD, roadmap, architecture, etc.
│   └── images/                    # Brand assets
├── SPECTEAM.md                    # Standalone all-in-one prompt
├── CHANGELOG.md                   # Version history
└── README.md / README.zh-CN.md    # Documentation (EN + CN)
```

## Skill Development Guide

### Anatomy of a Skill

Each skill lives in `plugin/skills/spec-{name}/SKILL.md` and must follow this structure:

```markdown
---
name: spec-{name}
short-description: "≤80 chars for UI display"
description: "Full description with 'Use this when...' trigger guidance"
user-invocable: true
argument-hint: "[optional argument format]"
triggers: [spec-parse]         # Skills auto-triggered by this skill
callable-by: [spec-init]       # Skills that auto-trigger this skill
---

# Skill: {name}

Brief purpose statement.

## Parameters

- `$ARGUMENTS`: Description of expected input

## Execution Steps

### Step 1 — Identity & pre-flight
1. Read `git config spec.member-code`... (identity guard)
2. Run `git status`... (pre-flight)

### Step N — {action}
...

```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Skill identifier, must match directory name |
| `short-description` | ✅ | ≤80 chars, shown in slash command lists |
| `description` | ✅ | Full description with "Use this when..." |
| `user-invocable` | ✅ | Always `true` for user-facing skills |
| `argument-hint` | ⬜ | Shows expected arguments in command palette |
| `triggers` | ✅ | List of skills this skill auto-triggers |
| `callable-by` | ✅ | List of skills that auto-trigger this skill |

### Rules for Skill Authors

1. **Identity guard first**: Always start with `git config spec.member-code` check
2. **Branch guard**: Always verify current branch matches `spec.main-branch`
3. **Read-only on source**: Never modify files outside `.spec/`
4. **Structured output**: Follow the 6-section output format (see SHARED-CONTEXT.md)
5. **Commit messages**: **English only**, no prefix is required. Workflow-generated commits (e.g. from `spec-push`, `spec-align`) use `[SpecTeam] {category}` labels as an internal categorization — that is a skill convention, not a contributor requirement.
6. **Stop and wait**: Use explicit "Stop and wait for the user to reply" at interaction points
7. **Divergence-aware**: Check DIVERGENCES.md impact for any file mutations
8. **English-only**: All skill prompts, output templates, and generated content must be in English. Do not mix Chinese and English in SKILL.md files.

## Testing

### Running Tests Manually
1. Create a fresh Git repository with `git init && git commit --allow-empty -m "init"`
2. Copy mock scenario data from `tests/mock-scenarios/`
3. Follow each test file in `tests/prompts/` in order
4. Check every item in the verification checklist

### Recommended Test Order
```
01-init-founder → 03-update-new → 02-init-join →
05-review-conflict → 06-align-propose → 07-align-approve →
10-status-full → 09-push-drift
```

### Adding New Tests
- Create `tests/prompts/NN-{scenario-name}.md`
- Follow the existing format: Scenario → Prerequisites → Test Prompt → Expected Interactions → Verification Checklist
- Add mock data in `tests/mock-scenarios/` if needed
- Update `tests/prompts/README.md` with the new test

### CI Validation
GitHub Actions CI runs on every PR — see `.github/workflows/validate.yml`.

## Pull Request Process

1. **Fork and branch**: Create a feature branch from `main`
2. **Make changes**: Follow the style guide below
3. **Test**: Run relevant test prompts manually
4. **Update CHANGELOG**: Add your changes under `[Unreleased]`
5. **Submit PR**: Include:
   - What changed and why
   - Which test prompts were verified
   - Screenshot/log of AI tool output (if applicable)

### PR Checklist
- [ ] SKILL.md has all required frontmatter fields
- [ ] `short-description` is ≤80 characters
- [ ] `triggers` and `callable-by` are correctly declared
- [ ] Test prompt created for new/changed behavior
- [ ] CHANGELOG.md updated
- [ ] No files outside `.spec/` are modified by the skill

## Style Guide

### Language Policy

> **All code, prompts, and commit messages MUST be in English.** Chinese translations are only permitted in dedicated translation files (e.g., `README.zh-CN.md`).

- **Skill prompts (`SKILL.md`)**: English only — both instructions and output templates
- **Commit messages**: English only. No fixed prefix is required — the `commit-msg` hook only rejects CJK characters. Skill-generated commits (from `spec-push`, `spec-align`, etc.) embed a `[SpecTeam] {category}` label as a workflow convention; do not replicate it on hand-written developer commits unless it's genuinely meaningful.
- **README**: English (`README.md`) + dedicated Chinese translation (`README.zh-CN.md`)
- **Design documents**: English preferred; Chinese-only docs should use `.zh-CN` suffix
- **Git hooks**: Run `git config core.hooksPath .githooks` after cloning to activate the commit message guard

### Markdown Formatting
- Use ATX-style headers (`#`, `##`, `###`)
- Use fenced code blocks with language hints
- Use tables for structured comparisons
- Use emoji sparingly but consistently (🔴 🟡 ✅ 🔒 ⚠️ ℹ️)

### Versioning
- Follow [Semantic Versioning](https://semver.org/):
  - **Major**: Breaking changes to skill behavior or .spec/ format
  - **Minor**: New skills, new frontmatter fields, new features
  - **Patch**: Bug fixes, documentation improvements
- Keep SPECTEAM.md version in sync with plugin manifests

---

Thank you for contributing to SpecTeam! 🎉
