# Business Requirements Document (BRD)

## Salesforce Apex AST Parser — AA: Xây dựng bộ phân tích cú pháp Salesforce Apex

---

## Document Information

| Field | Value |
|-------|-------|
| Project | AA (Salesforce Apex AST Parser) |
| Title | Xây dựng bộ phân tích cú pháp (Parser) cho ngôn ngữ Salesforce Apex sử dụng Tree-Sitter |
| Author | BA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-27 | BA Agent | Khởi tạo tài liệu — tổng hợp từ 4 Epics (AA-1 → AA-4) |

---

## 1. Introduction

### 1.1 Scope

Dự án **Salesforce Apex AST Parser** xây dựng một bộ phân tích cú pháp (parser) hoàn chỉnh cho ngôn ngữ lập trình Salesforce Apex, sử dụng framework Tree-Sitter. Bộ parser này có khả năng:

- Phân tích cú pháp (parse) mã nguồn Apex thành cây cú pháp trừu tượng (AST)
- Hỗ trợ cả SOQL/SOSL lồng nhau (nested queries)
- Cung cấp 2 định dạng đầu ra: Native Binding (.node) và WebAssembly (.wasm)
- Kế thừa và mở rộng grammar từ dự án mã nguồn mở `tree-sitter-sfapex`
- Hỗ trợ multi-language bindings: Node.js, Python, C, Rust, Go, Java, Swift, Zig

### 1.2 Out of Scope

- Phân tích cú pháp Lightning Web Components (LWC) — sử dụng parser HTML/CSS/JS riêng
- IDE integration (VS Code extension) — sẽ là dự án riêng sử dụng output từ parser này
- Code formatting / linting — chỉ tập trung vào parsing
- Semantic analysis (type checking, flow analysis) — chỉ syntactic parsing

### 1.3 Preliminary Requirement

- Node.js v20+ đã cài đặt
- C/C++ Compiler (Visual Studio Build Tools trên Windows)
- Python 3.x (hỗ trợ node-gyp)
- Emscripten SDK (cho WASM build)
- Git (clone source repository)

---

## 2. Business Requirements

### 2.1 High Level Process Map

Quy trình tổng quan của hệ thống parser:

1. **Input**: Mã nguồn Salesforce Apex (.cls, .trigger files)
2. **Processing**: Tree-Sitter engine đọc grammar rules → parse source code
3. **Output**: Abstract Syntax Tree (AST) dạng S-expression hoặc tree object
4. **Consumption**: Các ứng dụng downstream (Jira Assistant, VS Code Extension, Web analyzers) sử dụng AST

### 2.2 List of User Stories / Use Cases

| # | Story / Use Case | Priority | Source |
|---|------------------|----------|--------|
| 1 | Là developer, tôi muốn parse file .cls Apex thành AST để phân tích cấu trúc code | MUST HAVE | AA-1 |
| 2 | Là developer, tôi muốn parse SOQL/SOSL lồng nhau chính xác để hỗ trợ code analysis | MUST HAVE | AA-1 |
| 3 | Là developer, tôi muốn sử dụng parser qua Native Binding (.node) cho hiệu năng cao | MUST HAVE | AA-2 |
| 4 | Là developer, tôi muốn sử dụng parser qua WASM cho cross-platform deployment | MUST HAVE | AA-3 |
| 5 | Là developer, tôi muốn phát hiện lỗi cú pháp (ERROR nodes) trong code Apex | SHOULD HAVE | AA-2 |
| 6 | Là developer, tôi muốn mở rộng grammar bằng cách override rules trong grammar.js | SHOULD HAVE | AA-4 |
| 7 | Là developer, tôi muốn chạy automated tests để đảm bảo parser hoạt động đúng | MUST HAVE | AA-4 |
| 8 | Là developer, tôi muốn sử dụng parser từ nhiều ngôn ngữ (Python, Rust, Go, Java) | COULD HAVE | AA-1 |

---

### 2.3 Details of User Stories

---

#### Business Flow

**Step 1:** Developer cài đặt project (`npm install`)

**Step 2:** Generate parser từ grammar (`npm run generate`) → sinh ra `src/parser.c`

**Step 3:** Build native binding (`npx node-gyp rebuild`) → sinh ra `.node` file

**Step 4:** Build WASM (`npx tree-sitter build --wasm`) → sinh ra `.wasm` file

**Step 5:** Sử dụng parser trong ứng dụng:
- Native: `require('./build/Release/tree_sitter_apex_binding.node')`
- WASM: `Language.load('tree-sitter-apex.wasm')`

**Step 6:** Parse mã nguồn Apex → nhận AST tree

**Step 7:** Traverse AST để phân tích, phát hiện lỗi, hoặc extract thông tin

---

#### STORY 1: Parse Apex Class cơ bản

> Là developer, tôi muốn parse file .cls Apex thành AST để phân tích cấu trúc code

**Requirement Details:**

