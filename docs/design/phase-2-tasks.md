# SpecTeam Phase 2 — Protocol Crystallization (W1 completion)

This document is the **strict, line-by-line implementation plan** for Phase 2,
the work that follows the FT-1..FT-3 short-term pack. It corresponds to
Workstream 1 tasks 1.2–1.5 in `docs/design/execution-plan.md`, plus the
groundwork to host them.

> **Source of truth.** If a step here conflicts with prior conversation, this
> file wins. If something is genuinely ambiguous, stop and ask — do not improvise.

## Phase goal

Turn the markdown-described `.spec/` protocol into machine-readable schemas, a
typed parser, and a runtime validator — published as a reusable package — so
later workstreams (state engine, workflow engine, Spec Server) can build on it
without re-parsing markdown.

**After Phase 2:** the schema is code, every fixture in `tests/fixtures/states/`
validates against it, a `spec validate` CLI command exists for smoke-testing,
and the legacy fixture round-trips through a migration helper. The existing
CLI and VS Code extension still parse markdown the old way — their migration
is **explicitly Phase 3**.

## Hard prerequisites

Phase 2 cannot start until **all four** of these are merged on `main`:

- `(FT-1)` execution-plan name scrub
- `(FT-2a)` protocol audit filled in (zero `_TODO_` markers)
- `(FT-2b)` fixture pack seeded under `tests/fixtures/states/`
- `(FT-3)` stage banner + `[Unreleased]` changelog

If `git log --oneline | grep -E '\((FT-[1-3a-b])\)'` does not show all four
commits, **stop** and finish the FT pack first.

## Architectural commitments (require user approval before FN-1 starts)

Phase 2 is the moment we commit to repo structure for everything downstream.
Before moving any file, the executing agent must surface these decisions and
get an explicit "approved" reply:

1. **Monorepo via npm workspaces.** Root `package.json` declares `workspaces`,
   sub-packages live under `packages/`. No pnpm/yarn/lerna.
2. **TypeScript for new packages.** Precedent: `vscode-extension/` already uses
   TypeScript. Keep `cli/` as plain JS for now — it consumes compiled output
   from `packages/spec-schema/` via published types.
3. **Directory moves.**
   - `cli/` → `packages/cli/`
   - `vscode-extension/` → `packages/vscode-extension/`
   - `tests/fixtures/states/` → `packages/spec-fixtures/states/` (referenced via workspace)
   - **Existing `tests/fixtures/divergences-*.md` and `tests/run-e2e.sh` stay
     where they are.** They are part of the prompt-skill QA harness.
4. **Package names on npm.**
   - `specteam-cli` (unchanged — keep current published name)
   - `@specteam/schema` (new)
   - `@specteam/fixtures` (new — `private: true`, never published)
   - VS Code extension stays unpublished by Phase 2 (no rename).
5. **No version bumps in Phase 2.** Existing `specteam-cli` stays at 3.0.1 (or
   whatever ships from FT pack). The new `@specteam/schema` package starts at
   `0.1.0` and is `private: true` until Phase 3 wires consumers up.

The agent must paste these five points back to the user and wait for "approved"
before doing anything in FN-1.

> **Approval recorded 2026-05-01.** User approved all five architectural
> commitments above. FN-1 is unblocked.

## Global rules (apply to every task below)

1. **Never edit `plugin/skills/*/SKILL.md`** in Phase 2. Skill behavior does
   not change in this phase.
2. **Never edit `SPECTEAM.md`**. The standalone bundle stays in lockstep with
   skills, not packages.
3. **Never bump existing package versions.** New packages start at `0.1.0`.
4. **Never use `--no-verify`** or any hook bypass.
5. **One task = one commit.** Hand-written commit messages stay English-only,
   reference the task ID (e.g. `FN-1`), and do **not** prepend `[SpecTeam]`.
