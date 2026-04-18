# Test 09: Push — Source Drift Warning

## Scenario
A collaborator modifies their source documents but runs push WITHOUT running update first. The push skill should detect the drift and warn.

## Prerequisites
- PhoenixTeam initialized with member code `alice`
- `.phoenix/last-sync.json` exists with recorded file hashes
- Source file `./design/spec.md` has been modified AFTER the last sync
- At least one `.phoenix/` change exists to push

## Setup Steps
```bash
# Modify a source file without running update
echo "\n## Added Section\nNew content here." >> ./design/spec.md
# Make a minor .phoenix/ change (e.g., manually touch a file)
```

## Test Prompt
```
/phoenix-push
```

## Verification Checklist

### Source Drift Detection (Step 2)
- [ ] Output shows: `⚠️ Source drift detected: 1 source file(s) changed but not synced`
- [ ] `./design/spec.md` listed as modified
- [ ] Recommendation to run `/phoenix-update` shown
- [ ] AI stops and asks: `Continue pushing anyway? (yes / sync first)`

### User Choice: "sync first"
- [ ] If user replies "sync first" → AI stops and suggests `/phoenix-update`
- [ ] Push does NOT proceed

### User Choice: "yes" (continue anyway)
- [ ] Diff review proceeds normally
- [ ] Push completes with drift warning noted in output
- [ ] `.phoenix/` changes are pushed
- [ ] Source drift is NOT resolved (still drifted after push)

### Divergence Gate (Step 3)
- [ ] If open divergences exist → 🔴 warning shown
- [ ] If proposed divergences await current user → 🟡 priority alert
- [ ] User asked for confirmation before proceeding

### Warning Priority Order
- [ ] Source drift check runs BEFORE divergence gate
- [ ] Divergence gate runs BEFORE diff review
