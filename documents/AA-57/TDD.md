# Technical Design Document (TDD)

## Salesforce AST Parser - AA-57: Indexer Module

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-57 |
| Title | Indexer Module - Thiet ke ky thuat |
| Author | SA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## Architecture

![Architecture Overview](diagrams/architecture-overview.png)

![Dependency Graph](diagrams/dependency-graph.png)

![API Sequence](diagrams/api-sequence.png)

---

## 1. Architecture

### 1.1 Module Structure

`
src/indexer/
  index.js            -- Main entry (parseProject, toKBPayload)
  scanner.js          -- SFDX project scanner
  apex-indexer.js     -- Apex file indexer
  flow-indexer.js     -- Flow indexer
  object-indexer.js   -- Object/Field indexer
  lwc-indexer.js      -- LWC component indexer
  dependency-graph.js -- Graph builder
`

### 1.2 Data Flow

`
SFDX Project Path
       |
       v (scanner.js)
FileManifest { apex: [], flows: [], objects: [], lwc: [] }
       |
       v (individual indexers)
IndexedData { apex: [], flows: [], objects: [], lwc: [] }
       |
       v (dependency-graph.js)
DependencyGraph { nodes: Map, edges: [] }
       |
       v (index.js)
ProjectIndex (complete output)
       |
       v (toKBPayload)
KB Payloads []
`

---

## 2. Key Interfaces

### 2.1 parseProject()

`javascript
async function parseProject(projectPath, options = {}) {
  const manifest = scanProject(projectPath);
  const results = { apex: [], flows: [], objects: [], lwc: [] };
  
  // Parse each type
  for (const file of manifest.apex) results.apex.push(await indexApexFile(file));
  for (const file of manifest.flows) results.flows.push(indexFlowFile(file));
  // ... etc
  
  // Build graph
  const graph = buildDependencyGraph(results);
  
  return { metadata, ...results, graph };
}
`

### 2.2 DependencyGraph Class

`javascript
class DependencyGraph {
  addNode(type, name, filePath)
  addEdge(fromId, toId, relationship)
  getDependencies(nodeId)
  getDependents(nodeId)
  getImpact(nodeId, depth)
  search(query)
  toJSON()
  toDot()
}
`

### 2.3 KB Payload Format

`javascript
{
  id: 'apex:ClassName',
  type: 'apex',
  title: 'ClassName',
  content: JSON.stringify(data),
  searchText: 'class methods fields...',
  tags: ['apex', 'class']
}
`

---

## 3. Scanner Design

### 3.1 File Detection Patterns

| Type | Pattern | Example |
|------|---------|---------|
| Apex | **/*.cls, **/*.trigger | AccountService.cls |
| Flow | **/*.flow-meta.xml | MyFlow.flow-meta.xml |
| Object | **/*.object-meta.xml | Account.object-meta.xml |
| Field | **/*.field-meta.xml | MyField__c.field-meta.xml |
| LWC | lwc/*/  (directory) | lwc/myComponent/ |

---

## 4. Implementation Checklist

| # | File | Action |
|---|------|--------|
| 1 | src/indexer/scanner.js | Create |
| 2 | src/indexer/apex-indexer.js | Create |
| 3 | src/indexer/flow-indexer.js | Create |
| 4 | src/indexer/object-indexer.js | Create |
| 5 | src/indexer/lwc-indexer.js | Create |
| 6 | src/indexer/dependency-graph.js | Create |
| 7 | src/indexer/index.js | Create |
| 8 | index.js (root) | Update exports |
| 9 | package.json | Update exports map |
