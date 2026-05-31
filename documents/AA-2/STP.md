# Software Test Plan (STP)

## Salesforce AST Parser — AA-2: Verify Project

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-2 |
| Title | Verify Project — Kế hoạch kiểm thử |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## 1. Test Objectives

- Verify SOQL nested queries parse chính xác
- Validate grammar patch process hoạt động
- Đảm bảo regression testing catch breaks
- Verify error detection script report đúng

---

## 2. Test Strategy

### 2.1 Test Levels

| Level | Scope | Tools |
|-------|-------|-------|
| Unit (Corpus) | Individual syntax constructs | tree-sitter test |
| Integration | Error detection script | Node.js + native binding |
| Regression | Full corpus after each change | tree-sitter test |

### 2.2 Entry/Exit Criteria

| Level | Entry | Exit |
|-------|-------|------|
| Corpus | parser.c generated | All tests pass |
| Integration | Native binding built | Error script works |
| Regression | Grammar changed | 100% pass rate |

---

## 3. Test Scope

### 3.1 In Scope

| # | Feature | Priority |
|---|---------|----------|
| 1 | SOQL basic queries | High |
| 2 | SOQL nested/subqueries | High |
| 3 | DML statements (6 types) | High |
| 4 | Trigger declarations | High |
| 5 | Control flow statements | High |
| 6 | Error detection accuracy | High |
| 7 | Regression after patch | High |

### 3.2 Out of Scope

- Native binding build process (AA-3)
- WASM build process (AA-4)
- Performance benchmarks

---

## 4. Test Metrics

| Metric | Target |
|--------|--------|
| Corpus Test Count | >= 27 |
| Pass Rate | 100% |
| ERROR nodes in valid code | 0 |
| Regression after patch | 0 failures |
