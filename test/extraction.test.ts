/**
 * Tests for extraction features
 */

import {
  extractFromMarkdown,
  extractBalancedBraces,
  extractAllCandidates,
} from '../src/index';

describe('Extraction Features', () => {
  describe('Markdown Extraction', () => {
    it('should extract JSON from markdown code blocks', () => {
      const text =
        'Here is some JSON:\n```json\n{"name": "test"}\n```\nEnd.';
      const candidates = extractFromMarkdown(text);

      expect(candidates).toHaveLength(1);
      expect(candidates[0].text).toBe('{"name": "test"}');
      expect(candidates[0].source).toBe('markdown');
    });

    it('should extract multiple markdown blocks', () => {
      const text =
        '```json\n{"a": 1}\n```\nMiddle\n```json\n{"b": 2}\n```';
      const candidates = extractFromMarkdown(text);

      expect(candidates).toHaveLength(2);
      expect(candidates[0].text).toBe('{"a": 1}');
      expect(candidates[1].text).toBe('{"b": 2}');
    });

    it('should return empty array if no markdown blocks', () => {
      const text = 'No JSON here';
      const candidates = extractFromMarkdown(text);

      expect(candidates).toHaveLength(0);
    });
  });

  describe('Balanced Braces Extraction', () => {
    it('should extract balanced JSON objects', () => {
      const text = 'Start {"name": "test"} End';
      const candidates = extractBalancedBraces(text);

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].text).toBe('{"name": "test"}');
      expect(candidates[0].source).toBe('balanced-braces');
    });

    it('should extract balanced JSON arrays', () => {
      const text = 'Start [1, 2, 3] End';
      const candidates = extractBalancedBraces(text);

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].text).toBe('[1, 2, 3]');
    });

    it('should handle nested structures', () => {
      const text = '{"a": {"b": [1, 2]}}';
      const candidates = extractBalancedBraces(text);

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].text).toBe('{"a": {"b": [1, 2]}}');
    });

    it('should respect string boundaries', () => {
      const text = '{"msg": "text with } inside"} End';
      const candidates = extractBalancedBraces(text);

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].text).toBe('{"msg": "text with } inside"}');
    });
  });

  describe('Extract All Candidates', () => {
    it('should combine markdown and balanced extraction', () => {
      const text = '```json\n{"a": 1}\n```\nSome text\n{"b": 2}';
      const candidates = extractAllCandidates(text);

      expect(candidates.length).toBeGreaterThanOrEqual(1);
      const texts = candidates.map((c) => c.text);
      expect(texts).toContain('{"a": 1}');
    });

    it('should deduplicate candidates', () => {
      const text =
        '```json\n{"name": "test"}\n```\n{"name": "test"}';
      const candidates = extractAllCandidates(text);

      expect(candidates).toHaveLength(1);
    });
  });
});