6. **Schemas are derived from `docs/design/protocol-audit.md`.** Every field a
   schema declares must trace back to a row in the audit. If you find yourself
   inventing a field, stop — it means the audit was incomplete and FT-2a needs
   a follow-up before Phase 2 continues.
7. **Existing `tests/run-e2e.sh` must keep passing untouched** at every commit
   boundary.
8. **CI must stay green** at every commit boundary. If `.github/workflows/validate.yml`
   needs to learn about new paths, that update is part of the task that
   introduces those paths.

---

## FN-1 — Monorepo layout

### Why

A single flat repo with two sibling Node packages will not host five workstream
packages cleanly. Workspaces are the cheapest correct answer and unblock all
later FN-* tasks. This task is **structural only** — no behavior changes, no
new business logic.

### Pre-step (mandatory)

Surface the five "Architectural commitments" above to the user and wait for
explicit approval. If anything is rejected, stop and revise the plan — do not
proceed with partial approval.

### Files touched (exhaustive)

- `package.json` (NEW at repo root — declares workspaces, no runtime deps)
- `cli/` → `packages/cli/` (moved; use `git mv` so history follows)
- `vscode-extension/` → `packages/vscode-extension/` (moved; `git mv`)
- `packages/spec-schema/` (NEW — empty skeleton: package.json, tsconfig.json,
  src/index.ts with a single export, test/ dir)
- `packages/spec-fixtures/` (NEW — empty skeleton with package.json `private: true`)
- `.github/workflows/validate.yml` (path filters updated for new layout)
- `.gitignore` (add `packages/*/node_modules/`, `packages/*/dist/`)
- `README.md` and `README.zh-CN.md` (Repository Structure section reflects new layout)
- `CONTRIBUTING.md` (Project Structure section reflects new layout)
- `CHANGELOG.md` (`[Unreleased] → Changed` entry)

**Do not touch** plugin/, SPECTEAM.md, .githooks/, docs/design/foundation-tasks.md,
docs/design/protocol-audit.md, tests/ (other than fixture move noted above —
fixtures move only if FT-2b put them under `tests/fixtures/states/`).

### Steps

1. Verify FT-1..FT-3 are merged: `git log --oneline | grep -E '\(FT-(1|2a|2b|3)\)' | wc -l` must be `4`.
2. Create root `package.json`:
   ```json
   {
     "name": "specteam-monorepo",
     "private": true,
     "workspaces": ["packages/*"],
     "scripts": {
       "build": "npm run build --workspaces --if-present",
       "test": "npm run test --workspaces --if-present"
     }
   }
   ```
3. `git mv cli packages/cli` — verify `cli/package.json` "name" stays `specteam-cli`.
4. `git mv vscode-extension packages/vscode-extension`.
5. If `tests/fixtures/states/` exists (from FT-2b), move it: `git mv tests/fixtures/states packages/spec-fixtures/states`. Then create `packages/spec-fixtures/package.json` with `name: "@specteam/fixtures"`, `private: true`, `version: "0.1.0"`.
6. Create `packages/spec-schema/` skeleton:
   - `package.json`: name `@specteam/schema`, `version: 0.1.0`, `private: true`, `main: dist/index.js`, `types: dist/index.d.ts`, devDeps for `typescript`, build script `tsc`, test script `node --test test/`.
   - `tsconfig.json`: target `ES2022`, module `commonjs`, `outDir: dist`, `strict: true`, `declaration: true`.
   - `src/index.ts`: single export `export const VERSION = "0.1.0";` (placeholder; FN-2 fills this in).
   - `test/.gitkeep`.
