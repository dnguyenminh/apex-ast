# Business Requirements Document (BRD)

## Salesforce AST Parser — AA-1: Project Initialize

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-1 |
| Title | Project Initialize — Khởi tạo Tree-Sitter Apex Parser |
| Author | BA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-27 | BA Agent | Khởi tạo tài liệu từ Epic 1 |

---

## 1. Introduction

### 1.1 Scope

Khởi tạo Node.js project cho Salesforce Apex AST Parser sử dụng Tree-Sitter framework. Bao gồm cài đặt tree-sitter-cli, clone sfapex-source grammar, cấu hình grammar.js kế thừa, thiết lập tree-sitter.json, generate parser.c, và tạo test case đầu tiên.

### 1.2 Out of Scope

- Build native binding (.node) — thuộc AA-3
- Build WASM — thuộc AA-4
- Test nâng cao (SOQL nested) — thuộc AA-2
- XML/LWC parsers — thuộc AA-55, AA-56

### 1.3 Preliminary Requirement

- Node.js v20+ đã cài đặt
- Git (clone sfapex-source repository)
- npm (package manager)

---

## 2. Business Requirements

### 2.1 High Level Process Map

![Business Flow — Project Initialize](diagrams/business-flow.png)

1. Khởi tạo Node.js project với package.json
2. Cài đặt tree-sitter-cli làm devDependency
3. Clone tree-sitter-sfapex source grammar
4. Tạo grammar.js kế thừa từ sfapex grammar
5. Cấu hình tree-sitter.json metadata
6. Chạy `tree-sitter generate` → sinh src/parser.c
7. Tạo test case đầu tiên (basic_class.txt)
8. Verify: `tree-sitter test` pass

### 2.2 List of User Stories / Use Cases

| # | Story / Use Case | Priority | Source |
|---|------------------|----------|--------|
| 1 | Là developer, tôi muốn khởi tạo project Node.js với cấu trúc chuẩn Tree-Sitter | MUST HAVE | AA-1 |
| 2 | Là developer, tôi muốn kế thừa grammar từ sfapex để không phải viết lại từ đầu | MUST HAVE | AA-1 |
| 3 | Là developer, tôi muốn generate parser.c thành công từ grammar.js | MUST HAVE | AA-1 |
| 4 | Là developer, tôi muốn có test case đầu tiên để verify parser hoạt động | MUST HAVE | AA-1 |

---

### 2.3 Details of User Stories

---

#### STORY 1: Khởi tạo Node.js Project

> Là developer, tôi muốn khởi tạo project Node.js với cấu trúc chuẩn Tree-Sitter

**Requirement Details:**

1. Tạo package.json với name, version, scripts (generate, test)
2. Cài đặt tree-sitter-cli (devDependency)
3. Cài đặt tree-sitter (runtime dependency)
4. Tạo cấu trúc thư mục: src/, test/corpus/, bindings/

**Acceptance Criteria:**

1. `npm install` chạy thành công không lỗi
2. `npx tree-sitter --version` hiển thị version >= 0.26.0
3. package.json có scripts: generate, test
4. Thư mục src/, test/corpus/ tồn tại

---

#### STORY 2: Grammar Inheritance

> Là developer, tôi muốn kế thừa grammar từ sfapex để không phải viết lại từ đầu

**Requirement Details:**

1. Clone tree-sitter-sfapex vào thư mục sfapex-source/
2. Tạo grammar.js tại root, require sfapex grammar
3. Sử dụng `grammar(apexGrammar, { name: 'apex', rules: {} })` pattern
4. Grammar name PHẢI là 'apex' (khớp với tree-sitter.json)

**Acceptance Criteria:**

1. File sfapex-source/apex/grammar.js tồn tại
2. File grammar.js tại root require đúng path
3. Grammar name = 'apex'
4. `tree-sitter generate` không báo lỗi require

---

#### STORY 3: Generate Parser

> Là developer, tôi muốn generate parser.c thành công từ grammar.js

**Requirement Details:**

1. Chạy `tree-sitter generate` sinh ra src/parser.c
2. File parser.c chứa generated C code (~500KB)
3. File src/tree_sitter/parser.h được tạo
4. Không có grammar conflicts

**Acceptance Criteria:**

1. `npm run generate` exit code = 0
2. File src/parser.c tồn tại và > 100KB
3. File src/tree_sitter/parser.h tồn tại
4. Không có warning "conflict" trong output

---

#### STORY 4: Test Case Đầu Tiên

> Là developer, tôi muốn có test case đầu tiên để verify parser hoạt động

**Requirement Details:**

1. Tạo file test/corpus/basic_class.txt
2. Format chuẩn Tree-Sitter: === name === / source / --- / expected AST
3. Test parse basic class declaration
4. `tree-sitter test` pass

**Acceptance Criteria:**

1. File test/corpus/basic_class.txt tồn tại
2. `npm run test` (= tree-sitter test) pass
3. Output hiển thị checkmark cho test case
4. AST output có node class_declaration

---

## 3. Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| tree-sitter-cli ^0.26.9 | Tool | CLI generate parser |
| tree-sitter-sfapex ^3.0.0 | External | Grammar source kế thừa |
| Node.js 20+ | Runtime | JavaScript runtime |
| Git | Tool | Clone sfapex source |

---

## 4. Stakeholders

| Role | Name / Team | Responsibility |
|------|-------------|----------------|
| Project Owner | Nguyen Minh Duc | Kiến trúc, quyết định kỹ thuật |
| Developer | Nguyen Minh Duc | Implementation |

---

## 5. Risks and Assumptions

### 5.1 Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| sfapex grammar không tương thích tree-sitter-cli version mới | High | Low | Pin version trong package.json |
| Grammar conflicts khi generate | Medium | Medium | Resolve conflicts trong grammar.js override |

### 5.2 Assumptions

- tree-sitter-sfapex v3.0.0 grammar hoạt động với tree-sitter-cli v0.26.9
- Node.js 20+ đã cài đặt trên máy developer

---

## 6. Non-Functional Requirements

| Category | Requirement | Details |
|----------|-------------|---------|
| Performance | Generate time < 30s | tree-sitter generate hoàn thành nhanh |
| Portability | Chạy trên Windows, macOS, Linux | npm scripts cross-platform |
| Maintainability | Grammar extensible | Override pattern cho phép mở rộng |
