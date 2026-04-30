# SpecTeam Protocol Audit

Snapshot date: 2026-04-30
Snapshot version: 4167707

This document inventories every place each core `.spec/` entity's shape is
described today. It is the input to Workstream 1 schema design. It **describes**
the current surface — it does not **prescribe** the future schema.

## Methodology

I walked all 14 `plugin/skills/spec-*/SKILL.md` files, then searched the shared
prompt surfaces (`plugin/SHARED-CONTEXT.md`, `plugin/ERRORS.md`, `SPECTEAM.md`,
and `README.md`) for every place the core `.spec/` files, fields, statuses, or
transition rules are named. I then opened each cited line before recording it
here, and cross-checked the results against the shipped divergence fixtures and
the assertions in `tests/validate-divergences.js`. Mock scenarios were used to
confirm which collaborator layouts and divergence classes the demos exercise,
not as normative schema definitions.

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
| `code` | Yes | `plugin/skills/spec-init/SKILL.md:142`, `plugin/skills/spec-init/SKILL.md:144`, `plugin/SHARED-CONTEXT.md:38` | Rendered as the `Code` column, but most workflow prose calls it "member code". |
| `role` | No (legacy tolerated) | `plugin/SHARED-CONTEXT.md:26`, `plugin/SHARED-CONTEXT.md:30`, `plugin/SHARED-CONTEXT.md:31` | Shared context expects a `Role` column and defines three roles, but the current init template omits the column entirely (`plugin/skills/spec-init/SKILL.md:142`). |
| `sourceDirectories` (or doc-dir mapping) | Yes | `plugin/skills/spec-init/SKILL.md:142`, `plugin/skills/spec-init/SKILL.md:144`, `plugin/skills/spec-update/SKILL.md:52` | Stored as human-readable `Source Directories`; no delimiter or escaping rule is specified for multiple paths. |
| `specPath` | Yes | `plugin/skills/spec-init/SKILL.md:142`, `plugin/skills/spec-init/SKILL.md:144`, `plugin/SHARED-CONTEXT.md:38` | Rendered as `Spec Path`; always points at `.spec/design/{code}/`. |
| `joinedAt` | Yes | `plugin/skills/spec-init/SKILL.md:142`, `plugin/skills/spec-init/SKILL.md:144`, `plugin/skills/spec-whoami/SKILL.md:55` | Rendered as `Joined`; examples use date-only text, not an ISO timestamp. |
| `Main Branch` (header field) | Yes | `plugin/skills/spec-init/SKILL.md:132`, `plugin/skills/spec-init/SKILL.md:139`, `plugin/SHARED-CONTEXT.md:57`, `plugin/skills/spec-whoami/SKILL.md:84` | Header metadata, not a table column. It is relied on for branch auto-recovery on fresh clones. |

### Cross-references from other entities

- `DIVERGENCES.md` references collaborator codes in `Parties`, proposer fields,
  vote rows, and source-action rows (`plugin/skills/spec-review/SKILL.md:159`,
  `plugin/skills/spec-align/SKILL.md:105`, `plugin/skills/spec-align/SKILL.md:115`,
  `plugin/skills/spec-align/SKILL.md:288`).
- `decisions/D-{N}.md` uses collaborator codes in per-party block headings and
  action-item ownership (`plugin/skills/spec-align/SKILL.md:241`,
  `plugin/skills/spec-align/SKILL.md:269`).
- `THESIS.md` Decision Log records collaborator identity in archive/finalization
  prose (`plugin/skills/spec-align/SKILL.md:297`,
  `plugin/skills/spec-archive/SKILL.md:62`).
- `INDEX.md` groups the document tree by collaborator code
  (`plugin/skills/spec-parse/SKILL.md:77`).

### Open questions

- Is the `Role` column mandatory for all newly initialized workspaces, or does
  the workflow intentionally continue to support role-less collaborator tables
  as a first-class current format?
- Should `Joined` stay date-only for readability, or align with the ISO
  timestamp format used by the JSON state files?
- How should multiple source directories be encoded canonically: comma-separated
  text, a repeated row model, or a machine-readable list envelope?

## Entity: Thesis (THESIS.md)

### Section inventory

