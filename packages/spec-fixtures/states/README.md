# SpecTeam State Fixtures

These fixtures seed Workstream 1 schema work with minimal but complete `.spec`
trees covering the main workflow states and one legacy format.

| Fixture | Purpose | Key invariants exercised |
|---------|---------|--------------------------|
| `clean-workspace` | Aligned collaborators with no divergences | Roles + Main Branch present, no pending divergences, explicit empty signals marker |
| `conflicted` | Open blocking divergence before proposal | Modern collaborator registry, open divergence shape, blocker signal |
| `proposed-multi-party` | Three-party proposal awaiting final consensus | Proposed divergence validated by existing validator, multi-party collaborator map, partial votes |
| `resolved-pending-action-items` | Decision finalized but source updates still pending | Resolved divergence validated by existing validator, decision file present, pending action item remains, `last-review.json` + `last-sync.json` present |
| `fully-closed` | All source updates complete after a resolved decision | Decision file retained, fully-closed divergence metadata, completion signal, `last-review.json` + `last-sync.json` present |
| `legacy-pre-3.0` | Older workspace shape for future migration logic | No `Role` column, no `Main Branch` header, compact divergence formatting, validator-incompatible by design |

Reuse notes:
- API protocol fixtures reuse the Alice/Bob REST-vs-GraphQL scenario.
- Payment fixtures reuse the Alice/Bob/Carol three-way payment architecture scenario.
- Legacy keeps the same collaborator identities, but intentionally preserves older metadata shape.

## Validator coverage

`tests/validate-divergences.js` accepts four modes — `open`, `proposed`,
`resolved`, `fully-closed` — and the modern fixtures map to them as follows:

```bash
node tests/validate-divergences.js packages/spec-fixtures/states/conflicted/DIVERGENCES.md open
node tests/validate-divergences.js packages/spec-fixtures/states/proposed-multi-party/DIVERGENCES.md proposed
node tests/validate-divergences.js packages/spec-fixtures/states/resolved-pending-action-items/DIVERGENCES.md resolved
node tests/validate-divergences.js packages/spec-fixtures/states/fully-closed/DIVERGENCES.md fully-closed
```

`clean-workspace` has no divergences, so there is nothing to validate. The
`legacy-pre-3.0` fixture is deliberately validator-incompatible (compact
single-line shape, no `Role` column, no `Main Branch` header) — it exists as a
migration target, not a conformance target. Do not run the validator against it.

## Cache anchors

`resolved-pending-action-items/` and `fully-closed/` ship `last-review.json`
and `last-sync.json` so Workstream 2 (state engine) can exercise anchor-based
diff and consistency-score logic against real fixture content. Both files are
written from `alice`'s perspective. Hash values are placeholder sha256-shaped
strings — they exist to satisfy schema readers, not to verify content
integrity. Do not regenerate them from the fixture markdown; they are static
test inputs.
