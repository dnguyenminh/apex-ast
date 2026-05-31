# Functional Specification Document (FSD)

## Salesforce AST Parser - AA-57: Indexer Module

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-57 |
| Title | Indexer Module - Dac ta chuc nang |
| Author | BA Agent + TA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## System Overview

![Indexer Data Flow](diagrams/indexer-data-flow.png)

![Architecture Overview](diagrams/architecture-overview.png)

---

## 1. Functional Requirements

### 1.1 SFDX Project Scanner

**Use Case ID:** UC-01
**Input:** SFDX project root path
**Output:** FileManifest { [type]: FilePath[] }

**Scanned Types:**
- .cls, .trigger -> Apex
- .flow-meta.xml -> Flow
- .object-meta.xml -> Object
- .field-meta.xml -> Field
- .permissionset-meta.xml -> Permission Set
- .labels-meta.xml -> Labels
- .layout-meta.xml -> Layout
- lwc/**/*.js,html,css -> LWC
- aura/**/*.cmp,js -> Aura

### 1.2 Apex Indexer

**Use Case ID:** UC-02
**Input:** .cls or .trigger file
**Output:** ApexIndexData JSON

**Extracted:**
- Classes, methods, fields, annotations
- SOQL queries, DML operations
- Dependencies (referenced classes)
- Test methods detection

### 1.3 Flow Indexer

**Use Case ID:** UC-03
**Input:** Parsed flow data
**Output:** FlowIndexData JSON

**Extracted:**
- Flow metadata, node graph
- DML operations, variables
- Referenced Apex actions, subflows

### 1.4 Object/Field Indexer

**Use Case ID:** UC-04
**Input:** Parsed object/field data
**Output:** DataModelIndexData JSON

**Extracted:**
- Object schema, relationships
- Field definitions, validation rules
- Data model graph

### 1.5 LWC Indexer

**Use Case ID:** UC-05
**Input:** Parsed LWC data
**Output:** LWCIndexData JSON

**Extracted:**
- Component API surface
- Wire adapters, Apex imports
- Events, child components

### 1.6 Dependency Graph

**Use Case ID:** UC-06
**Input:** All indexed data
**Output:** DependencyGraph JSON

**Relationships:**
- Apex -> Apex (inheritance, method calls)
- Apex -> Object (SOQL, DML)
- Flow -> Apex (invocable methods)
- Flow -> Object (DML operations)
- LWC -> Apex (wire, imperative)
- LWC -> LWC (composition)
- Object -> Object (relationships)

### 1.7 Export API

**Use Case ID:** UC-07

`javascript
// Main API
const index = await parseProject('/path/to/sfdx', {
  include: ['apex', 'flows', 'objects', 'lwc'],
  exclude: ['profiles'],
  includeGraph: true,
  outputFormat: 'json' // or 'kb-payload'
});

// KB Payload conversion
const payloads = toKBPayload(index);
`

---

## 2. Business Rules

| Rule ID | Rule |
|---------|------|
| BR-01 | Scanner reads sfdx-project.json for package directories |
| BR-02 | Pipeline continues when individual files fail |
| BR-03 | Graph relationships are bidirectional queryable |
| BR-04 | KB payload includes searchText for semantic search |
