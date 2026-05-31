# salesforce-ast

Salesforce AST Parser & Indexer — Parse Apex, XML metadata, LWC components và xây dựng dependency graph cho Knowledge Base integration.

## Tổng quan

`salesforce-ast` là thư viện Node.js phân tích toàn bộ SFDX project thành structured data, phục vụ cho việc index code vào hệ thống Knowledge Base hoặc bất kỳ hệ thống phân tích nào.

**Hỗ trợ parse:**
- Apex Classes & Triggers (Tree-Sitter AST)
- Flows (.flow-meta.xml)
- Custom Objects & Fields (.object-meta.xml, .field-meta.xml)
- Validation Rules
- Permission Sets & Profiles
- Custom Labels
- Page Layouts
- Lightning Web Components (JS, HTML, CSS)

## Cài đặt

```bash
npm install salesforce-ast
```

**Yêu cầu:** Node.js 20+

## Quick Start

### Parse toàn bộ SFDX project

```javascript
const { parseProject } = require('salesforce-ast');

const index = await parseProject('/path/to/sfdx-project');

console.log(index.metadata.summary);
// { apex: 15, flows: 3, objects: 5, lwc: 8, total: 42 }

console.log(index.apex[0].data.classes);
// [{ name: 'AccountService', methods: [...], annotations: [...] }]

console.log(index.graph.stats);
// { nodeCount: 31, edgeCount: 47, nodesByType: { apex: 15, flow: 3, object: 5, lwc: 8 } }
```

### Export cho Knowledge Base

```javascript
const { parseProject, toKBPayload } = require('salesforce-ast');

const index = await parseProject('/path/to/sfdx-project');
const payloads = toKBPayload(index);

// Mỗi payload sẵn sàng ingest vào KB
for (const payload of payloads) {
  console.log(payload);
  // {
  //   id: 'apex:AccountService',
  //   type: 'apex',
  //   title: 'AccountService',
  //   content: '{"classes":[...],"methods":[...],"soqlQueries":[...]}',
  //   searchText: 'AccountService getAccounts insertAccount SOQL Account Contact',
  //   tags: ['apex', 'class']
  // }
  
  // Ingest vào KB system của bạn:
  // await kbClient.ingest(payload);
}
```

## API Reference

### Main API

#### `parseProject(projectPath, options?)`

Parse toàn bộ SFDX project.

```javascript
const index = await parseProject('/path/to/project', {
  include: ['apex', 'flows', 'objects'],  // Chỉ parse types này
  exclude: ['profiles'],                   // Bỏ qua types này
  includeGraph: true,                      // Xây dependency graph (default: true)
  outputFormat: 'json'                     // 'json' hoặc 'kb-payload'
});
```

**Returns:** `ProjectIndex` object chứa tất cả parsed data + dependency graph.

#### `toKBPayload(projectIndex)`

Convert ProjectIndex thành array KB payloads sẵn sàng ingest.

```javascript
const payloads = toKBPayload(index);
// Returns: [{ id, type, title, content, searchText, tags }, ...]
```

#### `scanProject(projectPath)`

Scan SFDX project structure, trả về manifest files grouped by type.

```javascript
const { scanProject } = require('salesforce-ast');

const manifest = scanProject('/path/to/project');
console.log(manifest);
// {
//   apex: ['force-app/.../AccountService.cls', ...],
//   flows: ['force-app/.../Create_Account.flow-meta.xml', ...],
//   objects: ['force-app/.../Account.object-meta.xml', ...],
//   lwc: ['force-app/.../lwc/accountList', ...],
//   ...
// }
```

#### `buildDependencyGraph(indexedData)`

Xây dựng dependency graph từ indexed data.

```javascript
const { buildDependencyGraph } = require('salesforce-ast');

const graph = buildDependencyGraph({
  apex: index.apex.filter(r => r.success),
  flows: index.flows.filter(r => r.success),
  objects: index.objects.filter(r => r.success),
  lwc: index.lwc.filter(r => r.success)
});

// Query: "AccountService phụ thuộc vào gì?"
const deps = graph.getDependencies('apex:AccountService');
// [{ from: 'apex:AccountService', to: 'object:Account', relationship: 'queries' }]

// Query: "Nếu thay đổi Account object, ảnh hưởng gì?"
const impact = graph.getImpact('object:Account');
// Set { 'apex:AccountService', 'flow:Create_Account', 'lwc:accountList' }

// Export DOT format (cho visualization)
const dot = graph.toDot();

// Export JSON
const json = graph.toJSON();
// { nodes: [...], edges: [...], stats: { nodeCount, edgeCount, nodesByType } }
```