| Section | Required? | Defined in (file:line) | Notes |
|---------|-----------|------------------------|-------|
| North Star | Yes | `plugin/skills/spec-init/SKILL.md:73`, `plugin/skills/spec-init/SKILL.md:153`, `plugin/skills/spec-parse/SKILL.md:48` | Founder init writes the project goal as the North Star; parse later quotes it verbatim into `INDEX.md`. |
| Decision Log | No (created lazily) | `plugin/skills/spec-parse/SKILL.md:54`, `plugin/skills/spec-parse/SKILL.md:58`, `plugin/skills/spec-align/SKILL.md:295`, `plugin/skills/spec-archive/SKILL.md:61` | Parse expects the section but explicitly tolerates it being absent. Align and archive append to it when needed. |

### Mutation rules

- Founder init writes the initial North Star (`plugin/skills/spec-init/SKILL.md:73`,
  `plugin/skills/spec-init/SKILL.md:153`).
- Only maintainers are allowed to modify the North Star directly; contributors
  are explicitly blocked from doing so (`plugin/SHARED-CONTEXT.md:27`,
  `plugin/SHARED-CONTEXT.md:28`).
- `align` does **not** update THESIS on proposal or approval; it only appends to
  `## Decision Log` at finalization time (`plugin/SHARED-CONTEXT.md:43`,
  `plugin/skills/spec-align/SKILL.md:293`).
- `archive` also appends to `## Decision Log`, which means THESIS changes are not
  exclusive to divergence resolution (`plugin/skills/spec-archive/SKILL.md:58`).

### Open questions

- Should `THESIS.md` always be initialized with an empty `## Decision Log`
  section, or is lazy creation part of the intended format?
- Is the North Star allowed to evolve by ordinary maintainer edits, or should
  all substantive thesis changes also be represented by divergence/decision IDs?

## Entity: Signal (SIGNALS.md)

### Field inventory

| Field | Required? | Defined in (file:line) | Notes |
|-------|-----------|------------------------|-------|
| status | No explicit field | `plugin/skills/spec-status/SKILL.md:62`, `plugin/skills/spec-parse/SKILL.md:71` | Consumers extract blockers/progress from prose; there is no declared `status:` key in any template. |
| blocker | Implicit only | `plugin/SHARED-CONTEXT.md:73`, `plugin/skills/spec-status/SKILL.md:62` | The file is described as "Runtime status & blockers", but no row or bullet template is defined. |
| source | Implicit only | `plugin/skills/spec-align/SKILL.md:301`, `plugin/skills/spec-update/SKILL.md:176` | New entries appear to derive source from a divergence ID embedded in free text (for example, `D-{N}` in a bullet). |
| updatedAt | Implicit only | `plugin/skills/spec-update/SKILL.md:176`, `plugin/skills/spec-parse/SKILL.md:73` | The only concrete timestamp shape shown is a leading `[YYYY-MM-DD]` inside appended bullets. |
| scope (optional) | No explicit field | `plugin/skills/spec-status/SKILL.md:62`, `plugin/skills/spec-status/SKILL.md:69` | Scope is inferred indirectly from blocker text and divergence priority, not stored structurally in SIGNALS itself. |
| progress/resolution message | Implicit only | `plugin/skills/spec-align/SKILL.md:301`, `plugin/skills/spec-update/SKILL.md:176` | SIGNALS carries both blocker removal / resolved notes and fully-closed completion notes, but both are prose-only. |

### Open questions

- Is `SIGNALS.md` supposed to be a structured event log, a current-state summary,
  or a mixed free-form bulletin board?
- Should blockers and progress events share one schema, or should "resolved"
  and "fully-closed" notifications move to a dedicated history/log surface?

## Entity: Divergence (DIVERGENCES.md)

### Field inventory

