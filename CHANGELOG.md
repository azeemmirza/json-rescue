# Changelog

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
