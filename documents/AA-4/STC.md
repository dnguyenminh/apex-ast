# Software Test Cases (STC)

## Salesforce AST Parser - AA-4: Deployment (WASM)

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-4 |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |

---

## Test Cases

### TC-001: WASM Build Success

| Step | Action | Expected |
|------|--------|----------|
| 1 | Run tree-sitter build --wasm | Exit code 0 |
| 2 | Check tree-sitter-apex.wasm | File exists |
| 3 | Check file size | < 1MB |

### TC-002: Language.load() Success

| Step | Action | Expected |
|------|--------|----------|
| 1 | Import { Parser, Language } | No error |
| 2 | await Parser.init() | Resolves |
| 3 | await Language.load(wasm) | Returns language object |

### TC-003: Parse with WASM

| Step | Action | Expected |
|------|--------|----------|
| 1 | parser.setLanguage(lang) | No error |
| 2 | parser.parse('public class X {}') | Returns tree |
| 3 | tree.rootNode.type | 'source_file' |

### TC-004: Output Consistency (Native vs WASM)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Parse same code with native | AST A |
| 2 | Parse same code with WASM | AST B |
| 3 | Compare AST A and B | Identical structure |

### TC-005: run_wasm.js Script

| Step | Action | Expected |
|------|--------|----------|
| 1 | node run_wasm.js test.cls | AST output printed |
| 2 | No errors in output | Clean execution |

---

## Traceability Matrix

| Requirement | Test Cases |
|-------------|------------|
| UC-01 (Build) | TC-001 |
| UC-02 (Runtime) | TC-002, TC-003, TC-005 |
| BR-02 (Size) | TC-001 |
| BR-04 (Named Exports) | TC-002 |
| BR-06 (Language.load) | TC-002 |
