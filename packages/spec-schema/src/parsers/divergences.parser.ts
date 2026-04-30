import type {
  DivergenceDocument,
  DivergenceEntry,
  DivergenceResolution,
  DivergenceVote,
} from "../types";

import {
  currentEnvelope,
  finalizeParsed,
  makeParseError,
  parseFailure,
  requiredField,
  splitCommaList,
  stripInlineCode,
  type ParseError,
  type ParseResult,
} from "./shared";

const entryHeadingRegex = /^###\s+(D-\d{3}):\s+(.+?)(?:\s+[✅🔒])?$/gm;

function normalizeStatus(rawStatus: string): DivergenceEntry["status"] | undefined {
  const match = rawStatus.match(/^(open|proposed|resolved|fully-closed)\b/);
  return match?.[1] as DivergenceEntry["status"] | undefined;
}

function normalizeEventValue(rawValue: string): string {
  return stripInlineCode(rawValue).replace(/\s+[—-].*$/, "").trim();
}

function parseVotes(body: string, label: "Votes" | "Final Votes"): DivergenceVote[] {
  const lines = body.split(/\r?\n/);
  const votesStart = lines.findIndex((line) => line.trim() === `**${label}**:`);
  if (votesStart === -1) {
    return [];
  }

  const votes: DivergenceVote[] = [];
  for (let index = votesStart + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      continue;
    }
    if (!line.startsWith("- ")) {
      break;
    }

    const match = line.match(/^-[ ]+([a-z0-9-]+):\s*`?(propose|approve)`?$/);
    if (!match) {
      break;
    }

    votes.push({
      collaborator: match[1],
      vote: match[2] as DivergenceVote["vote"],
    });
  }

  return votes;
}

