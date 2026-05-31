# Business Requirements Document (BRD)

## Salesforce AST Parser — AA-3: Synchronize (Native Binding)

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-3 |
| Title | Synchronize — Native Binding Build |
| Author | BA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## 1. Introduction

### 1.1 Scope

Build native Node.js C++ addon (.node file) tu generated parser.c. Giai quyet LNK2001 unresolved symbol, ABI mismatch. Tao run_parser.js script de quet ERROR nodes.

### 1.2 Preliminary Requirement

- AA-1, AA-2 hoan thanh
- C/C++ compiler (VS Build Tools / GCC)
- Python 3.x (cho node-gyp)

---

## 2. Business Requirements

### 2.1 User Stories

| # | Story | Priority |
|---|-------|----------|
| 1 | Build native .node file thanh cong | MUST HAVE |
| 2 | Giai quyet LNK2001 errors | MUST HAVE |
| 3 | run_parser.js quet ERROR nodes | MUST HAVE |
| 4 | Parser load qua require() | MUST HAVE |

### 2.2 Acceptance Criteria

1. npx node-gyp rebuild exit code 0
2. File .node ton tai trong build/Release/
3. require() khong throw error
4. parser.setLanguage() thanh cong
5. run_parser.js report ERROR nodes chinh xac

---

## 3. Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| node-gyp | Build Tool | Native addon compiler |
| nan / node-addon-api | Library | Node.js addon helpers |
| VS Build Tools | Compiler | Windows C++ |
| tree-sitter | Runtime | Parser runtime |

---

## 4. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| LNK2001 unresolved symbol | High | Sync grammar name |
| ABI mismatch | High | Match versions |
| Platform-specific issues | Medium | Document per-platform |
