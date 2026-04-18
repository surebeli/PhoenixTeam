# Test 08: Align — Reject Proposal

## Scenario
The approving party rejects a proposed resolution. The divergence should revert to `open` status with rejection history recorded.

## Prerequisites
- PhoenixTeam with two members: `alice` and `bob`
- D-002 in `proposed` 🟡 state, proposed by `alice`, awaiting `bob`
- Current identity: `bob`

## Test Prompt
```
/phoenix-align D-002
```

## Expected Interactions
1. AI shows alice's proposal details
2. AI asks bob to choose → reply: `2` (Reject)
3. AI asks for rejection reason → reply: `The proposed architecture doesn't scale for our expected user load of 10M+ DAU`

## Verification Checklist

### DIVERGENCES.md
- [ ] D-002 status reverted from `proposed` 🟡 to `open` 🔴
- [ ] `Proposal history` section added/appended:
  ```
  - [{date}] alice proposed: {resolution} — ❌ Rejected by bob, reason: {rejection reason}
  ```
- [ ] Original divergence fields preserved (parties, nature, priority, found at)

### THESIS.md
- [ ] ⚠️ THESIS.md was NOT updated (rejected proposals don't affect THESIS)

### No Decision File
- [ ] `.phoenix/decisions/D-002.md` was NOT created (only created on approval)

### Commit
- [ ] Message: `[PhoenixTeam] align — D-002: {title} proposal rejected by bob`

### Output
- [ ] Clear rejection confirmation
- [ ] Suggestion to re-propose with different resolution or gather more context
