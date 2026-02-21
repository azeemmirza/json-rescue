/**
 * Schema validation API - Validate parsed JSON against a schema
 * Provides optional schema validation with detailed error reporting
 */

import { RepairIssue } from './types';

/**
 * Simple JSON schema definition (subset of JSON Schema)
 */
export interface JsonSchema {
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  enum?: any[];
  description?: string;
}

/**
 * Result of schema validation
 */
export interface SchemaValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors if any */
  errors: SchemaValidationError[];
  /** Number of errors found */
  errorCount: number;
}

/**
 * Schema validation error
 */
export interface SchemaValidationError {
  /** The path to the invalid field (dot-notation) */
  path: string;
  /** The validation rule that failed */
  rule: string;
  /** Human-readable error message */
  message: string;
  /** Expected value/type */
  expected?: string;
  /** Actual value */
  actual?: unknown;
  /** Error severity */
  severity: 'error' | 'warning';
}

/**
 * Validate a parsed JSON object against a schema
 *
 * @param data - The data to validate
 * @param schema - The schema to validate against
 * @returns Validation result with any errors found
 *
 * @example
 * ```typescript
 * const schema: JsonSchema = {
 *   type: 'object',
 *   required: ['id', 'name'],
 *   properties: {
 *     id: { type: 'number' },
 *     name: { type: 'string' },
 *     email: { type: 'string', pattern: '^[a-z0-9]+@[a-z0-9]+\\.[a-z]{2,}$' }
 *   }
 * };
 *
 * const result = validateSchema(data, schema);
 * if (!result.valid) {
 *   console.log(result.errors);
 * }
 * ```
 */
export function validateSchema(data: unknown, schema: JsonSchema): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];
  validateValue(data, schema, '', errors);

  return {
    valid: errors.length === 0,
    errors,
    errorCount: errors.length,
  };
}

/**
 * Validate a single value against a schema
 */
function validateValue(
  data: unknown,
  schema: JsonSchema,
  path: string,
  errors: SchemaValidationError[]
): void {
  // Check type
  if (schema.type) {
    const actualType = getJsonType(data);
    if (actualType !== schema.type) {
      errors.push({
        path: path || 'root',
        rule: 'type',
        message: `Expected type ${schema.type}, got ${actualType}`,
        expected: schema.type,
        actual: actualType,
        severity: 'error',
      });
      return; // Don't validate further if type is wrong
    }
  }

  // Type-specific validations
  if (data === null || data === undefined) {
    return;
  }

  if (typeof data === 'string') {
    validateString(data, schema, path, errors);
  } else if (typeof data === 'number') {
    validateNumber(data, schema, path, errors);
  } else if (Array.isArray(data)) {
    validateArray(data, schema, path, errors);
  } else if (typeof data === 'object') {
    validateObject(data, schema, path, errors);
  }
}

/**
 * Validate a string value
 */
function validateString(
  data: string,
  schema: JsonSchema,
  path: string,
  errors: SchemaValidationError[]
): void {
  if (schema.minLength !== undefined && data.length < schema.minLength) {
    errors.push({
      path: path || 'root',
      rule: 'minLength',
      message: `String length must be at least ${String(schema.minLength)}`,
      expected: `length >= ${String(schema.minLength)}`,
      actual: data.length,
      severity: 'error',
    });
  }

  if (schema.maxLength !== undefined && data.length > schema.maxLength) {
    errors.push({
      path: path || 'root',
      rule: 'maxLength',
      message: `String length must not exceed ${String(schema.maxLength)}`,
      expected: `length <= ${String(schema.maxLength)}`,
      actual: data.length,
      severity: 'error',
    });
  }

  if (schema.pattern !== undefined) {
    try {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(data)) {
        errors.push({
          path: path || 'root',
          rule: 'pattern',
          message: `String does not match pattern: ${schema.pattern}`,
          expected: schema.pattern,
          actual: data,
          severity: 'error',
        });
      }
    } catch {
      errors.push({
        path: path || 'root',
        rule: 'pattern',
        message: `Invalid regex pattern: ${schema.pattern}`,
        severity: 'error',
      });
    }
  }

  if (schema.enum !== undefined && !schema.enum.includes(data)) {
    errors.push({
      path: path || 'root',
      rule: 'enum',
      message: `Value must be one of: ${schema.enum.join(', ')}`,
      expected: schema.enum.join(' | '),
      actual: data,
      severity: 'error',
    });
  }
}

