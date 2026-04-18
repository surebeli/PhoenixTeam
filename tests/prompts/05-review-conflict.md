# Test 05: Review — Conflict Detection

## Scenario
Two collaborators have contradictory design proposals. Running review should detect the divergence and generate a structured report in DIVERGENCES.md.

## Prerequisites
- PhoenixTeam initialized with two members: `alice` and `bob`
- `alice` proposes REST API (`.phoenix/design/alice/api-design.md`)
- `bob` proposes GraphQL API (`.phoenix/design/bob/api-design.md`)
- THESIS.md has a relevant North Star goal
- No existing DIVERGENCES.md (first review)

## Mock Data
Use `tests/mock-scenarios/demo-1-conflict/` — copy alice and bob folders to source directories during init.

## Test Prompt
```
/phoenix-review
```

## Verification Checklist

### Review Scope
- [ ] Output shows review scope: both alice and bob listed for analysis
- [ ] If `last-review.json` doesn't exist, full review triggered

### Divergence Detection
- [ ] At least 1 divergence detected (REST vs GraphQL)
- [ ] Divergence classified with:
  - Stable ID (D-001)
  - Nature (technology choice)
  - Priority (blocking / directional / detail)
  - Parties (alice vs bob)
  - Each party's position with doc path citations

### THESIS Alignment
- [ ] Each party's position assessed against THESIS North Star
- [ ] Assessment is specific (aligned / diverged / unrelated) with reasoning

### DIVERGENCES.md
- [ ] File created at `.phoenix/DIVERGENCES.md`
- [ ] Contains `## Open` section with D-001
- [ ] Status marked as `open` 🔴
- [ ] `Found at` field includes commit hash and date
- [ ] `_Last reviewed:` header with timestamp

### Report Sections
- [ ] "Consensus areas" section present
- [ ] "Gap areas" section present
- [ ] "Recommended handling priority" section present

### State Files
- [ ] `.phoenix/last-review.json` created with:
  - `reviewed_at` timestamp
  - `head_commit` hash
  - Per-collaborator commit hashes

### Commit
- [ ] Commit message: `[PhoenixTeam] review — 1 new divergences, 0 known divergences`