| Field | Required? | Defined in (file:line) | Notes |
|-------|-----------|------------------------|-------|
| `id` (D-NNN) | Yes | `plugin/SHARED-CONTEXT.md:42`, `plugin/skills/spec-review/SKILL.md:71`, `tests/validate-divergences.js:62` | Stable ID format is `D-001`, `D-002`, etc. The validator parses entries from the heading line. |
| `status` (`open` / `proposed` / `resolved` / `fully-closed`) | Yes | `README.md:274`, `README.md:275`, `README.md:276`, `README.md:277` | Four states are documented in README, but the shipped validator only knows `proposed` and `resolved`. |
| `parties` | Yes | `plugin/skills/spec-review/SKILL.md:159`, `plugin/skills/spec-align/SKILL.md:105`, `tests/validate-divergences.js:76` | Rendered as a comma-separated list in the detailed templates. README’s compact example uses `alice vs bob` prose instead (`README.md:287`). |
| `priority` | Open/proposed only | `plugin/skills/spec-review/SKILL.md:161`, `plugin/skills/spec-align/SKILL.md:107`, `tests/validate-divergences.js:78` | Required for proposed entries in the validator, but omitted from the resolved fixture and compact README resolved example. |
| `nature` / category | Open/proposed only | `plugin/skills/spec-review/SKILL.md:160`, `plugin/skills/spec-align/SKILL.md:106`, `tests/validate-divergences.js:77` | The field is called `Nature` in templates, but some prose calls it a "classification". |
| `foundAt` | Open/proposed only | `plugin/skills/spec-review/SKILL.md:162`, `plugin/skills/spec-align/SKILL.md:108`, `tests/validate-divergences.js:79` | Encoded as `{tool} @ {commit} ({date})`, not as separate timestamp and actor fields. |
| `proposal` (proposer, decision, reasoning) | Proposed only | `plugin/skills/spec-align/SKILL.md:109`, `plugin/skills/spec-align/SKILL.md:111`, `plugin/skills/spec-align/SKILL.md:112`, `tests/validate-divergences.js:80` | Active-proposal fields exist only for `proposed` entries. Field naming varies between `Proposer (Lead)` and `Proposer`. |
| `votes` | Proposed/resolved only | `plugin/skills/spec-align/SKILL.md:114`, `plugin/skills/spec-align/SKILL.md:283`, `tests/validate-divergences.js:84`, `tests/validate-divergences.js:95` | Proposed entries use a `Votes` list; resolved entries use `Final Votes`. README’s compact resolved example uses `Proposer`/`Confirmer` instead of a vote list (`README.md:298`). |
| `history` | No (conditional) | `plugin/skills/spec-align/SKILL.md:181`, `plugin/skills/spec-align/SKILL.md:196` | Proposal history only appears on rejection or counter-proposal paths. No normal-form history block exists for straight approve/finalize. |
| `changeInstructionsRef` (link to decisions/D-N.md) | Resolved only | `plugin/skills/spec-align/SKILL.md:284`, `tests/fixtures/divergences-resolved.md:14`, `tests/validate-divergences.js:97` | Required by the validator for resolved fixtures. Stored as a prose "see `.spec/decisions/D-{N}.md`" reference, not a separate ID/path field. |
| `closedAt` | Fully-closed only | `plugin/skills/spec-update/SKILL.md:174` | Only the update skill defines it, and the validator never checks it. |

### State machine references

For each transition, cite where the rule is described (skill file + line).

| From | To | Trigger | Defined in (file:line) |
|------|----|---------|------------------------|
| open | proposed | propose / submit proposal | `plugin/skills/spec-align/SKILL.md:100`, `plugin/SHARED-CONTEXT.md:43` |
| proposed | proposed | approve vote recorded (status stays `proposed`) | `plugin/skills/spec-align/SKILL.md:164` |
| proposed | open | reject | `plugin/skills/spec-align/SKILL.md:172` |
| proposed | open | withdraw | `plugin/skills/spec-align/SKILL.md:304` |
| proposed | proposed | modify (counter-propose) | `plugin/skills/spec-align/SKILL.md:186` |
| proposed | resolved | finalize after consensus reached | `plugin/skills/spec-align/SKILL.md:215`, `plugin/skills/spec-align/SKILL.md:274`, `README.md:309` |
| resolved | fully-closed | all action items complete during update | `plugin/skills/spec-update/SKILL.md:170`, `README.md:407` |

### Validator-asserted shape

- Entry headers must match `### D-NNN: {title}` so the parser can split entries
  (`tests/validate-divergences.js:62`, `tests/validate-divergences.js:67`).
