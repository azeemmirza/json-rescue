/**
 * Main test suite index
 * Tests are organized into separate files:
 * - extraction.test.ts: Extraction features (markdown, balanced braces)
 * - repair.test.ts: Repair features (trailing commas, comments, smart quotes)
 * - rescue.test.ts: Main rescueJson function with modes and generics support
 */

// Re-export all test suites for easy import
export * from './extraction.test';
export * from './repair.test';
export * from './rescue.test';