1. Parser phải nhận diện được class declaration với modifiers (public, private, global, virtual, abstract)
2. Parser phải nhận diện method declarations với return types và parameters
3. Parser phải nhận diện variable declarations và assignments
4. Parser phải nhận diện control flow statements (if/else, for, while, do-while)
5. Parser phải nhận diện DML statements (insert, update, delete, upsert, merge, undelete)

**Acceptance Criteria:**

1. Parse `public class MyClass { }` → AST có node `class_declaration` với `modifiers` và `identifier`
2. Parse method với parameters → AST có `method_declaration` với `formal_parameters`
3. Parse nested class → AST có class_declaration lồng trong class_body
4. Không có ERROR node khi parse valid Apex code
5. Thời gian parse < 100ms cho file 1000 dòng

---

#### STORY 2: Parse SOQL/SOSL lồng nhau

> Là developer, tôi muốn parse SOQL/SOSL lồng nhau chính xác để hỗ trợ code analysis

**Requirement Details:**

1. Nhận diện SOQL query trong dấu `[...]`
2. Hỗ trợ subquery (relationship queries) lồng nhau
3. Nhận diện SELECT, FROM, WHERE, ORDER BY, LIMIT, OFFSET clauses
4. Nhận diện aggregate functions (COUNT, SUM, AVG, MIN, MAX)
5. Nhận diện SOSL queries với FIND clause

**Acceptance Criteria:**

1. Parse `[SELECT Id, Name FROM Account]` → AST có `query_expression` → `soql_query_body`
2. Parse subquery `(SELECT LastName FROM Contacts)` → AST có `subquery` node
3. Parse WHERE clause với operators → AST chính xác
4. Không có ERROR node cho valid SOQL/SOSL

---

#### STORY 3: Native Binding cho Node.js

> Là developer, tôi muốn sử dụng parser qua Native Binding (.node) cho hiệu năng cao

**Requirement Details:**

1. Build thành công file `.node` trên Windows, macOS, Linux
2. Load được qua `require()` trong Node.js
3. API tương thích với `tree-sitter` npm package
4. Hỗ trợ incremental parsing (parse lại chỉ phần thay đổi)

**Acceptance Criteria:**

1. `npx node-gyp rebuild` thành công không lỗi
2. `require('./build/Release/tree_sitter_apex_binding.node')` load thành công
3. `parser.setLanguage(SfApex)` không throw error
4. `parser.parse(sourceCode)` trả về tree object hợp lệ

---

#### STORY 4: WebAssembly Build

> Là developer, tôi muốn sử dụng parser qua WASM cho cross-platform deployment

**Requirement Details:**

1. Build thành công file `tree-sitter-apex.wasm`
2. Load được qua `web-tree-sitter` package (ESM/CommonJS)
3. Hoạt động trong browser environment
4. Hoạt động trong Node.js environment
5. File size < 1MB

**Acceptance Criteria:**

1. `npx tree-sitter build --wasm` thành công
2. `Language.load('tree-sitter-apex.wasm')` load thành công
3. Parse kết quả giống hệt native binding
4. File `tree-sitter-apex.wasm` tồn tại và < 1MB

---

#### STORY 5: Error Detection

> Là developer, tôi muốn phát hiện lỗi cú pháp (ERROR nodes) trong code Apex

**Requirement Details:**

1. Khi gặp cú pháp không hợp lệ, parser tạo ERROR node thay vì crash
2. ERROR node chứa thông tin vị trí (row, column, startIndex, endIndex)
3. Parser tiếp tục parse phần còn lại sau ERROR (error recovery)
4. Cung cấp script mẫu để traverse tree và tìm ERROR nodes

**Acceptance Criteria:**

1. Parse code có syntax error → tree chứa ERROR node
2. ERROR node có `startPosition.row` và `startPosition.column` chính xác
3. Phần code hợp lệ sau ERROR vẫn được parse đúng
4. Script `run_parser.js` phát hiện và báo cáo ERROR nodes

---

#### STORY 6: Grammar Extension

> Là developer, tôi muốn mở rộng grammar bằng cách override rules trong grammar.js

**Requirement Details:**

1. Cơ chế kế thừa grammar từ `tree-sitter-sfapex` qua `require()`
2. Override rules trong object `rules: {}` của `grammar.js`
3. Quy trình vá lỗi: ANTLR4 reference → AI translation → Tree-Sitter rule
4. Regression testing sau mỗi lần thay đổi grammar

**Acceptance Criteria:**

1. Thêm rule mới vào `grammar.js` → `npm run generate` thành công
2. Rule mới không phá vỡ test cases hiện có
3. `npm run test` pass 100% sau khi thêm rule

---

#### STORY 7: Automated Testing

> Là developer, tôi muốn chạy automated tests để đảm bảo parser hoạt động đúng

**Requirement Details:**

