/**
 * Tests for field extraction API (v1.2.0)
 */

import { extractField, extractFields, fieldExists, getFieldOrDefault } from '../src/fields';

describe('Field Extraction (v1.2.0)', () => {
  const jsonText = '{"user": {"id": 1, "name": "Alice", "email": "alice@example.com"}, "status": "active"}';
  const markdownJson = '```json\n{"product": {"id": 42, "price": 99.99}, "available": true}\n```';

  describe('extractField', () => {
    it('should extract simple top-level field', () => {
      const result = extractField(jsonText, 'status');

      expect(result.success).toBe(true);
      expect(result.value).toBe('active');
      expect(result.fieldPath).toBe('status');
    });

    it('should extract nested field using dot notation', () => {
      const result = extractField<string>(jsonText, 'user.name');

      expect(result.success).toBe(true);
      expect(result.value).toBe('Alice');
    });

    it('should extract from nested objects', () => {
      const result = extractField<string>(jsonText, 'user.email');

      expect(result.success).toBe(true);
      expect(result.value).toBe('alice@example.com');
    });

    it('should extract from markdown JSON', () => {
      const result = extractField<number>(markdownJson, 'product.id');

      expect(result.success).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should return null for non-existent field', () => {
      const result = extractField(jsonText, 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.value).toBeNull();
    });

    it('should handle array indices', () => {
      const arrayJson = '{"items": [{"id": 1}, {"id": 2}, {"id": 3}]}';
      const result = extractField<number>(arrayJson, 'items.0.id');

      expect(result.success).toBe(true);
      expect(result.value).toBe(1);
    });

    it('should work with repaired JSON', () => {
      const brokenJson = '{"name": "test",}'; // trailing comma
      const result = extractField<string>(brokenJson, 'name', { autoRepair: true });

      expect(result.success).toBe(true);
      expect(result.value).toBe('test');
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('extractFields', () => {
    it('should extract multiple fields at once', () => {
      const result = extractFields(jsonText, ['status', 'user.id', 'user.name']);

      expect(result['status'].success).toBe(true);
      expect(result['status'].value).toBe('active');
      expect(result['user.id'].success).toBe(true);
      expect(result['user.id'].value).toBe(1);
      expect(result['user.name'].success).toBe(true);
      expect(result['user.name'].value).toBe('Alice');
    });

    it('should handle mix of found and missing fields', () => {
      const result = extractFields(jsonText, ['status', 'missing', 'user.name']);

      expect(result['status'].success).toBe(true);
      expect(result['missing'].success).toBe(false);
      expect(result['user.name'].success).toBe(true);
    });
  });

  describe('fieldExists', () => {
    it('should return true for existing field', () => {
      expect(fieldExists(jsonText, 'status')).toBe(true);
      expect(fieldExists(jsonText, 'user.name')).toBe(true);
    });

    it('should return false for non-existent field', () => {
      expect(fieldExists(jsonText, 'nonexistent')).toBe(false);
      expect(fieldExists(jsonText, 'user.missing')).toBe(false);
    });
  });

  describe('getFieldOrDefault', () => {
    it('should return field value if it exists', () => {
      const result = getFieldOrDefault<string>(jsonText, 'user.name', 'Unknown');

      expect(result).toBe('Alice');
    });

    it('should return default value if field does not exist', () => {
      const result = getFieldOrDefault<string>(jsonText, 'user.missing', 'Default');

      expect(result).toBe('Default');
    });

    it('should work with different types', () => {
      const numberResult = getFieldOrDefault<number>(jsonText, 'user.id', -1);
      expect(numberResult).toBe(1);

      const missingNumber = getFieldOrDefault<number>(jsonText, 'missing.number', 0);
      expect(missingNumber).toBe(0);
    });
  });
});
