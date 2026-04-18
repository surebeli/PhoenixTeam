# Contributing to PhoenixTeam

Thank you for your interest in contributing to PhoenixTeam! This guide will help you get started.

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

### Adding MCP Connectors
- See `mcp-connectors/` for existing connector definitions
- Follow the MCP resource schema pattern

## Development Setup

### Prerequisites
- Git 2.30+
- An AI coding tool: Claude Code, Codex CLI, Gemini CLI, or any LLM with tool-use capability
- No additional dependencies — PhoenixTeam is pure prompts

### Quick Start
```bash
git clone https://github.com/surebeli/PhoenixTeam.git
cd PhoenixTeam

# For Claude Code: install skills as slash commands
mkdir -p .claude/commands
for skill in plugin/skills/*/SKILL.md; do
  cp "$skill" ".claude/commands/$(basename $(dirname $skill)).md"
done

# For Codex CLI: link the plugin
ln -s $(pwd)/plugin ~/.codex/skills/phoenix-team

# For any tool: use PHOENIXTEAM.md as a standalone prompt
```

### Verify Installation
```
/phoenix-init
# Follow the interactive prompts
/phoenix-status
# Should show the full dashboard
```

## Project Structure

```
PhoenixTeam/
├── plugin/                        # The plugin package
│   ├── SHARED-CONTEXT.md          # Common context for all platforms
│   ├── CLAUDE.md                  # Claude Code specific overrides
│   ├── AGENTS.md                  # Codex CLI specific overrides
│   ├── .claude-plugin/            # Claude plugin manifest
│   └── skills/                    # Skill definitions (13 skills)
│       └── phoenix-{name}/
│           └── SKILL.md           # Skill prompt definition
├── mcp-connectors/                # MCP connector definitions
│   └── notion/                    # Notion connector
├── tests/
│   ├── prompts/                   # Structured test scenarios (10 tests)
│   └── mock-scenarios/            # Mock data (3 demos)
├── docs/design/                   # Example design documents
├── PHOENIXTEAM.md                 # Standalone all-in-one prompt
├── CHANGELOG.md                   # Version history
└── README.md / README.zh-CN.md   # Documentation (EN + CN)
```

## Skill Development Guide

### Anatomy of a Skill

Each skill lives in `plugin/skills/phoenix-{name}/SKILL.md` and must follow this structure:

```markdown
---
name: phoenix-{name}
short-description: "≤80 chars for UI display"
description: "Full description with 'Use this when...' trigger guidance"
user-invocable: true
argument-hint: "[optional argument format]"
triggers: [phoenix-parse]         # Skills auto-triggered by this skill
callable-by: [phoenix-init]       # Skills that auto-trigger this skill
---

# Skill: {name}

Brief purpose statement.

## Parameters

- `$ARGUMENTS`: Description of expected input

## Execution Steps

### Step 1 — Identity & pre-flight
1. Read `git config phoenix.member-code`... (identity guard)
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

1. **Identity guard first**: Always start with `git config phoenix.member-code` check
2. **Branch guard**: Always verify current branch matches `phoenix.main-branch`
3. **Read-only on source**: Never modify files outside `.phoenix/`
4. **Structured output**: Follow the 6-section output format (see SHARED-CONTEXT.md)
5. **Commit messages**: Use `[PhoenixTeam]` prefix
6. **Stop and wait**: Use explicit "Stop and wait for the user to reply" at interaction points
7. **Divergence-aware**: Check DIVERGENCES.md impact for any file mutations

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
- [ ] No files outside `.phoenix/` are modified by the skill

## Style Guide

### Language
- Skill prompts: English (primary) with Chinese output templates where user-facing
- README: Bilingual (English + Chinese)
- Commit messages: English with `[PhoenixTeam]` prefix

### Markdown Formatting
- Use ATX-style headers (`#`, `##`, `###`)
- Use fenced code blocks with language hints
- Use tables for structured comparisons
- Use emoji sparingly but consistently (🔴 🟡 ✅ 🔒 ⚠️ ℹ️)

### Versioning
- Follow [Semantic Versioning](https://semver.org/):
  - **Major**: Breaking changes to skill behavior or .phoenix/ format
  - **Minor**: New skills, new frontmatter fields, new features
  - **Patch**: Bug fixes, documentation improvements
- Keep PHOENIXTEAM.md version in sync with plugin manifests

---

Thank you for contributing to PhoenixTeam! 🎉
