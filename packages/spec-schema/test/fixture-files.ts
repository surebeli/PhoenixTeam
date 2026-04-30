import { existsSync, readdirSync, readFileSync } from "node:fs";
import * as path from "node:path";

const statesDir = path.resolve(__dirname, "..", "..", "..", "spec-fixtures", "states");

export function readStateFile(state: string, fileName: string): string {
  return readFileSync(path.join(statesDir, state, fileName), "utf8");
}

export function readDecisionFiles(state: string): string[] {
  const decisionDir = path.join(statesDir, state, "decisions");
  if (!existsSync(decisionDir)) {
    return [];
  }

  return readdirSync(decisionDir)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => readFileSync(path.join(decisionDir, fileName), "utf8"));
}

export function readLegacyWorkspace() {
  return {
    collaborator: readStateFile("legacy-pre-3.0", "COLLABORATORS.md"),
    divergence: readStateFile("legacy-pre-3.0", "DIVERGENCES.md"),
    thesis: readStateFile("legacy-pre-3.0", "THESIS.md"),
    signal: readStateFile("legacy-pre-3.0", "SIGNALS.md"),
    "index-doc": readStateFile("legacy-pre-3.0", "INDEX.md"),
  };
}