#!/usr/bin/env bash
# PhoenixTeam E2E Test Runner v1.0
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
PASS=0; FAIL=0; SKIP=0; ERRORS=()

log_pass() { echo -e "  ${GREEN}✅ PASS${NC}: $1"; PASS=$((PASS+1)); }
log_fail() { echo -e "  ${RED}❌ FAIL${NC}: $1"; FAIL=$((FAIL+1)); ERRORS+=("$1"); }
log_skip() { echo -e "  ${YELLOW}⏭️  SKIP${NC}: $1"; SKIP=$((SKIP+1)); }
log_section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

assert_file_exists() { [ -f "$1" ] && log_pass "Exists: $1" || log_fail "Missing: $1"; }
assert_dir_exists() { [ -d "$1" ] && log_pass "Dir: $1" || log_fail "No dir: $1"; }
assert_file_contains() {
  [ ! -f "$1" ] && { log_fail "Missing (content): $1"; return; }
  grep -q "$2" "$1" 2>/dev/null && log_pass "'$1' contains '$2'" || log_fail "'$1' missing '$2'"
}
assert_git_config_set() {
  local v; v=$(git config "$1" 2>/dev/null || echo "")
  [ -n "$v" ] && log_pass "git config $1 = $v" || log_fail "git config $1 is empty"
}
assert_commit_pattern() {
  git log --oneline -5 --format="%s" | grep -q "$1" && log_pass "Commit: $1" || log_fail "No commit: $1"
}

test_init_founder() {
  log_section "Test 01: Init — Founder"
  assert_dir_exists ".phoenix"
  assert_dir_exists ".phoenix/design"
  assert_file_exists ".phoenix/COLLABORATORS.md"
  assert_file_exists ".phoenix/THESIS.md"
  assert_file_exists ".phoenix/RULES.md"
  assert_file_exists ".phoenix/SIGNALS.md"
  assert_file_exists ".phoenix/INDEX.md"
  assert_git_config_set "phoenix.member-code"
  assert_git_config_set "phoenix.main-branch"
  assert_commit_pattern "\[PhoenixTeam\]"
  assert_file_contains ".phoenix/COLLABORATORS.md" "Main Branch"
}

test_init_join() {
  log_section "Test 02: Init — Join"
  local n; n=$(find .phoenix/design -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
  [ "$n" -ge 2 ] && log_pass "Collaborators: $n" || log_skip "Only $n collaborator(s)"
}

test_update_new() {
  log_section "Test 03: Update — New File"
  local mc; mc=$(git config phoenix.member-code 2>/dev/null || echo "")
  [ -z "$mc" ] && { log_skip "No identity"; return; }
  local d=".phoenix/design/$mc"
  [ -d "$d" ] && { local c; c=$(find "$d" -name "*.md" | wc -l); [ "$c" -gt 0 ] && log_pass "$c file(s) in $d" || log_fail "Empty: $d"; } || log_fail "Missing: $d"
  assert_file_exists ".phoenix/last-sync.json"
}

test_review_conflict() {
  log_section "Test 05: Review — Conflict"
  [ ! -f ".phoenix/DIVERGENCES.md" ] && { log_skip "No DIVERGENCES.md"; return; }
  assert_file_contains ".phoenix/DIVERGENCES.md" "D-001"
  assert_file_exists ".phoenix/last-review.json"
}

test_align_propose() {
  log_section "Test 06: Align — Propose"
  [ ! -f ".phoenix/DIVERGENCES.md" ] && { log_skip "No DIVERGENCES.md"; return; }
  grep -q "proposed" ".phoenix/DIVERGENCES.md" 2>/dev/null && { log_pass "Proposed found"; assert_file_contains ".phoenix/DIVERGENCES.md" "Proposer"; } || log_skip "No proposed divergences"
}

test_align_approve() {
  log_section "Test 07: Align — Approve"
  [ ! -f ".phoenix/DIVERGENCES.md" ] && { log_skip "No DIVERGENCES.md"; return; }
  if grep -q "resolved" ".phoenix/DIVERGENCES.md" 2>/dev/null; then
    log_pass "Resolved found"; assert_dir_exists ".phoenix/decisions"
    local dc; dc=$(find .phoenix/decisions -name "D-*.md" 2>/dev/null | wc -l)
    [ "$dc" -gt 0 ] && log_pass "Decision files: $dc" || log_fail "No decision files"
    assert_file_contains ".phoenix/THESIS.md" "Decision Log"
  else log_skip "No resolved divergences"; fi
}

test_status() {
  log_section "Test 10: Status — Dashboard inputs"
  assert_file_exists ".phoenix/COLLABORATORS.md"
  assert_file_exists ".phoenix/INDEX.md"
}

test_push_drift() {
  log_section "Test 09: Push — Drift"
  [ ! -f ".phoenix/last-sync.json" ] && { log_skip "No last-sync.json"; return; }
  python3 -c "import json; json.load(open('.phoenix/last-sync.json'))" 2>/dev/null && log_pass "Valid JSON" || log_fail "Invalid JSON"
}

setup_mock() {
  log_section "Setup mock workspace"
  local SD; SD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; local RR; RR="$(cd "$SD/.." && pwd)"
  local WD; WD=$(mktemp -d); echo -e "  Workspace: ${BLUE}$WD${NC}"; cd "$WD"
  git init -b main; git commit --allow-empty -m "init"
  mkdir -p design-alice design-bob
  cp "$RR/tests/mock-scenarios/demo-1-conflict/alice/"*.md design-alice/
  cp "$RR/tests/mock-scenarios/demo-1-conflict/bob/"*.md design-bob/
  git add . && git commit -m "add mock docs"
  echo -e "\n  ${YELLOW}Next: cd $WD && run /phoenix-init${NC}"
}

print_summary() {
  log_section "Summary"
  echo -e "  ${GREEN}PASS${NC}: $PASS  ${RED}FAIL${NC}: $FAIL  ${YELLOW}SKIP${NC}: $SKIP  Total: $((PASS+FAIL+SKIP))"
  [ $FAIL -gt 0 ] && { echo -e "  ${RED}Failures:${NC}"; for e in "${ERRORS[@]}"; do echo "    - $e"; done; exit 1; }
  echo -e "  ${GREEN}All passed! 🎉${NC}"
}

main() {
  echo -e "${BLUE}PhoenixTeam E2E Test Runner v1.0${NC}\n"
  case "${1:---assert-only}" in
    --setup) setup_mock; exit 0 ;;
    --assert-only) [ ! -d ".phoenix" ] && { echo -e "${RED}No .phoenix/ — use --setup first${NC}"; exit 1; } ;;
    --test) [ -z "${2:-}" ] && { echo "Usage: $0 --test <name>"; exit 1; } ;;
    *) echo "Usage: $0 [--setup|--assert-only|--test <name>]"; exit 1 ;;
  esac

  if [ "${1:-}" = "--test" ]; then
    case "$2" in
      init-founder) test_init_founder ;; init-join) test_init_join ;;
      update-new) test_update_new ;; review-conflict) test_review_conflict ;;
      align-propose) test_align_propose ;; align-approve) test_align_approve ;;
      status) test_status ;; push-drift) test_push_drift ;;
      *) echo "Unknown: $2"; exit 1 ;;
    esac
  else
    test_init_founder; test_init_join; test_update_new; test_review_conflict
    test_align_propose; test_align_approve; test_status; test_push_drift
  fi
  print_summary
}
main "$@"
