# Software Test Plan (STP)

## Salesforce AST Parser — AA-3: Synchronize (Native Binding)

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-3 |
| Title | Synchronize — Ke hoach kiem thu |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## 1. Test Objectives

- Verify native build thanh cong tren Windows
- Validate .node file loadable
- Verify parser.parse() tra ve AST hop le
- Verify run_parser.js detect ERROR nodes

---

## 2. Test Strategy

| Level | Scope | Tools |
|-------|-------|-------|
| Build | node-gyp rebuild | CLI |
| Integration | Load + parse | Node.js script |
| Functional | Error detection | run_parser.js |

---

## 3. Test Scope

| # | Feature | Priority |
|---|---------|----------|
| 1 | node-gyp rebuild success | High |
| 2 | require() .node file | High |
| 3 | parser.parse() returns tree | High |
| 4 | ERROR node detection | High |
| 5 | Cross-platform build | Medium |

---

## 4. Test Metrics

| Metric | Target |
|--------|--------|
| Build Success | 100% |
| Parse Accuracy | Matches corpus tests |
| Error Detection | All ERROR nodes found |
