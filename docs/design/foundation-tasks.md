# SpecTeam Foundation — Short-Term Task Pack

This document is the **strict, line-by-line implementation plan** for three immediate
follow-ups identified after the 3.0.1 release. It exists so any fresh AI session can
pick up the work without re-deriving scope.

> **Source of truth.** If a step here conflicts with prior conversation, this file wins.
> If something is genuinely ambiguous, stop and ask the user — do not improvise.

## Repo posture (read first)

SpecTeam is a **prompt-first product**. The deliverables are `plugin/skills/spec-*/SKILL.md`,
plus a thin Node CLI (`cli/`) and a VS Code extension (`vscode-extension/`). All four
distribution channels (Claude Code marketplace, Codex CLI plugin, `SPECTEAM.md` standalone,
specteam-cli npm) must stay version-synced. CI (`.github/workflows/validate.yml`) enforces
frontmatter shape, English-only content, version match, and trigger/callable-by symmetry.

Every commit message goes through `.githooks/commit-msg`, which rejects CJK characters.
After cloning, run once:

```bash
git config core.hooksPath .githooks
```

## Global rules (apply to every task below)

1. **Never edit `plugin/skills/*/SKILL.md`** unless the task explicitly authorizes it.
   These tasks do not.
2. **Never edit `SPECTEAM.md`** in this task pack. The standalone bundle is a release
   artifact; it changes only when skill behavior changes.
3. **Never bump versions** in any `package.json`, `marketplace.json`, or `.codex-plugin/plugin.json`.
4. **Never use `--no-verify`**, `--no-gpg-sign`, or any hook bypass.
5. **One task = one commit.** Hand-written commit messages stay English-only and do
   **not** prepend `[SpecTeam]`. Reference the task ID (e.g. `FT-1`) in the subject.
6. **Do not create files outside the task's "Files touched" list.** If you think a new
   file is needed, stop and confirm.
7. **Run the verification block before declaring a task done.** If verification fails,
   fix and re-run; do not mark the task complete on a failing run.
8. **Historical text is immutable.** `CHANGELOG.md` entries already shipped (3.0.0,
   3.0.1, etc.) record `phoenix-*` removals as historical fact — do not rewrite them.

---

## FT-1 — Naming consistency sweep in execution-plan docs

### Why

The 3.0.1 rebrand removed `phoenix-*` runtime surfaces but left behind speculative
API names in `docs/design/execution-plan.md` (and its zh-CN twin). Those tables seed
the future Spec Server design — leaving `phoenix_refresh_state` etc. there will
contaminate W4 (Spec Server) when work begins.

### Files touched (exhaustive)

- `docs/design/execution-plan.md`
- `docs/design/execution-plan.zh-CN.md`

**Do not** touch `CHANGELOG.md` (historical), `tests/**`, or skill files.

### Exact replacements

In **both** files, on the lines below, replace tokens 1:1. The line numbers are from
the 3.0.1 snapshot — confirm with grep before editing.

| Line | Old token | New token |
|------|-----------|-----------|
| 68 (table row "Collaborator") | `phoenixPath` | `specPath` |
| 215 (Action Tools row) | `phoenix_refresh_state` | `spec_refresh_state` |
| 216 | `phoenix_propose_resolution` | `spec_propose_resolution` |
| 217 | `phoenix_record_vote` | `spec_record_vote` |
| 218 | `phoenix_finalize_resolution` | `spec_finalize_resolution` |
| 219 | `phoenix_update_action_item` | `spec_update_action_item` |
| 220 | `phoenix_validate_workspace` | `spec_validate_workspace` |

### Steps

1. `grep -nP 'phoenix' docs/design/execution-plan.md docs/design/execution-plan.zh-CN.md`
   — confirm exactly 7 hits per file.
2. Apply the replacements above. Use `Edit` tool, not sed.
3. Re-grep — must return zero hits in both files.
4. Verify the surrounding table structure is intact (column count, alignment).

