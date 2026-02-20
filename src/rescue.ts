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

  // Return first successful or first result
  return results.find((r) => r.success) || results[0];
}

/**
 * Process a single candidate: attempt repair and parse
 */
function processCandidate<T>(raw: string, shouldRepair: boolean): RescueResult<T> {
  const allIssues: RepairIssue[] = [];
  let repaired = raw;

  // Try to parse as-is first
  if (isValidJson(raw)) {
    return {
      data: JSON.parse(raw) as T,
      success: true,
      issues: [],
      raw,
      repaired: raw,
    };
  }

  // If we should repair, apply repairs
  if (shouldRepair) {
    const repairResult = autoRepair(raw);
    repaired = repairResult.text;
    allIssues.push(...repairResult.issues);

    // Try parsing after repair
    if (isValidJson(repaired)) {
      return {
        data: JSON.parse(repaired) as T,
        success: true,
        issues: allIssues,
        raw,
        repaired,
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
  };
}

export { RescueResult, RescueOptions, RepairIssue } from './types';
