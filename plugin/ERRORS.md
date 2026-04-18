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
| **PX-E001** | 本机尚未绑定身份 | `git config phoenix.member-code` returns empty | Run `/phoenix-whoami` to bind identity |
| **PX-E002** | 当前分支非 PhoenixTeam 主分支 | Current branch ≠ `git config phoenix.main-branch` | `git checkout {main_branch}` |
| **PX-E003** | .phoenix/ 目录不存在 | Skill requires initialized workspace but `.phoenix/` missing | Run `/phoenix-init` |
| **PX-E004** | COLLABORATORS.md 无主分支记录 | Cloned repo missing branch binding, cannot auto-recover | Run `/phoenix-init` to re-initialize |
| **PX-E005** | 参数缺失 | Required argument not provided (e.g., align without D-N) | Re-run with required argument |
| **PX-E006** | 目标分歧不存在 | D-{N} not found in DIVERGENCES.md | Run `/phoenix-status` to see valid IDs |
| **PX-E007** | 权限不足 | Role does not permit this operation (e.g., observer trying to push) | Contact a maintainer |
| **PX-E008** | 远程仓库不可达 | `git push` / `git pull` failed due to network or auth | Check network and remote URL |

## Warnings (Execution Continues)

| Code | Message | Cause | Recovery |
|------|---------|-------|----------|
| **PX-W001** | 源文件漂移 | Source docs modified since last sync (`last-sync.json` mismatch) | Run `/phoenix-update` before push |
| **PX-W002** | 存在未解决分歧 | Open divergences found during push | Run `/phoenix-review` then `/phoenix-align` |
| **PX-W003** | 提议待确认 | Proposed divergences awaiting current user's approval | Run `/phoenix-align D-{N}` to approve/reject |
| **PX-W004** | 归档文件关联分歧 | File being archived is referenced by open/proposed divergence | Resolve divergence first, then archive |
| **PX-W005** | 文档集较大 | Single collaborator's docs exceed 50KB total | Use `--focus` to narrow scope, or split large docs |
| **PX-W006** | PHOENIXTEAM.md 版本不一致 | Standalone prompt version differs from plugin manifest version | Update PHOENIXTEAM.md header |
| **PX-W007** | 缓存已过期 | `last-parse.json` / `last-review.json` references non-existent commit | Run `/phoenix-parse` to rebuild cache |

## Info Messages

| Code | Message | Cause | Action |
|------|---------|-------|--------|
| **PX-I001** | 无变更 | No source files changed since last sync | No action needed |
| **PX-I002** | 已自动绑定主分支 | Auto-recovered branch binding from COLLABORATORS.md | Informational only |
| **PX-I003** | 无待处理分歧 | DIVERGENCES.md has no open/proposed items | No action needed |
| **PX-I004** | 增量解析 | INDEX.md updated incrementally (not full rewrite) | Informational only |
| **PX-I005** | 观察者模式 | Current user has `observer` role, read-only access | Informational only |

## Usage in Skills

When outputting an error or warning, use this format:

```
⚠️ [PX-W001] 源文件漂移: {count} 个文件自上次同步后已修改。
→ 建议运行 /phoenix-update 同步后再推送。
```

```
❌ [PX-E001] 本机尚未绑定身份。
→ 请运行 /phoenix-whoami 完成身份绑定后再继续。
```

The `[PX-XXXX]` prefix allows users to search this catalog for detailed context and recovery steps.
