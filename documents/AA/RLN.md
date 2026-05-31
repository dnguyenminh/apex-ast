# Release Notes (RLN)

## Salesforce Apex AST Parser — v1.0.0

---

## Release Information

| Field | Value |
|-------|-------|
| Release Version | 1.0.0 |
| Release Date | 2025-01-27 |
| Project | AA (Salesforce Apex AST Parser) |
| Author | Nguyen Minh Duc |
| Status | Released |

---

## 1. What's New

### 1.1 Feature Summary

Phiên bản đầu tiên của bộ phân tích cú pháp Salesforce Apex sử dụng Tree-Sitter framework. Parser kế thừa grammar từ `tree-sitter-sfapex` v3.0.0 và cung cấp khả năng parse toàn bộ cú pháp Apex hiện đại bao gồm SOQL/SOSL lồng nhau.

### 1.2 Key Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | Apex Parsing | Parse .cls và .trigger thành AST |
| 2 | SOQL/SOSL Support | Nested queries, subqueries, aggregate |
| 3 | Native Binding | Node.js C++ addon |
| 4 | WASM Build | WebAssembly cross-platform |
| 5 | Error Recovery | Phát hiện lỗi, tiếp tục parse |
| 6 | Grammar Extension | Override mechanism |
| 7 | Multi-Language Bindings | Node, Python, Rust, Go, Java, Swift, Zig, C |
| 8 | Automated Testing | Corpus test framework |

---

## 2. Technical Details

### 2.1 Artifacts

| Artifact | File | Size |
|----------|------|------|
| Native Binding | tree_sitter_apex_binding.node | ~200KB |
| WASM Binary | tree-sitter-apex.wasm | ~500KB |
| Parser Source | src/parser.c | ~500KB |

### 2.2 Supported Constructs

| Category | Constructs |
|----------|-----------|
| Declarations | class, interface, enum, trigger |
| Modifiers | public, private, protected, global, virtual, abstract, static, final |
| Control Flow | if/else, for, enhanced for, while, do-while, switch/when |
| Exception | try, catch, finally, throw |
| DML | insert, update, delete, upsert, merge, undelete |
| SOQL | SELECT, FROM, WHERE, ORDER BY, LIMIT, subquery |
| Annotations | @isTest, @AuraEnabled, @InvocableMethod, @future |

---

## 3. Dependencies

| Package | Version |
|---------|---------|
| tree-sitter | ^0.25.0 |
| web-tree-sitter | ^0.26.9 |
| tree-sitter-cli | ^0.26.9 |
| tree-sitter-sfapex | ^3.0.0 |

---

## 4. Known Issues

| # | Issue | Workaround |
|---|-------|------------|
| 1 | Một số cú pháp mới nhất chưa cover | Override trong grammar.js |
| 2 | Native build cần C++ compiler | Dùng WASM mode |

---

## 5. Roadmap

| Version | Features |
|---------|----------|
| 1.1.0 | Thêm test cases đầy đủ |
| 1.2.0 | Publish npm |
| 2.0.0 | VS Code extension |

---

## 6. License

MIT License