### Verification

```bash
# Must print nothing
grep -nP 'phoenix' docs/design/execution-plan.md docs/design/execution-plan.zh-CN.md

# Sanity: tables still parse (count of pipe-delimited rows unchanged)
grep -c '^|' docs/design/execution-plan.md
grep -c '^|' docs/design/execution-plan.zh-CN.md
```

CHANGELOG.md still legitimately mentions "phoenix-*" in its historical 3.0.1 entry —
that is correct and must remain.

### Commit

```
docs: scrub residual phoenix_* names from execution-plan (FT-1)
```

### Out of scope

- Renaming any field in actual `.spec/` documents.
- Editing skill files even if they reference these APIs (none currently do).
- Adding new entities to the canonical model — that is FT-2.

---

## FT-2 — Protocol audit + fixture seed (Workstream 1.1 + 1.6)

### Why

Workstream 1 of the roadmap blocks workstreams 2-7. We can advance W1 substantially
without writing any runtime code by producing (a) a complete inventory of where each
core `.spec/` document's shape is described today, and (b) a fixture pack that
captures every state the workflow can reach. This pins the schema surface before
anyone writes a parser.

This task has two sub-parts. Do **2a before 2b** — the audit informs which fixtures
matter.

### FT-2a — Format audit

#### Files touched

- `docs/design/protocol-audit.md` (PRE-FILLED SKELETON — fill in every `_TODO_`
  and replace placeholder rows with real content. Do not delete sections; if a
  section is genuinely not applicable, write "Not applicable" with a one-line
  reason.)

Read-only inputs:
- `plugin/skills/spec-*/SKILL.md` (all 14)
- `plugin/SHARED-CONTEXT.md`, `plugin/ERRORS.md`
- `SPECTEAM.md`
- `README.md` (the divergence/state tables)
- `tests/fixtures/divergences-proposed.md`, `tests/fixtures/divergences-resolved.md`
- `tests/mock-scenarios/**`

#### Required structure of `docs/design/protocol-audit.md`

```markdown
# SpecTeam Protocol Audit

Snapshot date: <YYYY-MM-DD>
Snapshot version: <git rev-parse --short HEAD>

This document inventories every place each core .spec/ entity's shape is
described today. It is the input to Workstream 1 schema design.

## Methodology
<2-4 sentence note on how the audit was produced>

## Entity: Collaborator (COLLABORATORS.md)
### Field inventory
| Field | Required? | Defined in (file:line) | Notes / inconsistencies |
| ...

### Open questions
- ...

## Entity: Thesis (THESIS.md)
...

## Entity: Signal (SIGNALS.md)
...

## Entity: Divergence (DIVERGENCES.md)
### Field inventory
### State machine references (where each transition is described)
### Open questions

## Entity: Decision (decisions/D-*.md)
...

## Entity: ActionItem (inside decisions/D-*.md)
...

## Entity: Index (INDEX.md)
...

## Cross-cutting metadata
- Where schema version is mentioned today (or absent)
- Where timestamps are mentioned (and in what format)
- Where generator identity is recorded

## Cross-document references
| From | To | Mechanism (id, path, hash) | Validated by |
| ...

## Summary of inconsistencies found
1. ...
2. ...
```

Every "Defined in" cell **must** include a real `path:line` reference. Spot-check
five rows by opening the cited line — if any cite is wrong, the audit is rejected.

The "Open questions" subsections are where you record genuinely ambiguous areas —
do not silently resolve them. These become inputs to W1 schema design.

#### Steps

1. Walk the 14 SKILL.md files; grep for the entity names. Capture every place a
   field, status value, or required block is described.
2. Cross-reference against `tests/fixtures/*.md` to see what is actually emitted.
3. Cross-reference against `tests/validate-divergences.js` — anything it asserts is
   load-bearing.
