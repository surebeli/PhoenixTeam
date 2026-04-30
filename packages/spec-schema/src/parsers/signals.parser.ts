import type { SignalDocument, SignalEntry } from "../types";

import {
  currentEnvelope,
  finalizeParsed,
  makeParseError,
  parseFailure,
  type ParseResult,
} from "./shared";

function inferStatus(line: string): string | undefined {
  if (line.includes("🔴")) {
    return "open";
  }
  if (line.includes("🟡")) {
    return "proposed";
  }
  if (line.includes("✅")) {
    return "resolved";
  }
  if (line.includes("🔒")) {
    return "fully-closed";
  }
  return undefined;
}

function normalizeSignalMessage(line: string): string {
  return line.replace(/^[🔴🟡✅🔒]\s*/, "").trim();
}

export function parseSignals(text: string): ParseResult<SignalDocument> {
  if (/_\((No active signals|No signals recorded in this legacy fixture)\)_/m.test(text)) {
    return finalizeParsed("signal", text, {
      envelope: currentEnvelope(),
      entries: [],
    });
  }

  const entries: SignalEntry[] = [];
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    if (!line.startsWith("- [")) {
      continue;
    }

    const match = line.match(/^- \[(\d{4}-\d{2}-\d{2})\]\s+(.+)$/);
    if (!match) {
      return parseFailure([
        makeParseError("PX-P004", text, line, "Malformed signal entry."),
      ]);
    }

    const sourceMatch = match[2].match(/(D-\d{3})/);
    const normalizedMessage = normalizeSignalMessage(match[2]);
    entries.push({
      updatedAt: match[1],
      source: sourceMatch?.[1],
      status: inferStatus(match[2]),
      blocker: /blocking/i.test(match[2]) ? normalizedMessage : undefined,
      message: normalizedMessage,
    });
  }

  return finalizeParsed("signal", text, {
    envelope: currentEnvelope(),
    entries,
  });
}