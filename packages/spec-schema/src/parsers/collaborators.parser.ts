import type { CollaboratorDocument, CollaboratorMember } from "../types";

import {
  currentEnvelope,
  finalizeParsed,
  locateText,
  makeParseError,
  parseFailure,
  type ParseResult,
} from "./shared";

const currentHeaders = ["Code", "Role", "Source Directories", "Spec Path", "Joined"];
const legacyHeaders = ["Code", "Source Directories", "Spec Path", "Joined"];

function splitTableRow(line: string): string[] {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);
}

export function parseCollaborators(text: string): ParseResult<CollaboratorDocument> {
  const lines = text.split(/\r?\n/);
  const membersHeadingIndex = lines.findIndex((line) => line.trim() === "## Members");
  if (membersHeadingIndex === -1) {
    return parseFailure([
      makeParseError("PX-P001", text, "## Members", "Missing ## Members section."),
    ]);
  }

  const headerIndex = lines.findIndex((line, index) => index > membersHeadingIndex && line.trim().startsWith("| Code"));
  if (headerIndex === -1) {
    return parseFailure([
      makeParseError("PX-P002", text, "| Code", "Missing collaborator table header."),
    ]);
  }

  const headers = splitTableRow(lines[headerIndex]);
  if (headers.join("|") === legacyHeaders.join("|")) {
    return parseFailure([
      makeParseError(
        "PX-P007",
        text,
        lines[headerIndex],
        "Legacy pre-3.0 collaborator table detected; run the legacy migration helper.",
      ),
    ]);
  }
  if (headers.join("|") !== currentHeaders.join("|")) {
    return parseFailure([
      makeParseError("PX-P002", text, lines[headerIndex], "Unrecognized collaborator table columns."),
    ]);
  }

  const mainBranchMatch = text.match(/^\*\*Main Branch\*\*:\s*(.+)$/m);
  if (!mainBranchMatch) {
    return parseFailure([
      makeParseError("PX-P001", text, "**Main Branch**", "Missing **Main Branch** header."),
    ]);
  }

  const members: CollaboratorMember[] = [];
  for (let index = headerIndex + 2; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line.startsWith("|")) {
      break;
    }

    const cells = splitTableRow(line);
    if (cells.length !== currentHeaders.length) {
      const { line: errorLine, column } = locateText(text, lines[index]);
      return parseFailure([
        {
          code: "PX-P002",
          line: errorLine,
          column,
          message: "Malformed collaborator table row.",
        },
      ]);
    }

    members.push({
      code: cells[0],
      role: cells[1] as CollaboratorMember["role"],
      sourceDirectories: cells[2].split(",").map((part) => part.trim()).filter(Boolean),
      specPath: cells[3],
      joinedAt: cells[4],
    });
  }

  if (members.length === 0) {
    return parseFailure([
      makeParseError("PX-P002", text, lines[headerIndex], "Collaborator table has no member rows."),
    ]);
  }

  return finalizeParsed("collaborator", text, {
    envelope: currentEnvelope(),
    mainBranch: mainBranchMatch[1].trim(),
    members,
  });
}