- Proposed entries must include: `Status` (`tests/validate-divergences.js:75`),
  `Parties` (`tests/validate-divergences.js:76`), `Nature`
  (`tests/validate-divergences.js:77`), `Priority`
  (`tests/validate-divergences.js:78`), `Found at`
  (`tests/validate-divergences.js:79`), `Proposer (Lead)`
  (`tests/validate-divergences.js:80`), `Proposed at`
  (`tests/validate-divergences.js:81`), `Proposed decision`
  (`tests/validate-divergences.js:82`), `Reasoning`
  (`tests/validate-divergences.js:83`), a `Votes` header
  (`tests/validate-divergences.js:84`), at least one vote row
  (`tests/validate-divergences.js:85`), and the exact awaiting note
  (`tests/validate-divergences.js:86`).
- Resolved entries must include: `Status` (`tests/validate-divergences.js:90`),
  `Parties` (`tests/validate-divergences.js:91`), `Resolved at`
  (`tests/validate-divergences.js:92`), `Decision`
  (`tests/validate-divergences.js:93`), `Rationale`
  (`tests/validate-divergences.js:94`), a `Final Votes` header
  (`tests/validate-divergences.js:95`), at least one final-vote row
  (`tests/validate-divergences.js:96`), a change-instructions reference
  (`tests/validate-divergences.js:97`), the `#### Source Document Action Items`
  header (`tests/validate-divergences.js:98`), the three-column action-item table
  header (`tests/validate-divergences.js:99`), and at least one action-item row
  (`tests/validate-divergences.js:100`).
- The validator dispatch only covers `proposed` and `resolved`; there is no
  shipped validator branch for `open` or `fully-closed`
  (`tests/validate-divergences.js:157`, `tests/validate-divergences.js:159`).

### Open questions

- Is `priority` an enum (`blocking`, `directional`, `detail`) or free text that
  just happens to use those examples today?
- Should `proposed` and `resolved` both carry vote lists, or should resolved
  entries normalize to `proposer`/`confirmer` instead?
- What is the canonical fully-closed shape beyond `Status` and `Closed at`?

## Entity: Decision (decisions/D-*.md)

### Field inventory

| Field | Required? | Defined in (file:line) | Notes |
|-------|-----------|------------------------|-------|
| `decisionId` | Yes | `plugin/skills/spec-align/SKILL.md:260`, `plugin/skills/spec-align/SKILL.md:262` | Encoded in filename and H1, not as a standalone keyed field. |
| `resolutionSummary` | Yes | `plugin/skills/spec-align/SKILL.md:264`, `plugin/skills/spec-align/SKILL.md:281` | Persisted as `**Decision**`, not `resolutionSummary`. |
| `rationale` | Partial / implicit | `plugin/skills/spec-align/SKILL.md:245`, `plugin/skills/spec-align/SKILL.md:282`, `plugin/skills/spec-align/SKILL.md:298` | Global rationale is explicit in DIVERGENCES.md and THESIS, but the persisted decision-file snippet does not show a top-level `**Rationale**` field. |
| `finalizedBy` | Implicit only | `plugin/skills/spec-align/SKILL.md:265`, `plugin/skills/spec-align/SKILL.md:297` | The decision file stores `Proposer (Lead)`; THESIS stores "Proposed and finalized by". No canonical `finalizedBy` key exists. |
| `resolvedAt` | Yes | `plugin/skills/spec-align/SKILL.md:265`, `plugin/skills/spec-align/SKILL.md:280` | Decision files use date-only text; divergence entries include tool + commit + date. |
| `actionItems` (table) | No explicit persisted table | `plugin/skills/spec-align/SKILL.md:232`, `plugin/skills/spec-align/SKILL.md:286`, `README.md:397` | Action-item tables appear in user output and DIVERGENCES.md summaries, but the decision-file template only guarantees per-party instruction blocks. |
| Per-party instruction blocks | Conditional | `plugin/skills/spec-align/SKILL.md:241`, `plugin/skills/spec-align/SKILL.md:269`, `plugin/skills/spec-align/SKILL.md:272` | Created only for parties that still need source changes; omitted for `No changes needed`. |

### Lifecycle rules

