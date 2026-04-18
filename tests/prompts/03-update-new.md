# Test 03: Update — New File Sync

## Scenario
A collaborator adds a new design document to their source directory after initialization, then runs update to sync it into `.phoenix/`.

## Prerequisites
- PhoenixTeam initialized with member code `alice`
- Source directory: `./design/`
- `.phoenix/design/alice/` already has previously synced files
- A NEW file `./design/new-feature.md` has been created since last init/update

## Setup Steps
```bash
# Create a new source document after init
echo "# New Feature Design\n\nThis is a new feature proposal." > ./design/new-feature.md
```

## Test Prompt
```
/phoenix-update
```

## Verification Checklist

### Change Detection
- [ ] Output shows "New: 1 file(s)" in source document change detection
- [ ] `./design/new-feature.md` listed with `+` (new) marker
- [ ] Existing unchanged files listed with correct count

### Sync Execution
- [ ] `.phoenix/design/alice/new-feature.md` created
- [ ] File has `<!-- Phoenix Normalized Document -->` header prepended
- [ ] Content matches source file (minus the header)

### State Files
- [ ] `.phoenix/last-sync.json` updated with new file entry
- [ ] New file has a hash recorded in `last-sync.json`
- [ ] `synced_at` timestamp updated

### Parse Auto-trigger
- [ ] INDEX.md updated to include `new-feature.md` in alice's document tree
- [ ] `last-parse.json` updated

### Commit
- [ ] Commit message: `[PhoenixTeam] update — alice 源文档同步: +1 ~0 -0`
