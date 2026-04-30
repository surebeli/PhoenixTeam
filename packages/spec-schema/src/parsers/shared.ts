import { CURRENT_SCHEMA_VERSION } from "../metadata";
import type { EntityType, EntityTypeMap, Envelope } from "../types";
import { validate } from "../validator";

export interface ParseError {
  code: string;
  line: number;
  column: number;
  message: string;
}

export type ParseResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      errors: ParseError[];
    };

export function currentEnvelope(overrides: Partial<Envelope> = {}): Envelope {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    ...overrides,
  };
}

export function lineColumnAt(text: string, index: number): { line: number; column: number } {
  const safeIndex = Math.max(0, index);
  const prefix = text.slice(0, safeIndex);
  const lines = prefix.split(/\r?\n/);

  return {
    line: lines.length,
    column: (lines.at(-1)?.length || 0) + 1,
  };
}

export function locateText(text: string, needle: string): { line: number; column: number } {
  const index = text.indexOf(needle);
  if (index === -1) {
    return { line: 1, column: 1 };
  }

  return lineColumnAt(text, index);
}

export function parseFailure<T = never>(errors: ParseError[]): ParseResult<T> {
  return {
    ok: false,
    errors,
  };
}

export function parseSuccess<T>(value: T): ParseResult<T> {
  return {
    ok: true,
    value,
  };
}

export function makeParseError(
  code: string,
  text: string,
  needle: string,
  message: string,
): ParseError {
  const { line, column } = locateText(text, needle);
  return {
    code,
    line,
    column,
    message,
  };
}

export function finalizeParsed<K extends EntityType>(
  entityType: K,
  text: string,
  value: EntityTypeMap[K],
): ParseResult<EntityTypeMap[K]> {
  const validation = validate(entityType, value);
  if (validation.ok) {
    return parseSuccess(value);
  }

  return parseFailure([
    {
      code: "PX-P010",
      line: 1,
      column: 1,
      message: `Parsed ${entityType} failed validation: [${validation.errors[0].code}] ${validation.errors[0].message}`,
    },
  ]);
}

export function stripInlineCode(value: string): string {
  return value.replace(/`/g, "").trim();
}

export function splitCommaList(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractSection(text: string, heading: string): string | undefined {
  const headingRegex = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "m");
  const headingMatch = headingRegex.exec(text);
  if (!headingMatch || headingMatch.index === undefined) {
    return undefined;
  }

  const contentStart = headingMatch.index + headingMatch[0].length;
  const remaining = text.slice(contentStart);
  const nextHeadingMatch = /^##\s+/m.exec(remaining);
  const contentEnd = nextHeadingMatch?.index !== undefined
    ? contentStart + nextHeadingMatch.index
    : text.length;

  return text.slice(contentStart, contentEnd).trim();
}

export function requiredField(
  text: string,
  body: string,
  label: string,
  errorCode: string,
  message: string,
): string | ParseError {
  const match = body.match(new RegExp(`^\\*\\*${escapeRegExp(label)}\\*\\*:\\s*(.+)$`, "m"));
  if (!match) {
    return makeParseError(errorCode, text, label, message);
  }

  return stripInlineCode(match[1]);
}