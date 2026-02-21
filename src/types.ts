/**
 * Core type definitions for json-rescue
 */

/**
 * Represents a single repair issue found during extraction/repair
 */
export interface RepairIssue {
  code: string; // e.g., 'TRAILING_COMMA', 'JSONC_COMMENT', 'SMART_QUOTES'
  message: string;
  line?: number;
  column?: number;
  severity: 'warning' | 'error';
}

/**
 * Result of a rescue operation with transparent repair reporting
 */
export interface RescueResult<T = unknown> {
  /** The parsed JSON object */
  data: T | null;
  /** Whether parsing was successful */
  success: boolean;
  /** List of repairs applied */
  issues: RepairIssue[];
  /** The original extracted text before repairs */
  raw: string;
  /** The repaired text before parsing */
  repaired: string;
  /** Score indicating likelihood this is correct JSON (0-1) */
  score?: number;
}

/**
 * Extraction candidate found in the text
 */
export interface ExtractionCandidate {
  text: string;
  source: 'markdown' | 'balanced-braces';
  startIndex: number;
  endIndex: number;
}

/**
 * Options for rescueJson function
 */
export interface RescueOptions {
  /** Mode of extraction: 'first' (default), 'all', or 'best' (highest score) */
  mode?: 'first' | 'all' | 'best';
  /** Whether to attempt auto-repair */
  autoRepair?: boolean;
  /** Custom repair rules */
  customRepairs?: ((text: string) => { text: string; issues: RepairIssue[] })[];
}
