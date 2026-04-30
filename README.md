<p align="center">
  <img src="./docs/images/logo.png" alt="SpecTeam logo" width="600">
</p>

# SpecTeam

> **Stage:** prompt-first workflow (stable) · platform foundation (W1 in progress) — see [Roadmap](./docs/design/roadmap.md).

SpecTeam keeps specs, decisions, and AI agents aligned.

> 中文文档: [README.zh-CN.md](./README.zh-CN.md)

<p align="center">
  <img src="./docs/images/ui_mockup.png" alt="SpecTeam VS Code extension — Divergence Review sidebar" width="820">
</p>

## Overview

SpecTeam is a Git-native workflow for AI-native spec review and decision alignment.

SpecTeam is the current market-facing wedge: AI-native spec review and decision alignment for product and engineering teams using multiple AI tools. It helps teams detect divergence across PRDs, architecture docs, and AI-generated proposals, make decisions quickly, and sync the outcome back into a shared source of truth.

SpecTeam now uses one consistent name across the repository, prompt skills, commands, and product story.

## Product Docs

- [Architecture](./docs/design/architecture.md)
- [Brand Strategy](./docs/design/brand-strategy.md)
- [Product Requirements](./docs/design/product-requirements.md)
- [PMF Validation Loop](./docs/design/pmf-loop.md)
- [Design Partner Playbook](./docs/design/design-partner-playbook.md)
- [Design Partner Templates](./docs/design/design-partner-templates.md)
- [Messaging Kit](./docs/design/messaging-kit.md)
- [Demo Script](./docs/design/demo-script.md)
- [Go-to-Market](./docs/design/go-to-market.md)
- [Dependency-Ordered Roadmap](./docs/design/roadmap.md)
- [Foundation Execution Plan](./docs/design/execution-plan.md)

## Installation

### Claude Code — `.claude/commands/` (recommended)

```bash
git clone https://github.com/surebeli/SpecTeam.git /tmp/spec-team

# Install to current project
mkdir -p .claude/commands
for skill in /tmp/spec-team/plugin/skills/*/SKILL.md; do
  cp "$skill" ".claude/commands/$(basename $(dirname $skill)).md"
done

# Or install globally (applies to all projects)
mkdir -p ~/.claude/commands
for skill in /tmp/spec-team/plugin/skills/*/SKILL.md; do
  cp "$skill" ~/.claude/commands/$(basename $(dirname $skill)).md
done
```

### Claude Code — `/plugin` marketplace

```bash
/plugin marketplace add surebeli/SpecTeam
/plugin install spec-team@SpecTeam
```

### Codex CLI

```bash
git clone https://github.com/surebeli/SpecTeam.git ~/.codex/skills/spec-team
```

### Any AI tool — standalone prompt

Copy `SPECTEAM.md` to your project root, then tell your AI tool:

```
You are now the SpecTeam Workflow. Follow all rules in ./SPECTEAM.md strictly.
Skill: init
```

## Quick Start

### 1-minute Demo (Local)
We provide a simulated scenario to let you experience SpecTeam's conflict detection and resolution in 1 minute.

```bash
# 1. Clone and install skills
git clone https://github.com/surebeli/SpecTeam.git
cd SpecTeam

# 2. Init and point to mock data
# When asked for document directories, enter: ./tests/mock-scenarios/demo-1-conflict/alice, ./tests/mock-scenarios/demo-1-conflict/bob
/spec-init

# 3. Detect conflicts between alice (REST) and bob (GraphQL)
/spec-review

# 4. Resolve a conflict (e.g., D-001)
/spec-align D-001
```

### Core Workflow

```
                        ┌─────────────────────────────────┐
                        │       First use (One-time)      │
                        │       /spec-init             │
                        │  Create .spec/, bind identity│
                        │  Write THESIS, normalize docs   │
                        └──────────────┬──────────────────┘
                                       │
                  ┌────────────────────────────────────────┐
                  │           Daily Collaboration          │
                  │                                        │
   ┌──────────────▼───────────────┐                       │
   │ /spec-pull               │                       │
   │ Pull remote + auto-parse    │                       │
   └──────────────┬───────────────┘                       │
                  │                                       │
   ┌──────────────▼───────────────┐                       │
   │ Edit source docs             │                       │
   │ (Human or AI edits code/doc) │                       │
   └──────────────┬───────────────┘                       │
                  │                                       │
   ┌──────────────▼───────────────┐                       │
   │ /spec-push               │                       │
   │ Sync to .spec/ + push    │                       │
   └──────────────┬───────────────┘                       │
                  │                                       │
                  └───────────────────┬───────────────────┘
                                      │
              ┌───────────────────────▼───────────────────────┐
              │           Conflict Resolution Flow            │
              │                                               │
              │ 1. /spec-review (Find divergences)         │
              │ 2. /spec-align (Propose/Approve decision)  │
              │ 3. /spec-update (Verify implementation)    │
              └───────────────────────────────────────────────┘
```

