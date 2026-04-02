import { readFile } from "fs/promises";
import * as yaml from "js-yaml";
import type { Feature, Scenario, Step, StepKeyword } from "./types.js";

/** Result of parsing a .feature.md file */
export interface ParsedFeatureFile {
  feature: Feature;
  platform: string;
  tags?: string[];
  debugMode?: boolean;
}

interface Frontmatter {
  platform: string;
  tags?: string[];
  debugMode?: boolean;
}

const STEP_KEYWORDS: readonly string[] = ["Given", "When", "Then", "And", "But"];
const STEP_LINE_RE = /^-\s+(Given|When|Then|And|But)\s+(.+)$/;
const TABLE_ROW_RE = /^\|(.+)\|$/;
const TAG_LINE_RE = /^@\S+/;

class ParseError extends Error {
  constructor(message: string, line?: number) {
    const prefix = line != null ? `Line ${line}: ` : "";
    super(`${prefix}${message}`);
    this.name = "ParseError";
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Parse a .feature.md file from disk */
export async function parseFeatureFile(filePath: string): Promise<ParsedFeatureFile> {
  const content = await readFile(filePath, "utf-8");
  return parseFeatureMarkdown(content);
}

/** Parse markdown content string (for testing/programmatic use) */
export function parseFeatureMarkdown(content: string): ParsedFeatureFile {
  const { frontmatter, body } = extractFrontmatter(content);
  const feature = parseBody(body);

  // Merge feature-level tags from frontmatter
  if (frontmatter.tags) {
    const fmTags = frontmatter.tags.map((t) => (t.startsWith("@") ? t : `@${t}`));
    feature.tags = Array.from(new Set([...fmTags, ...feature.tags]));
  }

  // Propagate debugMode to scenarios
  if (frontmatter.debugMode) {
    for (const scenario of feature.scenarios) {
      scenario.debugMode ??= true;
    }
  }

  return {
    feature,
    platform: frontmatter.platform,
    tags: frontmatter.tags,
    debugMode: frontmatter.debugMode,
  };
}

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

function extractFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) {
    throw new ParseError("Missing frontmatter — file must start with ---");
  }

  const endIdx = trimmed.indexOf("---", 3);
  if (endIdx === -1) {
    throw new ParseError("Unterminated frontmatter — missing closing ---");
  }

  const yamlStr = trimmed.slice(3, endIdx).trim();
  let parsed: Record<string, unknown>;
  try {
    parsed = yaml.load(yamlStr) as Record<string, unknown>;
  } catch (e) {
    throw new ParseError(`Invalid YAML in frontmatter: ${(e as Error).message}`);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new ParseError("Frontmatter must be a YAML mapping");
  }
  if (!parsed.platform || typeof parsed.platform !== "string") {
    throw new ParseError("Missing required 'platform' field in frontmatter");
  }

  const body = trimmed.slice(endIdx + 3);
  return {
    frontmatter: {
      platform: parsed.platform as string,
      tags: parsed.tags as string[] | undefined,
      debugMode: parsed.debugMode as boolean | undefined,
    },
    body,
  };
}

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------

function parseBody(body: string): Feature {
  const lines = body.split("\n");

  // Find feature heading
  let featureLine = -1;
  let featureName = "";
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^#\s+Feature:\s*(.+)$/);
    if (match) {
      featureLine = i;
      featureName = match[1].trim();
      break;
    }
  }
  if (featureLine === -1) {
    throw new ParseError("Missing '# Feature:' heading");
  }

  // Collect description (text between feature heading and first ## section)
  const descLines: string[] = [];
  let descEnd = lines.length;
  for (let i = featureLine + 1; i < lines.length; i++) {
    if (lines[i].match(/^##\s+/)) {
      descEnd = i;
      break;
    }
    descLines.push(lines[i]);
  }
  const description = descLines
    .join("\n")
    .trim() || undefined;

  // Split remaining content into sections by ## headings
  const sections = splitSections(lines, descEnd);

  let background: Step[] | undefined;
  const scenarios: Scenario[] = [];

  for (const section of sections) {
    const heading = section.heading;
    const sectionLines = section.lines;
    const sectionStartLine = section.lineNumber;

    if (/^Background$/i.test(heading)) {
      background = parseSteps(sectionLines, sectionStartLine);
    } else if (/^Scenario Outline:\s*(.+)$/i.test(heading)) {
      const name = heading.match(/^Scenario Outline:\s*(.+)$/i)![1].trim();
      scenarios.push(parseScenarioOutline(name, sectionLines, sectionStartLine));
    } else if (/^Scenario:\s*(.+)$/i.test(heading)) {
      const name = heading.match(/^Scenario:\s*(.+)$/i)![1].trim();
      scenarios.push(parseScenario(name, sectionLines, sectionStartLine));
    }
  }

  return {
    name: featureName,
    description,
    tags: [],
    background,
    scenarios,
  };
}

