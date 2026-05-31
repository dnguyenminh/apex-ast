# Software Test Plan (STP)

## Salesforce Apex AST Parser — AA: Kế hoạch kiểm thử

---

## Document Information

| Field | Value |
|-------|-------|
| Project | AA (Salesforce Apex AST Parser) |
| Title | Kế hoạch kiểm thử bộ phân tích cú pháp Salesforce Apex |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related BRD | documents/AA/BRD.md |
| Related FSD | documents/AA/FSD.md |
| Related TDD | documents/AA/TDD.md |

---

## 1. Introduction

### 1.1 Purpose

Kế hoạch kiểm thử cho bộ Salesforce Apex AST Parser, đảm bảo parser hoạt động chính xác cho tất cả cú pháp Apex được hỗ trợ.

### 1.2 Test Objectives

- Verify parser nhận diện đúng tất cả Apex constructs
- Validate error recovery cho invalid syntax
- Đảm bảo consistency giữa Native và WASM output
- Verify regression — grammar changes không phá vỡ existing tests

---

## 2. Test Strategy

### 2.1 Test Levels

| Level | Scope | Tools | Responsibility |
|-------|-------|-------|---------------|
| Unit (Corpus) | Individual syntax constructs | tree-sitter test | Developer |
| Integration | Native binding load + parse | node run_parser.js | Developer |
| Integration | WASM load + parse | node run_wasm.js | Developer |
| System | Full pipeline (generate, build, test) | npm scripts | CI/CD |

### 2.2 Test Types

| Type | Description | Applicable |
|------|-------------|------------|
| Functional | Verify AST output cho valid Apex | Yes |
| Negative | Verify ERROR nodes cho invalid Apex | Yes |
| Regression | New rules don't break old tests | Yes |
| Performance | Parse time benchmarks | Yes |
| Compatibility | Cross-platform | Yes |

### 2.3 Test Approach

- **Primary**: Tree-Sitter corpus tests (automated, declarative)
- **Secondary**: Script-based integration tests
- **Tertiary**: Manual verification cho edge cases

### 2.4 Entry/Exit Criteria

| Level | Entry | Exit |
|-------|-------|------|
| Corpus | generate success | 100% pass |
| Integration | .node exists | Parse success |
| WASM | .wasm exists | Output matches native |

---

## 3. Test Scope

### 3.1 In Scope

| # | Feature | Priority | Reference |
|---|---------|----------|-----------|
| 1 | Class declarations | High | UC-02 |
| 2 | Method declarations | High | UC-02 |
| 3 | Variable declarations | High | UC-02 |
| 4 | Control flow | High | UC-02 |
| 5 | DML statements | High | UC-02 |
| 6 | SOQL/SOSL | High | UC-02 |
| 7 | Triggers | High | UC-02 |
| 8 | Interfaces | Medium | UC-02 |
| 9 | Enums | Medium | UC-02 |
| 10 | Annotations | Medium | UC-02 |
| 11 | Try/catch | Medium | UC-02 |
| 12 | Error recovery | High | UC-04 |
| 13 | Native binding | High | UC-02 |
| 14 | WASM runtime | High | UC-03 |

### 3.2 Out of Scope

- LWC parsing
- Semantic analysis
- Multi-language bindings (Python, Rust, etc.)

---

## 4. Test Environment

| Environment | OS | Tools |
|-------------|-----|-------|
| Dev | Windows 11 | Node.js 20+, VS Build Tools |
| CI | Linux | Node.js 20+, GCC |

---

## 5. Test Metrics

| Metric | Target |
|--------|--------|
| Execution Rate | 100% |
| Pass Rate | 100% |
| Syntax Coverage | All major constructs |
| Parse Time | < 100ms / 1000 lines |

---

## 6. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Grammar upstream changes | High | Pin version |
| Platform-specific failures | Medium | Multi-OS test |
| AST format changes | Medium | Regenerate expected |