## Skill Reference

| Command | Description |
|---------|-------------|
| `/spec-init` | Initialize or join a project |
| `/spec-whoami` | Check or bind local identity |
| `/spec-pull` | Pull remote changes and auto-parse |
| `/spec-update` | Sync source documents to `.spec/` |
| `/spec-push` | Push changes to remote after divergence check |
| `/spec-review` | Analyze all docs for divergences vs THESIS |
| `/spec-align` | Resolve divergences via Propose → Approve |
| `/spec-status` | Comprehensive collaboration dashboard |
| `/spec-suggest` | AI-driven suggestions based on diffs |
| `/spec-diff` | View structured diff grouped by collaborator |
| `/spec-parse` | Scan documents and update `INDEX.md` |
| `/spec-archive` | Freeze and archive a design proposal |
| `/spec-import` | Import external docs via MCP/HTTP |
| `/spec-sos` | Emergency auto-resolution of Git merge conflicts in `.spec/` |

## Skill Dependency Graph

```mermaid
graph LR
    subgraph Daily[Daily Workflow]
        pull[pull]
        update[update]
        push[push]
    end

    subgraph Resolve[Review and Resolve]
        review[review]
        align[align]
    end

    subgraph Auto[Auto-triggered]
        parse[parse]
    end

    subgraph Util[Utility]
        init[init]
        status[status]
        suggest[suggest]
        diff[diff]
        whoami[whoami]
        importSkill[import]
        sos[sos]
    end

    init -->|triggers| parse
    pull -->|triggers| parse
    update -->|triggers| parse
    importSkill -->|triggers| parse

    review -.->|feeds| align
    align -.->|enables| push
    status -.->|recommends| review
    suggest -.->|recommends| align

    style parse fill:#4CAF50,color:#fff
    style align fill:#E55B3C,color:#fff
    style review fill:#FF9800,color:#fff
    style init fill:#2196F3,color:#fff
```

> **Legend**: Solid arrows = auto-triggers. Dotted arrows = workflow recommendations.

## Collaboration Flow

```
Alice (Claude Code)                    Bob (Codex CLI)
       │                                     │
 /spec-init (founder)              /spec-init (join)
 Set project goal → THESIS.md         Review goal → join
       │                                     │
 Edit .spec/design/alice/          Edit .spec/design/bob/
       │                                     │
 /spec-push ──────→ Git ◄───────── /spec-push
       │                                     │
 /spec-pull                        /spec-pull
       │                                     │
       └──────────── divergence found ───────→
                          │
                  /spec-review
                  Analyze docs vs THESIS → generate D-001
                  Write DIVERGENCES.md + commit anchors
                          │
  ┌───────────────────────┴────────────────────┐
  │                                            │
  Alice: /spec-align D-001                  │
  Pick resolution → proposed 🟡               │
  ⚠️ THESIS not updated yet                    │
  /spec-push                                │
  │                                            │
  │                             Bob: /spec-pull
  │                             🟡 "D-001 awaiting your confirmation"
  │                             Bob: /spec-align D-001
  │                             → Agree → resolved ✅
  │                             Generate decisions/D-001.md
  │                             Update THESIS Decision Log
  │                             /spec-push
  │                                            │
  └────────────────────────────────────────────┘
                          │
       ╔══════════════════╧══════════════════════════════════════════╗
       ║ [Side flow] Apply decision to source documents              ║
       ║                                                             ║
       ║ decisions/D-001.md contains per-party instruction blocks    ║
       ║ (background / required changes / acceptance criterion)      ║
       ║                                                             ║
       ║ Alice                            Bob                        ║
       ║ Read decisions/D-001.md          Read decisions/D-001.md    ║
       ║ Pass to own model →              Pass to own model →       ║
       ║ Model edits source doc           Model edits source doc     ║
       ║      │                               │                    ║
       ║ /spec-update                  /spec-update            ║
       ║ AI verifies acceptance           AI verifies acceptance     ║
       ║ criterion                        criterion                  ║
       ║ → Pass                           → Pass                    ║
       ║      │                               │                    ║
       ║      └─────────── all ✅ ─────────────┘                    ║
       ║                       │                                     ║
       ║              D-001 fully-closed 🔒                          ║
       ╚══════════════════╤══════════════════════════════════════════╝
                          │
              /spec-push (no open/proposed, push directly)
```