- The decision file is created only when the proposer finalizes a consensus
  (`plugin/skills/spec-align/SKILL.md:215`, `plugin/skills/spec-align/SKILL.md:260`).
- `update` reads the decision file to verify acceptance criteria, but no shipped
  skill mutates the decision file after creation (`plugin/skills/spec-update/SKILL.md:153`,
  `plugin/skills/spec-update/SKILL.md:170`).
- README positions the file as both a user-facing handoff artifact and the
  machine-readable source for update verification (`README.md:320`,
  `README.md:404`).

### Open questions

- Should "no changes needed" collaborators still appear in the decision file as
  explicit action items, or is omission the intended signal?
- Should a decision file carry a top-level rationale and vote summary, or is the
  combination of DIVERGENCES.md + THESIS.md considered sufficient?

## Entity: ActionItem (inside decisions/D-*.md)

### Field inventory

| Field | Required? | Defined in (file:line) | Notes |
|-------|-----------|------------------------|-------|
| `owner` (collaborator code) | Yes | `plugin/skills/spec-align/SKILL.md:234`, `plugin/skills/spec-align/SKILL.md:241`, `plugin/skills/spec-update/SKILL.md:150` | Ownership is duplicated in the summary table and the per-party block heading. |
| `targetFile` (source doc path) | Yes | `plugin/skills/spec-align/SKILL.md:234`, `plugin/skills/spec-align/SKILL.md:247`, `plugin/skills/spec-align/SKILL.md:290` | Stored as a relative source-doc path such as `./design/api.md`. |
| `requiredChanges` | Yes for actionable items | `plugin/skills/spec-align/SKILL.md:248`, `plugin/skills/spec-update/SKILL.md:153`, `README.md:398` | Required in decision blocks and README examples, but absent from the resolved-fixture table shape and the validator’s required columns. |
| `acceptanceCriterion` | Yes for actionable items | `plugin/skills/spec-align/SKILL.md:251`, `plugin/skills/spec-update/SKILL.md:153`, `README.md:404` | `update` treats this as the primary verification rule. |
| `completionState` (`pending` / `no-change-needed` / `complete` / `stale`) | Yes, but the enum is inconsistent | `README.md:400`, `README.md:401`, `plugin/skills/spec-update/SKILL.md:158`, `plugin/skills/spec-status/SKILL.md:50` | Shipped surfaces use `✅ No changes needed`, `⏳ Pending update`, `✅ Updated ({date})`, and `✅ Complete`. No shipped skill defines an action-item `stale` state. |
| `background` | Yes for actionable items | `plugin/skills/spec-align/SKILL.md:243` | Human context field inside the per-party block. |
| `decision` | Yes for actionable items | `plugin/skills/spec-align/SKILL.md:244` | Repeats the resolved decision inside each party-specific block. |

### Lifecycle rules

- `align` generates action items during finalization, marks already-aligned files
  as `No changes needed`, and includes `Acceptance criterion` only for parties
  that still need work (`plugin/skills/spec-align/SKILL.md:222`,
  `plugin/skills/spec-align/SKILL.md:226`, `plugin/skills/spec-align/SKILL.md:251`).
- `update` re-reads the decision block, evaluates the acceptance criterion, and
  either writes `✅ Updated ({date})` or keeps `⏳ Pending update`
  (`plugin/skills/spec-update/SKILL.md:153`, `plugin/skills/spec-update/SKILL.md:156`,
  `plugin/skills/spec-update/SKILL.md:168`).
- When all parties' action items are complete, the parent divergence becomes
  `fully-closed` (`plugin/skills/spec-update/SKILL.md:170`,
  `plugin/skills/spec-update/SKILL.md:173`).
- No shipped skill defines a transition into an action-item `stale` state.

### Open questions

- Is `No changes needed` a terminal completion state, or should it normalize to
  the same canonical enum as `Updated` / `Complete`?
- Should the summary table and the decision block contain the same fields, or is
  the current duplication-with-drift intentional?

## Entity: Index (INDEX.md)

### Section inventory

