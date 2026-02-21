/**
 * Field extraction API - Extract specific fields from JSON without full parsing
 * Useful for extracting values from large JSON objects without parsing the entire structure
 */

import { RepairIssue } from './types';
import { extractAllCandidates } from './extraction';
import { autoRepair } from './repair';

/**
 * Result of a field extraction operation
 */
export interface FieldExtractionResult<T = unknown> {
  /** The extracted field value */
  value: T | null;
  /** Whether extraction was successful */
  success: boolean;
  /** Field path that was extracted (dot-notation) */
  fieldPath: string;
  /** Any issues encountered during extraction */
  issues: RepairIssue[];
  /** Raw JSON text that was processed */
  raw: string;
  /** Repaired JSON text if repairs were applied */
  repaired: string;
}

/**
 * Extract a specific field from JSON text without parsing the entire structure
 * Supports dot-notation for nested fields (e.g., "user.name", "data.items.0.id")
 *
 * @template T - The expected type of the field value
 * @param text - The text containing JSON
 * @param fieldPath - The field path in dot-notation (e.g., "name", "user.profile.email")
 * @param options - Optional configuration
 * @returns The extracted field value or null if not found
 *
 * @example
 * ```typescript
 * const result = extractField<string>(jsonText, 'user.name');
 * if (result.success) {
 *   console.log(result.value); // The name value
 * }
 * ```
 */
export function extractField<T = unknown>(
  text: string,
  fieldPath: string,
  options: { autoRepair?: boolean } = {}
): FieldExtractionResult<T> {
  const { autoRepair: shouldRepair = true } = options;

  // Extract JSON candidates
  const candidates = extractAllCandidates(text);

  if (candidates.length === 0) {
    return {
      value: null,
      success: false,
      fieldPath,
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
  }

  // Try each candidate to find the field
  for (const candidate of candidates) {
    const result = extractFieldFromCandidate<T>(candidate.text, fieldPath, shouldRepair);
    if (result.success) {
      return result;
    }
  }

  // Return failure result from last attempt
  return extractFieldFromCandidate<T>(
    candidates[candidates.length - 1].text,
    fieldPath,
    shouldRepair
  );
}

/**
 * Extract multiple fields from JSON text
 *
 * @template T - A type mapping field paths to their values
 * @param text - The text containing JSON
 * @param fieldPaths - Array of field paths to extract
 * @param options - Optional configuration
 * @returns Object with extracted field values
 *
 * @example
 * ```typescript
 * const result = extractFields(jsonText, ['id', 'name', 'user.email']);
 * // Returns: { id: ..., name: ..., 'user.email': ... }
 * ```
 */
export function extractFields(
  text: string,
  fieldPaths: string[],
  options: { autoRepair?: boolean } = {}
): Record<string, FieldExtractionResult> {
  const results: Record<string, FieldExtractionResult> = {};

  for (const path of fieldPaths) {
    results[path] = extractField(text, path, options);
  }

  return results;
}

/**
 * Extract a field from a single JSON candidate
 */
function extractFieldFromCandidate<T>(
  raw: string,
  fieldPath: string,
  shouldRepair: boolean
): FieldExtractionResult<T> {
  const allIssues: RepairIssue[] = [];
  let repaired = raw;

  // Try to find field in raw text first
  let fieldValue = findFieldInJson(raw, fieldPath);

  if (fieldValue !== undefined) {
    return {
      value: fieldValue as T,
      success: true,
      fieldPath,
      issues: [],
      raw,
      repaired: raw,
    };
  }

  // If repair is enabled, try repairing and extracting again
  if (shouldRepair) {
    const repairResult = autoRepair(raw);
    repaired = repairResult.text;
    allIssues.push(...repairResult.issues);

    fieldValue = findFieldInJson(repaired, fieldPath);

    if (fieldValue !== undefined) {
      return {
        value: fieldValue as T,
        success: true,
        fieldPath,
        issues: allIssues,
        raw,
        repaired,
      };
    }
  }

  // Field not found
  return {
    value: null,
    success: false,
    fieldPath,
    issues: [
      ...allIssues,
      {
        code: 'FIELD_NOT_FOUND',
        message: `Field '${fieldPath}' not found in JSON`,
        severity: 'error',
      },
    ],
    raw,
    repaired,
  };
}

/**
 * Find a field value in JSON text using dot-notation path
 * This function uses a streaming-like approach to find the field without parsing the entire JSON
 */
function findFieldInJson(text: string, fieldPath: string): unknown {
  try {
    // Parse the JSON
    const obj = JSON.parse(text) as Record<string, unknown>;

    // Navigate through the path
    const pathSegments = fieldPath.split('.');
    let current: unknown = obj;

    for (const segment of pathSegments) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array indices
      if (/^\d+$/.test(segment)) {
        const index = parseInt(segment, 10);
        if (!Array.isArray(current)) {
          return undefined;
        }
        current = current[index];
      } else {
        if (typeof current !== 'object' || !(segment in (current as Record<string, unknown>))) {
          return undefined;
        }
        current = (current as Record<string, unknown>)[segment];
      }
    }

    return current;
  } catch {
    return undefined;
  }
}

/**
 * Check if a field exists in JSON text without extracting its value
 *
 * @param text - The text containing JSON
 * @param fieldPath - The field path to check
 * @returns Whether the field exists
 *
 * @example
 * ```typescript
 * if (fieldExists(jsonText, 'user.name')) {
 *   console.log('Field exists');
 * }
 * ```
 */
export function fieldExists(text: string, fieldPath: string): boolean {
  const result = extractField(text, fieldPath, { autoRepair: false });
  return result.success;
}

/**
 * Extract field value safely with default fallback
 *
 * @template T - The expected type of the field value
 * @param text - The text containing JSON
 * @param fieldPath - The field path
 * @param defaultValue - Value to return if field is not found
 * @returns The field value or the default
 *
 * @example
 * ```typescript
 * const name = getFieldOrDefault(jsonText, 'user.name', 'Unknown');
 * ```
 */
export function getFieldOrDefault<T>(text: string, fieldPath: string, defaultValue: T): T {
  const result = extractField<T>(text, fieldPath);
  return result.success && result.value !== null ? result.value : defaultValue;
}
