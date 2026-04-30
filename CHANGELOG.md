# Changelog

All notable changes to SpecTeam will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **`docs/design/W1-decisions.md`**: kicks off Phase 2 by extracting the eight schema decisions enumerated at the end of `protocol-audit.md` into a dedicated decision log. Each entry has explicit options, a "default if no answer", and an open/answered status field. The schema PR (FN-2) is gated on these decisions.
- **Validator coverage for `open` and `fully-closed` divergences**: `tests/validate-divergences.js` now accepts those modes alongside `proposed` and `resolved`. `fully-closed` additionally asserts every action-item row carries a `✅`. The four modern fixtures under `tests/fixtures/states/` are wired up in `README.md`; `legacy-pre-3.0` is documented as deliberately validator-incompatible.
- **Cache anchors in fixture pack**: `resolved-pending-action-items/` and `fully-closed/` now ship `last-review.json` + `last-sync.json` so Workstream 2 (state engine) can exercise anchor-driven diff and consistency-score logic against fixture content. Hash values are placeholder sha256-shaped strings.
- **Protocol audit extensions**: added "Cross-cutting: consistency score surfaces" (catalogues every place the 0-100 score is described today plus open questions on bucket cutoffs and additional factors) and "Out of scope but observed: RULES.md" (records that RULES.md exists in the protocol surface but is not yet enumerated as a W1 entity). Both sections feed two new decisions into the W1 schema-design input list.

### Changed
- **`docs/design/W1-decisions.md`**: resolved D1-D8 with the audit-derived defaults approved by the user on 2026-05-01, unblocking the schema PR (FN-2).
- **`docs/design/phase-2-tasks.md`**: recorded user approval for all five FN-1 architectural commitments, unblocking the monorepo layout task.
- **`docs/design/foundation-tasks.md`**: marked FT-1..FT-3 / FT-2a / FT-2b as completed and pointed forward to `phase-2-tasks.md` so fresh sessions stop re-executing the pack.

### Fixed
- **Foundation-tasks audit verification bug**: the awk range form used to count inconsistencies in `protocol-audit.md` closed on the heading line itself (because `^## ` matched both endpoints), so the assertion always returned 0. Replaced with a flag-driven awk that counts correctly.

## [3.0.1] - 2026-04-24

### Removed
- **Legacy PhoenixTeam surfaces**: removed 6 duplicate `phoenix-*` skill folders, `cli/bin/phoenix.js`, and root `PHOENIXTEAM.md`. The repo now uses `SpecTeam` / `spec-*` exclusively.
- **`mcp-connectors/` directory**: removed unimplemented Notion and Obsidian placeholders. SpecTeam ships no connectors today — `spec-import` relies on whatever fetch capability the host AI tool already provides. Connector catalog work is a future roadmap item.
- **Low-quality AI-generated images**: removed `docs/images/logo.png`, `favicon.png`, `ui_mockup.png`, and the stale `docs/design/image2-visual-prompts.md`. Replaced favicon and UI mockup with clean SVG assets.

### Changed
- **`docs/design/architecture.md`**: fully rewrote to match the current PRD and roadmap (Git-native async workflow, no Yjs/Yunxin/PostgreSQL/LangGraph stack). Added `architecture.zh-CN.md` pair.
- **CI workflow**: pointed `.github/workflows/validate.yml` at `spec-*` skills and `SPECTEAM.md`.
- **CLI**: bundled `plugin/skills/` into the published `specteam-cli` npm package so `spec install` works after `npm i -g`. Added `files` whitelist, `repository`/`homepage`/`bugs` metadata, `prepack` script, aligned version strings.
- **`spec-import` skill**: toned down MCP connector framing to reflect the absence of shipped connectors.

### Fixed
- CLI version string (`program.version('1.0.0')`) now reads from `package.json` instead of drifting from it.
- `cli/package.json` no longer declares a non-existent `main: index.js`.
- `.gitignore` tracked the old `.phoenix/` cache directory; now covers the real `.spec/last-*.json` anchors.

## [3.0.0] - 2026-04-23

### Added
- **Dialogue Validation Fixtures**: Added transcript fixtures and validation coverage for manual prompt flows, including align propose, approve, and finalize checkpoints.
- **Windows E2E Runner**: Added a Windows-only PowerShell wrapper for fixture validation, targeted workflow tests, and repeatable smoke workspaces.

### Changed
- **SpecTeam Release Alignment**: Unified plugin, CLI, and VS Code extension release metadata under a single `3.0.0` version.
- **Alignment Workflow**: Finalized the three-phase `spec-align` flow of propose, review or approve, and lead finalize across skills, prompts, and test scenarios.
- **Validation Coverage**: Extended divergence validation to cover proposed and resolved `.spec/DIVERGENCES.md` structures and transcript-based assertions.

## [2.7.0] - 2026-04-19

### Added
- **spec-sos Skill**: Emergency fallback to automatically parse and safely resolve Git tree merge conflicts (e.g. `<<<<<<< HEAD`) within the `.spec/` metadata directory.
- **Dry-run Support**: Added `--dry-run` flag to `spec-review` and `spec-align` for safe previews of AI execution plans without modifying files.
- **SpecTeam Node CLI**: A lightweight companion tool (`cli/`) providing `status`, `install`, `init`, and `sos` commands for zero-token local dashboarding and one-click setup.
- **VS Code Extension**: A visual dashboard (`vscode-extension/`) integrated into the IDE sidebar to view the team's divergence state (Open, Proposed, Resolved) and launch AI conflict resolution directly from the tree view.