| Section | Required? | Defined in (file:line) | Notes |
|---------|-----------|------------------------|-------|
| Title + generated banner | Yes | `plugin/skills/spec-parse/SKILL.md:44`, `plugin/skills/spec-parse/SKILL.md:46` | Includes generator identity (`parse`) and an ISO timestamp. |
| North Star | Yes | `plugin/skills/spec-parse/SKILL.md:48`, `plugin/skills/spec-parse/SKILL.md:50` | Must quote THESIS directly, not paraphrase it. |
| Decision Log (last 3) | Yes | `plugin/skills/spec-parse/SKILL.md:54`, `plugin/skills/spec-parse/SKILL.md:58` | Section is always present in INDEX, even if THESIS has no decisions yet. |
| Divergences | Yes | `plugin/skills/spec-parse/SKILL.md:60`, `plugin/skills/spec-parse/SKILL.md:68`, `plugin/skills/spec-parse/SKILL.md:69` | Summarizes open/proposed counts and pending items; resolved/fully-closed items are not listed in detail. |
| Signals | Yes | `plugin/skills/spec-parse/SKILL.md:71`, `plugin/skills/spec-parse/SKILL.md:73` | Direct quote/extract surface, not a normalized projection. |
| Document Tree | Yes | `plugin/skills/spec-parse/SKILL.md:75`, `plugin/skills/spec-parse/SKILL.md:77`, `plugin/skills/spec-parse/SKILL.md:83` | Grouped by collaborator code; `shared` is optional. |

### Generation rules

- `spec-parse` is the primary writer for `INDEX.md`
  (`plugin/skills/spec-parse/SKILL.md:41`).
- The skill attempts incremental rewrites based on `last-parse.json`; unchanged
  sections are preserved when possible (`plugin/skills/spec-parse/SKILL.md:34`,
  `plugin/skills/spec-parse/SKILL.md:37`, `plugin/skills/spec-parse/SKILL.md:39`).
- `init`, `pull`, `update`, and `import` all trigger parse after they run
  (`plugin/skills/spec-init/SKILL.md:160`, `plugin/skills/spec-pull/SKILL.md:6`,
  `plugin/skills/spec-update/SKILL.md:189`, `plugin/skills/spec-import/SKILL.md:7`).
- README documents the same dependency graph (`README.md:189`,
  `README.md:190`, `README.md:191`, `README.md:192`).
- `spec-sos` is the exceptional repair path and may regenerate INDEX during
  merge-conflict recovery (`plugin/skills/spec-sos/SKILL.md:41`).

### Open questions

- Is `INDEX.md` part of the protocol schema, or purely a derived cache that can
  be rebuilt at any time without compatibility guarantees?
- Should the generated banner (`Generated by parse @ ...`) be considered stable
  metadata, or just a human-facing hint?

## Cross-cutting metadata

### Schema version

No explicit schema version is encoded in any `.spec/` entity template or the
documented `.spec/` directory layout (`plugin/SHARED-CONTEXT.md:65`,
`README.md:423`). The only version-related warning in the shipped prompt set is
about standalone-prompt packaging drift, not workspace schema state
(`plugin/ERRORS.md:36`).

### Timestamps

- `COLLABORATORS.md` uses date-only values in `Joined`
  (`plugin/skills/spec-init/SKILL.md:144`, `plugin/skills/spec-whoami/SKILL.md:55`).
- `last-review.json` and `last-sync.json` use explicit ISO timestamps in
  `reviewed_at` / `synced_at` (`plugin/skills/spec-review/SKILL.md:38`,
  `plugin/skills/spec-update/SKILL.md:33`).
- `INDEX.md` uses an ISO timestamp in its generated banner
  (`plugin/skills/spec-parse/SKILL.md:46`).
- Divergence lifecycle fields use `{tool} @ {commit} ({date})`
  (`plugin/skills/spec-review/SKILL.md:162`, `plugin/skills/spec-align/SKILL.md:108`,
  `plugin/skills/spec-align/SKILL.md:280`).
- THESIS and SIGNALS event lines use bracketed date-only bullets
  (`plugin/skills/spec-align/SKILL.md:296`, `plugin/skills/spec-update/SKILL.md:176`).

The current surface uses at least four different timestamp encodings, with no
declared canonical format.

### Generator identity

- `INDEX.md` records generator identity explicitly as `parse`
  (`plugin/skills/spec-parse/SKILL.md:46`).
