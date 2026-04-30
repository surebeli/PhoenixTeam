# SpecTeam Error Catalog

All SpecTeam errors use the `PX-` prefix for easy searching and troubleshooting.

## Error Code Format

```
PX-{severity}{number}
  E = Fatal (execution stops)
  W = Warning (execution continues with notice)
  I = Info (informational, no action needed)
```

Deterministic validation and parsing surfaces introduced in Phase 2 also use:

```
PX-V{number} = Schema validation failure
PX-P{number} = Markdown parse failure
```

## Fatal Errors (Execution Stops)

| Code | Message | Cause | Recovery |
|------|---------|-------|----------|
| **PX-E001** | Identity Not Bound | `git config spec.member-code` returns empty | Run `/spec-whoami` to bind identity |
| **PX-E002** | Not on Main Branch | Current branch ≠ `git config spec.main-branch` | `git checkout {main_branch}` |
| **PX-E003** | .spec/ Missing | Skill requires initialized workspace but `.spec/` missing | Run `/spec-init` |
| **PX-E004** | Main Branch Unknown | Cloned repo missing branch binding, cannot auto-recover | Run `/spec-init` to re-initialize |
| **PX-E005** | Missing Argument | Required argument not provided (e.g., align without D-N) | Re-run with required argument |
| **PX-E006** | Divergence Not Found | D-{N} not found in DIVERGENCES.md | Run `/spec-status` to see valid IDs |
| **PX-E007** | Insufficient Permissions | Role does not permit this operation (e.g., observer trying to push) | Contact a maintainer |
| **PX-E008** | Remote Unreachable | `git push` / `git pull` failed due to network or auth | Check network and remote URL |

## Warnings (Execution Continues)

| Code | Message | Cause | Recovery |
|------|---------|-------|----------|
| **PX-W001** | Source Document Drift | Source docs modified since last sync (`last-sync.json` mismatch) | Run `/spec-update` before push |
| **PX-W002** | Unresolved Divergences | Open divergences found during push | Run `/spec-review` then `/spec-align` |
| **PX-W003** | Proposal Pending Confirmation | Proposed divergences awaiting current user's approval | Run `/spec-align D-{N}` to approve/reject |
| **PX-W004** | Archived File Referenced | File being archived is referenced by open/proposed divergence | Resolve divergence first, then archive |
| **PX-W005** | Large Document Set | Single collaborator's docs exceed 50KB total | Use `--focus` to narrow scope, or split large docs |
| **PX-W006** | Version Mismatch | Standalone prompt version differs from plugin manifest version | Update SPECTEAM.md header |
| **PX-W007** | Cache Expired | `last-parse.json` / `last-review.json` references non-existent commit | Run `/spec-parse` to rebuild cache |

## Info Messages

| Code | Message | Cause | Action |
|------|---------|-------|--------|
| **PX-I001** | No Changes | No source files changed since last sync | No action needed |
| **PX-I002** | Main Branch Auto-bound | Auto-recovered branch binding from COLLABORATORS.md | Informational only |
| **PX-I003** | No Actionable Divergences | DIVERGENCES.md has no open/proposed items | No action needed |
| **PX-I004** | Incremental Parse | INDEX.md updated incrementally (not full rewrite) | Informational only |
| **PX-I005** | Observer Mode | Current user has `observer` role, read-only access | Informational only |

## Validation Errors (Deterministic Schema Checks)

| Code | Message | Cause | Recovery |
|------|---------|-------|----------|
| **PX-V001** | Missing Required Field | A schema-required field is absent from the typed entity | Add the missing field or run the relevant migration/parser path |
| **PX-V002** | Wrong Type | A field's runtime type does not match the schema | Coerce or rewrite the field to the expected scalar/array/object type |
| **PX-V003** | Unknown Field | Extra fields were supplied under `additionalProperties: false` | Remove unsupported fields or update the typed model generator |
| **PX-V004** | Invalid Enum Value | A field uses a value outside the allowed enum set | Replace it with one of the documented protocol values |
| **PX-V005** | Invalid Format | A date/date-time/path-like field fails format validation | Rewrite the field to the documented canonical format |
| **PX-V006** | Dangling Reference | A collaborator or decision reference points to a missing in-document target | Repair the referenced ID/path so it matches the owning entity |
| **PX-V007** | Schema Version Unsupported | The entity is missing the current schema version or uses a legacy version | Run the legacy migration path or emit the current schema envelope |
| **PX-V008** | Reserved Validation Slot | Reserved for future multi-entity consistency validation | n/a |
| **PX-V009** | Reserved Validation Slot | Reserved for future cache-anchor validation | n/a |
| **PX-V010** | Generic Validation Failure | Validation failed but did not map to a more specific PX-V code | Inspect the raw validation message and fix the underlying field |

## Parse Errors (Deterministic Markdown Parsing)

| Code | Message | Cause | Recovery |
|------|---------|-------|----------|
| **PX-P001** | Missing Section or Heading | A required markdown heading/banner was not found | Restore the expected section heading or migrate the legacy file |
| **PX-P002** | Malformed Table | A required markdown table header or row shape is invalid | Rewrite the table to the documented column layout |
| **PX-P003** | Missing Field Line | A required `**Field**:` line is absent or malformed | Restore the missing field line with the expected label |
| **PX-P004** | Malformed List Entry | A bullet/list item does not match the expected parseable shape | Rewrite the bullet using the documented markdown form |
| **PX-P005** | Malformed Event Line | A generated banner or event/timestamp line is malformed | Rewrite the line to the documented date/event pattern |
| **PX-P006** | Unsupported State Value | Parsed markdown surfaced a status/state outside the supported set | Replace it with a documented protocol state |
| **PX-P007** | Legacy Format Detected | The parser detected a pre-3.0 legacy markdown shape | Run the `legacy-pre-3.0` migration helper |
| **PX-P008** | Malformed Change Instructions | A decision-file change-instructions block is incomplete or malformed | Rewrite the per-collaborator block to the current template |
| **PX-P009** | Malformed Document Tree | INDEX document-tree entries could not be parsed deterministically | Rewrite the tree bullets to the generated parse format |
| **PX-P010** | Parsed Output Failed Validation | Markdown parsed structurally, but the typed result failed schema validation | Inspect the downstream PX-V code and fix the parsed fields |

## Usage in Skills

When outputting an error or warning, use this format:

```
⚠️ [PX-W001] Source document drift: {count} file(s) modified since last sync.
→ Recommended: run /spec-update to sync before pushing.
```

```
❌ [PX-E001] Identity not bound on this machine.
→ Please run /spec-whoami to bind your identity before continuing.
```

The `[PX-XXXX]` prefix allows users to search this catalog for detailed context and recovery steps.
