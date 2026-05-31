# Functional Specification Document (FSD)

## Salesforce Apex AST Parser — AA: Đặc tả chức năng

---

## Document Information

| Field | Value |
|-------|-------|
| Project | AA (Salesforce Apex AST Parser) |
| Title | Đặc tả chức năng bộ phân tích cú pháp Salesforce Apex |
| Author | BA Agent + TA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related BRD | documents/AA/BRD.md |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-27 | BA + TA Agent | Khởi tạo tài liệu |

---

## 1. Introduction

### 1.1 Purpose

Tài liệu này đặc tả chi tiết các chức năng của bộ Salesforce Apex AST Parser, bao gồm use cases, business rules, data specifications, và API contracts cho từng tính năng.

### 1.2 Scope

Bao gồm toàn bộ chức năng parsing, error detection, grammar extension, và multi-platform deployment (Native + WASM).

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|------------|
| AST | Abstract Syntax Tree |
| S-expression | String representation của tree structure |
| Node | Một phần tử trong AST tree |
| Grammar Rule | Quy tắc định nghĩa cú pháp trong grammar.js |
| Corpus Test | File test theo format chuẩn Tree-Sitter |

---

## 2. System Overview

### 2.1 System Context

Hệ thống parser hoạt động như một thư viện (library) được nhúng vào các ứng dụng khác:

**Actors:**
- **Developer**: Người sử dụng parser để phân tích code Apex
- **CI/CD Pipeline**: Tự động chạy tests khi grammar thay đổi
- **Downstream Applications**: Jira Assistant, VS Code Extension, Web Analyzer

**External Systems:**
- **tree-sitter-sfapex**: Nguồn grammar gốc (upstream)
- **forcedotcom/apex-parser**: Reference ANTLR4 grammar từ Salesforce
- **Emscripten**: Compiler cho WASM build

### 2.2 System Architecture

```
Consumer Applications (Jira Assistant, VS Code, Web Analyzer)
        |                           |
   Native Binding (.node)     WASM Runtime (.wasm)
   tree-sitter package        web-tree-sitter package
        |                           |
        +------ src/parser.c -------+
                     |
               grammar.js
          (inherits sfapex grammar)
                     |
        sfapex-source/apex/grammar.js
```

---

## 3. Functional Requirements

### 3.1 Feature: Grammar Generation

**Source:** BRD Story 1, 6

#### 3.1.1 Description

Hệ thống sử dụng file `grammar.js` tại root directory để định nghĩa cú pháp ngôn ngữ Apex. File này kế thừa toàn bộ rules từ `sfapex-source/apex/grammar.js` và cho phép override/extend rules.

#### 3.1.2 Use Case

**Use Case ID:** UC-01
**Actor:** Developer
**Preconditions:** Node.js và tree-sitter-cli đã cài đặt
**Postconditions:** File `src/parser.c` được sinh ra

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Chạy `npm run generate` | | Developer trigger generation |
| 2 | | Đọc grammar.js | Tree-sitter CLI load grammar |
| 3 | | Resolve require | Load upstream grammar |
| 4 | | Merge override rules | Apply custom rules |
| 5 | | Generate src/parser.c | Output C parser code |

**Exception Flows:**

| ID | Condition | Steps |
|----|-----------|-------|
| EF-1 | Grammar syntax error | CLI báo lỗi với line number |
| EF-2 | Conflict trong grammar rules | CLI báo conflict |
| EF-3 | Missing sfapex-source | require() fail |

#### 3.1.3 Business Rules

| Rule ID | Rule | Source |
|---------|------|--------|
| BR-01 | Grammar name PHẢI là 'apex' (khớp với tree-sitter.json) | Phase 3 doc |
| BR-02 | Override rules không được conflict với upstream rules | Phase 2 doc |
| BR-03 | Sau mỗi generate, PHẢI chạy test để verify regression | Phase 2 doc |

---

### 3.2 Feature: Native Parsing

**Source:** BRD Story 1, 3, 5

#### 3.2.1 Description

Parser chạy dưới dạng native C addon trong Node.js, cung cấp hiệu năng cao nhất.

#### 3.2.2 Use Case

**Use Case ID:** UC-02
**Actor:** Developer / Application
**Preconditions:** Native binding đã build thành công
**Postconditions:** AST tree object được trả về

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Load binding | | `require('./build/Release/tree_sitter_apex_binding.node')` |
| 2 | Create parser | | `new Parser()` |
| 3 | Set language | | `parser.setLanguage(SfApex)` |
| 4 | Provide source | | String chứa Apex code |
| 5 | | Parse source | `parser.parse(sourceCode)` |
| 6 | | Return tree | Tree object với rootNode |

**Alternative Flows:**

| ID | Condition | Steps |
|----|-----------|-------|
| AF-1 | Incremental parse | Cung cấp old tree + edits |

**Exception Flows:**

| ID | Condition | Steps |
|----|-----------|-------|
| EF-1 | Invalid source | Parser tạo ERROR node, tiếp tục parse |
| EF-2 | ABI mismatch | TypeError thrown |

#### 3.2.3 Business Rules