- `DIVERGENCES.md` records reviewer identity in its header
  (`plugin/skills/spec-review/SKILL.md:152`).
- Divergence event fields encode tool stage (`review`, `align`, `update`) plus
  commit/date, but not a stable actor/tool object
  (`plugin/skills/spec-align/SKILL.md:108`, `plugin/skills/spec-align/SKILL.md:280`,
  `plugin/skills/spec-update/SKILL.md:174`).
- `last-sync.json` stores `member_code`, but not a generator skill name or
  schema version (`plugin/skills/spec-update/SKILL.md:34`).

### Anchors / cache files

- `last-parse.json` is documented as a parse cache that stores file list,
  timestamps, content hashes, and `head_commit` for anchored diffs
  (`plugin/skills/spec-parse/SKILL.md:95`, `plugin/skills/spec-parse/SKILL.md:127`).
- `last-review.json` has the most explicit schema: `reviewed_at`, `head_commit`,
  `per_collaborator.<code>.commit`, and optional `source_hashes`
  (`plugin/skills/spec-review/SKILL.md:35`, `plugin/skills/spec-review/SKILL.md:38`,
  `plugin/skills/spec-review/SKILL.md:40`, `plugin/skills/spec-review/SKILL.md:42`,
  `plugin/skills/spec-review/SKILL.md:43`, `plugin/skills/spec-review/SKILL.md:188`).
- `last-sync.json` is also explicit: `synced_at`, `member_code`, `source_dirs`,
  `files.<path>.hash`, `files.<path>.synced_to`, and `files.<path>.synced_at`
  (`plugin/skills/spec-update/SKILL.md:27`, `plugin/skills/spec-update/SKILL.md:33`,
  `plugin/skills/spec-update/SKILL.md:35`, `plugin/skills/spec-update/SKILL.md:38`,
  `plugin/skills/spec-update/SKILL.md:39`, `plugin/skills/spec-update/SKILL.md:40`).
- Only `last-sync.json` declares its hash algorithm (`sha256`)
  (`plugin/skills/spec-update/SKILL.md:38`); `last-review.json` and
  `last-parse.json` say "hash" or "content hashes" without naming the algorithm
  (`plugin/skills/spec-review/SKILL.md:44`, `plugin/skills/spec-parse/SKILL.md:127`).
- These files are treated as committed workspace state, not ignored scratch:
  they are documented in the generated `.spec/` tree (`README.md:430`,
  `README.md:431`, `README.md:432`) and explicitly staged by `spec-push`
  (`plugin/skills/spec-push/SKILL.md:120`).

## Cross-document references

| From | To | Mechanism (id, path, hash) | Validated by | Notes |
|------|----|----------------------------|--------------|-------|
| DIVERGENCES.md resolved entry | decisions/D-N.md | Prose path reference in `**Change Instructions**: see \`.spec/decisions/D-{N}.md\`` | `tests/validate-divergences.js:97` | Only resolved entries carry this link. |
| decisions/D-N.md action item | source doc path | Literal relative source path in action-item table/block (`./design/...`) | `plugin/skills/spec-update/SKILL.md:150`, `plugin/skills/spec-update/SKILL.md:153` | `update` uses the path plus acceptance criterion to find and verify source-doc edits. |
| THESIS.md Decision Log | decisions/D-N.md / divergence D-N | Shared divergence ID only, not an explicit path | No shipped validator; indirect consumer is `plugin/skills/spec-parse/SKILL.md:54` | The THESIS log can mention `D-{N}` but does not formally link to a decision-file path. |
| COLLABORATORS.md member code | `.spec/design/{code}/` directory | `Spec Path` column value plus directory convention | `plugin/skills/spec-review/SKILL.md:50`, `plugin/skills/spec-parse/SKILL.md:77` | The relationship is path-based, not ID-based. |
| DIVERGENCES.md `Parties` / votes | COLLABORATORS.md codes | Shared collaborator code strings | No explicit validator beyond line presence | The workflow assumes party codes already exist in the collaborator registry, but no skill describes a referential-integrity check. |
| last-review.json `per_collaborator` keys | COLLABORATORS.md codes | Shared collaborator code keys inside JSON | `plugin/skills/spec-review/SKILL.md:50`, `plugin/skills/spec-review/SKILL.md:203` | The same member code namespace is reused across markdown and JSON state. |