4. Write `docs/design/protocol-audit.md` per the structure above. English only.
5. End-of-document: list **at least 5** specific inconsistencies (e.g. "DIVERGENCES.md
   has `Priority` field in spec-review SKILL but `priority` lowercase in fixture").

#### Verification

```bash
test -f docs/design/protocol-audit.md

# Must still contain all entity headings (skeleton invariant)
for h in Collaborator Thesis Signal Divergence Decision ActionItem Index; do
  grep -q "## Entity: $h" docs/design/protocol-audit.md || echo "MISSING: $h"
done

# Skeleton must be filled: zero unresolved _TODO_ markers remain
test "$(grep -c '_TODO' docs/design/protocol-audit.md)" -eq 0 \
  || { echo "Unresolved TODOs remain"; exit 1; }

# Snapshot date and version are real (not placeholder text)
grep -E '^Snapshot date: [0-9]{4}-[0-9]{2}-[0-9]{2}$' docs/design/protocol-audit.md
grep -E '^Snapshot version: [0-9a-f]{7,}$' docs/design/protocol-audit.md

# At least 20 real `path:line` citations across the doc
test "$(grep -cE '`[a-zA-Z_./-]+:[0-9]+`' docs/design/protocol-audit.md)" -ge 20

# Spot-check: open three random citations and confirm those lines exist.
# (Manual step — paste the three citations and the head -n result back to the user.)

# Inconsistencies summary has at least 5 numbered items
test "$(awk '/^## Summary of inconsistencies found/,/^## /' docs/design/protocol-audit.md \
  | grep -cE '^[0-9]+\.')" -ge 5
```

#### Out of scope for 2a

- Designing the schema. This task **describes**, it does not **prescribe**.
- Editing skill files to fix inconsistencies. Only record them.

### FT-2b — Fixture pack seed

Only start after 2a is committed.

#### Files touched

- `tests/fixtures/states/` (NEW directory)
- `tests/fixtures/states/README.md` (NEW — index of fixtures)
- `tests/fixtures/states/clean-workspace/` (NEW)
- `tests/fixtures/states/conflicted/` (NEW)
- `tests/fixtures/states/proposed-multi-party/` (NEW)
- `tests/fixtures/states/resolved-pending-action-items/` (NEW)
- `tests/fixtures/states/fully-closed/` (NEW)
- `tests/fixtures/states/legacy-pre-3.0/` (NEW)

Each fixture directory contains a minimal but complete `.spec/` tree representing
that state. Reuse content from existing `tests/mock-scenarios/` where possible —
do not reinvent collaborators or designs.

#### Per-fixture requirements

Every fixture directory must contain:

- `COLLABORATORS.md` — at least 2 collaborators with role column
- `THESIS.md` — at least the North Star section
- `INDEX.md` — auto-generatable but include a stub
- `DIVERGENCES.md` — present in every fixture (empty list section is fine for `clean-workspace`)
- `SIGNALS.md` — at least one signal entry or explicit empty marker
- A 2-line `STATE.md` describing what state this fixture represents and which
  invariants it exercises

`decisions/D-*.md` files must be present for `resolved-pending-action-items` and
`fully-closed`.

The `legacy-pre-3.0/` fixture intentionally uses an older shape (e.g. no Role
column, no `Main Branch` field in COLLABORATORS.md) so future migration code has
a target.

#### Steps

1. Read `protocol-audit.md` (FT-2a output) — confirm which fields are required vs optional.
2. Create the 6 fixture directories with the files listed above.
3. Write `tests/fixtures/states/README.md` indexing each fixture, its purpose, and
   the invariants it exercises (table form).
4. Run existing validator on the fixtures' DIVERGENCES.md where applicable:

```bash
node tests/validate-divergences.js tests/fixtures/states/proposed-multi-party/DIVERGENCES.md proposed
node tests/validate-divergences.js tests/fixtures/states/resolved-pending-action-items/DIVERGENCES.md resolved
```

If validation fails, fix the fixture so it passes — do not modify the validator.

#### Verification

```bash
ls tests/fixtures/states/clean-workspace tests/fixtures/states/conflicted \
   tests/fixtures/states/proposed-multi-party tests/fixtures/states/resolved-pending-action-items \
   tests/fixtures/states/fully-closed tests/fixtures/states/legacy-pre-3.0
test -f tests/fixtures/states/README.md

# Each fixture has the 6 required core files
for d in tests/fixtures/states/*/; do
  for f in COLLABORATORS.md THESIS.md INDEX.md DIVERGENCES.md SIGNALS.md STATE.md; do
    [ -f "$d$f" ] || echo "MISSING: $d$f"
  done
done

# Existing validator passes for the two states it knows about
node tests/validate-divergences.js tests/fixtures/states/proposed-multi-party/DIVERGENCES.md proposed
node tests/validate-divergences.js tests/fixtures/states/resolved-pending-action-items/DIVERGENCES.md resolved
```

#### Commits

Two commits, one per sub-task:

```
docs: add protocol audit for .spec/ entities (FT-2a)
test: add fixture pack seeding W1 schema work (FT-2b)
```

#### Out of scope

- Wiring fixtures into `.github/workflows/validate.yml` — that is a follow-up.
- Writing a schema validator. The validator that exists today is enough for 2b.
- Modifying `tests/run-e2e.sh`. Existing tests must keep passing untouched.

---

## FT-3 — Stage banner + Unreleased changelog

### Why

External readers cannot tell from the README that the product is at "prompt-first
prototype, foundation in progress." A one-line stage banner sets expectations.
Reopening `[Unreleased]` in CHANGELOG.md gives subsequent merges a place to land.

### Files touched

- `README.md`
- `README.zh-CN.md`
- `CHANGELOG.md`

### Steps

1. **README.md** — directly under the H1 `# SpecTeam`, before the existing tagline,
   add a stage line:

   ```markdown
   > **Stage:** prompt-first workflow (stable) · platform foundation (W1 in progress) — see [Roadmap](./docs/design/roadmap.md).
   ```

2. **README.zh-CN.md** — add the matching Chinese banner in the same position:

   ```markdown
   > **当前阶段：** Prompt-first 工作流（已稳定）· 平台底座（W1 进行中）— 详见 [路线图](./docs/design/roadmap.zh-CN.md)。
   ```

3. **CHANGELOG.md** — directly under the existing intro paragraph (above `## [3.0.1]`),
   insert:

   ```markdown
   ## [Unreleased]

   ### Added
   - _(none yet)_

   ### Changed
   - _(none yet)_

   ### Fixed
   - _(none yet)_
   ```

   Do not edit any existing version's section.

### Verification

```bash
grep -q '^> \*\*Stage:\*\*' README.md
grep -q '^> \*\*当前阶段：' README.zh-CN.md
grep -q '^## \[Unreleased\]' CHANGELOG.md
# Confirm Unreleased sits ABOVE 3.0.1
awk '/^## \[/{print NR": "$0}' CHANGELOG.md | head -3
```

The third command must show `[Unreleased]` before `[3.0.1]`.

### Commit

```
docs: add stage banner and reopen Unreleased changelog (FT-3)
```

### Out of scope

- Adding any other section to the README.
- Listing planned 3.1.0 contents — `[Unreleased]` stays empty until real changes land.

---

## Done condition for the whole pack

All four commits exist on the branch:
1. `... (FT-1)`
2. `... (FT-2a)`
3. `... (FT-2b)`
4. `... (FT-3)`

`git status` is clean. Every per-task verification block passes on a fresh run. No
file outside the listed scopes was touched.

## Suggested order

`FT-3` → `FT-1` → `FT-2a` → `FT-2b`. Reasons: 3 is fastest and ships visible value;
1 unblocks any future Spec Server discussion that scrapes these docs; 2 is the
heaviest and benefits from the warm-up.

Tasks may be split across sessions — each is independently committable.