interface Section {
  heading: string;
  lines: string[];
  lineNumber: number; // 0-based line index in the full body
}

function splitSections(lines: string[], startIdx: number): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;

  for (let i = startIdx; i < lines.length; i++) {
    const headingMatch = lines[i].match(/^##\s+(.+)$/);
    if (headingMatch) {
      if (current) sections.push(current);
      current = { heading: headingMatch[1].trim(), lines: [], lineNumber: i + 1 };
    } else if (current) {
      current.lines.push(lines[i]);
    }
  }
  if (current) sections.push(current);
  return sections;
}

// ---------------------------------------------------------------------------
// Scenario parsing
// ---------------------------------------------------------------------------

function parseScenario(name: string, lines: string[], startLine: number): Scenario {
  const { tags, contentLines, contentStartLine } = extractTags(lines, startLine);
  const steps = parseSteps(contentLines, contentStartLine);
  return { name, tags, steps };
}

function parseScenarioOutline(name: string, lines: string[], startLine: number): Scenario {
  const { tags, contentLines, contentStartLine } = extractTags(lines, startLine);

  // Separate trailing top-level table (examples) from step content
  const { stepLines, examplesTableLines } = separateExamplesTable(contentLines);

  const steps = parseSteps(stepLines, contentStartLine);

  if (examplesTableLines.length === 0) {
    throw new ParseError(
      "Scenario Outline must have an examples table",
      contentStartLine + stepLines.length
    );
  }

  const examples = parseExamplesTable(examplesTableLines);

  return { name, tags, steps, examples, isOutline: true };
}

function extractTags(
  lines: string[],
  startLine: number
): { tags: string[]; contentLines: string[]; contentStartLine: number } {
  const tags: string[] = [];
  let i = 0;

  // Skip empty lines before tags
  while (i < lines.length && lines[i].trim() === "") i++;

  // Consume tag lines (lines starting with @)
  while (i < lines.length && TAG_LINE_RE.test(lines[i].trim())) {
    const tagMatches = lines[i].trim().match(/@\S+/g);
    if (tagMatches) tags.push(...tagMatches);
    i++;
  }

  return {
    tags,
    contentLines: lines.slice(i),
    contentStartLine: startLine + i,
  };
}

// ---------------------------------------------------------------------------
// Step parsing (handles data tables and docstrings attached to steps)
// ---------------------------------------------------------------------------

function parseSteps(lines: string[], startLine: number): Step[] {
  const steps: Step[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (line === "") {
      i++;
      continue;
    }

    const stepMatch = line.match(STEP_LINE_RE);
    if (!stepMatch) {
      // Not a step line — could be an unrecognized line, skip it
      i++;
      continue;
    }

    const keyword = stepMatch[1] as StepKeyword;
    const text = stepMatch[2].trim();
    i++;

    // Look ahead for attached data table or docstring
    const { table, docString, nextIndex } = parseStepAttachment(lines, i);

    const step: Step = { keyword, text };
    if (table) step.table = table;
    if (docString != null) step.docString = docString;
    steps.push(step);
    i = nextIndex;
  }

  return steps;
}

function parseStepAttachment(
  lines: string[],
  startIdx: number
): { table?: string[][]; docString?: string; nextIndex: number } {
  let i = startIdx;

  // Skip blank lines between step and potential attachment
  while (i < lines.length && lines[i].trim() === "") i++;

  if (i >= lines.length) return { nextIndex: i };

  const trimmed = lines[i].trim();

  // Check for indented or inline fenced code block (docstring)
  if (isIndentedOrAttachment(lines, startIdx, i) && trimmed.startsWith("```")) {
    return parseDocString(lines, i);
  }

  // Check for indented or inline table
  if (isIndentedOrAttachment(lines, startIdx, i) && TABLE_ROW_RE.test(trimmed)) {
    return parseDataTable(lines, i);
  }

  return { nextIndex: startIdx };
}

/**
 * Determines whether content at `currentIdx` is "attached" to the preceding step.
 * It's attached if:
 *  - It's indented (starts with whitespace)
 *  - OR it immediately follows the step (no blank line gap, and isn't another step)
 */