## Divergence Handling

### Four divergence states

| State | Meaning | Who can act |
|-------|---------|-------------|
| `open` 🔴 | Unresolved | Either party can propose |
| `proposed` 🟡 | One party proposed, awaiting other's confirmation | Other party confirms/rejects/modifies; proposer can withdraw |
| `resolved` ✅ | Both parties agreed, source documents being updated | Each party runs update to complete source doc updates |
| `fully-closed` 🔒 | All source documents updated per decision | Read-only, fully archived |

### DIVERGENCES.md — Divergence registry

Written by `review`, read/written by `align`, read by `push`/`status`:

```markdown
## Open

### D-001: API style choice
Status: open 🔴 | Parties: alice vs bob | Priority: blocking

## Proposed

### D-002: Deployment strategy
Status: proposed 🟡 | Proposer: alice | Awaiting bob's confirmation
Proposed decision: adopt Kubernetes (bob's approach) | Reasoning: ...

## Resolved

### D-003: Data model ✅
Status: resolved | Proposer: alice | Confirmer: bob
Decision: adopt NoSQL | Resolved at: 2026-04-09
Change instructions: See .spec/decisions/D-003.md
```

### Propose → Approve two-phase confirmation

`align` automatically switches behavior based on divergence state:

- **Divergence is open** → show comparison table + AI recommendation; user picks resolution → status becomes `proposed`, THESIS **not updated yet**
- **Divergence is proposed, awaiting my confirmation** → show proposer's resolution and reasoning:
  - ✅ Agree → `resolved`; AI generates per-party change instruction blocks (with acceptance criteria); update THESIS Decision Log
  - ❌ Reject (with reason) → revert to `open`
  - 📝 Modify and counter-propose → still `proposed`, proposer changes to me
- **Divergence is proposed, I am proposer** → show waiting state; option to withdraw

### decisions/ — Decision instruction files

When `align` confirms a resolution, it creates `.spec/decisions/D-{N}.md` containing:
- Full decision + reasoning
- Per-party change instruction blocks: what to change, in which file, and an **acceptance criterion** for automated verification by `update`

Users can pass `decisions/D-001.md` directly to their own model to execute source document changes.

### review commit anchor deduplication

`last-review.json` records each collaborator's commit hash at last analysis time:
- New commits → re-analyze
- No new commits → skip
- `resolved` / `proposed` → not disrupted

### pull auto-alerts

After pulling: detects `proposed` divergences awaiting your confirmation, and `resolved` divergences with pending Action Items for you.

### push divergence soft gate

Before pushing, distinguishes:
- 🟡 Proposals awaiting my confirmation → suggest confirming first
- 🔴 Unresolved divergences → warn and wait
- 🟡 Awaiting other party's confirmation → inform (non-blocking)

## Emergency & Safety Mechanisms

### Conflict Fallback (`/spec-sos`)

If you encounter a Git tree conflict (e.g., `<<<<<<< HEAD` markers) while running `/spec-pull` or `/spec-push`, do not manually edit the `.spec/` metadata. Simply run `/spec-sos` to automatically parse and intelligently merge conflicting divergences and JSON state safely.

### Dry-run (`--dry-run`)

For any destructive or global write actions, you can append `--dry-run` to preview the AI's intended actions without touching the file system:

```bash
/spec-review --dry-run
/spec-align --dry-run D-001
/spec-update --dry-run
```

## Ecosystem & Companion Tools

While SpecTeam is "Prompt-First", we provide lightweight companion tools to enhance your workflow.

### SpecTeam CLI (`packages/cli/`)

A zero-logic Node.js CLI that assists with installation and provides a local status dashboard.

- **`spec install`**: Auto-copies skills to your `.claude/commands` directory.
- **`spec status`**: Displays a visual summary of `DIVERGENCES.md` and repository state (zero-token cost).
- **`spec init`**: Scaffolds the `.spec/` directory and guides you to the AI `/spec-init` prompt.
- **`spec validate`**: Runs a deterministic `.spec/` schema check with per-file pass/fail output or machine-readable JSON.
- **`spec sos`**: Detects Git tree conflicts and provides emergency instructions.

### VS Code Extension (`packages/vscode-extension/`)

