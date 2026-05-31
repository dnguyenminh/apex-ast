# Salesforce Indexer Module

Full-project indexer that scans SFDX projects, parses all metadata types, and outputs structured data ready for Knowledge Base ingestion.

## Quick Start

```javascript
const { parseProject } = require('salesforce-ast');

const index = await parseProject('/path/to/sfdx-project', {
  includeGraph: true,
  outputFormat: 'json'
});

console.log(index.metadata.totalFiles);  // Total files indexed
console.log(index.flows.length);         // Flow count
console.log(index.graph.stats);          // Dependency graph stats
```

## API

### `parseProject(projectPath, options?)`

Main entry point. Scans and indexes entire SFDX project.

**Options:**
- `include: string[]` — Only include these metadata types
- `exclude: string[]` — Exclude these metadata types
- `includeGraph: boolean` — Build dependency graph (default: true)
- `outputFormat: 'json' | 'kb-payload'` — Output format

### `scanProject(projectPath)`

Scan project and return file manifest grouped by type.

### `buildDependencyGraph(projectIndex)`

Build cross-component dependency graph from indexed data.

## Dependency Graph

Tracks relationships:
- Apex -> Apex (inheritance, method calls)
- Apex -> Object (SOQL, DML)
- Flow -> Object (DML operations)
- Flow -> Flow (subflows)
- LWC -> Apex (wire, imperative)
- LWC -> LWC (composition)
- Object -> Object (lookups)

```javascript
const { buildDependencyGraph } = require('salesforce-ast');

const graph = buildDependencyGraph(index);
const impact = graph.getImpact('object:Account');  // What breaks if Account changes?
const dot = graph.toDot();                          // Export for visualization
```

## KB Payload Format

```javascript
const index = await parseProject(path, { outputFormat: 'kb-payload' });
// Returns array of: { id, type, title, content, searchText, tags }
```