---

### Individual Parsers

Mỗi parser có thể dùng độc lập (không cần scan toàn bộ project).

#### Apex Parser

```javascript
const { parseApexFile, initParser } = require('salesforce-ast');

// Khởi tạo parser (gọi 1 lần)
await initParser();

// Parse file
const result = await parseApexFile('/path/to/AccountService.cls');
// result.data: { classes, methods, fields, annotations, soqlQueries, dmlOperations }
```

#### Flow Parser

```javascript
const { parseFlowFile, parseFlowString } = require('salesforce-ast');

// Parse từ file
const result = parseFlowFile('/path/to/MyFlow.flow-meta.xml');

// Hoặc parse từ string
const result2 = parseFlowString(xmlContent);

// result.data:
// {
//   fullName: 'Create_Account_Flow',
//   processType: 'AutoLaunchedFlow',
//   status: 'Active',
//   variables: [...],
//   decisions: [...],
//   assignments: [...],
//   recordCreates: [...],
//   recordUpdates: [...],
//   recordDeletes: [...],
//   recordLookups: [...],
//   screens: [...],
//   loops: [...],
//   subflows: [...]
// }
```

#### Object & Field Parser

```javascript
const { parseObjectFile, parseFieldFile } = require('salesforce-ast');

const obj = parseObjectFile('/path/to/Account.object-meta.xml');
// obj.data: { fullName, label, fields, relationships, recordTypes, validationRules, sharingModel }

const field = parseFieldFile('/path/to/MyField__c.field-meta.xml');
// field.data: { fullName, label, type, formula, picklistValues, referenceTo, required, unique }
```

#### Permission Set & Profile Parser

```javascript
const { parsePermissionSetFile, parseProfileFile } = require('salesforce-ast');

const ps = parsePermissionSetFile('/path/to/MyPermSet.permissionset-meta.xml');
// ps.data: { objectPermissions, fieldPermissions, classAccesses, tabVisibilities }

const profile = parseProfileFile('/path/to/Admin.profile-meta.xml');
```

#### Label & Layout Parser

```javascript
const { parseLabelFile, parseLayoutFile } = require('salesforce-ast');

const labels = parseLabelFile('/path/to/CustomLabels.labels-meta.xml');
// labels.data: { labels: [{ fullName, value, category, language }] }

const layout = parseLayoutFile('/path/to/Account-Layout.layout-meta.xml');
// layout.data: { sections, relatedLists, quickActions }
```

#### LWC Parsers

```javascript
const { parseLWCJsFile, parseLWCHtmlFile, parseLWCCssFile } = require('salesforce-ast');

// JavaScript — extract component API surface
const js = parseLWCJsFile('/path/to/lwc/myComponent/myComponent.js');
// js.data: { className, apiProperties, wireDecorators, apexImports, events, lifecycleHooks }

// HTML Template — extract bindings and component refs
const html = parseLWCHtmlFile('/path/to/lwc/myComponent/myComponent.html');
// html.data: { components, bindings, directives, eventHandlers, slots }

// CSS — extract custom properties
const css = parseLWCCssFile('/path/to/lwc/myComponent/myComponent.css');
// css.data: { customProperties, hostSelectors, mediaQueries }
```

---

### Sub-path Imports

Import trực tiếp từng module để giảm bundle size:

```javascript
const { parseFlowFile } = require('salesforce-ast/parsers/xml');
const { parseLWCJsFile } = require('salesforce-ast/parsers/lwc');
const { parseApexFile } = require('salesforce-ast/parsers/apex');
const { parseProject } = require('salesforce-ast/indexer');
const { scanProject } = require('salesforce-ast/scanner');
const { DependencyGraph } = require('salesforce-ast/graph');
```

---

## Tích hợp với hệ thống khác

### 1. Knowledge Base Integration

```javascript
const { parseProject, toKBPayload } = require('salesforce-ast');

async function indexSalesforceProject(projectPath, kbClient) {
  const index = await parseProject(projectPath);
  const payloads = toKBPayload(index);
  
  for (const payload of payloads) {
    await kbClient.ingest({
      id: payload.id,
      type: payload.type,
      title: payload.title,
      content: payload.content,
      metadata: { searchText: payload.searchText, tags: payload.tags }
    });
  }
  
  // Ingest dependency graph
  if (index.graph) {
    await kbClient.ingest({
      id: 'graph:project-dependencies',
      type: 'dependency-graph',
      title: 'Project Dependency Graph',
      content: JSON.stringify(index.graph)
    });
  }
  
  console.log(`Indexed ${payloads.length} components`);
}
```

