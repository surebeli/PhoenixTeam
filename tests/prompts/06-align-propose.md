# Test 06: Align — Propose Resolution

## Scenario
A collaborator proposes a resolution for an open divergence. The status should change to `proposed` but THESIS.md should NOT be updated yet.

## Prerequisites
- PhoenixTeam with two members: `alice` and `bob`
- DIVERGENCES.md has at least one `open` divergence (D-001)
- Current identity: `alice` (she is the proposer)

## Test Prompt
```
/phoenix-align D-001
```

## Expected Interactions
1. AI shows comparison table (position / advantage / risk / THESIS alignment)
2. AI shows AI-recommended resolution
3. AI asks user to choose (1-5 options) → reply: `3` (adopt AI recommendation)

## Verification Checklist

### Display
- [ ] Comparison table shown with both parties' positions
- [ ] Each position has: advantage, risk, THESIS alignment assessment
- [ ] AI recommendation provided with reasoning

### DIVERGENCES.md Updates
- [ ] D-001 status changed from `open` 🔴 to `proposed` 🟡
- [ ] `Proposer: alice` field added
- [ ] `Proposed at: align @ {commit} ({date})` field added
- [ ] `Proposed decision: {chosen resolution}` field added
- [ ] `Reasoning: {rationale}` field added
- [ ] `_Awaiting confirmation from bob_` notice added

### THESIS.md
- [ ] ⚠️ THESIS.md Decision Log was NOT updated (only updated after approval)
- [ ] Existing THESIS content unchanged

### Commit
- [ ] Message: `[PhoenixTeam] align — D-001: {title} proposed by alice, awaiting bob confirmation`

### Output
- [ ] Confirmation: "Proposal submitted. bob can run /phoenix-align D-001 after their next pull to confirm or reject."
