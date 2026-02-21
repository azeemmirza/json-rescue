/**
 * Tests for repair features
 */

import {
  autoRepair,
  repairTrailingCommas,
  repairJsoncComments,
  repairSmartQuotes,
  repairSingleQuotes,
  repairUnquotedKeys,
  repairPythonLiterals,
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

  describe('Single Quotes Repair', () => {
    it('should convert single quotes to double quotes', () => {
      const text = "{'name': 'John', 'age': 30}";
      const result = repairSingleQuotes(text);

      expect(result.text).toBe('{"name": "John", "age": 30}');
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('SINGLE_QUOTES');
    });

    it('should handle mixed quotes', () => {
      const text = "{'key': \"value\"}";
      const result = repairSingleQuotes(text);

      expect(result.text).toBe('{"key": "value"}');
      expect(result.issues).toHaveLength(1);
    });

    it('should not modify already double-quoted strings', () => {
      const text = '{"name": "test"}';
      const result = repairSingleQuotes(text);

      expect(result.text).toBe(text);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('Unquoted Keys Repair', () => {
    it('should add quotes around unquoted keys', () => {
      const text = '{name: "John", age: 30}';
      const result = repairUnquotedKeys(text);

      expect(result.text).toContain('"name"');
      expect(result.text).toContain('"age"');
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('UNQUOTED_KEYS');
    });

    it('should handle already quoted keys', () => {
      const text = '{"name": "John", age: 30}';
      const result = repairUnquotedKeys(text);

      expect(result.text).toContain('"name"');
      expect(result.text).toContain('"age"');
    });

    it('should handle unquoted keys with underscore', () => {
      const text = '{first_name: "John"}';
      const result = repairUnquotedKeys(text);

      expect(result.text).toContain('"first_name"');
    });
  });

  describe('Python Literals Repair', () => {
    it('should convert Python True to JSON true', () => {
      const text = '{"active": True}';
      const result = repairPythonLiterals(text);

      expect(result.text).toBe('{"active": true}');
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].code).toBe('PYTHON_LITERALS');
    });

    it('should convert Python False to JSON false', () => {
      const text = '{"active": False}';
      const result = repairPythonLiterals(text);

      expect(result.text).toBe('{"active": false}');
    });

    it('should convert Python None to JSON null', () => {
      const text = '{"value": None}';
      const result = repairPythonLiterals(text);

      expect(result.text).toBe('{"value": null}');
    });

    it('should handle multiple Python literals', () => {
      const text = '{"a": True, "b": False, "c": None}';
      const result = repairPythonLiterals(text);

      expect(result.text).toBe('{"a": true, "b": false, "c": null}');
      expect(result.issues).toHaveLength(1);
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

    it('should apply all repair strategies', () => {
      const text = "{name: 'John', active: True, age: 30,}";
      const result = autoRepair(text);

      expect(result.text).not.toContain("'");
      expect(result.text).not.toContain('True');
      expect(result.text).not.toContain(',}');
      expect(result.text).toContain('"name"');
    });
  });
});
