# SpecTeam Protocol Audit

Snapshot date: _TODO: fill on first edit (YYYY-MM-DD)_
Snapshot version: _TODO: `git rev-parse --short HEAD`_

This document inventories every place each core `.spec/` entity's shape is
described today. It is the input to Workstream 1 schema design. It **describes**
the current surface — it does not **prescribe** the future schema.

> **For the AI session executing FT-2a:** every "Defined in" cell must cite a
> real `path:line`. Open the cited line and confirm before recording it.
> The plan file (`docs/design/foundation-tasks.md`, section FT-2a) is the
> source of truth for what counts as done.

## Methodology

_TODO: 2-4 sentences describing how the audit was produced (which files were
walked, which greps were used, which mock scenarios were cross-checked)._

Inputs walked:
- `plugin/skills/spec-*/SKILL.md` (14 files)
- `plugin/SHARED-CONTEXT.md`
- `plugin/ERRORS.md`
- `SPECTEAM.md`
- `README.md` (state tables, divergence section)
- `tests/fixtures/divergences-proposed.md`
- `tests/fixtures/divergences-resolved.md`
- `tests/mock-scenarios/**`
- `tests/validate-divergences.js` (load-bearing assertions)

## Entity: Collaborator (COLLABORATORS.md)

### Field inventory

| Field | Required? | Defined in (file:line) | Notes / inconsistencies |
|-------|-----------|------------------------|-------------------------|
| `code` | _TODO_ | _TODO_ | _TODO_ |
| `role` | _TODO_ | _TODO_ | _TODO_ |
| `sourceDirectories` (or doc-dir mapping) | _TODO_ | _TODO_ | _TODO_ |
| `specPath` | _TODO_ | _TODO_ | _TODO_ |
| `joinedAt` | _TODO_ | _TODO_ | _TODO_ |
| `Main Branch` (header field) | _TODO_ | _TODO_ | _TODO_ |
| _add rows as discovered_ | | | |

### Cross-references from other entities

_TODO: list every place a Collaborator is referenced by `code` (e.g. divergence
`Parties`, decision `Proposer`/`Confirmer`)._

### Open questions

- _TODO: e.g. "Is `Role` column required, or treated as legacy/contributor when missing?"_
- _TODO_

## Entity: Thesis (THESIS.md)

### Section inventory

| Section | Required? | Defined in (file:line) | Notes |
|---------|-----------|------------------------|-------|
| North Star | _TODO_ | _TODO_ | _TODO_ |
| Decision Log | _TODO_ | _TODO_ | _TODO_ |
| _add rows as discovered_ | | | |

### Mutation rules

_TODO: who can edit which section (maintainer-only for North Star, etc.) and
where that rule is described._

### Open questions

- _TODO_

## Entity: Signal (SIGNALS.md)

### Field inventory

| Field | Required? | Defined in (file:line) | Notes |
|-------|-----------|------------------------|-------|
| status | _TODO_ | _TODO_ | _TODO_ |
| blocker | _TODO_ | _TODO_ | _TODO_ |
| source | _TODO_ | _TODO_ | _TODO_ |
| updatedAt | _TODO_ | _TODO_ | _TODO_ |
| scope (optional) | _TODO_ | _TODO_ | _TODO_ |
| _add rows as discovered_ | | | |

### Open questions

- _TODO_

## Entity: Divergence (DIVERGENCES.md)

### Field inventory

| Field | Required? | Defined in (file:line) | Notes |
|-------|-----------|------------------------|-------|
| `id` (D-NNN) | _TODO_ | _TODO_ | _TODO_ |
| `status` (open / proposed / resolved / fully-closed) | _TODO_ | _TODO_ | _TODO_ |
| `parties` | _TODO_ | _TODO_ | _TODO_ |
| `priority` | _TODO_ | _TODO_ | _TODO_ |
| `nature` / category | _TODO_ | _TODO_ | _TODO_ |
| `foundAt` | _TODO_ | _TODO_ | _TODO_ |
| `proposal` (proposer, decision, reasoning) | _TODO_ | _TODO_ | _TODO_ |
| `votes` | _TODO_ | _TODO_ | _TODO_ |
| `history` | _TODO_ | _TODO_ | _TODO_ |
| `changeInstructionsRef` (link to decisions/D-N.md) | _TODO_ | _TODO_ | _TODO_ |
| _add rows as discovered_ | | | |

### State machine references

For each transition, cite where the rule is described (skill file + line).

