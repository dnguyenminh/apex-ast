# Functional Specification Document (FSD)

## Salesforce AST Parser — AA-2: Verify Project

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-2 |
| Title | Verify Project — Đặc tả chức năng |
| Author | BA Agent + TA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related BRD | documents/AA-2/BRD.md |

---

## 1. Introduction

### 1.1 Purpose

Đặc tả chức năng cho quy trình verify parser với test nâng cao và quy trình vá lỗi grammar.

---

## 2. Functional Requirements

### 2.1 Feature: SOQL Advanced Testing

#### 2.1.1 Use Case

**Use Case ID:** UC-01
**Actor:** Developer
**Preconditions:** Parser generated (AA-1 done)
**Postconditions:** All SOQL tests pass

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Tạo test file soql_queries.txt | | Corpus test |
| 2 | Viết SOQL test cases | | Basic, nested, aggregate |
| 3 | Chạy `npm run test` | | Execute tests |
| 4 | | Parse SOQL syntax | Generate AST |
| 5 | | Compare with expected | Pass/fail |

**Exception Flows:**

| ID | Condition | Steps |
|----|-----------|-------|
| EF-1 | ERROR node in SOQL | Trigger patch process (UC-02) |

#### 2.1.2 Business Rules

| Rule ID | Rule | Source |
|---------|------|--------|
| BR-01 | SOQL trong [...] PHẢI parse thành query_expression | BRD Story 1 |
| BR-02 | Subquery PHẢI parse thành nested node | BRD Story 1 |
| BR-03 | 0 ERROR nodes cho valid SOQL | BRD Story 1 |

---

### 2.2 Feature: Grammar Patch Process

#### 2.2.1 Use Case

**Use Case ID:** UC-02
**Actor:** Developer
**Preconditions:** ERROR node detected in test
**Postconditions:** Grammar patched, all tests pass

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Identify ERROR node | | From test output |
| 2 | Find ANTLR4 rule | | forcedotcom/apex-parser |
| 3 | Translate to Tree-Sitter | | AI-assisted |
| 4 | Add override to grammar.js | | In rules: {} |
| 5 | Run `npm run generate` | | Regenerate parser |
| 6 | Run `npm run test` | | Verify fix + regression |

**Alternative Flows:**

| ID | Condition | Steps |
|----|-----------|-------|
| AF-1 | AI translation incorrect | Manual translation |
| AF-2 | Conflict after override | Adjust precedence |

#### 2.2.2 Business Rules

| Rule ID | Rule | Source |
|---------|------|--------|
| BR-04 | Mỗi patch PHẢI có test case đi kèm | BRD Story 2 |
| BR-05 | Regression tests PHẢI pass 100% sau patch | BRD Story 3 |
| BR-06 | Override KHÔNG được conflict với upstream | Design principle |

---

### 2.3 Feature: Error Detection Script

#### 2.3.1 Use Case

**Use Case ID:** UC-03
**Actor:** Developer
**Preconditions:** Parser available (native or WASM)
**Postconditions:** Error report generated

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Provide Apex source file | | .cls or .trigger |
| 2 | | Parse source | Generate AST |
| 3 | | Traverse tree | Find ERROR/MISSING nodes |
| 4 | | Report errors | Line, column, text |

#### 2.3.2 Data Specifications

**Error Report Output:**

| Field | Type | Description |
|-------|------|-------------|
| type | String | "ERROR" or "MISSING" |
| line | Number | Line number (1-indexed) |
| column | Number | Column number |
| text | String | Source text at error |

---

## 3. Test Cases Required

| # | Test File | Content | Priority |
|---|-----------|---------|----------|
| 1 | soql_queries.txt | Basic + nested SOQL | High |
| 2 | dml_statements.txt | insert, update, delete, upsert | High |
| 3 | triggers.txt | Trigger declarations | High |
| 4 | control_flow.txt | if/else, for, while | High |
| 5 | interfaces.txt | Interface declarations | Medium |
| 6 | enums.txt | Enum declarations | Medium |
| 7 | annotations.txt | @isTest, @AuraEnabled | Medium |
| 8 | try_catch.txt | Exception handling | Medium |

---

## 4. Patch Process Diagram

```
ERROR detected in test
       |
       v
Identify missing syntax
       |
       v
Search ANTLR4 grammar (forcedotcom/apex-parser)
       |
       v
Translate rule (AI-assisted)
       |
       v
Add to grammar.js rules: {}
       |
       v
npm run generate
       |
       v
npm run test --> PASS? --> Done
       |              
       v (FAIL)       
Investigate + fix (loop back)
```
