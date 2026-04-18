# PhoenixTeam Test Prompts

Structured test scenarios for validating PhoenixTeam skill behavior. Each test file defines:
- **Scenario**: What situation is being tested
- **Prerequisites**: Required state before running
- **Test Prompt**: The exact command to run
- **Expected Interactions**: What the AI should ask and how to reply
- **Verification Checklist**: Specific assertions to check (file existence, content, git state)

## Test Matrix

| # | Test | Skill(s) | Category | Complexity |
|---|------|----------|----------|------------|
| 01 | Init — Founder Mode | init, parse | Setup | ⭐⭐ |
| 02 | Init — Join Mode | init, parse | Setup | ⭐⭐ |
| 03 | Update — New File | update, parse | Sync | ⭐ |
| 04 | Update — Delete File | update, parse | Sync | ⭐ |
| 05 | Review — Conflict | review | Analysis | ⭐⭐⭐ |
| 06 | Align — Propose | align | Resolution | ⭐⭐ |
| 07 | Align — Approve | align | Resolution | ⭐⭐⭐ |
| 08 | Align — Reject | align | Resolution | ⭐⭐ |
| 09 | Push — Drift Warning | push | Safety | ⭐⭐ |
| 10 | Status — Full Dashboard | status | Reporting | ⭐ |

## Skill Coverage

```
Skills covered by test prompts:
  ✅ phoenix-init      (01, 02)
  ✅ phoenix-update    (03, 04)
  ✅ phoenix-review    (05)
  ✅ phoenix-align     (06, 07, 08)
  ✅ phoenix-push      (09)
  ✅ phoenix-status    (10)
  ✅ phoenix-parse     (01, 02, 03, 04 — auto-triggered)
  ⬜ phoenix-pull      (requires remote)
  ⬜ phoenix-whoami    (covered implicitly by init)
  ⬜ phoenix-suggest   (depends on review state)
  ⬜ phoenix-diff      (supplementary)
  ⬜ phoenix-archive   (supplementary)
  ⬜ phoenix-import    (requires MCP/external source)
```

## How to Run

### Manual (Recommended for first-time validation)
1. Create a fresh Git repository
2. Copy mock scenario data from `tests/mock-scenarios/`
3. Follow each test file's prerequisites and setup steps
4. Run the test prompt and check each verification item

### Recommended Flow (End-to-End)
Run these tests in order to build up state:
```
01-init-founder  →  03-update-new  →  02-init-join  →
05-review-conflict  →  06-align-propose  →  07-align-approve  →
10-status-full  →  09-push-drift
```

Then separately:
```
08-align-reject  (needs a second open divergence)
04-update-delete  (can run anytime after init)
```
