import assert = require("node:assert/strict");
import test = require("node:test");

import { buildLegacyPre30Draft, migrateLegacyPre30, validate } from "../src";

import { readLegacyWorkspace } from "./fixture-files";

function assertMigrationSuccess<T>(result: { ok: true; value: T; applied: string[] } | { ok: false; errors: { code: string; message: string }[] }, label: string): asserts result is { ok: true; value: T; applied: string[] } {
  if (!result.ok) {
    assert.fail(`${label} should migrate but failed with ${JSON.stringify(result.errors)}`);
  }
}

test("legacy draft fails current validation before migration", () => {
  const draft = buildLegacyPre30Draft(readLegacyWorkspace());
  assert.equal(draft.ok, true, `Expected legacy draft build to succeed: ${JSON.stringify(draft)}`);
  if (!draft.ok) {
    return;
  }

  const collaboratorValidation = validate("collaborator", draft.value.collaborator as never);
  assert.equal(collaboratorValidation.ok, false);
  if (!collaboratorValidation.ok) {
    assert.match(
      collaboratorValidation.errors.map((error) => error.code).join(","),
      /PX-V007/,
    );
  }
});

test("legacy-pre-3.0 migration yields schema-valid current documents", () => {
  const result = migrateLegacyPre30(readLegacyWorkspace());
  assertMigrationSuccess(result, "legacy-pre-3.0");
  assert.ok(result.applied.length >= 1);

  assert.equal(validate("collaborator", result.value.collaborator).ok, true);
  assert.equal(validate("divergence", result.value.divergence).ok, true);
  assert.equal(validate("thesis", result.value.thesis).ok, true);
  assert.equal(validate("signal", result.value.signal).ok, true);
  assert.equal(validate("index-doc", result.value["index-doc"]).ok, true);
});

test("legacy-pre-3.0 migration is idempotent", () => {
  const once = migrateLegacyPre30(readLegacyWorkspace());
  assertMigrationSuccess(once, "legacy-pre-3.0 initial run");

  const twice = migrateLegacyPre30(once.value);
  assertMigrationSuccess(twice, "legacy-pre-3.0 second run");

  assert.deepEqual(twice.value, once.value);
  assert.deepEqual(twice.applied, []);
});