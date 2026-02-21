# json-rescue

[![npm version](https://img.shields.io/npm/v/json-rescue?style=flat-square&color=blue)](https://www.npmjs.com/package/json-rescue)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen?style=flat-square)](#)
[![Tests](https://img.shields.io/badge/Tests-122%2F122-brightgreen?style=flat-square)](#)
[![Coverage](https://img.shields.io/badge/Coverage-80%25-brightgreen?style=flat-square)](#)

**Don't just parse. Rescue it.**

## 1. Introduction

Picture this: Your LLM just returned a response. You need the JSON inside it. But there's prose wrapped around it. And trailing commas. And single quotes where double quotes belong. Your first instinct is to write a regex. Your second is to use JSON5. But you really want something **deterministic**, **transparent**, and **zero-dependency**.

`json-rescue` solves this problem. It **extracts** JSON candidates from mixed text, **repairs** common defects with full visibility, and **validates** results against schemas. Whether you're processing LLM outputs, scraping JSON-LD from HTML, or salvaging JSON from logs, `json-rescue` gives you reliable extraction with zero surprises.

### Key Characteristics

- **Extraction**: Find JSON in Markdown fences, plain text, or mixed content
- **Repair**: Auto-fix trailing commas, JSONC comments, quote issues, unquoted keys, Python literals
- **Validation**: Validate against JSON Schema (core features) with detailed error reporting
- **Field Extraction**: Get specific fields without parsing the entire JSON
- **Transparent**: Every change is logged with issue codes for auditing
- **Type-Safe**: Full TypeScript generics support, zero `any` types in public APIs
- **Zero Dependencies**: ~10 KB minified, works in Node and browsers

## 2. Features

### Core Extraction & Repair
- Extract JSON from **Markdown code blocks** (```json … ```)
- Extract JSON from **plain text** using balanced braces / brackets (string-aware)
- Auto-repair with **6 strategies**:
  - Trailing commas removal
  - JSONC comment removal
  - Smart quote conversion
  - Single-to-double quote conversion
  - Unquoted key handling
  - Python literal conversion
- **Multiple extraction modes**: `first`, `all`, `best` (confidence-ranked)
- **Transparent repair reports** with issue codes and metadata
- **Candidate scoring** (0–1 scale) with confidence ranking

### Field Extraction
- Extract specific fields using **dot-notation** (e.g., `user.profile.name`)
- Support for **nested objects** and **array indices** (e.g., `items.0.id`)
- Type-safe field extraction with generics
- Optional auto-repair for malformed JSON during extraction

### Schema Validation
- Validate against **JSON Schema** (core features)
- Type validation (object, array, string, number, boolean, null)
- Property validation (required fields, type constraints)
- String validation (pattern, minLength, maxLength)
- Number validation (minimum, maximum, enum)
- Recursive array item validation
- **Detailed error reporting** with field paths
- Combined repair + validation reports

### Additional
- Full **TypeScript generics** support with strict type safety
- **Zero dependencies** – ~10 KB minified
- Works in **Node.js** and **browsers**
- ⏳ Streaming / incremental extraction (planned for v2.1)
- ⏳ Advanced schema features (planned for v3.0)


## 3. Installation

### npm

```bash
npm install json-rescue
```

### yarn

```bash
yarn add json-rescue
```

### pnpm

```bash
pnpm add json-rescue
```

## 4. Quick Start

### Basic Usage: Rescue JSON from Mixed Text

```typescript
import { rescueJson } from 'json-rescue';

const mixedText = `
  Here's the API response:
  {
    "name": "John",
    "age": 30,
    "tags": ["developer", "typescript"],
  }
  Some more text after.
`;

const result = rescueJson(mixedText);

if (result.ok) {
  console.log(result.data);
  // Output: { name: 'John', age: 30, tags: ['developer', 'typescript'] }
  
  console.log(result.repairs);
  // Output: [{ type: 'trailing-comma-removal', field: 'root', ... }]
} else {
  console.log('No valid JSON found:', result.error);
}
```

### Extract All JSON Candidates

```typescript
import { rescueJsonAll } from 'json-rescue';

const text = `
  First: {"id": 1, "name": "Alice"}
  Second: {"id": 2, "name": "Bob",}
`;

const results = rescueJsonAll(text);
console.log(results.length); // 2
console.log(results[0].data); // { id: 1, name: 'Alice' }
console.log(results[1].data); // { id: 2, name: 'Bob' }
```

### Get the Best (Most Confident) Result

```typescript
import { rescueJson } from 'json-rescue';

const result = rescueJson(text, { mode: 'best' });
// Returns the single result with highest confidence score (0–1)
if (result.ok) {
  console.log(result.score); // 0.95 (example)
}
```

### Extract a Specific Field

```typescript
import { extractField } from 'json-rescue';

const jsonText = `
  {
    "user": {
      "profile": {
        "name": "Alice",
        "email": "alice@example.com"
      }
    }
  }
`;

const name = extractField<string>(jsonText, 'user.profile.name');
console.log(name.ok); // true
console.log(name.data); // "Alice"
```

### Validate Against a Schema

```typescript
import { rescueJson, validateSchema } from 'json-rescue';

const userSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', pattern: '^[^@]+@[^@]+$' }
  }
};

const result = rescueJson('{ "id": 1, "name": "Alice", "email": "alice@example.com" }');

if (result.ok) {
  const validation = validateSchema(result.data, userSchema);
  if (validation.ok) {
    console.log('✓ Valid');
  } else {
    console.log('✗ Validation errors:', validation.errors);
    // [{ field: 'email', message: 'Does not match pattern ^[^@]+@[^@]+$' }]
  }
}
```

### Combined Repair + Validation Report

```typescript
import { createValidationReport } from 'json-rescue';

const report = createValidationReport(
  '{"id": 1, "name": "Alice",}',
  userSchema
);

console.log(report.repaired); // true (trailing comma was fixed)
console.log(report.data); // { id: 1, name: 'Alice' }
console.log(report.repairs); // [{ type: 'trailing-comma-removal', ... }]
console.log(report.validation.ok); // true
```

---

## 5. Motivation & Design

This library addresses a real problem across many systems:

- JSON appears in **mixed text** (logs, HTML, Markdown, CLI output, LLM responses)
- It often contains **defects** (comments, trailing commas, single quotes, unquoted keys)
- Teams need a **reliable tool** that salvages JSON while keeping changes **auditable**

### Design Principles

1. **Deterministic**: Same input → same output, every time
2. **Transparent**: Every repair is logged with issue codes for debugging
3. **Safe**: Conservative auto-repair, never silently corrupt data
4. **Type-Safe**: Full TypeScript generics, zero `any` in public APIs
5. **Lightweight**: Zero dependencies, ~10 KB minified
6. **Practical**: Solves real problems (LLM outputs, scraping, logs)

## 6. Use Cases & Feedback

### 6.1 Typical Usage Scenarios

Teams commonly rely on combinations of:

- `JSON.parse` + regex extraction
- Permissive parsers (JSON5 / HJSON / custom)
- Fragile "fixers" that mutate input without explaining changes

**Common environments where this breaks:**

- LLM systems returning JSON inside prose or markdown
- Ingestion pipelines pulling embedded JSON from logs or documents
- Web scraping pipelines extracting JSON-LD or app state from HTML
- API responses with malformed JSON wrappers
- Log aggregation with JSON events embedded in text

### 6.2 Expected Benefits

| Benefit | Impact |
|---------|--------|
| **Reliability** | Stop failing on minor JSON defects and mixed-text wrappers |
| **Maintainability** | Replace ad-hoc regex parsing and "repair spaghetti" |
| **Observability** | Every repair is logged in an `issues[]` report for debugging |
| **Safety** | Avoid overly-permissive parsing with deterministic guardrails |
| **Portability** | Zero dependencies, works in Node.js and browser runtimes |

## 8. API Reference

### Core Functions

#### `rescueJson<T>(text: string, options?: RescueOptions): RescueResult<T>`

Extracts and repairs a single JSON object from text.

**Options:**
- `mode?: 'first' | 'all' | 'best'` (default: `'first'`)
- `repair?: boolean` (default: `true`)
- `maxCandidates?: number` (default: `10`)

**Returns:**
- `{ ok: true, data: T, score?: number, repairs: RepairIssue[] }`
- `{ ok: false, error: string }`

#### `rescueJsonAll<T>(text: string, options?: RescueOptions): RescueResult<T>[]`

Extracts all JSON candidates from text, sorted by confidence score.

#### `extractField<T>(text: string, field: string, options?: FieldExtractionOptions): FieldExtractionResult<T>`

Extracts a specific field using dot-notation without parsing the entire JSON.

**Supports:**
- Nested objects: `user.profile.name`
- Array indices: `items.0.id`
- Array shorthand: `items.[].id` (extracts all matching)

#### `validateSchema<T>(data: T, schema: JsonSchema): SchemaValidationResult`

Validates data against a JSON Schema (core features).

**Returns:**
- `{ ok: true }`
- `{ ok: false, errors: SchemaValidationError[] }`

#### `createValidationReport<T>(text: string, schema: JsonSchema): ValidationReport<T>`

Combined extraction + repair + validation in one call.

### Type Definitions

```typescript
interface RescueResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  score?: number;
  repairs: RepairIssue[];
}

interface RepairIssue {
  type: 'trailing-comma-removal' | 'jsonc-comment-removal' | 'smart-quote-conversion' | 'single-to-double-quote' | 'unquoted-key' | 'python-literal';
  field: string;
  before: string;
  after: string;
}

interface JsonSchema {
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
}

interface SchemaValidationError {
  field: string;
  message: string;
}

interface ValidationReport<T> {
  data: T;
  repaired: boolean;
  repairs: RepairIssue[];
  validation: SchemaValidationResult;
}
```

---

## 9. Real-World Examples

### Example 1: Parse LLM Response with Embedded JSON

```typescript
import { rescueJson } from 'json-rescue';

const llmResponse = `
Based on the query, here's the user data:
\`\`\`json
{
  "id": 123,
  "name": "Alice",
  "tags": ["admin", "developer"],
}
\`\`\`
Hope this helps!
`;

const result = rescueJson<{ id: number; name: string; tags: string[] }>(llmResponse);
if (result.ok) {
  console.log('User:', result.data.name);
  console.log('Repairs applied:', result.repairs.length);
}
```

### Example 2: Scrape JSON-LD from HTML

```typescript
import { rescueJsonAll } from 'json-rescue';

const htmlContent = `
<html>
  <head>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "type": "Article",
      "headline": "Sample Article",
      "author": {"name": "John",}
    }
    </script>
  </head>
</html>
`;

const results = rescueJsonAll(htmlContent);
if (results.length > 0) {
  console.log('Extracted structured data:', results[0].data);
}
```

### Example 3: Extract from Logs with Validation

```typescript
import { createValidationReport } from 'json-rescue';

const logLine = `[2024-01-15] Event: {"userId": 42, "action": "login", "timestamp": "2024-01-15T10:30:00Z",}`;

const schema = {
  type: 'object',
  required: ['userId', 'action'],
  properties: {
    userId: { type: 'number' },
    action: { type: 'string' },
    timestamp: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}' }
  }
};

const report = createValidationReport(logLine, schema);
if (report.validation.ok) {
  console.log('✓ Event is valid:', report.data);
} else {
  console.log('✗ Validation failed:', report.validation.errors);
}
```

---

## 9. Testing & Coverage

The project maintains comprehensive test coverage with 122 passing tests across all modules.

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch
```

### Coverage Reports

Generate and view code coverage reports:

```bash
# Generate coverage report and open interactive HTML view
npm run coverage

# Generate coverage report (text output in terminal)
npm run test:coverage

# Generate coverage report with verbose test output
npm run coverage:report
```

### Coverage Metrics

- **Statements**: 80% minimum threshold
- **Branches**: 80% minimum threshold
- **Functions**: 80% minimum threshold
- **Lines**: 80% minimum threshold

Reports are generated in multiple formats:
- **HTML**: Interactive report at `./coverage/index.html`
- **LCOV**: Standard format for CI/CD integration at `./coverage/lcov.info`
- **JSON**: Machine-readable metrics at `./coverage/coverage-final.json`

For detailed coverage documentation, see [COVERAGE.md](./COVERAGE.md).

---

## 10. Real-World Examples

---

## 12. Contributing

This project is developed and maintained by **[Azeem Mirza](https://azeemmirza.co)**.

Contributions, issues, and suggestions are welcome! Please refer to the [GitHub repository](https://github.com/azeemmirza/json-rescue) for contribution guidelines.

---

## 13. License

`json-rescue` is released under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

Made with ❤️ by [Azeem Mirza](https://azeemmirza.co)