| Rule ID | Rule | Source |
|---------|------|--------|
| BR-04 | Parser KHÔNG ĐƯỢC crash khi gặp invalid syntax | BRD NFR |
| BR-05 | ERROR node PHẢI chứa position info | BRD Story 5 |
| BR-06 | Parse result PHẢI consistent giữa native và WASM | BRD Story 4 |

#### 3.2.4 Data Specifications

**Input Data:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| sourceCode | String | Yes | Non-empty | Mã nguồn Apex cần parse |
| oldTree | Tree | No | Valid tree | Tree cũ cho incremental parse |

**Output Data:**

| Field | Type | Description |
|-------|------|-------------|
| tree | Tree | AST tree object |
| tree.rootNode | SyntaxNode | Root node |
| node.type | String | Loại node |
| node.startPosition | Point | {row, column} bắt đầu |
| node.endPosition | Point | {row, column} kết thúc |
| node.text | String | Source text tương ứng |
| node.children | SyntaxNode[] | Child nodes |

---

### 3.3 Feature: WASM Parsing

**Source:** BRD Story 4

#### 3.3.1 Description

Parser chạy dưới dạng WebAssembly, cho phép sử dụng trong browser.

#### 3.3.2 Use Case

**Use Case ID:** UC-03
**Actor:** Developer / Web Application
**Preconditions:** File `tree-sitter-apex.wasm` tồn tại
**Postconditions:** AST tree object được trả về

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Import | | `const { Parser, Language } = require('web-tree-sitter')` |
| 2 | Init | | `await Parser.init()` |
| 3 | Create parser | | `new Parser()` |
| 4 | Load WASM | | `await Language.load('tree-sitter-apex.wasm')` |
| 5 | Set language | | `parser.setLanguage(Lang)` |
| 6 | Parse | | `parser.parse(sourceCode)` |

#### 3.3.3 Business Rules

| Rule ID | Rule | Source |
|---------|------|--------|
| BR-07 | API dùng Named Exports: `{ Parser, Language }` | Phase 4 doc |
| BR-08 | Parser.init() PHẢI gọi trước mọi operation | Phase 4 doc |
| BR-09 | Dùng Language.load() (không phải Parser.Language.load()) | Phase 4 doc |

---

### 3.4 Feature: Error Detection & Reporting

**Source:** BRD Story 5

#### 3.4.1 Use Case

**Use Case ID:** UC-04
**Actor:** Developer
**Preconditions:** Source code có syntax error
**Postconditions:** Danh sách errors với vị trí chính xác

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Parse source code | | Code chứa syntax error |
| 2 | | Tạo AST với ERROR nodes | Error recovery |
| 3 | Traverse tree | | Tìm ERROR/MISSING nodes |
| 4 | | Report error info | Position + text |

#### 3.4.2 Data Specifications — Error Report

| Field | Type | Description |
|-------|------|-------------|
| type | String | "ERROR" hoặc "MISSING" |
| startPosition.row | Number | Dòng bắt đầu (0-indexed) |
| startPosition.column | Number | Cột bắt đầu |
| endPosition | Point | Vị trí kết thúc |
| text | String | Đoạn code gây lỗi |

---

### 3.5 Feature: Test Execution

**Source:** BRD Story 7

#### 3.5.1 Use Case

**Use Case ID:** UC-05
**Actor:** Developer / CI Pipeline
**Preconditions:** Test files tại `test/corpus/*.txt`
**Postconditions:** Test results (pass/fail)

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Chạy `npm run test` | | Trigger test |
| 2 | | Scan test/corpus/ | Tìm .txt files |
| 3 | | Parse mỗi test case | Extract name, source, expected |
| 4 | | So sánh actual vs expected | Diff AST |
| 5 | | Report results | Pass/fail |

#### 3.5.2 Business Rules

| Rule ID | Rule | Source |
|---------|------|--------|
| BR-10 | Format: `===` cho name, `---` cho expected AST | Tree-Sitter docs |
| BR-11 | Expected AST dùng S-expression format | Tree-Sitter docs |
| BR-12 | PHẢI pass 100% trước khi release | BRD Story 7 |

---

### 3.6 Feature: Grammar Extension

**Source:** BRD Story 6

#### 3.6.1 Use Case

**Use Case ID:** UC-06
**Actor:** Developer
**Preconditions:** Phát hiện cú pháp chưa support
**Postconditions:** Grammar mở rộng, tests pass

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Xác định cú pháp thiếu | | Từ ERROR node |
| 2 | Tra cứu ANTLR4 grammar | | forcedotcom/apex-parser |
| 3 | Dịch rule sang Tree-Sitter | | AI-assisted |
| 4 | Thêm vào grammar.js | | Override rule |
| 5 | | Generate + Test | Verify no regression |

---

## 4. Data Model

### 4.1 AST Node Types (Core)

