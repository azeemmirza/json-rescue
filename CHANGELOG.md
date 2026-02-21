# Changelog

## [2.0.0](https://github.com/azeemmirza/json-rescue/compare/1.0.0...2.0.0) (2026-02-21)

### ✨ Features

- **Field Extraction API** (v1.2.0 feature, released in v2.0.0)
  - Extract specific fields from JSON without parsing entire structure
  - Dot-notation support for nested objects (e.g., `user.profile.name`)
  - Array index support (e.g., `items.0.id`)
  - Optional auto-repair for malformed JSON
  - Functions: `extractField()`, `extractFields()`, `fieldExists()`, `getFieldOrDefault()`

- **Schema Validation** (v2.0.0 core feature)
  - Comprehensive JSON Schema validation (subset support)
  - Type validation for all JSON types (object, array, string, number, boolean, null)
  - Property validation (required fields, type constraints)
  - String validation (minLength, maxLength, pattern)
  - Number validation (minimum, maximum, enum)
  - Array item validation with recursive support
  - Detailed error reporting with field paths
  - Validation report combining repair and schema errors
  - Functions: `validateSchema()`, `createValidationReport()`

### 🔧 Technical Improvements

- **New Modules**: `fields.ts` and `schema.ts` for advanced features
- **Enhanced Type System**: Added `JsonSchema`, `SchemaValidationResult`, `FieldExtractionResult` types
- **Improved Error Reporting**: Detailed validation errors with paths and expected/actual values
- **Backward Compatibility**: All v1.0.0 APIs remain unchanged and fully compatible
- **Type Safety**: Full TypeScript support with no `any` types in public APIs

### 📊 Test Coverage

- **Total Tests**: 122 (up from 94)
- **Test Suites**: 6/6 passing ✅
- **Field Extraction Tests**: 14 new tests
- **Schema Validation Tests**: 14 new tests
- **All Existing Tests**: Still passing ✅

### 📝 New Documentation

- JSDoc comments for all new field extraction functions
- JSDoc comments for all schema validation functions
- Comprehensive examples for field extraction
- Comprehensive examples for schema validation
- Type definitions for all new interfaces

### ✅ v2.0.0 Release Checklist

- [x] Field extraction API (v1.2.0)
- [x] Schema validation (v2.0.0)
- [x] Comprehensive test coverage
- [x] Type-safe implementations
- [x] Backward compatibility with v1.0.0
- [x] Zero breaking changes
- [x] Extended type definitions
- [x] Production-ready error handling

### 🚀 What's New

**Field Extraction:**
```typescript
import { extractField, fieldExists, getFieldOrDefault } from 'json-rescue';

// Extract a specific field
const result = extractField<string>(jsonText, 'user.name');
if (result.success) {
  console.log(result.value);
}

// Check if field exists
if (fieldExists(jsonText, 'user.email')) {
  console.log('Email field found');
}

// Get with default fallback
const name = getFieldOrDefault(jsonText, 'user.name', 'Unknown');
```

**Schema Validation:**
```typescript
import { validateSchema } from 'json-rescue';

const schema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'number', minimum: 1 },
    name: { type: 'string', minLength: 1 }
  }
};

const result = validateSchema(data, schema);
if (!result.valid) {
  console.log(result.errors);
}
```

### 🎯 Production Ready

v2.0.0 is production-ready with:
- Stable API for all features
- Comprehensive error handling
- Full TypeScript support
- Extensive test coverage (122 tests)
- Zero breaking changes from v1.0.0
- Optional features don't impact core functionality

---

## [1.0.0](https://github.com/azeemmirza/json-rescue/compare/0.2.2...1.0.0) (2026-02-20)

### ✨ Features

- **Stable API Contract**: Finalized and stable public API for production use
- **Comprehensive Repair Suite**: Complete set of repair strategies for common JSON defects
  - Trailing comma removal
  - JSONC comment removal (single and multi-line)
  - Smart quotes conversion
  - **NEW**: Single quote to double quote conversion
  - **NEW**: Unquoted key addition (converts `{key: value}` to `{"key": value}`)
  - **NEW**: Python literal conversion (True/False/None → true/false/null)

- **Candidate Scoring System**: Each result now includes a confidence score (0-1)
  - Perfect JSON (no repairs): score ≈ 1.0
  - JSON requiring repairs: score penalized by repair count and type
  - Failures: score = 0

- **Best Mode Selection**: New `mode: 'best'` option to automatically select highest-scoring candidate
  - Useful when multiple JSON candidates are found
  - Automatically chooses most reliable extraction

- **Convenience API**: New `rescueJsonAll()` function for easier multi-candidate extraction
  - Simpler alternative to `rescueJson(text, { mode: 'all' })`
  - Type-safe with full generic support

### 🔧 Technical Improvements

- **Enhanced Type Definitions**: Score field added to RescueResult
- **Improved Scoring Algorithm**: Takes into account repair count and text length
- **Comprehensive Test Suite**: 94 tests covering all features and edge cases
- **Zero Dependencies**: Remains dependency-free

### 📊 Test Coverage

- **Total Tests**: 94 (up from 56)
- **Test Suites**: 4/4 passing ✅
- **Extraction Tests**: 10 tests
- **Repair Tests**: 30 tests (15 new)
- **Integration Tests**: 54 tests (38 new)

### 📝 Documentation

All features are fully documented with:
- JSDoc comments for all public APIs
- TypeScript type definitions
- Usage examples
- Behavior guarantees

### ✅ v1.0.0 Release Checklist

- [x] All v0.1.0 core features
- [x] All v0.2.0 repair expansions
- [x] Candidate scoring system
- [x] Multiple extraction modes (first, all, best)
- [x] Stable issue codes and contract
- [x] Comprehensive test coverage
- [x] Type-safe APIs with generics
- [x] Production-ready error handling
- [x] Zero external dependencies

### 🚀 What's Included

**Core Extraction:**
- Markdown fence extraction (```json ... ```)
- String-aware balanced brace extraction
- Automatic candidate deduplication

**Automatic Repairs:**
- Trailing comma removal
- JSONC comment removal
- Smart quotes conversion
- Single quote conversion
- Unquoted key handling
- Python literal conversion

**Parsing & Results:**
- Generic type support for type-safe parsing
- Transparent repair reporting with issue codes
- Confidence scoring for result evaluation
- Multiple extraction modes for flexibility
- Detailed error messages

### 💡 Usage Example

```typescript
import { rescueJson, rescueJsonAll } from 'json-rescue';

// Simple usage (first valid result)
const result = rescueJson<MyType>(mixedText);
if (result.success) {
  console.log('Parsed:', result.data);
  console.log('Repairs:', result.issues);
}

// Get best result (highest confidence score)
const best = rescueJson<MyType>(mixedText, { mode: 'best' });

// Get all candidates
const all = rescueJsonAll<MyType>(mixedText);
```

### 🎯 Production Ready

This release marks json-rescue as production-ready with:
- Stable public API
- Comprehensive error handling
- Full TypeScript support
- Extensive test coverage
- Zero breaking changes planned for 1.x

---

## [0.2.1](https://github.com/azeemmirza/json-rescue/compare/0.2.0...0.2.1) (2026-02-20)