## Summary of inconsistencies found

1. `COLLABORATORS.md` role handling is internally inconsistent: shared context says the file includes a `Role` column and defines role semantics (`plugin/SHARED-CONTEXT.md:26`), but the current init template still creates only `Code | Source Directories | Spec Path | Joined` (`plugin/skills/spec-init/SKILL.md:142`).
2. Divergence state coverage is incomplete in the shipped validator: README and shared docs describe four states including `open` and `fully-closed` (`README.md:274`, `README.md:277`), but `tests/validate-divergences.js` only validates `proposed` and `resolved` entries (`tests/validate-divergences.js:157`, `tests/validate-divergences.js:159`).
3. Resolved divergence shape differs between documentation surfaces: README’s compact example uses `Proposer` / `Confirmer` (`README.md:298`), while the validator and resolved fixture require a `Final Votes` block plus action-item table (`tests/validate-divergences.js:95`, `tests/fixtures/divergences-resolved.md:11`).
4. Action-item table shape drifts across surfaces: README uses four columns including `Required changes` (`README.md:398`), the resolved divergence template/fixture uses only `Collaborator | Source file | Status` (`plugin/skills/spec-align/SKILL.md:288`, `tests/validate-divergences.js:99`), and the persisted decision-file template does not guarantee any action-item table at all (`plugin/skills/spec-align/SKILL.md:260`).
5. Action-item completion states are not normalized: README uses `✅ No changes needed` and `⏳ Pending update` (`README.md:400`, `README.md:401`), `update` writes `✅ Updated ({date})` (`plugin/skills/spec-update/SKILL.md:158`), and `status` summarizes the same concept as `✅ Complete` (`plugin/skills/spec-status/SKILL.md:50`).
6. `SIGNALS.md` is a core file with consumers (`plugin/skills/spec-status/SKILL.md:62`, `plugin/skills/spec-parse/SKILL.md:73`), but no shipped prompt defines a stable row, bullet, or section schema for it; align/update only describe prose mutations (`plugin/skills/spec-align/SKILL.md:301`, `plugin/skills/spec-update/SKILL.md:176`).
7. Timestamp formats vary by entity with no normalization rule: collaborator rows use date-only (`plugin/skills/spec-init/SKILL.md:144`), caches use ISO timestamps (`plugin/skills/spec-review/SKILL.md:38`, `plugin/skills/spec-update/SKILL.md:33`), divergence fields use `tool @ commit (date)` (`plugin/skills/spec-align/SKILL.md:108`), and THESIS/SIGNALS log bullets use bracketed dates (`plugin/skills/spec-align/SKILL.md:296`, `plugin/skills/spec-update/SKILL.md:176`).
8. THESIS Decision Log initialization is underspecified: parse explicitly tolerates no Decision Log section (`plugin/skills/spec-parse/SKILL.md:58`), but align and archive both append to `## Decision Log` as though the section already exists (`plugin/skills/spec-align/SKILL.md:295`, `plugin/skills/spec-archive/SKILL.md:61`).

## Inputs to Workstream 1 schema design

Based on the audit, the following questions need explicit answers before W1 can
freeze a schema:

- Decide whether `Role` is mandatory in `COLLABORATORS.md`, and if legacy rows
  without it should be migrated eagerly or interpreted lazily forever.
- Decide the canonical divergence shape for **all four** states, including
  whether resolved entries store vote lists, proposer/confirmer fields, or both.
- Decide one canonical action-item model: where the authoritative fields live
  (decision file vs divergence summary), and what the normalized status enum is.
- Decide whether `SIGNALS.md` is a structured log with typed fields or a free-form
  human note surface that should stay outside strict schema enforcement.
- Decide a single timestamp policy across markdown entities and JSON state:
  ISO 8601 everywhere, date-only in human-facing docs, or a mixed model with
  explicit conversion rules.
- Decide whether `INDEX.md` is part of the schema contract or a purely derived
  artifact whose shape can evolve independently of persisted workspace state.
