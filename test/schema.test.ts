/**
 * Tests for schema validation API (v2.0.0)
 */

import { validateSchema, createValidationReport, JsonSchema } from '../src/schema';
import { RepairIssue } from '../src/types';

describe('Schema Validation (v2.0.0)', () => {
  describe('validateSchema', () => {
    it('should validate object type', () => {
      const schema: JsonSchema = { type: 'object' };
      const result = validateSchema({ name: 'test' }, schema);

      expect(result.valid).toBe(true);
      expect(result.errorCount).toBe(0);
    });

    it('should fail for incorrect type', () => {
      const schema: JsonSchema = { type: 'object' };
      const result = validateSchema('not an object', schema);

      expect(result.valid).toBe(false);
      expect(result.errorCount).toBeGreaterThan(0);
    });

    it('should validate required properties', () => {
      const schema: JsonSchema = {
        type: 'object',
        required: ['id', 'name'],
      };

      const validResult = validateSchema({ id: 1, name: 'test' }, schema);
      expect(validResult.valid).toBe(true);

      const invalidResult = validateSchema({ id: 1 }, schema);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors.some((e) => e.rule === 'required')).toBe(true);
    });

    it('should validate property types', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
        },
      };

      const validResult = validateSchema({ id: 1, name: 'test' }, schema);
      expect(validResult.valid).toBe(true);

      const invalidResult = validateSchema({ id: 'not a number', name: 'test' }, schema);
      expect(invalidResult.valid).toBe(false);
    });

    it('should validate string constraints', () => {
      const schema: JsonSchema = {
        type: 'string',
        minLength: 3,
        maxLength: 10,
      };

      expect(validateSchema('test', schema).valid).toBe(true);
      expect(validateSchema('ab', schema).valid).toBe(false);
      expect(validateSchema('this is too long', schema).valid).toBe(false);
    });

    it('should validate string pattern', () => {
      const schema: JsonSchema = {
        type: 'string',
        pattern: '^[a-z]+@[a-z]+\\.[a-z]{2,}$',
      };

      expect(validateSchema('user@example.com', schema).valid).toBe(true);
      expect(validateSchema('invalid-email', schema).valid).toBe(false);
    });

    it('should validate number constraints', () => {
      const schema: JsonSchema = {
        type: 'number',
        minimum: 0,
        maximum: 100,
      };

      expect(validateSchema(50, schema).valid).toBe(true);
      expect(validateSchema(-1, schema).valid).toBe(false);
      expect(validateSchema(101, schema).valid).toBe(false);
    });

    it('should validate enum values', () => {
      const schema: JsonSchema = {
        type: 'string',
        enum: ['active', 'inactive', 'pending'],
      };

      expect(validateSchema('active', schema).valid).toBe(true);
      expect(validateSchema('invalid', schema).valid).toBe(false);
    });

    it('should validate array items', () => {
      const schema: JsonSchema = {
        type: 'array',
        items: { type: 'number' },
      };

      expect(validateSchema([1, 2, 3], schema).valid).toBe(true);
      expect(validateSchema([1, 'two', 3], schema).valid).toBe(false);
    });

    it('should validate nested objects', () => {
      const schema: JsonSchema = {
        type: 'object',
        required: ['user'],
        properties: {
          user: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
          },
        },
      };

      const valid = { user: { id: 1, name: 'Alice' } };
      expect(validateSchema(valid, schema).valid).toBe(true);

      const invalidMissing = { user: { id: 1 } };
      expect(validateSchema(invalidMissing, schema).valid).toBe(false);

      const invalidType = { user: { id: 'not a number', name: 'Alice' } };
      expect(validateSchema(invalidType, schema).valid).toBe(false);
    });

    it('should provide detailed error information', () => {
      const schema: JsonSchema = {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number' },
        },
      };

      const result = validateSchema({ id: 'string' }, schema);

      expect(result.valid).toBe(false);
      const typeError = result.errors.find((e) => e.rule === 'type');
      expect(typeError).toBeDefined();
      expect(typeError?.path).toBe('id');
      expect(typeError?.actual).toBe('string');
      expect(typeError?.expected).toBe('number');
    });
  });

  describe('createValidationReport', () => {
    it('should combine repair and schema validation', () => {
      const repairIssues: RepairIssue[] = [
        {
          code: 'TRAILING_COMMA',
          message: 'Trailing comma removed',
          severity: 'warning',
        },
      ];

      const schemaResult = {
        valid: true,
        errors: [],
        errorCount: 0,
      };

      const report = createValidationReport(repairIssues, schemaResult);

      expect(report.isValid).toBe(true);
      expect(report.totalErrors).toBe(0);
      expect(report.repairIssues).toEqual(repairIssues);
    });

    it('should mark invalid when there are errors', () => {
      const repairIssues: RepairIssue[] = [
        {
          code: 'PARSE_ERROR',
          message: 'Failed to parse',
          severity: 'error',
        },
      ];

      const schemaResult = {
        valid: false,
        errors: [
          {
            path: 'field',
            rule: 'required',
            message: 'Required field missing',
            severity: 'error' as const,
          },
        ],
        errorCount: 1,
      };

      const report = createValidationReport(repairIssues, schemaResult);

      expect(report.isValid).toBe(false);
      expect(report.totalErrors).toBe(2);
    });
  });

  describe('Complex Schema Validation', () => {
    it('should validate a complete user schema', () => {
      const userSchema: JsonSchema = {
        type: 'object',
        required: ['id', 'username', 'email'],
        properties: {
          id: { type: 'number', minimum: 1 },
          username: { type: 'string', minLength: 3, maxLength: 20 },
          email: {
            type: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          },
          role: { type: 'string', enum: ['admin', 'user', 'guest'] },
          active: { type: 'boolean' },
        },
      };

      const validUser = {
        id: 1,
        username: 'alice',
        email: 'alice@example.com',
        role: 'admin',
        active: true,
      };

      expect(validateSchema(validUser, userSchema).valid).toBe(true);

      const invalidUser = {
        id: -1,
        username: 'ab',
        email: 'invalid',
        role: 'superuser',
      };

      const result = validateSchema(invalidUser, userSchema);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
