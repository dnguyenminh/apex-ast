# Business Requirements Document (BRD)

## Salesforce AST Parser - AA-57: Indexer Module (KB Integration)

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-57 |
| Title | Indexer Module - KB Integration API |
| Author | BA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## 1. Introduction

### 1.1 Scope

Module chinh export API cho project khac dung de index toan bo Salesforce code vao Knowledge Base. Bao gom: SFDX project scanner, Apex/Flow/Object/LWC indexers, Dependency graph builder, Export API parseProject(), KB payload format.

### 1.2 Preliminary Requirement

- AA-55 hoan thanh (XML parsers)
- AA-56 hoan thanh (LWC parsers)
- Apex parser available (AA-1/AA-3)

---

## 2. Business Requirements

### 2.1 User Stories

| # | Story | Priority |
|---|-------|----------|
| 1 | Scan SFDX project structure, detect all metadata files | MUST HAVE |
| 2 | Index Apex classes (methods, fields, SOQL, DML, dependencies) | MUST HAVE |
| 3 | Index Flows (nodes, connections, DML operations) | MUST HAVE |
| 4 | Index Objects/Fields (schema, relationships) | MUST HAVE |
| 5 | Index LWC components (API surface, wire adapters, events) | MUST HAVE |
| 6 | Build dependency graph (cross-component relationships) | MUST HAVE |
| 7 | Export API: parseProject() main entry point | MUST HAVE |
| 8 | KB payload format output | MUST HAVE |
| 9 | npm package configuration | SHOULD HAVE |

### 2.2 Acceptance Criteria

1. parseProject(path) tra ve complete ProjectIndex
2. Scanner detect tat ca metadata types theo SFDX conventions
3. Dependency graph track relationships: Apex->Apex, Apex->Object, Flow->Object, LWC->Apex
4. toKBPayload() convert index to KB-ready format
5. Support include/exclude filters
6. Error resilience: pipeline continues when individual files fail

---

## 3. Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| AA-55 (XML Parsers) | Internal | Parse metadata XML |
| AA-56 (LWC Parsers) | Internal | Parse LWC components |
| AA-1/AA-3 (Apex Parser) | Internal | Parse Apex code |

---

## 4. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large projects slow to index | Medium | Parallel processing |
| Missing metadata types | Low | Extensible scanner |
| Graph cycles | Low | Cycle detection |
