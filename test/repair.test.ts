/**
 * Tests for repair features
 */

import {
  autoRepair,
  repairTrailingCommas,
  repairJsoncComments,
  repairSmartQuotes,
} from '../src/index';

describe('Repair Features', () => {
  describe('Trailing Comma Repair', () => {
    it('should remove trailing commas before closing brace', () => {
      const text = '{"a": 1, "b": 2,}';
      const result = repairTrailingCommas(text);

      expect(result.text).toBe('{"a": 1, "b": 2}');
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('TRAILING_COMMA');
    });

    it('should remove trailing commas before closing bracket', () => {
      const text = '[1, 2, 3,]';
      const result = repairTrailingCommas(text);

      expect(result.text).toBe('[1, 2, 3]');
      expect(result.issues).toHaveLength(1);
    });

    it('should handle multiple trailing commas', () => {
      const text = '{"a": 1,, "b": 2,}';
      const result = repairTrailingCommas(text);

      expect(result.text).not.toContain(',}');
    });
  });

  describe('JSONC Comments Repair', () => {
    it('should remove single-line comments', () => {
      const text = '{"a": 1, // comment\n"b": 2}';
      const result = repairJsoncComments(text);

      expect(result.text).not.toContain('// comment');
      expect(
        result.issues.some((i) => i.code === 'JSONC_COMMENT_SINGLE')
      ).toBe(true);
    });

    it('should remove multi-line comments', () => {
      const text = '{"a": 1, /* comment */ "b": 2}';
      const result = repairJsoncComments(text);

      expect(result.text).not.toContain('/* comment */');
      expect(
        result.issues.some((i) => i.code === 'JSONC_COMMENT_MULTI')
      ).toBe(true);
    });

    it('should handle nested multi-line comments', () => {
      const text = '{"a": /* start /* nested */ end */ 1}';
      const result = repairJsoncComments(text);

      expect(result.text).not.toContain('/*');
    });
  });

  describe('Smart Quotes Repair', () => {
    it('should replace curly double quotes', () => {
      const text = '{\u201Cname\u201D: \u201CJohn\u201D}'; // with curly quotes
      const result = repairSmartQuotes(text);

      expect(result.text).not.toContain('\u201C');
      expect(result.text).toContain('"');
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('SMART_QUOTES');
    });

    it('should replace curly single quotes', () => {
      const text = "{\u2018name\u2019: \u2018John\u2019}"; // with curly quotes
      const result = repairSmartQuotes(text);

      expect(result.text).not.toContain('\u2018');
      expect(result.text).toContain("'");
    });
  });

  describe('Auto Repair', () => {
    it('should apply multiple repairs in sequence', () => {
      const text = '{"a": 1, /* comment */ "b": 2,}';
      const result = autoRepair(text);

      expect(result.text).not.toContain(',}');
      expect(result.text).not.toContain('/*');
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should report all issues found', () => {
      const text = '{"a": 1, // comment\n"b": 2,}';
      const result = autoRepair(text);

      expect(result.issues.length).toBeGreaterThan(0);
      const codes = result.issues.map((i) => i.code);
      expect(codes).toContain('TRAILING_COMMA');
    });
  });
});
