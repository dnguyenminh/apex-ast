# Software Test Plan (STP)

## Salesforce AST Parser — AA-1: Project Initialize

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-1 |
| Title | Project Initialize — Kế hoạch kiểm thử |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related BRD | documents/AA-1/BRD.md |
| Related FSD | documents/AA-1/FSD.md |
| Related TDD | documents/AA-1/TDD.md |

---

## 1. Introduction

### 1.1 Purpose

Kế hoạch kiểm thử cho phase khởi tạo project, đảm bảo project structure đúng chuẩn, grammar inheritance hoạt động, parser generate thành công, và test infrastructure sẵn sàng.

### 1.2 Test Objectives

- Verify project initialization thành công trên multiple platforms
- Validate grammar inheritance mechanism hoạt động
- Đảm bảo parser generation không lỗi
- Verify test corpus framework hoạt động

---

## 2. Test Strategy

### 2.1 Test Levels

| Level | Scope | Tools | Responsibility |
|-------|-------|-------|---------------|
| Smoke Test | npm install + generate | CLI | Developer |
| Unit (Corpus) | Basic class parsing | tree-sitter test | Developer |
| Integration | Full pipeline (install, generate, test) | npm scripts | CI/CD |

### 2.2 Test Types

| Type | Description | Applicable |
|------|-------------|------------|
| Functional | Verify generate + test commands work | Yes |
| Regression | Ensure sfapex grammar still works after setup | Yes |
| Compatibility | Cross-platform (Win/Mac/Linux) | Yes |

### 2.3 Entry/Exit Criteria

| Level | Entry | Exit |
|-------|-------|------|
| Smoke | Node.js installed | npm install success |
| Corpus | parser.c generated | All corpus tests pass |
| Integration | Full setup complete | End-to-end pipeline pass |

---

## 3. Test Scope

### 3.1 In Scope

| # | Feature | Priority | Reference |
|---|---------|----------|-----------|
| 1 | npm install success | High | UC-01 |
| 2 | Grammar require resolution | High | UC-02 |
| 3 | tree-sitter generate success | High | UC-03 |
| 4 | Corpus test pass | High | UC-04 |
| 5 | Generated files exist | High | UC-03 |

### 3.2 Out of Scope

- Native binding build (AA-3)
- WASM build (AA-4)
- Advanced SOQL parsing (AA-2)

---

## 4. Test Environment

| Environment | OS | Tools |
|-------------|-----|-------|
| Dev (Primary) | Windows 11 | Node.js 20+, npm 10+ |
| CI | Linux (Ubuntu) | Node.js 20+, npm 10+ |
| Alt | macOS | Node.js 20+, npm 10+ |

---

## 5. Test Metrics

| Metric | Target |
|--------|--------|
| Execution Rate | 100% |
| Pass Rate | 100% |
| Generate Time | < 30s |
| Test Execution Time | < 5s |

---

## 6. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| sfapex version incompatible | High | Pin version in package.json |
| Platform-specific path issues | Medium | Use path.join, test on multiple OS |
| Network issues during npm install | Low | Use npm cache, offline mirror |