### 2. MCP Server Integration

```javascript
const { parseProject, scanProject, buildDependencyGraph } = require('salesforce-ast');

// MCP Tool: parse_salesforce_project
async function handleParseProject({ projectPath, types }) {
  const options = types ? { include: types } : {};
  return await parseProject(projectPath, options);
}

// MCP Tool: get_impact_analysis
async function handleImpactAnalysis({ projectPath, componentId }) {
  const index = await parseProject(projectPath);
  const graph = buildDependencyGraph(index);
  return {
    dependencies: graph.getDependencies(componentId),
    dependents: graph.getDependents(componentId),
    impact: Array.from(graph.getImpact(componentId))
  };
}
```

### 3. CI/CD Pipeline — Impact Analysis

```javascript
const { parseProject, buildDependencyGraph } = require('salesforce-ast');

async function checkImpact(changedFiles) {
  const index = await parseProject(process.cwd());
  const graph = buildDependencyGraph(index);
  
  const allImpacted = new Set();
  for (const file of changedFiles) {
    const impact = graph.getImpact(resolveComponentId(file));
    impact.forEach(id => allImpacted.add(id));
  }
  
  if (allImpacted.size > 10) {
    console.warn(`⚠️ High impact: ${allImpacted.size} components affected`);
    process.exit(1);
  }
}
```

### 4. VS Code Extension

```javascript
const { parseApexFile, parseFlowFile, initParser } = require('salesforce-ast');

// On file open — show AST in sidebar
vscode.workspace.onDidOpenTextDocument(async (doc) => {
  if (doc.fileName.endsWith('.cls')) {
    await initParser();
    const result = await parseApexFile(doc.fileName);
    updateASTView(result.data);
  }
});
```

---

## Output Format

### ParseResult

```typescript
interface ParseResult {
  success: boolean;
  data?: any;           // Parsed data (type-specific)
  error?: string;       // Error message nếu fail
  filePath: string;     // Source file path
  metadataType: string; // 'Flow' | 'CustomObject' | 'Apex' | ...
  parseTimeMs: number;  // Parse duration in ms
}
```

### ProjectIndex

```typescript
interface ProjectIndex {
  metadata: {
    projectPath: string;
    indexedAt: string;
    totalFiles: number;
    parseTimeMs: number;
    summary: { [type: string]: number };
  };
  apex: ParseResult[];
  flows: ParseResult[];
  objects: ParseResult[];
  fields: ParseResult[];
  lwc: ParseResult[];
  permissions: ParseResult[];
  labels: ParseResult | null;
  layouts: ParseResult[];
  graph: {
    nodes: { id: string, type: string, name: string, filePath: string }[];
    edges: { from: string, to: string, relationship: string }[];
    stats: { nodeCount: number, edgeCount: number, nodesByType: object };
  } | null;
}
```

### KBPayload

```typescript
interface KBPayload {
  id: string;          // "apex:ClassName" | "flow:FlowName" | "object:ObjectName"
  type: string;        // 'apex' | 'flow' | 'object' | 'lwc'
  title: string;       // Display name
  content: string;     // JSON stringified parsed data
  searchText: string;  // Optimized for semantic search
  tags: string[];      // Categorization tags
}
```

---

## Dependency Graph Relationships

| From | To | Relationship | Ví dụ |
|------|----|-------------|-------|
| Apex | Apex | extends, implements | AccountService extends BaseService |
| Apex | Object | queries, creates, updates, deletes | [SELECT FROM Account] |
| Flow | Object | creates, updates, deletes, queries | Record Create → Account |
| Flow | Apex | calls_invocable | Flow → @InvocableMethod |
| Flow | Flow | calls_subflow | Parent Flow → Child Flow |
| LWC | Apex | calls_apex | @wire(getAccounts) |
| LWC | LWC | contains | Parent → Child component |
| Object | Object | lookup, master_detail | Contact → Account |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run generate` | Regenerate Apex parser from grammar.js |
| `npm run test:grammar` | Run 38 Tree-Sitter corpus tests |
| `npm run test` | Run 48 vitest unit/integration tests |
| `npm run test:coverage` | Run tests with coverage report |

---

## License

MIT © [Nguyen Minh Duc](https://www.linkedin.com/in/duc-nguyen-7bbb3827/)
