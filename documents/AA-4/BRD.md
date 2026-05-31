# Business Requirements Document (BRD)

## Salesforce AST Parser - AA-4: Deployment (WASM)

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-4 |
| Title | Deployment - WASM Build |
| Author | BA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## 1. Introduction

### 1.1 Scope

Build WebAssembly binary tu parser.c, su dung web-tree-sitter API moi (Named Exports), tao run_wasm.js script de parse Apex code bang WASM runtime.

### 1.2 Preliminary Requirement

- AA-1 hoan thanh (parser.c generated)
- Emscripten SDK cai dat (cho WASM compilation)

---

## 2. Business Requirements

### 2.1 User Stories

| # | Story | Priority |
|---|-------|----------|
| 1 | Build WASM binary thanh cong | MUST HAVE |
| 2 | Su dung Named Exports API (Parser, Language) | MUST HAVE |
| 3 | run_wasm.js parse Apex thanh cong | MUST HAVE |
| 4 | WASM output consistent voi native | SHOULD HAVE |
| 5 | File size < 1MB | SHOULD HAVE |

### 2.2 Acceptance Criteria

1. tree-sitter build --wasm thanh cong
2. File tree-sitter-apex.wasm ton tai va < 1MB
3. Language.load() thanh cong (khong dung Parser.Language.load)
4. parser.parse() tra ve AST giong native
5. run_wasm.js chay duoc trong Node.js

---

## 3. Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| web-tree-sitter ^0.26.9 | Runtime | WASM runtime |
| Emscripten | Build Tool | C to WASM compiler |
| tree-sitter-cli | Build Tool | WASM build command |

---

## 4. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Emscripten not installed | High | Document install steps |
| API breaking changes | Medium | Pin web-tree-sitter version |
| WASM size > 1MB | Low | Optimize build flags |
