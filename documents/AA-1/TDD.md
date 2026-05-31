# Technical Design Document (TDD)

## Salesforce AST Parser — AA-1: Project Initialize

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-1 |
| Title | Project Initialize — Thiết kế kỹ thuật |
| Author | SA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related BRD | documents/AA-1/BRD.md |
| Related FSD | documents/AA-1/FSD.md |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-27 | SA Agent | Khởi tạo tài liệu |

---

## 1. Introduction

### 1.1 Purpose

Thiết kế kỹ thuật chi tiết cho việc khởi tạo project Tree-Sitter Apex Parser, bao gồm project structure, build configuration, grammar inheritance mechanism, và test infrastructure.

### 1.2 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20+ |
| Language | JavaScript (Grammar DSL) | ES2020 |
| Generated Code | C | C11 |
| CLI Tool | tree-sitter-cli | 0.26.9 |
| Package Manager | npm | 10+ |
| Source Grammar | tree-sitter-sfapex | 3.0.0 |

### 1.3 Design Principles

- **Inheritance over Fork**: Kế thừa grammar, không fork
- **Convention over Configuration**: Theo chuẩn Tree-Sitter project structure
- **Minimal Setup**: Ít bước nhất để có parser hoạt động

---

## 2. System Architecture

### 2.1 Architecture Overview

```
PROJECT ROOT
├── grammar.js          ← Entry point (inherits sfapex)
├── tree-sitter.json    ← Parser metadata
├── package.json        ← npm config + scripts
├── sfapex-source/      ← Upstream grammar (git clone)
│   └── apex/grammar.js
├── src/                ← Generated (DO NOT EDIT)
│   ├── parser.c
│   ├── grammar.json
│   ├── node-types.json
│   └── tree_sitter/parser.h
└── test/corpus/        ← Test cases
    └── basic_class.txt
```

### 2.2 Build Pipeline

![Build Pipeline](diagrams/build-pipeline.png)

```
grammar.js ──require──> sfapex-source/apex/grammar.js
     |
     v (tree-sitter generate)
src/parser.c + src/tree_sitter/parser.h + src/grammar.json + src/node-types.json
```

---

## 3. Module Design

### 3.1 package.json Configuration

```json
{
  "name": "salesforce-ast",
  "version": "1.0.0",
  "description": "Salesforce Apex AST Parser using Tree-Sitter",
  "main": "index.js",
  "scripts": {
    "generate": "tree-sitter generate",
    "test": "tree-sitter test"
  },
  "devDependencies": {
    "tree-sitter-cli": "^0.26.9",
    "tree-sitter-sfapex": "^3.0.0"
  },
  "dependencies": {
    "tree-sitter": "^0.25.0"
  }
}
```

### 3.2 grammar.js Pattern

```javascript
const apexGrammar = require('./sfapex-source/apex/grammar.js');

module.exports = grammar(apexGrammar, {
  name: 'apex',
  rules: {
    // Override/extend rules here
    // Empty = inherit 100% from sfapex
  }
});
```

**Critical:** `name: 'apex'` PHẢI khớp với:
- tree-sitter.json grammars[0].name
- binding.gyp target_name suffix
- Export symbol: `tree_sitter_apex`

### 3.3 tree-sitter.json

```json
{
  "grammars": [
    {
      "name": "apex",
      "camelCase": "apex",
      "scope": "source.apex",
      "path": ".",
      "file-types": ["cls", "trigger"]
    }
  ]
}
```

### 3.4 Test Corpus Format

```
==================
Basic Class Declaration
==================

public class MyClass {
}

---

(source_file
  (class_declaration
    (modifiers
      (modifier))
    name: (identifier)
    body: (class_body)))
```

---

## 4. Build Configuration

### 4.1 npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| generate | `tree-sitter generate` | Grammar to C parser |
| test | `tree-sitter test` | Run corpus tests |

### 4.2 File Generation

Khi chạy `tree-sitter generate`, CLI tạo:

| File | Size | Purpose |
|------|------|---------|
| src/parser.c | ~500KB | Main parser implementation |
| src/tree_sitter/parser.h | ~5KB | Parser API header |
| src/grammar.json | ~200KB | Grammar rules in JSON |
| src/node-types.json | ~50KB | All node type definitions |

---

## 5. Implementation Checklist

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | package.json | Create | Project config với scripts |
| 2 | sfapex-source/ | Clone | `git clone` tree-sitter-sfapex |
| 3 | grammar.js | Create | Grammar inheritance file |
| 4 | tree-sitter.json | Create | Parser metadata |
| 5 | src/parser.c | Generate | `npm run generate` |
| 6 | test/corpus/basic_class.txt | Create | First test case |
| 7 | .gitignore | Create | Ignore node_modules, build |

---

## 6. Verification Steps

| Step | Command | Expected |
|------|---------|----------|
| 1 | `npm install` | Exit 0, node_modules created |
| 2 | `npm run generate` | Exit 0, src/parser.c created |
| 3 | `npm run test` | Exit 0, all tests pass |
| 4 | Check src/parser.c size | > 100KB |
| 5 | Check src/node-types.json | Contains 'class_declaration' |