/**
 * Validate a number value
 */
function validateNumber(
  data: number,
  schema: JsonSchema,
  path: string,
  errors: SchemaValidationError[]
): void {
  if (schema.minimum !== undefined && data < schema.minimum) {
    errors.push({
      path: path || 'root',
      rule: 'minimum',
      message: `Number must be at least ${String(schema.minimum)}`,
      expected: `>= ${String(schema.minimum)}`,
      actual: data,
      severity: 'error',
    });
  }

  if (schema.maximum !== undefined && data > schema.maximum) {
    errors.push({
      path: path || 'root',
      rule: 'maximum',
      message: `Number must not exceed ${String(schema.maximum)}`,
      expected: `<= ${String(schema.maximum)}`,
      actual: data,
      severity: 'error',
    });
  }

  if (schema.enum !== undefined && !schema.enum.includes(data)) {
    errors.push({
      path: path || 'root',
      rule: 'enum',
      message: `Value must be one of: ${schema.enum.join(', ')}`,
      expected: schema.enum.join(' | '),
      actual: data,
      severity: 'error',
    });
  }
}

/**
 * Validate an array value
 */
function validateArray(
  data: unknown[],
  schema: JsonSchema,
  path: string,
  errors: SchemaValidationError[]
): void {
  if (schema.items) {
    for (let i = 0; i < data.length; i++) {
      const itemPath = path ? `${path}[${String(i)}]` : `[${String(i)}]`;
      validateValue(data[i], schema.items, itemPath, errors);
    }
  }
}

/**
 * Validate an object value
 */
function validateObject(
  data: unknown,
  schema: JsonSchema,
  path: string,
  errors: SchemaValidationError[]
): void {
  if (typeof data !== 'object' || data === null) {
    return;
  }

  const dataObj = data as Record<string, unknown>;

  // Check required properties
  if (schema.required) {
    for (const prop of schema.required) {
      if (!(prop in dataObj)) {
        errors.push({
          path: path ? `${path}.${prop}` : prop,
          rule: 'required',
          message: `Required property '${prop}' is missing`,
          expected: 'property to exist',
          actual: 'undefined',
          severity: 'error',
        });
      }
    }
  }

  // Validate properties
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in dataObj) {
        const propPath = path ? `${path}.${key}` : key;
        validateValue(dataObj[key], propSchema, propPath, errors);
      }
    }
  }

  // Validate all properties if no specific schema
  if (!schema.properties && schema.type === 'object') {
    for (const [key, value] of Object.entries(dataObj)) {
      const propPath = path ? `${path}.${key}` : key;
      // Just validate that values are JSON-serializable
      if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
        errors.push({
          path: propPath,
          rule: 'json-serializable',
          message: 'Value is not JSON-serializable',
          severity: 'warning',
        });
      }
    }
  }
}

/**
 * Get the JSON type of a value
 */
function getJsonType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Combine schema validation with repair issues into a single report
 */
export interface ValidationReport {
  /** Repair issues from JSON extraction */
  repairIssues: RepairIssue[];
  /** Schema validation results */
  schemaValidation: SchemaValidationResult;
  /** Overall success status */
  isValid: boolean;
  /** Total error count */
  totalErrors: number;
}

/**
 * Create a validation report combining repair and schema validation
 */
export function createValidationReport(
  repairIssues: RepairIssue[],
  schemaValidation: SchemaValidationResult
): ValidationReport {
  const repairErrors = repairIssues.filter((i) => i.severity === 'error').length;
  const schemaErrors = schemaValidation.errorCount;

  return {
    repairIssues,
    schemaValidation,
    isValid: repairErrors === 0 && schemaErrors === 0,
    totalErrors: repairErrors + schemaErrors,
  };
}