| Node Type | Parent | Description |
|-----------|--------|-------------|
| source_file | (root) | Root node |
| class_declaration | source_file, class_body | Khai báo class |
| interface_declaration | source_file, class_body | Khai báo interface |
| enum_declaration | source_file, class_body | Khai báo enum |
| trigger_declaration | source_file | Khai báo trigger |
| method_declaration | class_body | Khai báo method |
| constructor_declaration | class_body | Khai báo constructor |
| field_declaration | class_body | Khai báo field |
| local_variable_declaration | block | Biến local |
| if_statement | block | if/else |
| for_statement | block | for loop |
| while_statement | block | while loop |
| do_statement | block | do-while |
| try_statement | block | try/catch/finally |
| dml_expression | expression_statement | DML operations |
| query_expression | expression | SOQL/SOSL |
| soql_query_body | query_expression | SOQL content |
| modifiers | various | Access modifiers |
| annotation | modifiers | @isTest, @AuraEnabled |

---

## 5. Integration Specifications

### 5.1 tree-sitter-sfapex (Upstream Grammar)

| Attribute | Value |
|-----------|-------|
| Purpose | Cung cấp grammar rules gốc |
| Direction | Inbound (read-only) |
| Data Format | JavaScript module |
| Frequency | One-time clone, manual update |

### 5.2 Salesforce ANTLR Parser (Reference)

| Attribute | Value |
|-----------|-------|
| Purpose | Reference khi patch cú pháp mới |
| Direction | Inbound (read-only) |
| Data Format | ANTLR4 .g4 files |
| Frequency | On-demand |

---

## 6. Processing Logic

### 6.1 Parse Process

| Step | Description | Error Handling |
|------|-------------|----------------|
| 1 | Tokenize input | Invalid chars → ERROR token |
| 2 | Apply grammar rules | Ambiguity → precedence |
| 3 | Build AST nodes | Unmatched → ERROR node |
| 4 | Error recovery | Skip until valid state |
| 5 | Return tree | Always returns (never null) |

### 6.2 Build Process (Native)

| Step | Description | Error Handling |
|------|-------------|----------------|
| 1 | Compile parser.c | Compiler errors |
| 2 | Compile binding.cc | Linker errors → check symbols |
| 3 | Link → .node | LNK2001 → sync grammar name |

### 6.3 Build Process (WASM)

| Step | Description | Error Handling |
|------|-------------|----------------|
| 1 | Invoke Emscripten | Missing emcc → install |
| 2 | Compile C → WASM | Fix parser.c |
| 3 | Output .wasm | Verify size < 1MB |

---

## 7. Security Requirements

| Data Type | Classification | Requirement |
|-----------|---------------|-------------|
| Source code input | Internal | Chỉ parse text, không execute |
| Grammar rules | Internal | Đọc từ local filesystem |
| WASM binary | Internal | Sandboxed execution |

---

## 8. Non-Functional Requirements

| Category | Requirement | Acceptance Criteria |
|----------|-------------|---------------------|
| Performance | Parse nhanh | < 100ms / 1000 dòng |
| Performance | Incremental parse | < 10ms / single edit |
| Portability | Cross-platform | Win + Mac + Linux + Browser |
| Size | Lightweight | WASM < 1MB |
| Reliability | No crash | Error recovery mọi input |
| Testability | Automated | 100% pass rate |

---

## 9. Error Handling

| Scenario | Severity | Expected Behavior |
|----------|----------|-------------------|
| Invalid Apex syntax | Info | ERROR node, tiếp tục parse |
| ABI mismatch | Critical | Rebuild native binding |
| WASM load failure | Critical | Check path, reinstall |
| Grammar conflict | Warning | Resolve trong grammar.js |
| Missing dependency | Critical | npm install |

---

## 10. Testing Considerations

| ID | Scenario | Input | Expected | Priority |
|----|----------|-------|----------|----------|
| TC-01 | Basic class | `public class X {}` | class_declaration | High |
| TC-02 | SOQL nested | `[SELECT...(SELECT...)]` | query_expression + subquery | High |
| TC-03 | DML insert | `insert accounts;` | dml_expression | High |
| TC-04 | Trigger | `trigger X on Account(){}` | trigger_declaration | High |
| TC-05 | Interface | `public interface X {}` | interface_declaration | Medium |
| TC-06 | Enum | `public enum X { A, B }` | enum_declaration | Medium |
| TC-07 | Annotation | `@isTest class X {}` | annotation | Medium |
| TC-08 | For loop | `for(X x : list) {}` | for_statement | Medium |
| TC-09 | Try/catch | `try {} catch(E e) {}` | try_statement | Medium |
| TC-10 | Error recovery | Invalid code | ERROR node | High |

---

## 11. Appendix

### Supported Apex Constructs

| Category | Constructs |
|----------|-----------|
| Declarations | class, interface, enum, trigger |
| Modifiers | public, private, protected, global, virtual, abstract, static, final |
| Methods | void/typed return, parameters, varargs |
| Control Flow | if/else, for, enhanced for, while, do-while, switch/when |
| Exception | try, catch, finally, throw |
| DML | insert, update, delete, upsert, merge, undelete |
| SOQL/SOSL | SELECT, FROM, WHERE, ORDER BY, LIMIT, subquery |
| Annotations | @isTest, @AuraEnabled, @InvocableMethod, @future |
| Literals | string, integer, decimal, boolean, null |
