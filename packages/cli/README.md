# SpecTeam CLI

> **Companion CLI for SpecTeam**

SpecTeam is a Git-native workflow for AI-native spec review and decision alignment. This lightweight Node CLI provides a local UX layer for installing SpecTeam, checking divergence state, and running the `spec-*` command surface locally.

**Note:** This CLI contains no workflow business logic. Divergence resolution still runs in your AI assistant; the only deterministic local logic is the thin `spec validate` smoke command backed by `@specteam/schema`.

## Installation

```bash
npm install -g specteam-cli
```

## Usage

### 1. Initialize an AI Project

```bash
spec init
```
Detects your git repository, creates the `.spec/` foundation, and guides you to trigger `/spec-init` in your AI assistant.

### 2. Install AI Skills

```bash
spec install --global
```
Automatically copies all SpecTeam `.md` prompts to your `~/.claude/commands` directory, eliminating the need to copy folders manually. (Omit `--global` to install locally to your current project's `.claude/commands` folder).

### 3. Check Workflow Status

```bash
spec status
```
A highly visual, zero-token way to view the state of your `.spec/DIVERGENCES.md`. See exactly how many conflicts are `Open 🔴`, `Proposed 🟡`, or `Resolved ✅` without burning AI tokens to summarize them.

### 4. Emergency Conflict Help

```bash
spec sos
```
If your `git pull` or `git push` fails due to a Git Tree Merge Conflict, run this command. It will scan your git tree, highlight the conflicted files, and instruct you on how to trigger the AI-powered `/spec-sos` auto-resolution tool.

### 5. Deterministic Schema Check

```bash
spec validate
spec validate --path=packages/spec-fixtures/states/clean-workspace
spec validate --json
```

Validates the recognized `.spec/` markdown files in the target directory using the Phase 2 markdown parsers and AJV schemas from `@specteam/schema`. Human output lists per-file pass/fail and PX-P/PX-V codes, while `--json` emits a machine-readable report and preserves the same exit semantics: `0` when all files pass, `1` when any file fails.

## License
MIT
