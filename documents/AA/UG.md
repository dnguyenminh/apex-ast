# User Guide (UG)

## Salesforce Apex AST Parser — Hướng dẫn sử dụng

---

## Document Information

| Field | Value |
|-------|-------|
| Project | AA (Salesforce Apex AST Parser) |
| Version | 1.0 |
| Date | 2025-01-27 |
| Author | DEV Agent |

---

## 1. Introduction

### 1.1 Purpose

Bộ **Salesforce Apex AST Parser** phân tích cú pháp mã nguồn Salesforce Apex thành cây cú pháp trừu tượng (AST). Hỗ trợ Native Binding (hiệu năng cao) và WebAssembly (cross-platform).

### 1.2 Prerequisites

| Prerequisite | Version | Required |
|-------------|---------|----------|
| Node.js | 20+ | Yes |
| C/C++ Compiler | VS Build Tools (Win) / GCC (Linux) | For native build |
| Python | 3.x | For node-gyp |
| Emscripten | Latest | For WASM build |

---

## 2. Getting Started

### 2.1 Quick Start

```bash
# Clone & install
git clone https://github.com/dnguyenminh/apex-ast.git
cd salesforce-ast
npm install

# Generate parser
npm run generate

# Run tests
npm run test

# Build native (optional)
npx node-gyp rebuild

# Build WASM (optional)
npx tree-sitter build --wasm
```

### 2.2 Verify Installation

```bash
npm run generate   # No output = success
npm run test       # All green checkmarks
node run_parser.js # AST output (after native build)
node run_wasm.js   # AST output (after WASM build)
```

---

## 3. Configuration

### 3.1 grammar.js

```javascript
const apexGrammar = require('./sfapex-source/apex/grammar.js');

module.exports = grammar(apexGrammar, {
  name: 'apex',
  rules: {
    // Override/extend rules here
  }
});
```

### 3.2 Key Files

| File | Purpose | Edit? |
|------|---------|-------|
| grammar.js | Grammar rules | Yes |
| tree-sitter.json | Parser metadata | Rarely |
| binding.gyp | Native build config | No |
| package.json | Dependencies | Rarely |

---

## 4. Usage

### 4.1 Native Parsing

```javascript
const Parser = require('tree-sitter');
const SfApex = require('./build/Release/tree_sitter_apex_binding.node');

const parser = new Parser();
parser.setLanguage(SfApex);

const tree = parser.parse(`
public class AccountService {
    public List<Account> getAccounts() {
        return [SELECT Id, Name FROM Account];
    }
}
`);

console.log(tree.rootNode.toString());
```

### 4.2 WASM Parsing

```javascript
const { Parser, Language } = require('web-tree-sitter');

async function parse(sourceCode) {
    await Parser.init();
    const parser = new Parser();
    const Lang = await Language.load('tree-sitter-apex.wasm');
    parser.setLanguage(Lang);
    return parser.parse(sourceCode);
}
```

### 4.3 Error Detection

```javascript
function findErrors(node, sourceCode, errors = []) {
    if (node.type === 'ERROR' || node.isMissing) {
        errors.push({
            line: node.startPosition.row + 1,
            column: node.startPosition.column,
            text: sourceCode.substring(node.startIndex, node.endIndex)
        });
    }
    for (let i = 0; i < node.childCount; i++) {
        findErrors(node.child(i), sourceCode, errors);
    }
    return errors;
}
```

### 4.4 AST Traversal

```javascript
function getClassNames(node, names = []) {
    if (node.type === 'class_declaration') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) names.push(nameNode.text);
    }
    for (let i = 0; i < node.childCount; i++) {
        getClassNames(node.child(i), names);
    }
    return names;
}
```

### 4.5 Incremental Parsing

```javascript
tree.edit({
    startIndex: editStart,
    oldEndIndex: editOldEnd,
    newEndIndex: editNewEnd,
    startPosition: { row: 4, column: 10 },
    oldEndPosition: { row: 4, column: 15 },
    newEndPosition: { row: 4, column: 20 }
});
tree = parser.parse(newSource, tree);
```

---

## 5. Administration

### 5.1 Adding Grammar Rules

1. Xác định ERROR node → tra cứu ANTLR4 grammar
2. Dịch rule sang Tree-Sitter → thêm vào grammar.js
3. `npm run generate && npm run test`

### 5.2 Updating Upstream

```bash
cd sfapex-source && git pull && cd ..
npm run generate && npm run test
```

---

## 6. Troubleshooting

| # | Symptom | Solution |
|---|---------|----------|
| 1 | LNK2001 unresolved symbol | Sync name in grammar.js + tree-sitter.json |
| 2 | TypeError undefined length | `npm install tree-sitter@latest` |
| 3 | MODULE_NOT_FOUND .node | `npx node-gyp rebuild` |
| 4 | WASM load fails | `npx tree-sitter build --wasm` |
| 5 | Parser.Language.load error | Use `Language.load()` (named export) |

---

## 7. API Reference

### SyntaxNode Properties

| Property | Type | Description |
|----------|------|-------------|
| type | string | Node type |
| text | string | Source text |
| startPosition | {row, column} | Start |
| endPosition | {row, column} | End |
| children | SyntaxNode[] | Children |
| namedChildren | SyntaxNode[] | Named only |
| isMissing | boolean | Error recovery |

### SyntaxNode Methods

| Method | Description |
|--------|-------------|
| child(i) | Get child by index |
| childForFieldName(name) | Get by field name |
| descendantsOfType(type) | Find all of type |
