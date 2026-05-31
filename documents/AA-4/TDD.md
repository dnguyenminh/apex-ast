# Technical Design Document (TDD)

## Salesforce AST Parser - AA-4: Deployment (WASM)

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-4 |
| Title | Deployment WASM - Thiet ke ky thuat |
| Author | SA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## Architecture

![WASM Build Pipeline](diagrams/wasm-build-pipeline.png)

---

## 1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| WASM Compiler | Emscripten | Latest |
| Runtime | web-tree-sitter | 0.26.9 |
| Build Tool | tree-sitter-cli | 0.26.9 |

---

## 2. Build Process

### 2.1 WASM Build Command

`ash
npx tree-sitter build --wasm
`

### 2.2 Output

| File | Size | Location |
|------|------|----------|
| tree-sitter-apex.wasm | ~500KB | Project root |

### 2.3 Build Pipeline

`
src/parser.c --> Emscripten --> tree-sitter-apex.wasm
`

---

## 3. Runtime Design

### 3.1 run_wasm.js

`javascript
const { Parser, Language } = require('web-tree-sitter');
const fs = require('fs');

async function main() {
    await Parser.init();
    const parser = new Parser();
    const Lang = await Language.load('./tree-sitter-apex.wasm');
    parser.setLanguage(Lang);
    
    const source = fs.readFileSync(process.argv[2], 'utf-8');
    const tree = parser.parse(source);
    console.log(tree.rootNode.toString());
}

main().catch(console.error);
`

---

## 4. Implementation Checklist

| # | Task | Command |
|---|------|---------|
| 1 | Install Emscripten | emsdk install latest |
| 2 | Build WASM | npx tree-sitter build --wasm |
| 3 | Verify file exists | ls tree-sitter-apex.wasm |
| 4 | Create run_wasm.js | Script file |
| 5 | Test parse | node run_wasm.js test.cls |
