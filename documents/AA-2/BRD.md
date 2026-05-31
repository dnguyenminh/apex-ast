# Business Requirements Document (BRD)

## Salesforce AST Parser — AA-2: Verify Project

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-2 |
| Title | Verify Project — Test nâng cao và Quy trình vá lỗi |
| Author | BA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## 1. Introduction

### 1.1 Scope

Mở rộng test coverage cho parser, đặc biệt SOQL nested queries. Thiết lập quy trình vá lỗi khi phát hiện cú pháp chưa support: ANTLR4 reference → AI translation → Tree-Sitter override. Regression testing cycle đảm bảo grammar changes không phá vỡ existing tests.

### 1.2 Out of Scope

- Native binding build (AA-3)
- WASM build (AA-4)

### 1.3 Preliminary Requirement

- AA-1 hoàn thành (project initialized, basic test pass)

---

## 2. Business Requirements

### 2.1 High Level Process Map

1. Tạo test cases nâng cao (SOQL nested, DML, triggers)
2. Chạy tests → phát hiện ERROR nodes
3. Tra cứu ANTLR4 grammar (forcedotcom/apex-parser)
4. Dịch rule sang Tree-Sitter format (AI-assisted)
5. Thêm override vào grammar.js
6. Re-generate + re-test (regression cycle)

### 2.2 List of User Stories / Use Cases

| # | Story / Use Case | Priority | Source |
|---|------------------|----------|--------|
| 1 | Là developer, tôi muốn test SOQL nested queries | MUST HAVE | AA-2 |
| 2 | Là developer, tôi muốn có quy trình vá lỗi grammar rõ ràng | MUST HAVE | AA-2 |
| 3 | Là developer, tôi muốn regression testing tự động | MUST HAVE | AA-2 |
| 4 | Là developer, tôi muốn phát hiện ERROR nodes chính xác | SHOULD HAVE | AA-2 |

---

### 2.3 Details of User Stories

#### STORY 1: SOQL Nested Query Testing

> Là developer, tôi muốn test SOQL nested queries để đảm bảo parser handle đúng

**Acceptance Criteria:**

1. Tất cả SOQL test cases pass (0 ERROR nodes)
2. AST có đúng node types: query_expression, soql_query_body, subquery
3. Nested queries parse đúng cấu trúc parent-child

#### STORY 2: Quy trình vá lỗi Grammar

> Là developer, tôi muốn có quy trình vá lỗi rõ ràng khi phát hiện cú pháp thiếu

**Acceptance Criteria:**

1. Quy trình documented (ANTLR4 → AI → Tree-Sitter)
2. Mỗi patch có test case đi kèm
3. Regression tests pass 100% sau mỗi patch

#### STORY 3: Regression Testing

> Là developer, tôi muốn regression testing tự động sau mỗi grammar change

**Acceptance Criteria:**

1. `npm run test` pass 100% trước mỗi commit
2. Có ít nhất 10+ corpus test cases
3. Coverage: class, method, SOQL, DML, triggers, control flow

---

## 3. Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| AA-1 | Prerequisite | Project initialized |
| forcedotcom/apex-parser | Reference | ANTLR4 grammar |

---

## 4. Risks and Assumptions

### 4.1 Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| ANTLR4 rule không dịch được sang Tree-Sitter | High | Medium | AI-assisted, manual fallback |
| Grammar conflict khi thêm override | Medium | Medium | Incremental changes |
| Regression break | High | Low | Automated test before commit |

### 4.2 Assumptions

- ANTLR4 grammar từ forcedotcom là reference chính xác
- AI translation cho kết quả đúng 80%+ cases
