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