function parseEntry(text: string, body: string, id: string, rawTitle: string): DivergenceEntry | ParseError {
  const status = requiredField(
    text,
    body,
    "Status",
    "PX-P003",
    `Missing **Status** field for ${id}.`,
  );
  if (typeof status !== "string") {
    return status;
  }

  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) {
    return makeParseError("PX-P006", text, id, `Unsupported divergence status for ${id}: ${status}.`);
  }

  const parties = requiredField(
    text,
    body,
    "Parties",
    "PX-P003",
    `Missing **Parties** field for ${id}.`,
  );
  if (typeof parties !== "string") {
    return parties;
  }

  const entry: DivergenceEntry = {
    id,
    title: rawTitle.trim(),
    status: normalizedStatus,
    parties: splitCommaList(parties),
  };

  if (normalizedStatus === "open" || normalizedStatus === "proposed") {
    const nature = requiredField(text, body, "Nature", "PX-P003", `Missing **Nature** field for ${id}.`);
    const priority = requiredField(text, body, "Priority", "PX-P003", `Missing **Priority** field for ${id}.`);
    const foundAt = requiredField(text, body, "Found at", "PX-P003", `Missing **Found at** field for ${id}.`);
    if (typeof nature !== "string" || typeof priority !== "string" || typeof foundAt !== "string") {
      return (typeof nature !== "string" ? nature : typeof priority !== "string" ? priority : foundAt) as ParseError;
    }

    entry.nature = nature;
    entry.priority = priority as DivergenceEntry["priority"];
    entry.foundAt = normalizeEventValue(foundAt);
  }

  if (normalizedStatus === "proposed") {
    const proposer = requiredField(
      text,
      body,
      "Proposer (Lead)",
      "PX-P003",
      `Missing **Proposer (Lead)** field for ${id}.`,
    );
    const proposedAt = requiredField(
      text,
      body,
      "Proposed at",
      "PX-P003",
      `Missing **Proposed at** field for ${id}.`,
    );
    const decision = requiredField(
      text,
      body,
      "Proposed decision",
      "PX-P003",
      `Missing **Proposed decision** field for ${id}.`,
    );
    const reasoning = requiredField(
      text,
      body,
      "Reasoning",
      "PX-P003",
      `Missing **Reasoning** field for ${id}.`,
    );
    if (
      typeof proposer !== "string"
      || typeof proposedAt !== "string"
      || typeof decision !== "string"
      || typeof reasoning !== "string"
    ) {
      return (typeof proposer !== "string"
        ? proposer
        : typeof proposedAt !== "string"
          ? proposedAt
          : typeof decision !== "string"
            ? decision
            : reasoning) as ParseError;
    }

    entry.proposal = {
      proposer,
      proposedAt: normalizeEventValue(proposedAt),
      decision,
      reasoning,
      votes: parseVotes(body, "Votes"),
    };
  }

  if (normalizedStatus === "resolved" || normalizedStatus === "fully-closed") {
    const resolvedAt = requiredField(
      text,
      body,
      "Resolved at",
      "PX-P003",
      `Missing **Resolved at** field for ${id}.`,
    );
    const decision = requiredField(text, body, "Decision", "PX-P003", `Missing **Decision** field for ${id}.`);
    const rationale = requiredField(text, body, "Rationale", "PX-P003", `Missing **Rationale** field for ${id}.`);
    const changeInstructionsRef = requiredField(
      text,
      body,
      "Change Instructions",
      "PX-P003",
      `Missing **Change Instructions** field for ${id}.`,
    );
    if (
      typeof resolvedAt !== "string"
      || typeof decision !== "string"
      || typeof rationale !== "string"
      || typeof changeInstructionsRef !== "string"
    ) {
      return (typeof resolvedAt !== "string"
        ? resolvedAt
        : typeof decision !== "string"
          ? decision
          : typeof rationale !== "string"
            ? rationale
            : changeInstructionsRef) as ParseError;
    }

    const resolution: DivergenceResolution = {
      resolvedAt: normalizeEventValue(resolvedAt),
        decision,
      rationale,
      finalVotes: parseVotes(body, "Final Votes"),
      changeInstructionsRef: stripInlineCode(changeInstructionsRef.replace(/^see\s+/, "")),
    };

    if (normalizedStatus === "fully-closed") {
      const closedAt = requiredField(text, body, "Closed at", "PX-P003", `Missing **Closed at** field for ${id}.`);
      if (typeof closedAt !== "string") {
        return closedAt;
      }
      resolution.closedAt = normalizeEventValue(closedAt);
    }

    entry.resolution = resolution;
  }

  return entry;
}

export function parseDivergences(text: string): ParseResult<DivergenceDocument> {
  if (/^Status:\s+/m.test(text) && !/^\*\*Status\*\*:/m.test(text)) {
    return parseFailure([
      makeParseError(
        "PX-P007",
        text,
        "Status:",
        "Legacy pre-3.0 divergence format detected; run the legacy migration helper.",
      ),
    ]);
  }

  const headerMatch = text.match(/^_Last reviewed:\s+([0-9T:-]+Z) @ `?([0-9a-f]{7,40})`? by ([a-z0-9-]+)_$/m);
  const matches = [...text.matchAll(entryHeadingRegex)];
  if (matches.length === 0) {
    return parseFailure([
      makeParseError("PX-P001", text, "### ", "No divergence entries were found."),
    ]);
  }

  const entries: DivergenceEntry[] = [];
  for (const [matchIndex, match] of matches.entries()) {
    const start = match.index || 0;
    const end = matchIndex + 1 < matches.length ? (matches[matchIndex + 1].index || text.length) : text.length;
    const body = text.slice(start, end);
    const parsedEntry = parseEntry(text, body, match[1], match[2]);
    if ("code" in parsedEntry) {
      return parseFailure([parsedEntry]);
    }

    entries.push(parsedEntry);
  }

  return finalizeParsed("divergence", text, {
    envelope: currentEnvelope(),
    reviewedAt: headerMatch?.[1],
    reviewedCommit: headerMatch?.[2],
    reviewedBy: headerMatch?.[3],
    entries,
  });
}