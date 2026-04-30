import type { ActionItem, DecisionDocument } from "../types";

import {
  currentEnvelope,
  finalizeParsed,
  makeParseError,
  parseFailure,
  requiredField,
  stripInlineCode,
  type ParseError,
  type ParseResult,
} from "./shared";

const decisionHeadingRegex = /^#\s+(D-\d{3}):\s+(.+?)\s+—\s+Change Instructions$/m;
const actionBlockRegex = /^##\s+\[([a-z0-9-]+)\]\s+Change Instructions$/gm;

function parseActionItem(text: string, body: string, owner: string): ActionItem | ParseError {
  const background = requiredField(text, body, "Background", "PX-P008", `Missing **Background** for ${owner}.`);
  const decision = requiredField(text, body, "Decision", "PX-P008", `Missing **Decision** for ${owner}.`);
  const rationale = requiredField(text, body, "Rationale", "PX-P008", `Missing **Rationale** for ${owner}.`);
  const targetFile = requiredField(text, body, "File", "PX-P008", `Missing **File** for ${owner}.`);
  const acceptanceCriterion = requiredField(
    text,
    body,
    "Acceptance criterion",
    "PX-P008",
    `Missing **Acceptance criterion** for ${owner}.`,
  );
  if (
    typeof background !== "string"
    || typeof decision !== "string"
    || typeof rationale !== "string"
    || typeof targetFile !== "string"
    || typeof acceptanceCriterion !== "string"
  ) {
    return (typeof background !== "string"
      ? background
      : typeof decision !== "string"
        ? decision
        : typeof rationale !== "string"
          ? rationale
          : typeof targetFile !== "string"
            ? targetFile
            : acceptanceCriterion) as ParseError;
  }

  const requiredChangesHeader = body.match(/^\*\*Required changes\*\*:\s*$/m);
  if (!requiredChangesHeader) {
    return makeParseError("PX-P008", text, "**Required changes**", `Missing **Required changes** list for ${owner}.`);
  }

  const requiredChanges = body
    .slice(requiredChangesHeader.index! + requiredChangesHeader[0].length)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^-\s+/, "").trim());

  return {
    owner,
    targetFile: stripInlineCode(targetFile),
    completionState: "pending",
    requiredChanges,
    acceptanceCriterion,
    background,
    decision,
  };
}

export function parseDecisions(text: string): ParseResult<DecisionDocument> {
  const headingMatch = text.match(decisionHeadingRegex);
  if (!headingMatch) {
    return parseFailure([
      makeParseError("PX-P001", text, "# D-", "Missing decision heading."),
    ]);
  }

  const resolutionSummary = requiredField(
    text,
    text,
    "Decision",
    "PX-P003",
    `Missing top-level **Decision** field for ${headingMatch[1]}.`,
  );
  if (typeof resolutionSummary !== "string") {
    return parseFailure([resolutionSummary]);
  }

  const metaMatch = text.match(/^\*\*Proposer \(Lead\)\*\*:\s*([a-z0-9-]+)\s*\|\s*\*\*Resolved at\*\*:\s*(\d{4}-\d{2}-\d{2})$/m);
  if (!metaMatch) {
    return parseFailure([
      makeParseError("PX-P003", text, "**Proposer (Lead)**", "Missing proposer/resolved-at metadata line."),
    ]);
  }

  const actionItems: ActionItem[] = [];
  const blocks = [...text.matchAll(actionBlockRegex)];
  if (blocks.length === 0) {
    return parseFailure([
      makeParseError("PX-P008", text, "## [", "No change-instruction blocks were found."),
    ]);
  }

  for (const [blockIndex, block] of blocks.entries()) {
    const start = block.index || 0;
    const end = blockIndex + 1 < blocks.length ? (blocks[blockIndex + 1].index || text.length) : text.length;
    const body = text.slice(start, end);
    const parsedActionItem = parseActionItem(text, body, block[1]);
    if ("code" in parsedActionItem) {
      return parseFailure([parsedActionItem]);
    }
    actionItems.push(parsedActionItem);
  }

  return finalizeParsed("decision", text, {
    envelope: currentEnvelope(),
    decisionId: headingMatch[1],
    title: headingMatch[2].trim(),
    resolutionSummary,
    finalizedBy: metaMatch[1],
    resolvedAt: metaMatch[2],
    actionItems,
  });
}