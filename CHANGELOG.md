# Changelog

All notable changes to PhoenixTeam will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **PHOENIXTEAM.md**: Synced version from v2.3 to v2.5
- **phoenix-parse**: Added incremental INDEX.md update guidance (section-based updates vs full rewrite)
- **CLAUDE.md / AGENTS.md**: Refactored to reference SHARED-CONTEXT.md, only platform-specific differences remain

### Fixed
- Version number mismatch between PHOENIXTEAM.md (v2.3) and plugin manifests (v2.5)

## [2.3.0] - 2026-04-08

### Added
- **phoenix-import**: New skill for importing external documents via MCP connectors
- **Codex CLI support**: `.codex-plugin/plugin.json` with full skill mapping
- **PHOENIXTEAM.md**: Standalone all-in-one prompt file for any AI tool
- **Collaboration flow diagram**: ASCII art workflow in PHOENIXTEAM.md

### Changed
- **phoenix-align**: Added `fully-closed` 🔒 state (all source docs updated per decision)
- **phoenix-update**: Added Action Items verification with acceptance criteria from `decisions/D-{N}.md`
- **phoenix-review**: Anchor-based scope with source file drift detection via `last-sync.json`
- **DIVERGENCES.md format**: Added `Source document action items` table per resolved divergence

## [2.0.0] - 2026-03-25

### Added
- **Two-phase divergence resolution**: Propose → Approve workflow
- **phoenix-align**: Full Mode A (propose) / Mode B (approve/reject/modify) / Mode C (withdraw) support
- **decisions/ directory**: Per-divergence instruction files with acceptance criteria
- **Branch guard**: Protect against cross-branch .phoenix/ state corruption
- **Identity guard**: Require `git config phoenix.member-code` before any operation
- **last-review.json**: Anchor-based review scope to avoid redundant analysis

### Changed
- **DIVERGENCES.md**: Four-state lifecycle (open → proposed → resolved → fully-closed)
- **phoenix-push**: Added divergence gate and source drift check
- **phoenix-pull**: Smart diff with reflog fallback for prior `git pull` detection

## [1.0.0] - 2026-03-15

### Added
- Initial release with 11 skills: init, whoami, pull, push, parse, status, suggest, diff, review, align, archive
- `.phoenix/` directory structure with COLLABORATORS.md, THESIS.md, RULES.md, SIGNALS.md, INDEX.md
- Claude Code `.claude-plugin/marketplace.json` support
- Design document normalization (source → `.phoenix/design/{code}/`)
- Git-native diff tracking with `last-parse.json` caching
- Dual README (English + Chinese)
