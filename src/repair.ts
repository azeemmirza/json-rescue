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
  const repairs = [repairTrailingCommas, repairJsoncComments, repairSmartQuotes];

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