### Changed
- **Token Optimization**: Updated `spec-review` to strictly prefer incremental analysis via `git diff` rather than full document reads, heavily reducing token consumption.
- Updated plugin version references to `v2.7.0`.

## [2.6.0] - 2026-04-19

### Added
- **Language Policy Enforcement**: Enforced strict English-only policy for all skills, prompts, and git commits to resolve locale mixing issues.
- **Git Commit Hook**: Added `.githooks/commit-msg` to block commits containing CJK characters.
- **CI Validation**: Added `validate-locale` job in GitHub Actions to check for CJK characters in `SKILL.md` files and PR commit messages.
- **Bilingual Documentation**: Created `product-requirements.zh-CN.md` and `go-to-market.zh-CN.md` as dedicated Chinese translations, translating original docs to English.

### Changed
- Translated all user-facing output templates in 7 skill files (`whoami`, `align`, `update`, `push`, `parse`, `import`, `archive`) to English.
- Updated `CONTRIBUTING.md` to emphasize the strict English-only requirement.
- Updated test prompt assertions to expect English output.

## [2.5.0] - 2026-04-19

### Added
- **Test prompts**: 10 structured test scenarios covering init, update, review, align, push, and status flows
- **Mock scenarios**: 3 demos — API conflict (2-person), solo mode (1-person), three-way conflict (3-person)
- **SHARED-CONTEXT.md**: Extracted common plugin context, reducing duplication between CLAUDE.md and AGENTS.md
- **Skill frontmatter enhancements**: `triggers`, `callable-by`, `short-description`, `estimated-tokens` fields for all 13 skills
- **LICENSE**: MIT license for open-source readiness
- **CHANGELOG.md**: Version history tracking
- **CONTRIBUTING.md**: Community contribution guide with skill authoring instructions and PR process
- **GitHub Actions CI**: Automated validation of plugin structure, frontmatter, versions, tests, and dependency graph
- **MCP Notion connector**: Full connector with `connector.json` schema, reference implementation (`index.js`), and documentation
- **MCP connectors directory**: `mcp-connectors/` with index README and planned connectors roadmap
- **Error catalog**: `ERRORS.md` with standardized PX-codes (PX-E001…PX-I005) for consistent error handling across all skills
- **E2E test runner**: `tests/run-e2e.sh` with automated Git state assertions and mock workspace setup
- **i18n support**: `config.json` locale system (`en`/`zh-CN`) for language-aware output
- **Role system**: Three-tier access control (maintainer/contributor/observer) with role guard enforcement
- **Token budget**: `estimated-tokens` annotations in all 13 skill frontmatters for cost prediction
- **Skill dependency diagram**: Mermaid flowchart in README showing trigger relationships and workflow recommendations
- **Large document protection**: Context budget warning (PX-W005) for documents exceeding 50KB

### Changed
- **SPECTEAM.md**: Synced version from v2.3 to v2.5
- **spec-parse**: Added incremental INDEX.md update guidance (section-based updates vs full rewrite)
- **CLAUDE.md / AGENTS.md**: Refactored to reference SHARED-CONTEXT.md, only platform-specific differences remain

### Fixed
- Version number mismatch between SPECTEAM.md (v2.3) and plugin manifests (v2.5)

## [2.3.0] - 2026-04-08

### Added
- **spec-import**: New skill for importing external documents via MCP connectors
- **Codex CLI support**: `.codex-plugin/plugin.json` with full skill mapping
- **SPECTEAM.md**: Standalone all-in-one prompt file for any AI tool
- **Collaboration flow diagram**: ASCII art workflow in SPECTEAM.md

### Changed
- **spec-align**: Added `fully-closed` 🔒 state (all source docs updated per decision)
- **spec-update**: Added Action Items verification with acceptance criteria from `decisions/D-{N}.md`
- **spec-review**: Anchor-based scope with source file drift detection via `last-sync.json`
- **DIVERGENCES.md format**: Added `Source document action items` table per resolved divergence

## [2.0.0] - 2026-03-25

### Added
- **Two-phase divergence resolution**: Propose → Approve workflow
- **spec-align**: Full Mode A (propose) / Mode B (approve/reject/modify) / Mode C (withdraw) support
- **decisions/ directory**: Per-divergence instruction files with acceptance criteria
- **Branch guard**: Protect against cross-branch .spec/ state corruption
- **Identity guard**: Require `git config spec.member-code` before any operation
- **last-review.json**: Anchor-based review scope to avoid redundant analysis

### Changed
- **DIVERGENCES.md**: Four-state lifecycle (open → proposed → resolved → fully-closed)
- **spec-push**: Added divergence gate and source drift check
- **spec-pull**: Smart diff with reflog fallback for prior `git pull` detection

## [1.0.0] - 2026-03-15

### Added
- Initial release with 11 skills: init, whoami, pull, push, parse, status, suggest, diff, review, align, archive
- `.spec/` directory structure with COLLABORATORS.md, THESIS.md, RULES.md, SIGNALS.md, INDEX.md
- Claude Code `.claude-plugin/marketplace.json` support
- Design document normalization (source → `.spec/design/{code}/`)
- Git-native diff tracking with `last-parse.json` caching
- Dual README (English + Chinese)
