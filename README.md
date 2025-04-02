# json-rescue

 **Don’t just parse. Rescue it.**


## 1. Overview

### 1.1 Project Introduction

`json-rescue` is a TypeScript library built to **extract**, **repair**, and **parse** JSON from messy real-world text — including (but not limited to) LLM outputs. It is designed to be **deterministic**, **transparent** (repair reports), and **dependency-free**.

| Item | Value |
|------|-------|
| Package Name | `json-rescue` |
| Target Version | 0.1.0 (Initial public release) |
| License | MIT |
| Dependencies | Zero Dependency |
| Primary Goal | Recover strict JSON from mixed / malformed text safely |

### 1.2 Current Features (Planned for Initial Releases)

- ✅ Extract JSON from Markdown code blocks (```json … ```)
- ✅ Extract JSON from plain text using balanced braces / brackets
- ✅ Auto-repair (trailing commas, comments, smart quotes; more planned)
- ✅ TypeScript generics support
- ✅ Multiple JSON extraction (`mode: 'all'`)
- ✅ Repair report (issues list with codes + metadata)
- ⏳ Streaming / incremental extraction (planned)
- ⏳ Field extraction without full parsing (planned)
- ⏳ Schema validation (explicitly out-of-scope for early versions; optional later)

### 1.3 Proposal Background

This proposal is driven by a consistent pattern across systems:

- JSON appears inside **mixed text** (logs, HTML, Markdown, CLI output, vendor payloads, LLM responses).
- It often contains **non-JSON defects** (comments, trailing commas, single quotes).
- Teams want a **single reliable tool** that can salvage JSON while keeping changes **auditable**.

---

## 2. User Feedback Summary

### 2.1 Current Usage Environment

Teams commonly rely on combinations of:

- `JSON.parse` + regex extraction
- permissive parsers (JSON5 / HJSON / custom)
- fragile “fixers” that mutate input without explaining changes

Typical environments where this breaks:

- LLM systems returning JSON inside prose or markdown
- ingestion pipelines pulling embedded JSON from logs or documents
- web scraping pipelines extracting JSON-LD or app state from HTML

### 2.2 Feature Requests (Priority Order)

| Priority | Feature | Importance | Status |
|----------|---------|------------|--------|
| 1 | Deterministic extraction from mixed text | ⭐⭐⭐ Highest | ✅ Planned (v0.1.0) |
| 2 | Repair report with issue codes | ⭐⭐⭐ Highest | ✅ Planned (v0.1.0) |
| 3 | Safe auto-repair for common defects | ⭐⭐ High | ✅ Planned (v0.1.0 → v0.2.0) |
| 4 | Multiple JSON extraction (`all`) | ⭐⭐ High | ✅ Planned (v0.1.0/v0.2.0) |
| 5 | Candidate scoring (`best`) | ⭐⭐ Medium | ✅ Planned (v0.2.0) |
| 6 | Streaming/incremental parsing | ⭐ Medium | ⏳ Planned (v0.4.0) |
| 7 | Field extraction API | ⭐ Low | ⏳ Planned (v0.4.0) |

### 2.3 Expected Benefits

1. **Reliability**: Stop failing on minor JSON defects and mixed-text wrappers.
2. **Maintainability**: Replace ad-hoc regex parsing and “repair spaghetti.”
3. **Observability**: Every repair is logged in an `issues[]` report for debugging.
4. **Safety**: Avoid overly-permissive parsing with deterministic guardrails.
5. **Portability**: Zero dependency, works in Node and browser runtimes.

---

## 3. Implementation Status

`json-rescue` is designed to ship fast in a staged roadmap, prioritizing the stable core first.

### 3.1 Version Roadmap (Planned)

```text
v0.1.0 (Core) → v0.2.0 → v0.3.0 → v0.4.0 → v1.0.0
     │            │         │         │         │
     ▼            ▼         ▼         ▼         ▼
 Extract +     Repair     Multi +   Streaming  Stable
 Report        Expansion  Scoring   + Fields   Contract
 ```

 ## 3.2 Planned Features by Version

| Version | Feature | Status |
|--------:|---------|:------|
| v0.1.0 | Markdown fence extraction | ✅ Planned |
| v0.1.0 | Balanced brace extraction (string-aware) | ✅ Planned |
| v0.1.0 | Repairs: trailing commas, JSONC comments, smart quotes | ✅ Planned |
| v0.1.0 | Repair report (`issues[]`) | ✅ Planned |
| v0.2.0 | Repairs: single quotes, unquoted keys, Python literals | ⏳ Planned |
| v0.2.0 | Candidate scoring (mode: `'best'`) | ⏳ Planned |
| v0.3.0 | `rescueJsonAll()` convenience | ⏳ Planned |
| v0.4.0 | Streaming / incremental candidate tracking | ⏳ Planned |
| v0.4.0 | Field extraction (optional, streaming-friendly) | ⏳ Planned |
| v1.0.0 | Behavior contract + stable issue codes | ⏳ Planned |

# License
`json-rescue` is released under the **MIT License**.

# Author

This project is developed by **[Azeem Mirza](https://azeemmirza.co)** with ❤️.
