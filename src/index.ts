/**
 * json-rescue - Extract, repair, and parse JSON from messy real-world text
 * @packageDocumentation
 */

export { rescueJson, rescueJsonAll } from './rescue';
export type { RescueResult, RescueOptions, RepairIssue, ExtractionCandidate } from './types';

// Re-export extraction utilities
export { extractAllCandidates, extractFromMarkdown, extractBalancedBraces } from './extraction';

// Re-export repair utilities
export {
  autoRepair,
  repairTrailingCommas,
  repairJsoncComments,
  repairSmartQuotes,
  repairSingleQuotes,
  repairUnquotedKeys,
  repairPythonLiterals,
} from './repair';

// Re-export field extraction utilities (v1.2.0)
export { extractField, extractFields, fieldExists, getFieldOrDefault } from './fields';
export type { FieldExtractionResult } from './fields';

// Re-export schema validation utilities (v2.0.0)
export { validateSchema, createValidationReport } from './schema';
export type {
  JsonSchema,
  SchemaValidationResult,
  SchemaValidationError,
  ValidationReport,
} from './schema';