function isIndentedOrAttachment(lines: string[], stepEndIdx: number, currentIdx: number): boolean {
  // If the line is indented, it's an attachment
  if (lines[currentIdx].match(/^\s{2,}/) || lines[currentIdx].startsWith("\t")) {
    return true;
  }

  // If there's no gap between step and this line, it could still be an attachment
  // (check that nothing between stepEndIdx and currentIdx is a step line)
  for (let j = stepEndIdx; j < currentIdx; j++) {
    if (lines[j].trim() !== "") return false;
  }

  // It's an attachment if the current line is NOT another step
  const trimmed = lines[currentIdx].trim();
  return !STEP_LINE_RE.test(trimmed);
}

function parseDocString(
  lines: string[],
  startIdx: number
): { docString: string; nextIndex: number } {
  // Find opening ```
  const openLine = lines[startIdx].trim();
  if (!openLine.startsWith("```")) {
    return { docString: "", nextIndex: startIdx + 1 };
  }

  const contentLines: string[] = [];
  let i = startIdx + 1;

  // Find the indentation level of the opening fence to strip from content
  const openIndent = lines[startIdx].match(/^(\s*)/)?.[1]?.length ?? 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("```") && contentLines.length > 0) {
      // Closing fence
      i++;
      break;
    }
    // Strip common indent
    const raw = lines[i];
    const stripped = raw.length >= openIndent ? raw.slice(openIndent) : raw.trimStart();
    contentLines.push(stripped);
    i++;
  }

  return { docString: contentLines.join("\n").trimEnd(), nextIndex: i };
}

function parseDataTable(
  lines: string[],
  startIdx: number
): { table: string[][]; nextIndex: number } {
  const rows: string[][] = [];
  let i = startIdx;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!TABLE_ROW_RE.test(trimmed)) break;

    const cells = trimmed
      .slice(1, -1) // remove leading and trailing |
      .split("|")
      .map((c) => c.trim());

    // Skip separator rows (all dashes/spaces)
    if (cells.every((c) => /^-+$/.test(c) || c === "")) {
      i++;
      continue;
    }

    rows.push(cells);
    i++;
  }

  return { table: rows, nextIndex: i };
}

// ---------------------------------------------------------------------------
// Examples table (Scenario Outline) → Record<string, string>[]
// ---------------------------------------------------------------------------

/**
 * Separates the trailing top-level Markdown table (examples) from step content.
 * The examples table is the last block of consecutive table rows that is NOT
 * indented and NOT preceded by a step on the immediately prior non-blank line.
 */
function separateExamplesTable(
  lines: string[]
): { stepLines: string[]; examplesTableLines: string[] } {
  // Walk backwards from end to find the last contiguous block of table rows
  let tableEnd = lines.length;

  // Skip trailing blank lines
  while (tableEnd > 0 && lines[tableEnd - 1].trim() === "") tableEnd--;

  if (tableEnd === 0) return { stepLines: lines, examplesTableLines: [] };

  // Check if the last non-blank lines form a table
  let tableStart = tableEnd;
  while (tableStart > 0 && TABLE_ROW_RE.test(lines[tableStart - 1].trim())) {
    tableStart--;
  }

  if (tableStart === tableEnd) {
    // No trailing table found
    return { stepLines: lines, examplesTableLines: [] };
  }

  // Verify this table is NOT indented (i.e., not attached to a step)
  const firstTableLine = lines[tableStart];
  if (firstTableLine.match(/^\s{2,}/) || firstTableLine.startsWith("\t")) {
    // Indented table — belongs to a step, not examples
    return { stepLines: lines, examplesTableLines: [] };
  }

  // Check the line before the table is not a step (with the table being its attachment)
  // We look backwards past blank lines
  let checkIdx = tableStart - 1;
  while (checkIdx >= 0 && lines[checkIdx].trim() === "") checkIdx--;

  if (checkIdx >= 0 && STEP_LINE_RE.test(lines[checkIdx].trim())) {
    // Directly after a step — this is a step's data table, not examples.
    // But for Scenario Outline, we need a heuristic: if the table has headers that
    // look like placeholders from the steps, it's the examples table.
    // However, the spec says examples table is at the end and NOT indented under a step.
    // Since it's not indented, treat it as the examples table.
  }

  return {
    stepLines: lines.slice(0, tableStart),
    examplesTableLines: lines.slice(tableStart, tableEnd),
  };
}

function parseExamplesTable(lines: string[]): Record<string, string>[] {
  const rows: string[][] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!TABLE_ROW_RE.test(trimmed)) continue;

    const cells = trimmed
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());

    // Skip separator rows
    if (cells.every((c) => /^-+$/.test(c) || c === "")) continue;

    rows.push(cells);
  }

  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx] ?? "";
    });
    return record;
  });
}
