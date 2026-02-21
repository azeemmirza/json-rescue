# json-rescue

 **Don’t just parse. Rescue it.**


## 1. Overview

### 1.1 Project Introduction

`json-rescue` is a TypeScript library built to **extract**, **repair**, and **parse** JSON from messy real-world text — including (but not limited to) LLM outputs. It is designed to be **deterministic**, **transparent** (repair reports), and **dependency-free**.

| Item | Value |
|------|-------|
| Package Name | `json-rescue` |
| Current Version | **1.0.0** (Stable Release) |
| License | MIT |
| Dependencies | Zero Dependency |
| Primary Goal | Recover strict JSON from mixed / malformed text safely |

### 1.2 Current Features (v1.0.0 - Production Ready)

- ✅ Extract JSON from Markdown code blocks (```json … ```)
- ✅ Extract JSON from plain text using balanced braces / brackets
- ✅ Auto-repair (trailing commas, JSONC comments, smart quotes, single quotes, unquoted keys, Python literals)
- ✅ TypeScript generics support with full type safety
- ✅ Multiple JSON extraction modes (`first`, `all`, `best`)
- ✅ Repair report (issues list with codes + metadata)
- ✅ Candidate scoring and confidence ranking
- ✅ Convenient API (`rescueJson` and `rescueJsonAll`)
- ⏳ Streaming / incremental extraction (planned for v1.1)
- ⏳ Field extraction without full parsing (planned for v1.2)
- ⏳ Schema validation (planned for v2.0)

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
| 1 | Deterministic extraction from mixed text | ⭐⭐⭐ Highest | ✅ v1.0.0 |
| 2 | Repair report with issue codes | ⭐⭐⭐ Highest | ✅ v1.0.0 |
| 3 | Safe auto-repair for common defects | ⭐⭐ High | ✅ v1.0.0 |
| 4 | Multiple JSON extraction (`all` and `best`) | ⭐⭐ High | ✅ v1.0.0 |
| 5 | Candidate scoring and best selection | ⭐⭐ Medium | ✅ v1.0.0 |
| 6 | Streaming/incremental parsing | ⭐ Medium | ⏳ v1.1+ |
| 7 | Field extraction API | ⭐ Low | ⏳ v1.2+ |

### 2.3 Expected Benefits

1. **Reliability**: Stop failing on minor JSON defects and mixed-text wrappers.
2. **Maintainability**: Replace ad-hoc regex parsing and “repair spaghetti.”
3. **Observability**: Every repair is logged in an `issues[]` report for debugging.
4. **Safety**: Avoid overly-permissive parsing with deterministic guardrails.
5. **Portability**: Zero dependency, works in Node and browser runtimes.

---

## 3. Implementation Status

`json-rescue` is at **v1.0.0** - Production Ready. All core features are complete and stable.

### 3.1 Version Roadmap (Completed)

```text
v0.1.0 (Core) → v0.2.0 → v0.3.0 → v1.0.0 → v1.1.0+
     │            │         │         │         │
     ▼            ▼         ▼         ▼         ▼
 Extract +     Repair     Multi +   Stable    Advanced
 Report        Expansion  Scoring   Contract  Features
 ```

### 3.2 Feature Status by Version

| Version | Feature | Status |
|--------:|---------|:------|
| v0.1.0 | Markdown fence extraction | ✅ v1.0.0 |
| v0.1.0 | Balanced brace extraction (string-aware) | ✅ v1.0.0 |
| v0.1.0 | Repairs: trailing commas, JSONC comments, smart quotes | ✅ v1.0.0 |
| v0.1.0 | Repair report (`issues[]`) | ✅ v1.0.0 |
| v0.2.0 | Repairs: single quotes, unquoted keys, Python literals | ✅ v1.0.0 |
| v0.2.0 | Candidate scoring (mode: `'best'`) | ✅ v1.0.0 |
| v0.3.0 | `rescueJsonAll()` convenience | ✅ v1.0.0 |
| v1.0.0 | Behavior contract + stable issue codes | ✅ v1.0.0 |
| v1.1.0 | Streaming / incremental candidate tracking | ⏳ Planned |
| v1.2.0 | Field extraction (optional, streaming-friendly) | ⏳ Planned |

# License
`json-rescue` is released under the **MIT License**.

# Author

This project is developed by **[Azeem Mirza](https://azeemmirza.co)** with ❤️.
