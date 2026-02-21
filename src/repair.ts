/**
 * Auto-repair strategies for common JSON defects
 */

import { RepairIssue } from './types';

export interface RepairResult {
  text: string;
  issues: RepairIssue[];
}

/**
 * Apply all default repairs to the text
 */
export function autoRepair(text: string): RepairResult {
  let current = text;
  const allIssues: RepairIssue[] = [];

  // Apply repairs in order
  const repairs = [
    repairTrailingCommas,
    repairJsoncComments,
    repairSmartQuotes,
    repairSingleQuotes,
    repairUnquotedKeys,
    repairPythonLiterals,
  ];

  for (const repair of repairs) {
    const result = repair(current);
    current = result.text;
    allIssues.push(...result.issues);
  }

  return {
    text: current,
    issues: allIssues,
  };
}

/**
 * Remove trailing commas before closing braces/brackets
 * e.g., {a: 1,} → {a: 1}
 */
export function repairTrailingCommas(text: string): RepairResult {
  const issues: RepairIssue[] = [];
  let modified = false;

  // Match comma followed by whitespace and closing bracket/brace
  const repaired = text.replace(/,(\s*[}\]])/g, (match: string, closing: string): string => {
    if (!modified) {
      modified = true;
      issues.push({
        code: 'TRAILING_COMMA',
        message: 'Removed trailing comma before closing bracket',
        severity: 'warning',
      });
    }
    return closing;
  });

  return { text: repaired, issues };
}

/**
 * Remove JSONC-style comments
 * Handles both line and block style comments
 */
export function repairJsoncComments(text: string): RepairResult {
  const issues: RepairIssue[] = [];
  let result = text;

  // Remove // comments (to end of line)
  const singleLineRegex = /\/\/.*$/gm;
  if (singleLineRegex.test(result)) {
    issues.push({
      code: 'JSONC_COMMENT_SINGLE',
      message: 'Removed single-line comments',
      severity: 'warning',
    });
    result = result.replace(singleLineRegex, '');
  }

  // Remove /* */ comments
  const multiLineRegex = /\/\*[\s\S]*?\*\//g;
  if (multiLineRegex.test(result)) {
    issues.push({
      code: 'JSONC_COMMENT_MULTI',
      message: 'Removed multi-line comments',
      severity: 'warning',
    });
    result = result.replace(multiLineRegex, '');
  }

  return { text: result, issues };
}

/**
 * Replace smart quotes (curly quotes) with standard quotes
 * e.g., "hello" → "hello"
 */
export function repairSmartQuotes(text: string): RepairResult {
  const issues: RepairIssue[] = [];

  // Unicode smart quotes: " " ' '
  const smartQuoteRegex = /[\u201C\u201D\u2018\u2019]/g;

  if (smartQuoteRegex.test(text)) {
    issues.push({
      code: 'SMART_QUOTES',
      message: 'Converted smart quotes to standard ASCII quotes',
      severity: 'warning',
    });
  }

  const repaired = text
    .replace(/[\u201C\u201D]/g, '"') // Convert curly double quotes
    .replace(/[\u2018\u2019]/g, "'"); // Convert curly single quotes

  return { text: repaired, issues };
}

/**
 * Replace single quotes with double quotes for JSON keys and string values
 * e.g., {'key': 'value'} → {"key": "value"}
 * Note: Only replaces quotes around identifiers and string literals at top level
 */
export function repairSingleQuotes(text: string): RepairResult {
  const issues: RepairIssue[] = [];
  let inDoubleQuote = false;
  let result = '';
  let modified = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Track if we're in a double-quoted string
    if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
      inDoubleQuote = !inDoubleQuote;
      result += char;
    } else if (!inDoubleQuote && char === "'" && (i === 0 || text[i - 1] !== '\\')) {
      // Replace single quotes with double quotes when not already in a double-quoted string
      result += '"';
      modified = true;
    } else {
      result += char;
    }
  }

  if (modified) {
    issues.push({
      code: 'SINGLE_QUOTES',
      message: 'Converted single quotes to double quotes',
      severity: 'warning',
    });
  }

  return { text: result, issues };
}

/**
 * Add quotes around unquoted object keys
 * e.g., {key: "value"} → {"key": "value"}
 */
export function repairUnquotedKeys(text: string): RepairResult {
  const issues: RepairIssue[] = [];

  // Match unquoted keys: word characters followed by colon
  // But not inside strings
  let result = text;
  let modified = false;

  // Simple regex to find unquoted keys - matches word boundaries before colons
  const unquotedKeyRegex = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g;

  if (unquotedKeyRegex.test(result)) {
    modified = true;
    result = result.replace(unquotedKeyRegex, '$1"$2":');
  }

  if (modified) {
    issues.push({
      code: 'UNQUOTED_KEYS',
      message: 'Added quotes around unquoted object keys',
      severity: 'warning',
    });
  }

  return { text: result, issues };
}

/**
 * Convert Python literal syntax to JSON
 * e.g., True → true, False → false, None → null
 */
export function repairPythonLiterals(text: string): RepairResult {
  const issues: RepairIssue[] = [];
  let result = text;
  let modified = false;

  // Replace Python True with JSON true
  if (/\bTrue\b/.test(result)) {
    result = result.replace(/\bTrue\b/g, 'true');
    modified = true;
  }

  // Replace Python False with JSON false
  if (/\bFalse\b/.test(result)) {
    result = result.replace(/\bFalse\b/g, 'false');
    modified = true;
  }

  // Replace Python None with JSON null
  if (/\bNone\b/.test(result)) {
    result = result.replace(/\bNone\b/g, 'null');
    modified = true;
  }

  if (modified) {
    issues.push({
      code: 'PYTHON_LITERALS',
      message: 'Converted Python literals to JSON (True/False/None)',
      severity: 'warning',
    });
  }

  return { text: result, issues };
}

/**
 * Check if text is valid JSON without throwing
 */
export function isValidJson(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}
