# Functional Specification Document (FSD)

## Salesforce AST Parser - AA-4: Deployment (WASM)

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-4 |
| Title | Deployment WASM - Dac ta chuc nang |
| Author | BA Agent + TA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## 1. Functional Requirements

### 1.1 Feature: WASM Build

**Use Case ID:** UC-01
**Actor:** Developer
**Preconditions:** parser.c exists, Emscripten available
**Postconditions:** tree-sitter-apex.wasm created

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Run tree-sitter build --wasm | | Trigger WASM build |
| 2 | | Compile C to WASM | Emscripten |
| 3 | | Output .wasm file | tree-sitter-apex.wasm |

**Business Rules:**

| Rule ID | Rule |
|---------|------|
| BR-01 | Output file = tree-sitter-apex.wasm |
| BR-02 | File size < 1MB |
| BR-03 | Compatible with web-tree-sitter 0.26.9+ |

### 1.2 Feature: WASM Runtime (run_wasm.js)

**Use Case ID:** UC-02
**Actor:** Developer
**Preconditions:** .wasm file exists
**Postconditions:** AST parsed successfully

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Import web-tree-sitter | | Named Exports |
| 2 | | Parser.init() | Initialize runtime |
| 3 | Create parser | | new Parser() |
| 4 | | Language.load(wasm) | Load language |
| 5 | Set language | | parser.setLanguage(lang) |
| 6 | Parse source | | parser.parse(code) |

**Business Rules:**

| Rule ID | Rule |
|---------|------|
| BR-04 | MUST use Named Exports: { Parser, Language } |
| BR-05 | MUST call Parser.init() before any operation |
| BR-06 | Use Language.load() NOT Parser.Language.load() |

---

## 2. API Contract

### 2.1 WASM API (web-tree-sitter)

`javascript
const { Parser, Language } = require('web-tree-sitter');
await Parser.init();
const parser = new Parser();
const lang = await Language.load('tree-sitter-apex.wasm');
parser.setLanguage(lang);
const tree = parser.parse(sourceCode);
`

### 2.2 Output Consistency

| Property | Native | WASM | Must Match |
|----------|--------|------|------------|
| rootNode.type | source_file | source_file | Yes |
| node.type | Same | Same | Yes |
| node.text | Same | Same | Yes |
| node.startPosition | Same | Same | Yes |
| node.childCount | Same | Same | Yes |
