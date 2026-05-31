# Functional Specification Document (FSD)

## Salesforce AST Parser — AA-1: Project Initialize

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-1 |
| Title | Project Initialize — Đặc tả chức năng |
| Author | BA Agent + TA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related BRD | documents/AA-1/BRD.md |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-27 | BA + TA Agent | Khởi tạo tài liệu |

---

## 1. Introduction

### 1.1 Purpose

Đặc tả chi tiết chức năng khởi tạo project Tree-Sitter Apex Parser, bao gồm cấu hình project, grammar inheritance, parser generation, và test infrastructure.

### 1.2 Scope

- Khởi tạo Node.js project structure
- Cấu hình grammar.js kế thừa sfapex
- Generate parser.c từ grammar
- Thiết lập test corpus framework

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|------------|
| Tree-Sitter | Framework tạo parser incremental |
| Grammar | Tập rules định nghĩa cú pháp ngôn ngữ |
| Corpus Test | File test theo format chuẩn Tree-Sitter |
| S-expression | Biểu diễn text của AST tree |

---

## 2. System Overview

### 2.1 System Context

**Actors:**
- Developer: Người khởi tạo và cấu hình project

**External Systems:**
- tree-sitter-sfapex: Nguồn grammar gốc (upstream)
- npm registry: Package manager
- tree-sitter-cli: Code generation tool

### 2.2 System Architecture

```
Developer
    |
    v
package.json (npm scripts)
    |
    +-- npm run generate --> tree-sitter-cli --> grammar.js --> src/parser.c
    |
    +-- npm run test --> tree-sitter test --> test/corpus/*.txt
    |
    v
grammar.js
    |
    v (require)
sfapex-source/apex/grammar.js
```

---

## 3. Functional Requirements

### 3.1 Feature: Project Initialization

#### 3.1.1 Use Case

**Use Case ID:** UC-01
**Actor:** Developer
**Preconditions:** Node.js 20+ cài đặt, Git available
**Postconditions:** Project structure hoàn chỉnh, dependencies installed

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Chạy `npm init` | | Tạo package.json |
| 2 | Chạy `npm install` | | Cài dependencies |
| 3 | | Tải tree-sitter-cli | devDependency |
| 4 | | Tải tree-sitter | runtime dependency |
| 5 | Clone sfapex-source | | Git clone |

**Exception Flows:**

| ID | Condition | Steps |
|----|-----------|-------|
| EF-1 | npm install fail | Kiểm tra Node.js version, network |
| EF-2 | Git clone fail | Kiểm tra Git, network, URL |

#### 3.1.2 Business Rules

| Rule ID | Rule | Source |
|---------|------|--------|
| BR-01 | package.json PHẢI có scripts: generate, test | BRD Story 1 |
| BR-02 | tree-sitter-cli version >= 0.26.9 | BRD Dependencies |

---

### 3.2 Feature: Grammar Configuration

#### 3.2.1 Use Case

**Use Case ID:** UC-02
**Actor:** Developer
**Preconditions:** sfapex-source đã clone
**Postconditions:** grammar.js configured, ready to generate

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Tạo grammar.js | | File tại project root |
| 2 | Viết require statement | | `require('./sfapex-source/apex/grammar.js')` |
| 3 | Export grammar object | | `module.exports = grammar(apexGrammar, {...})` |
| 4 | Set name = 'apex' | | Khớp với tree-sitter.json |
| 5 | Tạo tree-sitter.json | | Parser metadata |

#### 3.2.2 Business Rules

| Rule ID | Rule | Source |
|---------|------|--------|
| BR-03 | Grammar name PHẢI là 'apex' | BRD Story 2 |
| BR-04 | grammar.js PHẢI require đúng path sfapex | BRD Story 2 |
| BR-05 | tree-sitter.json scope PHẢI là 'source.apex' | Tree-Sitter convention |

#### 3.2.3 Data Specifications

**tree-sitter.json:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| grammars | Array | Yes | Grammar definitions |
| grammars[].name | String | Yes | Must be 'apex' |
| grammars[].scope | String | Yes | 'source.apex' |
| grammars[].file-types | Array | Yes | ['cls', 'trigger'] |

---

### 3.3 Feature: Parser Generation

#### 3.3.1 Use Case

**Use Case ID:** UC-03
**Actor:** Developer
**Preconditions:** grammar.js và tree-sitter.json configured
**Postconditions:** src/parser.c generated

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Chạy `npm run generate` | | Trigger tree-sitter generate |
| 2 | | Đọc grammar.js | Load grammar definition |
| 3 | | Resolve require | Load sfapex grammar |
| 4 | | Generate C code | Output src/parser.c |
| 5 | | Generate header | Output src/tree_sitter/parser.h |

**Exception Flows:**

| ID | Condition | Steps |
|----|-----------|-------|
| EF-1 | Grammar syntax error | CLI báo lỗi với line number |
| EF-2 | Conflict trong rules | CLI báo conflict, cần resolve |
| EF-3 | Missing require | Module not found error |

#### 3.3.2 Data Specifications

**Output Files:**

| File | Type | Size | Description |
|------|------|------|-------------|
| src/parser.c | C source | ~500KB | Generated parser |
| src/tree_sitter/parser.h | C header | ~5KB | Parser interface |
| src/grammar.json | JSON | ~200KB | Grammar metadata |
| src/node-types.json | JSON | ~50KB | Node type definitions |

---

### 3.4 Feature: Test Infrastructure

#### 3.4.1 Use Case

**Use Case ID:** UC-04
**Actor:** Developer
**Preconditions:** Parser generated thành công
**Postconditions:** Test case pass

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Tạo test/corpus/basic_class.txt | | Test file |
| 2 | Viết test case | | Name + source + expected |
| 3 | Chạy `npm run test` | | tree-sitter test |
| 4 | | Parse source code | Dùng generated parser |
| 5 | | So sánh AST | Actual vs expected |
| 6 | | Report result | Pass/fail |

#### 3.4.2 Business Rules

| Rule ID | Rule | Source |
|---------|------|--------|
| BR-06 | Test format: === name === / source / --- / expected | Tree-Sitter docs |
| BR-07 | Expected AST dùng S-expression | Tree-Sitter docs |
| BR-08 | Test PHẢI pass 100% | BRD Story 4 |

#### 3.4.3 Data Specifications

**Test File Format:**

```
==================
Test Name
==================

source code here

---

(expected_ast_node
  (child_node))
```

---

## 4. Data Model

### 4.1 Project File Structure

| File/Dir | Purpose | Created By |
|----------|---------|------------|
| package.json | Project config | npm init |
| grammar.js | Grammar definition | Developer |
| tree-sitter.json | Parser metadata | Developer |
| sfapex-source/ | Upstream grammar | Git clone |
| src/parser.c | Generated parser | tree-sitter generate |
| test/corpus/ | Test cases | Developer |

---

## 5. Non-Functional Requirements

| Category | Requirement | Acceptance Criteria |
|----------|-------------|---------------------|
| Performance | Generate < 30s | Measured on standard dev machine |
| Portability | Cross-platform | Windows + macOS + Linux |
| Reliability | Deterministic output | Same grammar produces same parser.c |
