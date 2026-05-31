# Software Test Cases (STC)

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

## Test Cases

### 1. Scanner

#### TC-001: Scan SFDX Project
**Input:** Sample SFDX project with all metadata types
**Expected:** FileManifest with correct file counts per type

#### TC-002: Read sfdx-project.json
**Input:** Project with custom packageDirectories
**Expected:** Scanner uses correct paths

#### TC-003: Handle Missing Directories
**Input:** Project without lwc/ directory
**Expected:** lwc: [] (empty, no error)

#### TC-004: Manifest Summary
**Input:** Scanned project
**Expected:** getManifestSummary() returns correct totals

### 2. Apex Indexer

#### TC-010: Index Apex Class
**Input:** AccountService.cls with methods, SOQL, DML
**Expected:** { classes, methods, soqlQueries, dmlOperations }

#### TC-011: Index Trigger
**Input:** AccountTrigger.trigger
**Expected:** { triggerName, events, referencedObjects }

#### TC-012: Extract Dependencies
**Input:** Class calling other classes
**Expected:** dependencies array populated

#### TC-013: Handle Parse Error
**Input:** Malformed Apex file
**Expected:** { success: false, error: '...' }

### 3. Flow Indexer

#### TC-020: Index Flow
**Input:** Parsed flow data
**Expected:** { fullName, dmlOperations, variables, nodeCount }

#### TC-021: Extract DML Operations
**Input:** Flow with recordCreates, recordUpdates
**Expected:** dmlOperations: [{ type: 'create', object: 'Account' }]

#### TC-022: Extract Subflow References
**Input:** Flow calling subflows
**Expected:** referencedSubflows: ['SubFlowName']

### 4. Dependency Graph

#### TC-030: Add Nodes and Edges
**Input:** Graph with apex, object nodes
**Expected:** Nodes and edges stored correctly

#### TC-031: Query Dependencies
**Input:** getDependencies('apex:AccountService')
**Expected:** Returns edges from that node

#### TC-032: Query Dependents
**Input:** getDependents('object:Account')
**Expected:** Returns all nodes that reference Account

#### TC-033: Impact Analysis
**Input:** getImpact('object:Account', depth=2)
**Expected:** Returns all affected nodes within 2 hops

#### TC-034: Export to DOT
**Input:** Graph with nodes and edges
**Expected:** Valid DOT format string

### 5. parseProject()

#### TC-040: Full Pipeline
**Input:** Sample SFDX project path
**Expected:** Complete ProjectIndex with all sections

#### TC-041: With Filters
**Input:** parseProject(path, { include: ['apex'] })
**Expected:** Only apex indexed, others empty

#### TC-042: KB Payload Output
**Input:** parseProject(path, { outputFormat: 'kb-payload' })
**Expected:** Array of KB payload objects

---

## Traceability Matrix

| Requirement | Test Cases |
|-------------|------------|
| UC-01 (Scanner) | TC-001 to TC-004 |
| UC-02 (Apex) | TC-010 to TC-013 |
| UC-03 (Flow) | TC-020 to TC-022 |
| UC-06 (Graph) | TC-030 to TC-034 |
| UC-07 (API) | TC-040 to TC-042 |
| BR-02 (Resilience) | TC-013 |
| BR-03 (Bidirectional) | TC-031, TC-032 |
