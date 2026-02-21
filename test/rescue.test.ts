/**
 * Tests for main rescueJson function
 */

import { rescueJson, rescueJsonAll } from '../src/index';

describe('rescueJson Function', () => {
  describe('First Mode (Default)', () => {
    it('should parse valid JSON as-is', () => {
      const text = '{"name": "test"}';
      const result = rescueJson<{ name: string }>(text);

      expect(Array.isArray(result)).toBe(false);
      const singleResult = result as any;
      expect(singleResult.success).toBe(true);
      expect(singleResult.data).toEqual({ name: 'test' });
      expect(singleResult.issues).toHaveLength(0);
    });

    it('should extract from markdown', () => {
      const text = 'Here is JSON:\n```json\n{"name": "rescue"}\n```';
      const result = rescueJson<{ name: string }>(text);

      expect(Array.isArray(result)).toBe(false);
      const singleResult = result as any;
      expect(singleResult.success).toBe(true);
      expect(singleResult.data?.name).toBe('rescue');
    });

    it('should repair and parse defective JSON', () => {
      const text = '{"a": 1, "b": 2,}'; // Trailing comma
      const result = rescueJson<{ a: number; b: number }>(text);

      expect(Array.isArray(result)).toBe(false);
      const singleResult = result as any;
      expect(singleResult.success).toBe(true);
      expect(singleResult.data).toEqual({ a: 1, b: 2 });
      expect(singleResult.issues.length).toBeGreaterThan(0);
    });

    it('should return failure for unparseable JSON', () => {
      const text = 'Not JSON at all';
      const result = rescueJson(text);

      expect(Array.isArray(result)).toBe(false);
      const singleResult = result as any;
      expect(singleResult.success).toBe(false);
      expect(singleResult.data).toBeNull();
    });
  });

  describe('All Mode', () => {
    it('should return array of results', () => {
      const text = '```json\n{"a": 1}\n```\nMiddle\n{"b": 2}';
      const result = rescueJson(text, { mode: 'all' });

      expect(Array.isArray(result)).toBe(true);
      expect((result as any[]).length).toBeGreaterThan(0);
    });

    it('should process multiple candidates', () => {
      const text = '[1, 2, 3]\nSome text\n{"key": "value"}';
      const result = rescueJson(text, { mode: 'all' });

      expect(Array.isArray(result)).toBe(true);
      const results = result as any[];
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('TypeScript Generics Support', () => {
    interface User {
      id: number;
      name: string;
      email?: string;
    }

    it('should parse with correct type', () => {
      const text = '{"id": 1, "name": "Alice"}';
      const result = rescueJson<User>(text);

      expect(Array.isArray(result)).toBe(false);
      const singleResult = result as any;
      expect(singleResult.success).toBe(true);
      expect(singleResult.data.id).toBe(1);
      expect(singleResult.data.name).toBe('Alice');
    });
  });

  describe('Repair Report Transparency', () => {
    it('should provide detailed repair information', () => {
      const text = `{
        "a": 1, // comment
        "b": 2,
      }`;
      const result = rescueJson(text);

      expect(Array.isArray(result)).toBe(false);
      const singleResult = result as any;
      expect(singleResult.raw).toBeDefined();
      expect(singleResult.repaired).toBeDefined();
      expect(singleResult.issues).toBeDefined();
      expect(singleResult.issues.length).toBeGreaterThan(0);
    });

    it('should track issue severity', () => {
      const text = '{"a": 1,}';
      const result = rescueJson(text);

      expect(Array.isArray(result)).toBe(false);
      const singleResult = result as any;
      expect(singleResult.issues[0].severity).toBe('warning');
    });
  });

  describe('Best Mode', () => {
    it('should return result with highest score', () => {
      const text = '{"a": 1}\nMiddle\n{"b": 2,}'; // Second one needs repair
      const result = rescueJson(text, { mode: 'best' });

      expect(Array.isArray(result)).toBe(false);
      const singleResult = result as any;
      expect(singleResult.score).toBeDefined();
      expect(singleResult.score).toBeGreaterThan(0);
    });

    it('should prefer perfect JSON over repaired JSON', () => {
      const text = '{"perfect": true}\nMiddle\n{"repaired": true,}';
      const result = rescueJson(text, { mode: 'best' });

      expect(Array.isArray(result)).toBe(false);
      const singleResult = result as any;
      expect(singleResult.success).toBe(true);
      expect(singleResult.data).toEqual({ perfect: true });
    });
  });

  describe('Candidate Scoring', () => {
    it('should assign score to successful results', () => {
      const text = '{"name": "test"}';
      const result = rescueJson(text);

      expect(Array.isArray(result)).toBe(false);
      const singleResult = result as any;
      expect(singleResult.score).toBeDefined();
      expect(singleResult.score).toBeGreaterThan(0);
      expect(singleResult.score).toBeLessThanOrEqual(1);
    });

    it('should penalize results with repairs', () => {
      const textPerfect = '{"name": "test"}';
      const textRepaired = '{"name": "test",}';

      const resultPerfect = rescueJson(textPerfect);
      const resultRepaired = rescueJson(textRepaired);

      expect(Array.isArray(resultPerfect)).toBe(false);
      expect(Array.isArray(resultRepaired)).toBe(false);

      const perfectScore = (resultPerfect as any).score ?? 0;
      const repairedScore = (resultRepaired as any).score ?? 0;

      expect(perfectScore).toBeGreaterThan(repairedScore);
    });
  });

  describe('rescueJsonAll Convenience Function', () => {
    it('should return array of all results', () => {
      const text = '{"a": 1}\nMiddle\n{"b": 2}';
      const results = rescueJsonAll(text);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should include both successful and failed results', () => {
      const text = '{"valid": true}\nMiddle\nNot JSON';
      const results = rescueJsonAll(text);

      expect(Array.isArray(results)).toBe(true);
      const successful = results.filter((r) => r.success);
      expect(successful.length).toBeGreaterThan(0);
    });

    it('should work with type generics', () => {
      interface Item {
        id: number;
      }

      const text = '{"id": 1}\n{"id": 2}';
      const results = rescueJsonAll<Item>(text);

      expect(Array.isArray(results)).toBe(true);
      const firstSuccess = results.find((r) => r.success);
      expect(firstSuccess?.data?.id).toBeDefined();
    });

    it('should respect autoRepair option', () => {
      const text = '{"a": 1,}\nMiddle\n{"b": 2,}';
      const results = rescueJsonAll(text, { autoRepair: true });

      expect(Array.isArray(results)).toBe(true);
      const successful = results.filter((r) => r.success);
      expect(successful.length).toBeGreaterThan(0);
    });
  });
});
