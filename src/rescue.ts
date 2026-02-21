/**
 * Main rescue function with support for generics and multiple modes
 */

import { RescueResult, RescueOptions, RepairIssue } from './types';
import { extractAllCandidates } from './extraction';
import { autoRepair, isValidJson } from './repair';

/**
 * Rescue JSON from messy text with transparent repair reporting
 *
 * @template T - The expected type of the parsed JSON
 * @param text - The text containing JSON
 * @param options - Configuration options
 * @returns A RescueResult with parsed data, repair issues, and metadata
 *
 * @example
 * ```typescript
 * const result = rescueJson<{ name: string }>(mixedText);
 * if (result.success) {
 *   console.log(result.data.name);
 *   console.log(result.issues); // See what was repaired
 * }
 * ```
 */
export function rescueJson<T = unknown>(
  text: string,
  options: RescueOptions = {}
): RescueResult<T> | RescueResult<T>[] {
  const { mode = 'first', autoRepair: shouldRepair = true } = options;

  // Extract candidates
  const candidates = extractAllCandidates(text);

  if (candidates.length === 0) {
    const emptyResult: RescueResult<T> = {
      data: null,
      success: false,
      issues: [
        {
          code: 'NO_JSON_FOUND',
          message: 'No JSON candidates found in the text',
          severity: 'error',
        },
      ],
      raw: '',
      repaired: '',
      score: 0,
    };
    return mode === 'all' ? [emptyResult] : emptyResult;
  }

  // Process candidates
  const results: RescueResult<T>[] = [];

  for (const candidate of candidates) {
    const result = processCandidate<T>(candidate.text, shouldRepair);
    results.push(result);

    // Stop if we found a valid one and only want the first
    if (mode === 'first' && result.success) {
      break;
    }
  }

  // Return based on mode
  if (mode === 'all') {
    return results;
  }

  if (mode === 'best') {
    // Return the result with the highest score
    return results.reduce((best, current) => {
      const bestScore = best.score ?? 0;
      const currentScore = current.score ?? 0;
      return currentScore > bestScore ? current : best;
    });
  }

  // Return first successful or first result (default 'first' mode)
  return results.find((r) => r.success) || results[0];
}

/**
 * Convenience wrapper to get all JSON candidates
 *
 * @template T - The expected type of the parsed JSON
 * @param text - The text containing JSON
 * @param options - Configuration options (mode is always 'all')
 * @returns An array of RescueResult
 *
 * @example
 * ```typescript
 * const results = rescueJsonAll<{ name: string }>(mixedText);
 * results.forEach(result => {
 *   if (result.success) {
 *     console.log(result.data);
 *   }
 * });
 * ```
 */
export function rescueJsonAll<T = unknown>(
  text: string,
  options: Omit<RescueOptions, 'mode'> = {}
): RescueResult<T>[] {
  const results = rescueJson<T>(text, { ...options, mode: 'all' });
  return Array.isArray(results) ? results : [results];
}

/**
 * Process a single candidate: attempt repair and parse
 */
function processCandidate<T>(raw: string, shouldRepair: boolean): RescueResult<T> {
  const allIssues: RepairIssue[] = [];
  let repaired = raw;

  // Try to parse as-is first
  if (isValidJson(raw)) {
    const score = calculateScore(raw, []);
    return {
      data: JSON.parse(raw) as T,
      success: true,
      issues: [],
      raw,
      repaired: raw,
      score,
    };
  }

  // If we should repair, apply repairs
  if (shouldRepair) {
    const repairResult = autoRepair(raw);
    repaired = repairResult.text;
    allIssues.push(...repairResult.issues);

    // Try parsing after repair
    if (isValidJson(repaired)) {
      const score = calculateScore(repaired, allIssues);
      return {
        data: JSON.parse(repaired) as T,
        success: true,
        issues: allIssues,
        raw,
        repaired,
        score,
      };
    }
  }

  // Failed to parse
  let parseError = 'Unknown parse error';
  try {
    JSON.parse(repaired);
  } catch (e) {
    parseError = e instanceof Error ? e.message : String(e);
  }

  return {
    data: null,
    success: false,
    issues: [
      ...allIssues,
      {
        code: 'PARSE_ERROR',
        message: `Failed to parse JSON: ${parseError}`,
        severity: 'error',
      },
    ],
    raw,
    repaired,
    score: 0,
  };
}

/**
 * Calculate a confidence score for the parsed result
 * Score ranges from 0 to 1, where 1 is perfect (no repairs needed)
 * and 0 is a parse failure
 */
function calculateScore(text: string, issues: RepairIssue[]): number {
  // Base score is 1.0 (perfect)
  let score = 1.0;

  // Penalize for each repair issue
  // Warning issues reduce score by 0.05, error issues reduce by 0.1
  for (const issue of issues) {
    if (issue.severity === 'warning') {
      score -= 0.05;
    } else {
      score -= 0.1;
    }
  }

  // Penalize for length (longer text might have more issues)
  // But less significantly
  const lengthPenalty = Math.log(text.length) / 1000;
  score -= Math.min(lengthPenalty, 0.1);

  // Ensure score stays in valid range
  return Math.max(0, Math.min(1, score));
}

export { RescueResult, RescueOptions, RepairIssue } from './types';