7. Update `.gitignore`: add `packages/*/node_modules/` and `packages/*/dist/`.
8. Update `.github/workflows/validate.yml` path filters: `cli/**` → `packages/cli/**`, `vscode-extension/**` → `packages/vscode-extension/**`. Add `packages/spec-schema/**` and `packages/spec-fixtures/**` to triggers.
9. Update `README.md` "Repository Structure" section (and `README.zh-CN.md`) to reflect `packages/`.
10. Update `CONTRIBUTING.md` "Project Structure" section.
11. Add `CHANGELOG.md` `[Unreleased] → Changed` entry: `Restructure repo to npm workspaces under packages/`.
12. From repo root: `npm install` (must succeed, generates one root `package-lock.json`).
13. From repo root: `npm run build` (must succeed; `vscode-extension` builds, others no-op).

### Verification

```bash
# Workspace structure exists
test -f package.json
test -d packages/cli
test -d packages/vscode-extension
test -d packages/spec-schema
test -d packages/spec-fixtures

# CLI package name preserved
node -e "console.log(require('./packages/cli/package.json').name)" \
  | grep -q '^specteam-cli$'

# Workspaces resolve
npm install --workspaces --include-workspace-root --dry-run > /dev/null

# CI workflow paths updated (no orphan references)
! grep -E "'cli/\*\*'|'vscode-extension/\*\*'" .github/workflows/validate.yml

# Existing run-e2e.sh path references still work
grep -q "tests/run-e2e.sh" docs/design/foundation-tasks.md  # sanity
test -x tests/run-e2e.sh

# `npm pack` for cli still produces a working tarball with skills bundled
cd packages/cli && npm pack --dry-run | grep -q 'skills/' && cd ../..
```

### Commit

```
build: restructure repo into npm workspaces (FN-1)
```

### Out of scope

- Migrating CLI/extension code to consume `@specteam/schema` (Phase 3).
- Renaming the published `specteam-cli` package on npm.
- Adding lint/format tooling (eslint/prettier) — separate task if wanted.

---

## FN-2 — `@specteam/schema` schemas + validator

### Why

The audit (FT-2a) describes the protocol in prose. This task encodes it as
JSON Schema (draft 2020-12) plus matching TypeScript types, and ships an
ajv-based validator. After this, "is this `.spec/` file valid" is a deterministic
function call, not a prompt judgment.

### Files touched (exhaustive)

- `packages/spec-schema/package.json` (add deps: `ajv`, `ajv-formats`)
- `packages/spec-schema/src/schemas/` (NEW dir):
  - `collaborator.schema.json`
  - `divergence.schema.json`
  - `decision.schema.json`
  - `action-item.schema.json`
  - `signal.schema.json`
  - `thesis.schema.json`
  - `index-doc.schema.json`
  - `envelope.schema.json` (shared metadata: `schemaVersion`, generator, timestamps)
- `packages/spec-schema/src/types/` (NEW dir): one `.ts` per entity matching the schema
- `packages/spec-schema/src/validator.ts` (NEW — `validate(entityType, data) → ValidationResult`)
- `packages/spec-schema/src/index.ts` (re-exports types + validator)
- `packages/spec-schema/test/validator.test.ts` (NEW — tests using `@specteam/fixtures` states)
- `plugin/ERRORS.md` (append `PX-V001..PX-V010` codes for schema-violation categories)
- `CHANGELOG.md` (`[Unreleased] → Added` entry)

### Steps

1. Read `docs/design/protocol-audit.md` end-to-end. Confirm zero `_TODO_` markers
   (else FT-2a is incomplete — stop and report).
2. For each entity heading in the audit, write its JSON Schema. Every field
   in the audit's "Field inventory" table maps to either a `properties` entry
   or a documented omission (with reason).
3. Define `envelope.schema.json` for cross-cutting metadata. Decide based on
   the audit's "Cross-cutting metadata" section whether `schemaVersion` is
   required or optional in v1. Default to **required**, with the audit's
   `legacy-pre-3.0` fixture explicitly exempt via the migration path (FN-3).
4. Hand-author TypeScript types in `src/types/` that match each schema 1:1.
   Do not use a code-generation tool in Phase 2 — manual gives us a forcing
   function to keep the schemas legible. (Codegen can be a Phase 3 chore.)
