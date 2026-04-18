# Test 07: Align — Approve Resolution

## Scenario
The other party approves a proposed resolution. THESIS.md should now be updated, decisions file created, and action items generated.

## Prerequisites
- PhoenixTeam with two members: `alice` and `bob`
- D-001 in `proposed` 🟡 state, proposed by `alice`, awaiting `bob`
- Current identity: `bob` (he is the approver)

## Test Prompt
```
/phoenix-align D-001
```

## Expected Interactions
1. AI shows alice's proposal details and reasoning
2. AI shows original comparison table
3. AI asks bob to choose (Agree / Reject / Modify / Skip) → reply: `1` (Agree)

## Verification Checklist

### Decision File
- [ ] `.phoenix/decisions/D-001.md` created
- [ ] Contains `# D-001: {title} — Change Instructions` header
- [ ] Contains `Decision`, `Proposer`, `Confirmer`, `Resolved at` metadata
- [ ] Per-party instruction blocks with:
  - Background (one sentence)
  - Decision (unambiguous statement)
  - Rationale
  - File path
  - Required changes (concrete items)
  - Acceptance criterion (one-sentence check)
- [ ] Parties needing no changes have their block omitted (not present)

### DIVERGENCES.md
- [ ] D-001 status changed from `proposed` 🟡 to `resolved` ✅
- [ ] `Proposer: alice | Confirmer: bob` recorded
- [ ] `Resolved at: align @ {commit} ({date})` field
- [ ] `Change instructions: See .phoenix/decisions/D-001.md` reference
- [ ] Source document action items table present with per-party status

### THESIS.md
- [ ] ✅ Decision Log section updated (NOW it should be updated)
- [ ] Entry format: `[{date}] **D-001: {title}**: {resolution summary}`
- [ ] Includes proposer + confirmer + reasoning

### SIGNALS.md
- [ ] Blocker removed (if D-001 was a blocker)
- [ ] Resolved entry added

### Commit
- [ ] Message: `[PhoenixTeam] align — D-001: {title} 决策达成 (alice提议, bob确认)`
