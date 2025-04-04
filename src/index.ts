/**
 * json-rescue - Extract, repair, and parse JSON from messy real-world text
 * @packageDocumentation
 */

export { rescueJson } from './rescue';
export type { RescueResult, RescueOptions, RepairIssue, ExtractionCandidate } from './types';

// Re-export extraction utilities
export { extractAllCandidates, extractFromMarkdown, extractBalancedBraces } from './extraction';

// Re-export repair utilities
export { autoRepair, repairTrailingCommas, repairJsoncComments, repairSmartQuotes } from './repair';