5. Implement `validator.ts`:
   - `import Ajv from "ajv"` + `addFormats`
   - Compile all schemas at module load.
   - Export `validate(entityType: EntityType, data: unknown): { ok: true, value: T } | { ok: false, errors: ValidationError[] }`.
   - Each `ValidationError` has `code: string` (PX-V###), `path: string`, `message: string`.
6. Append PX-V### codes to `plugin/ERRORS.md` covering: missing required field,
   wrong type, unknown field (strict mode), invalid enum, invalid format, dangling
   reference, schema-version unsupported, plus three slots reserved.
7. Write `validator.test.ts` using Node's built-in `node:test`:
   - Each FT-2b fixture state must produce `ok: true` for the entities it contains.
   - The `legacy-pre-3.0` fixture must produce `ok: false` with at least one
     `PX-V007` (schema-version unsupported) — its valid path is via FN-3 migration.
   - Each entity gets at least one negative test (mutate one field, expect specific PX-V code).
8. From repo root: `npm run build -w @specteam/schema` and `npm test -w @specteam/schema` must both pass.
9. Append `CHANGELOG.md` `[Unreleased] → Added` entry: `@specteam/schema 0.1.0 — JSON Schema + ajv validator for .spec/ entities.`

### Verification

```bash
npm run build -w @specteam/schema
npm test -w @specteam/schema

# Every entity has a schema file
for e in collaborator divergence decision action-item signal thesis index-doc envelope; do
  test -f packages/spec-schema/src/schemas/${e}.schema.json || echo "MISSING: $e"
done

# Every schema has a matching .ts type
for e in collaborator divergence decision action-item signal thesis index-doc envelope; do
  test -f packages/spec-schema/src/types/${e}.ts || echo "MISSING type: $e"
done

# ERRORS.md gained at least 7 PX-V### entries
test "$(grep -cE '^\| `PX-V[0-9]{3}`' plugin/ERRORS.md)" -ge 7

# Validator API surface present
grep -q 'export function validate' packages/spec-schema/src/validator.ts \
  || grep -q 'export const validate' packages/spec-schema/src/validator.ts
```

### Commit

```
feat(schema): add @specteam/schema with entity schemas and ajv validator (FN-2)
```

### Out of scope

- Markdown parsing (FN-3).
- Migration helpers (FN-3).
- CLI integration (FN-4).
- Schema codegen tooling.

---

## FN-3 — Markdown parser + migration helpers

### Why

Schemas validate structured data. Production data lives in markdown. This task
adds the parser that converts current and legacy `.spec/` markdown into the
typed models from FN-2, plus migration helpers for legacy formats. After this,
the round trip "markdown → typed model → validate" works end-to-end on every
fixture.

### Files touched (exhaustive)

- `packages/spec-schema/package.json` (no new runtime deps; consider `mdast-util-from-markdown` only if a clear need emerges — prefer hand-rolled parsers for stability)
- `packages/spec-schema/src/parsers/` (NEW dir):
  - `collaborators.parser.ts`
  - `divergences.parser.ts`
  - `decisions.parser.ts`
  - `signals.parser.ts`
  - `thesis.parser.ts`
  - `index.parser.ts`
- `packages/spec-schema/src/migrations/` (NEW dir):
  - `legacy-pre-3.0.ts` (single migration: legacy shape → current shape)
  - `index.ts` (registry: maps detected legacy markers → migration function)
- `packages/spec-schema/src/index.ts` (re-export parsers + migrations)
- `packages/spec-schema/test/parsers.test.ts` (NEW)
- `packages/spec-schema/test/migrations.test.ts` (NEW)
- `CHANGELOG.md` (`[Unreleased] → Added` entry)

### Parser contract

Every parser exports `parse(text: string): { ok: true, value: T } | { ok: false, errors: ParseError[] }`
where `ParseError` has `code: string` (PX-P###, new range — append to ERRORS.md
within this task), `line: number`, `column: number`, `message: string`.

Parsers must be pure. No file I/O, no global state.

### Migration contract

Every migration exports `migrate(input: unknown): { ok: true, value: T, applied: string[] } | { ok: false, errors: MigrationError[] }`.
The `applied` array lists migration steps actually performed (for logging).

The `legacy-pre-3.0` migration must:
- Accept input that fails FN-2 validation with PX-V007 (schema-version unsupported).
- Produce output that passes FN-2 validation.
- Be idempotent: running it twice produces the same result as running it once.

### Steps

1. For each entity, write a parser that converts markdown sections (per the
   audit) into the typed model. Hand-rolled section-by-section is fine; lean on
   regex only for terminal fields.
2. Wire parsers through the FN-2 validator: every parser's success path must
   produce a value that `validate()` accepts. Add an integration test that
   asserts this on every FT-2b fixture.
3. Implement `migrations/legacy-pre-3.0.ts`. The contract is: input is the
   `legacy-pre-3.0` fixture (which fails FN-2 validation), output passes.
4. Append parse-error codes (PX-P001..PX-P010) to `plugin/ERRORS.md`.
5. Write tests:
   - `parsers.test.ts`: every fixture parses without error; corrupt-input
     test cases produce specific PX-P codes.
   - `migrations.test.ts`: legacy fixture → migrate → validate, all green.
     Also assert idempotence.
6. `npm test -w @specteam/schema` must pass.

### Verification

```bash
npm run build -w @specteam/schema
npm test -w @specteam/schema

# Every entity has a parser
for e in collaborators divergences decisions signals thesis index; do
  test -f packages/spec-schema/src/parsers/${e}.parser.ts || echo "MISSING parser: $e"
done

# Migration target exists
test -f packages/spec-schema/src/migrations/legacy-pre-3.0.ts

# ERRORS.md gained PX-P### entries
test "$(grep -cE '^\| `PX-P[0-9]{3}`' plugin/ERRORS.md)" -ge 7

# End-to-end smoke (executable inline test)
node --input-type=module -e "
  import { parseDivergences, validate } from './packages/spec-schema/dist/index.js';
  import { readFileSync } from 'node:fs';
  const text = readFileSync('packages/spec-fixtures/states/proposed-multi-party/DIVERGENCES.md', 'utf8');
  const parsed = parseDivergences(text);
  if (!parsed.ok) { console.error(parsed.errors); process.exit(1); }
  const validated = validate('divergence', parsed.value);
  if (!validated.ok) { console.error(validated.errors); process.exit(1); }
  console.log('OK');
"
```

### Commit

```
feat(schema): add markdown parsers and legacy-pre-3.0 migration (FN-3)
```

### Out of scope

- CLI command wiring (FN-4).
- Migrating other consumers (Phase 3).
- Round-trip serialization (typed model → markdown). Phase 2 is read-only.

---

## FN-4 — `spec validate` CLI smoke command

### Why

A consumer of `@specteam/schema` proves the package is wirable end-to-end and
gives users a deterministic way to check their `.spec/` state. This is the
**only consumer migration in Phase 2** — `spec status` and the VS Code extension
keep their existing markdown parsing until Phase 3.

### Files touched (exhaustive)

- `packages/cli/package.json` (add dep: `@specteam/schema` via workspace protocol)
- `packages/cli/bin/spec.js` (add `validate` command)
- `packages/cli/test/validate.test.js` (NEW — node:test, runs against fixtures)
- `packages/cli/README.md` (document the new command)
- `README.md` and `README.zh-CN.md` (add `spec validate` to the CLI command table)
- `CHANGELOG.md` (`[Unreleased] → Added` entry)

### Command contract

```
$ spec validate [--path=<dir>] [--json]

Default: walks .spec/ in CWD, parses every recognized file, validates each
against its schema, prints a structured summary, exits 0 on all-pass / 1 on
any failure.

--json: emit machine-readable JSON instead of the human summary.
```

Output (human form) lists per-file pass/fail with PX-V### / PX-P### codes for
failures, and a final `Summary: N passed, M failed`. No prompts, no tool calls.

### Steps

1. Add `@specteam/schema` to `packages/cli/package.json` dependencies as `"workspace:^0.1.0"`.
2. Implement the `validate` subcommand in `bin/spec.js`. Reuse existing
   `commander` setup. Keep the implementation thin — discovery + iteration only;
   parsing and validation come from `@specteam/schema`.
3. Tests via `node:test`:
   - Each FT-2b fixture as `--path` argument: every state except `legacy-pre-3.0`
     exits 0; `legacy-pre-3.0` exits 1 with PX-V007 in stderr.
   - `--json` flag emits parseable JSON.
4. Document the command in `packages/cli/README.md` and add to the README CLI
   table.
5. Append `CHANGELOG.md` `[Unreleased] → Added` entry: `spec validate command for deterministic .spec/ schema check.`

### Verification

```bash
npm run build -w @specteam/schema
npm test -w specteam-cli

# Smoke each fixture (must exit 0 / 1 as expected)
for d in packages/spec-fixtures/states/*/; do
  name=$(basename "$d")
  if [ "$name" = "legacy-pre-3.0" ]; then
    node packages/cli/bin/spec.js validate --path="$d" >/dev/null 2>&1 \
      && { echo "EXPECTED FAIL: $name"; exit 1; } \
      || echo "ok: $name (failed as expected)"
  else
    node packages/cli/bin/spec.js validate --path="$d" \
      || { echo "UNEXPECTED FAIL: $name"; exit 1; }
  fi
done

# JSON output is parseable
node packages/cli/bin/spec.js validate \
  --path=packages/spec-fixtures/states/clean-workspace --json \
  | python3 -c "import sys, json; json.load(sys.stdin)"

# Existing run-e2e.sh still passes
bash tests/run-e2e.sh --setup
# (run-e2e --assert-only if user has an initialized workspace; else skip)
```

### Commit

```
feat(cli): add spec validate command backed by @specteam/schema (FN-4)
```

### Out of scope

- Migrating `spec status` to use the parser (Phase 3 — FN-6 in the next plan).
- VS Code extension changes (Phase 3 — FN-7 in the next plan).
- Adding `spec validate` invocation to CI. That happens once consumer migration
  lands and we know the command is stable.

---

## Done condition for Phase 2

All four commits exist on `main`:
1. `... (FN-1)` repo restructure
2. `... (FN-2)` schemas + validator
3. `... (FN-3)` parsers + migration
4. `... (FN-4)` `spec validate` CLI

Plus:
- `git status` clean
- `npm install` and `npm run build` green from repo root
- `npm test --workspaces` green
- `tests/run-e2e.sh --assert-only` (against an initialized workspace) still passes
- `.github/workflows/validate.yml` green on the resulting `main`
- `[Unreleased]` in `CHANGELOG.md` has entries for each FN-* task

## Phase 2 → Phase 3 hand-off

Phase 3 (planned, not detailed here) migrates the existing consumers:

- **FN-5 (Phase 3):** `spec status` uses `@specteam/schema` instead of regex.
- **FN-6 (Phase 3):** VS Code extension `DivergenceProvider` uses `@specteam/schema`.
- **FN-7 (Phase 3):** Decide whether to extract a `@specteam/state` package
  (Workstream 2) or postpone until a Spec Server use case justifies it.

Phase 3 will get its own `phase-3-tasks.md` once Phase 2 is merged and the
package shape has settled.

## Suggested order

`FN-1 → FN-2 → FN-3 → FN-4`. Strict ordering: each task depends on artifacts
from the previous one. Tasks may be split across sessions — each is independently
committable and has its own verification block.