| From | To | Trigger | Defined in (file:line) |
|------|----|---------|------------------------|
| open | proposed | _TODO_ | _TODO_ |
| proposed | open | reject | _TODO_ |
| proposed | open | withdraw | _TODO_ |
| proposed | proposed | modify (counter-propose) | _TODO_ |
| proposed | resolved | approve / finalize | _TODO_ |
| resolved | fully-closed | all action items complete | _TODO_ |
| _other transitions if any_ | | | |

### Validator-asserted shape

_TODO: list every field/marker `tests/validate-divergences.js` enforces, with
line numbers in that file. Anything it asserts is load-bearing and must be
preserved by any future schema._

### Open questions

- _TODO: e.g. "Is `priority: blocking` an enum or free text?"_
- _TODO_

## Entity: Decision (decisions/D-*.md)

### Field inventory

| Field | Required? | Defined in (file:line) | Notes |
|-------|-----------|------------------------|-------|
| `decisionId` | _TODO_ | _TODO_ | _TODO_ |
| `resolutionSummary` | _TODO_ | _TODO_ | _TODO_ |
| `rationale` | _TODO_ | _TODO_ | _TODO_ |
| `finalizedBy` | _TODO_ | _TODO_ | _TODO_ |
| `resolvedAt` | _TODO_ | _TODO_ | _TODO_ |
| `actionItems` (table) | _TODO_ | _TODO_ | _TODO_ |
| Per-party instruction blocks | _TODO_ | _TODO_ | _TODO_ |
| _add rows as discovered_ | | | |

### Lifecycle rules

_TODO: when is a decision file created (which skill, which transition), when
is it modified, when is it considered final._

### Open questions

- _TODO_

## Entity: ActionItem (inside decisions/D-*.md)

### Field inventory

| Field | Required? | Defined in (file:line) | Notes |
|-------|-----------|------------------------|-------|
| `owner` (collaborator code) | _TODO_ | _TODO_ | _TODO_ |
| `targetFile` (source doc path) | _TODO_ | _TODO_ | _TODO_ |
| `requiredChanges` | _TODO_ | _TODO_ | _TODO_ |
| `acceptanceCriterion` | _TODO_ | _TODO_ | _TODO_ |
| `completionState` (pending / no-change-needed / complete / stale) | _TODO_ | _TODO_ | _TODO_ |
| _add rows as discovered_ | | | |

### Lifecycle rules

_TODO: which skill mutates each state, what verification gate each transition has._

### Open questions

- _TODO_

## Entity: Index (INDEX.md)

### Section inventory

| Section | Required? | Defined in (file:line) | Notes |
|---------|-----------|------------------------|-------|
| _TODO_ | | | |

### Generation rules

_TODO: which skill writes/refreshes INDEX.md, whether updates are full-rewrite
or incremental, what triggers a refresh._

### Open questions

- _TODO_

## Cross-cutting metadata

### Schema version

_TODO: where (if anywhere) a schema version is encoded today. Likely "nowhere
explicit" — record that as a finding._

### Timestamps

_TODO: list every place a timestamp appears, what format it uses (ISO 8601?
date-only? human prose like "2026-04-09"?), and whether the format is consistent._

### Generator identity

_TODO: where (if anywhere) the document records which skill/tool wrote it._

### Anchors / cache files

_TODO: shape of `last-parse.json`, `last-review.json`, `last-sync.json` — fields,
hash algorithm, whether they're committed or gitignored._

## Cross-document references

| From | To | Mechanism (id, path, hash) | Validated by | Notes |
|------|----|----------------------------|--------------|-------|
| DIVERGENCES.md row | decisions/D-N.md | _TODO_ | _TODO_ | _TODO_ |
| decisions/D-N.md action item | source doc path | _TODO_ | _TODO_ | _TODO_ |
| THESIS.md Decision Log | decisions/D-N.md | _TODO_ | _TODO_ | _TODO_ |
| COLLABORATORS.md member code | design/{code}/ directory | _TODO_ | _TODO_ | _TODO_ |
| _add rows as discovered_ | | | | |

## Summary of inconsistencies found

> **Required: at least 5 specific inconsistencies.** Each one must be concrete
> enough that a schema author can decide how to resolve it. Vague observations
> ("formatting varies") do not count.

1. _TODO — concrete inconsistency (file A says X, file B says Y)_
2. _TODO_
3. _TODO_
4. _TODO_
5. _TODO_

## Inputs to Workstream 1 schema design

Based on the audit, the following questions need explicit answers before W1 can
freeze a schema:

- _TODO: e.g. "Decide canonical timestamp format (ISO 8601 vs date-only)"_
- _TODO: e.g. "Decide whether `priority` is enum {blocking, normal, low} or free text"_
- _TODO: e.g. "Decide whether INDEX.md is part of the schema surface or purely derived"_
- _TODO_
