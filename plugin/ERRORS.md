# PhoenixTeam Error Catalog

All PhoenixTeam errors use the `PX-` prefix for easy searching and troubleshooting.

## Error Code Format

```
PX-{severity}{number}
  E = Fatal (execution stops)
  W = Warning (execution continues with notice)
  I = Info (informational, no action needed)
```

## Fatal Errors (Execution Stops)

| Code | Message | Cause | Recovery |
|------|---------|-------|----------|
| **PX-E001** | Identity Not Bound | `git config phoenix.member-code` returns empty | Run `/phoenix-whoami` to bind identity |
| **PX-E002** | Not on Main Branch | Current branch ≠ `git config phoenix.main-branch` | `git checkout {main_branch}` |
| **PX-E003** | .phoenix/ Missing | Skill requires initialized workspace but `.phoenix/` missing | Run `/phoenix-init` |
| **PX-E004** | Main Branch Unknown | Cloned repo missing branch binding, cannot auto-recover | Run `/phoenix-init` to re-initialize |
| **PX-E005** | Missing Argument | Required argument not provided (e.g., align without D-N) | Re-run with required argument |
| **PX-E006** | Divergence Not Found | D-{N} not found in DIVERGENCES.md | Run `/phoenix-status` to see valid IDs |
| **PX-E007** | Insufficient Permissions | Role does not permit this operation (e.g., observer trying to push) | Contact a maintainer |
| **PX-E008** | Remote Unreachable | `git push` / `git pull` failed due to network or auth | Check network and remote URL |

## Warnings (Execution Continues)

| Code | Message | Cause | Recovery |
|------|---------|-------|----------|
| **PX-W001** | Source Document Drift | Source docs modified since last sync (`last-sync.json` mismatch) | Run `/phoenix-update` before push |
| **PX-W002** | Unresolved Divergences | Open divergences found during push | Run `/phoenix-review` then `/phoenix-align` |
| **PX-W003** | Proposal Pending Confirmation | Proposed divergences awaiting current user's approval | Run `/phoenix-align D-{N}` to approve/reject |
| **PX-W004** | Archived File Referenced | File being archived is referenced by open/proposed divergence | Resolve divergence first, then archive |
| **PX-W005** | Large Document Set | Single collaborator's docs exceed 50KB total | Use `--focus` to narrow scope, or split large docs |
| **PX-W006** | Version Mismatch | Standalone prompt version differs from plugin manifest version | Update PHOENIXTEAM.md header |
| **PX-W007** | Cache Expired | `last-parse.json` / `last-review.json` references non-existent commit | Run `/phoenix-parse` to rebuild cache |

## Info Messages

| Code | Message | Cause | Action |
|------|---------|-------|--------|
| **PX-I001** | No Changes | No source files changed since last sync | No action needed |
| **PX-I002** | Main Branch Auto-bound | Auto-recovered branch binding from COLLABORATORS.md | Informational only |
| **PX-I003** | No Actionable Divergences | DIVERGENCES.md has no open/proposed items | No action needed |
| **PX-I004** | Incremental Parse | INDEX.md updated incrementally (not full rewrite) | Informational only |
| **PX-I005** | Observer Mode | Current user has `observer` role, read-only access | Informational only |

## Usage in Skills

When outputting an error or warning, use this format:

```
⚠️ [PX-W001] Source document drift: {count} file(s) modified since last sync.
→ Recommended: run /phoenix-update to sync before pushing.
```

```
❌ [PX-E001] Identity not bound on this machine.
→ Please run /phoenix-whoami to bind your identity before continuing.
```

The `[PX-XXXX]` prefix allows users to search this catalog for detailed context and recovery steps.
