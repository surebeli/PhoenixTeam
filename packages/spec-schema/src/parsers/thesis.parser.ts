import type { ThesisDecisionLogItem, ThesisDocument } from "../types";

import {
  currentEnvelope,
  extractSection,
  finalizeParsed,
  makeParseError,
  parseFailure,
  type ParseResult,
} from "./shared";

export function parseThesis(text: string): ParseResult<ThesisDocument> {
  const northStarSection = extractSection(text, "North Star");
  if (!northStarSection) {
    return parseFailure([
      makeParseError("PX-P001", text, "## North Star", "Missing ## North Star section."),
    ]);
  }

  const northStar = northStarSection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

  const decisionLogSection = extractSection(text, "Decision Log");
  const decisionLog: ThesisDecisionLogItem[] = [];
  if (decisionLogSection && !/_\(No decisions recorded yet\)_/m.test(decisionLogSection)) {
    const lines = decisionLogSection.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim();
      const entryMatch = line.match(/^- \[(\d{4}-\d{2}-\d{2})\]\s+\*\*(D-\d{3}):[^*]+\*\*:\s+(.+)$/);
      if (!entryMatch) {
        continue;
      }

      const item: ThesisDecisionLogItem = {
        date: entryMatch[1],
        decisionId: entryMatch[2],
        summary: entryMatch[3],
      };

      const finalizedByLine = lines[index + 1]?.trim();
      if (finalizedByLine?.startsWith("- Proposed and finalized by:")) {
        item.finalizedBy = finalizedByLine.replace(/^- Proposed and finalized by:\s*/, "").trim();
        index += 1;
      }

      const rationaleLine = lines[index + 1]?.trim();
      if (rationaleLine?.startsWith("- Rationale:")) {
        item.rationale = rationaleLine.replace(/^- Rationale:\s*/, "").trim();
        index += 1;
      }

      decisionLog.push(item);
    }
  }

  return finalizeParsed("thesis", text, {
    envelope: currentEnvelope(),
    northStar,
    decisionLog,
  });
}