1. Test format theo chuẩn Tree-Sitter corpus (`test/corpus/*.txt`)
2. Mỗi test case gồm: tên, source code, expected AST
3. Chạy bằng `npm run test` (= `tree-sitter test`)
4. Cover các scenarios: class, method, SOQL, DML, control flow, triggers, interfaces, enums, annotations

**Acceptance Criteria:**

1. `npm run test` chạy thành công
2. Tất cả test cases pass (success rate 100%)
3. Có ít nhất 10 test cases covering major Apex constructs
4. Test output hiển thị rõ pass/fail cho từng case

---

## 3. Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| tree-sitter-sfapex v3.0.0 | External Library | Grammar source kế thừa |
| tree-sitter-cli v0.26.9 | Tool | CLI để generate parser |
| tree-sitter v0.25.0 | Runtime | Node.js runtime binding |
| web-tree-sitter v0.26.9 | Runtime | WASM runtime |
| node-gyp | Build Tool | Native addon compiler |
| Emscripten | Build Tool | WASM compiler |
| Visual Studio Build Tools | Build Tool | C/C++ compiler (Windows) |

---

## 4. Stakeholders

| Role | Name / Team | Responsibility |
|------|-------------|----------------|
| Project Owner | Nguyen Minh Duc | Kiến trúc, quyết định kỹ thuật |
| Developer | Nguyen Minh Duc | Implementation, testing |
| Consumer | Jira Assistant Team | Sử dụng parser output cho code analysis |

---

## 5. Risks and Assumptions

### 5.1 Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Salesforce cập nhật cú pháp mới | High | Medium | Quy trình vá lỗi ANTLR → AI → Tree-Sitter |
| tree-sitter-sfapex ngừng maintain | Medium | Low | Đã clone full source, có thể fork |
| Breaking changes trong web-tree-sitter API | Medium | Medium | Pin version, test kỹ trước upgrade |
| ABI version mismatch giữa CLI và runtime | High | Medium | Đồng bộ version trong package.json |

### 5.2 Assumptions

- Grammar từ `tree-sitter-sfapex` v3.0.0 cover 95%+ cú pháp Apex hiện tại
- Tree-Sitter framework ổn định và tiếp tục được maintain
- Salesforce không thay đổi cú pháp Apex một cách đột ngột
- Developer có kiến thức cơ bản về compiler/parser concepts

---

## 6. Non-Functional Requirements

| Category | Requirement | Details |
|----------|-------------|---------|
| Performance | Parse time < 100ms cho file 1000 dòng | Cả native và WASM |
| Performance | Incremental parse < 10ms cho single-line change | Native binding |
| Portability | Chạy trên Windows, macOS, Linux | Native binding + WASM |
| Portability | Chạy trong browser | WASM only |
| Size | WASM file < 1MB | Tối ưu cho web deployment |
| Reliability | Error recovery — không crash khi gặp invalid syntax | Tree-Sitter built-in |
| Maintainability | Grammar extensible qua override mechanism | Không cần fork upstream |
| Compatibility | Tương thích Tree-Sitter ABI 14+ | Bindings cho 8 ngôn ngữ |

---

## 7. Related Tickets

| Ticket Key | Summary | Type | Relationship |
|------------|---------|------|--------------|
| AA-1 | Project Initialization & Grammar Inheritance | Epic | Phase 1 — Setup |
| AA-2 | Native Binding & Error Detection | Epic | Phase 2 — Verify |
| AA-3 | WASM Build & Cross-Platform | Epic | Phase 3 — Synchronize |
| AA-4 | Deployment & Testing Pipeline | Epic | Phase 4 — Deployment |

---

## 8. Appendix

### Glossary

| Term | Definition |
|------|------------|
| AST | Abstract Syntax Tree — cấu trúc dữ liệu biểu diễn cú pháp của source code |
| Tree-Sitter | Framework tạo parser incremental, hỗ trợ nhiều ngôn ngữ |
| SOQL | Salesforce Object Query Language — ngôn ngữ truy vấn dữ liệu Salesforce |
| SOSL | Salesforce Object Search Language — ngôn ngữ tìm kiếm Salesforce |
| WASM | WebAssembly — format nhị phân chạy trong browser |
| Native Binding | Addon C/C++ compiled cho Node.js runtime |
| Grammar | Tập hợp rules định nghĩa cú pháp của ngôn ngữ |
| ABI | Application Binary Interface — giao diện nhị phân giữa các components |
| DML | Data Manipulation Language — insert, update, delete, upsert, merge, undelete |

### Reference Documents

| Document | Location |
|----------|----------|
| Phase 1 - Project Initialize | documents/Phase 1 - Project-Initilize.md |
| Phase 2 - Verify Project | documents/Phase 2 - Verify_project.md |
| Phase 3 - Synchronize | documents/Phase 3 - Synchronyize.md |
| Phase 4 - Deployment | documents/Phase 4 - Deployment.md |
| tree-sitter-sfapex GitHub | https://github.com/aheber/tree-sitter-sfapex |
| Salesforce ANTLR Parser | https://github.com/forcedotcom/apex-parser |
