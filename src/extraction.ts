/**
 * Extraction strategies for finding JSON in messy text
 */

import { ExtractionCandidate } from './types';

/**
 * Extract JSON from Markdown code blocks (```json ... ```)
 */
export function extractFromMarkdown(text: string): ExtractionCandidate[] {
  const candidates: ExtractionCandidate[] = [];

  // Match ```json ... ``` blocks
  const markdownRegex = /```json\s*\n([\s\S]*?)```/g;
  let match;

  while ((match = markdownRegex.exec(text)) !== null) {
    const jsonText = match[1].trim();
    if (jsonText) {
      candidates.push({
        text: jsonText,
        source: 'markdown',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  return candidates;
}

/**
 * Extract JSON using balanced braces/brackets (string-aware)
 * Handles nested structures and respects string boundaries
 */
export function extractBalancedBraces(text: string): ExtractionCandidate[] {
  const candidates: ExtractionCandidate[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Look for object or array start
    if (char === '{' || char === '[') {
      const result = extractBalancedRegion(text, i);
      if (result) {
        const { endIndex, extracted } = result;
        candidates.push({
          text: extracted,
          source: 'balanced-braces',
          startIndex: i,
          endIndex,
        });
        i = endIndex - 1; // Move past this candidate
      }
    }
  }

  return candidates;
}

/**
 * Extract a balanced region from startIndex, respecting string boundaries
 */
function extractBalancedRegion(
  text: string,
  startIndex: number
): { endIndex: number; extracted: string } | null {
  const opening = text[startIndex];
  const closing = opening === '{' ? '}' : ']';

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === opening) {
        depth++;
      } else if (char === closing) {
        depth--;

        if (depth === 0) {
          const extracted = text.substring(startIndex, i + 1);
          // Validate it looks like valid JSON structure
          if (extracted.trim().length > 2) {
            return {
              endIndex: i + 1,
              extracted,
            };
          }
          return null;
        }
      }
    }
  }

  return null;
}

/**
 * Extract all JSON candidates from text
 */
export function extractAllCandidates(text: string): ExtractionCandidate[] {
  const markdown = extractFromMarkdown(text);
  const balanced = extractBalancedBraces(text);

  // Combine and deduplicate by content
  const seen = new Set<string>();
  const all: ExtractionCandidate[] = [];

  for (const candidate of [...markdown, ...balanced]) {
    if (!seen.has(candidate.text)) {
      seen.add(candidate.text);
      all.push(candidate);
    }
  }

  return all;
}