A visual dashboard integrated into your IDE sidebar.

- **Sidebar Dashboard**: View all `Open 🔴`, `Proposed 🟡`, and `Resolved ✅` divergences at a glance.
- **Quick Action**: Click the "Play" icon next to any open divergence to instantly open a terminal and trigger `/spec-align` in your AI assistant.

## Source Document Sync

### Background

`init` does a one-time copy. If source documents (e.g. `./design/spec.md`) change afterward, the copies in `.spec/design/{code}/` are not automatically updated.

### spec-update solution

`update` records source file hashes in `last-sync.json`, detecting changes incrementally on each run:

```bash
/spec-update           # Detect and sync all changes
/spec-update --dry-run # Preview changes without writing
/spec-update --force   # Skip divergence confirmation, force sync
```

### Post-resolution source document updates (Action Items)

When `align` confirms a resolution, AI analyzes both parties' documents against the decision and generates Action Items written to `decisions/D-{N}.md`:

```markdown
## Source Document Action Items
| Collaborator | Source file | Required changes | Status |
|--------------|-------------|-----------------|--------|
| alice | ./design/api.md | Keep REST design unchanged | ✅ No changes needed |
| bob | ./design/api-proposal.md | Replace GraphQL with REST, update interface examples | ⏳ Pending update |
```

After each party updates their source documents and runs `update`, AI auto-verifies against the **acceptance criterion**:
- ✅ Satisfied → Action Item marked complete
- ❌ Not satisfied → specific guidance (e.g. "GraphQL description still present in section 3")
- All complete → divergence upgrades to `fully-closed` 🔒

### Branch protection

`init` records the current branch as the protected SpecTeam main branch (`git config spec.main-branch`). All other skills enforce a **branch guard** — operations on any other branch are rejected:

```
❌ Current branch 'feature-x' is not the SpecTeam main branch 'main'.
   Switch with: git checkout main
```

## .spec/ Directory Structure

Generated in the target project after initialization:

```
.spec/
├── COLLABORATORS.md    # Identity map: member codes → doc directories; Main Branch metadata
├── THESIS.md           # Project design constitution (North Star) + Decision Log
├── RULES.md            # Code conventions
├── SIGNALS.md          # Runtime status & blockers
├── INDEX.md            # Auto-generated document index
├── DIVERGENCES.md      # Divergence registry (D-001…status summary): written by review, read by align/push/status
├── last-parse.json     # Parse cache (file hashes)
├── last-review.json    # Review anchor: per-collaborator commit hashes + source file hashes at last review
├── last-sync.json      # Source document sync state: source file hashes, maintained by update skill
├── design/
│   ├── alice/          # alice's normalized documents
│   ├── bob/
│   └── shared/         # Jointly maintained (optional)
├── decisions/          # Per-divergence decision files (created by align on resolution)
│   ├── D-001.md        # Full decision + per-party change instruction blocks + acceptance criteria
│   └── D-002.md
└── archive/            # Frozen proposals
```

## Repository Structure

```
SpecTeam/
├── .claude-plugin/
│   ├── marketplace.json          # Marketplace manifest
│   └── plugin.json               # Claude Code plugin definition
├── .codex-plugin/plugin.json     # Codex CLI plugin manifest
├── plugin/                       # Plugin core
│   ├── skills/                   # 14 Skills (shared across platforms)
│   │   ├── spec-init/
│   │   ├── spec-whoami/
│   │   ├── spec-pull/
│   │   ├── spec-push/
│   │   ├── spec-update/
│   │   ├── spec-parse/
│   │   ├── spec-status/
│   │   ├── spec-suggest/
│   │   ├── spec-diff/
│   │   ├── spec-review/
│   │   ├── spec-align/
│   │   ├── spec-archive/
│   │   ├── spec-import/
│   │   └── spec-sos/
│   ├── CLAUDE.md                 # Shared context (Claude Code)
│   └── AGENTS.md                 # Shared context (Codex CLI)
├── packages/                     # npm workspaces
│   ├── cli/                      # specteam-cli — thin local CLI surface
│   ├── vscode-extension/         # VS Code divergence tree view
│   ├── spec-schema/              # @specteam/schema — typed protocol schemas + validator
│   └── spec-fixtures/            # @specteam/fixtures — test fixture states (private)
├── SPECTEAM.md                   # Standalone prompt version (manual mode)
├── README.md                     # This file (English)
├── README.zh-CN.md               # Chinese translation
└── docs/design/                  # Design documents and roadmap
```

## License

MIT
