# Test 04: Update — Deleted File Cleanup

## Scenario
A collaborator deletes a design document from their source directory, then runs update. The corresponding file in `.phoenix/design/` should be removed.

## Prerequisites
- PhoenixTeam initialized with member code `alice`
- `.phoenix/design/alice/old-draft.md` exists (was synced in a previous update)
- `./design/old-draft.md` has been DELETED from the source directory

## Setup Steps
```bash
# Delete a previously synced source document
rm ./design/old-draft.md
```

## Test Prompt
```
/phoenix-update
```

## Verification Checklist

### Change Detection
- [ ] Output shows "Deleted: 1 file(s)" in source document change detection
- [ ] `./design/old-draft.md` listed with `-` (deleted) marker

### Sync Execution
- [ ] `.phoenix/design/alice/old-draft.md` removed from workspace
- [ ] File is NOT moved to `.phoenix/archive/` (deletion tracked by git diff, not archived)

### State Files
- [ ] `.phoenix/last-sync.json` no longer contains entry for `old-draft.md`
- [ ] Other file entries in `last-sync.json` preserved

### INDEX.md
- [ ] `old-draft.md` no longer appears in alice's document tree
- [ ] Parse auto-triggered and INDEX.md updated

### Commit
- [ ] Commit message includes `-1` in the deletion count
- [ ] `git diff` shows file removal
