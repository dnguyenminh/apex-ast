# Software Test Plan (STP)

## Salesforce AST Parser - AA-57: Indexer Module

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-57 |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |

---

## 1. Test Objectives

- Verify scanner detects all metadata file types
- Verify each indexer produces correct structured output
- Verify dependency graph tracks cross-component relationships
- Verify parseProject() orchestrates full pipeline
- Verify error resilience (pipeline continues on individual failures)

---

## 2. Test Strategy

| Level | Scope | Tools |
|-------|-------|-------|
| Unit | Individual indexers | vitest |
| Integration | Full pipeline (scan -> parse -> graph) | vitest |
| Performance | Full project index time | vitest + timer |

---

## 3. Test Scope

| # | Module | Test Count | Priority |
|---|--------|-----------|----------|
| 1 | Scanner | 4 | High |
| 2 | Apex Indexer | 4 | High |
| 3 | Flow Indexer | 3 | High |
| 4 | Object Indexer | 3 | High |
| 5 | LWC Indexer | 3 | High |
| 6 | Dependency Graph | 5 | High |
| 7 | parseProject() | 3 | High |
| 8 | toKBPayload() | 2 | Medium |

---

## 4. Test Metrics

| Metric | Target |
|--------|--------|
| Coverage | >= 80% |
| Pass Rate | 100% |
| Full project index | < 5s for sample project |
