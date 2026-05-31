# Technical Design Document (TDD)

## Salesforce Apex AST Parser — AA: Thiết kế kỹ thuật

---

## Document Information

| Field | Value |
|-------|-------|
| Project | AA (Salesforce Apex AST Parser) |
| Title | Thiết kế kỹ thuật bộ phân tích cú pháp Salesforce Apex |
| Author | SA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related BRD | documents/AA/BRD.md |
| Related FSD | documents/AA/FSD.md |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-27 | SA Agent | Khởi tạo tài liệu |

---

## 1. Introduction

### 1.1 Purpose

Tài liệu này mô tả thiết kế kỹ thuật chi tiết cho bộ Salesforce Apex AST Parser, bao gồm kiến trúc hệ thống, cấu trúc module, quy trình build, và deployment strategy.

### 1.2 Scope

- Grammar definition và generation pipeline
- Native binding architecture (Node.js C++ addon)
- WASM compilation và runtime
- Test infrastructure
- Multi-language binding system

### 1.3 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language (Grammar) | JavaScript | ES2020 |
| Language (Parser) | C | C11 |
| Language (Binding) | C++ | C++14 |
| Framework | Tree-Sitter | 0.25.0+ |
| CLI Tool | tree-sitter-cli | 0.26.9 |
| WASM Runtime | web-tree-sitter | 0.26.9 |
| Build (Native) | node-gyp + MSBuild/GCC | Latest |
| Build (WASM) | Emscripten | Latest |
| Package Manager | npm | 10+ |
| Runtime | Node.js | 20+ |

### 1.4 Design Principles

- **Inheritance over Fork**: Kế thừa grammar upstream, override khi cần
- **Dual Output**: Cùng parser.c sinh ra cả native và WASM
- **Error Tolerance**: Parser không bao giờ crash, luôn trả về tree
- **Zero Runtime Dependencies**: Parser C code tự chứa
- **Test-Driven**: Mọi grammar change phải có test case

### 1.5 Constraints

- Tree-Sitter grammar phải viết bằng JavaScript (DSL)
- Parser output là C code
- WASM build yêu cầu Emscripten SDK
- Native build yêu cầu C/C++ compiler
- Grammar name phải khớp giữa grammar.js và tree-sitter.json

---

## 2. System Architecture

### 2.1 Architecture Overview

```
CONSUMER LAYER
  Node.js App | Browser App | Python/Rust/Go/Java App
       |              |                |
BINDING LAYER
  Native (.node) | WASM (.wasm) | Language FFI
       |              |                |
PARSER ENGINE
  src/parser.c (Generated C code ~500KB)
       |
GRAMMAR LAYER
  grammar.js → sfapex-source/apex/grammar.js
```

### 2.2 Component Diagram

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| grammar.js | Định nghĩa cú pháp Apex | JavaScript DSL |
| src/parser.c | Parser engine (generated) | C11 |
| bindings/node/binding.cc | Node.js addon bridge | C++ |
| tree-sitter-apex.wasm | Cross-platform binary | WebAssembly |
| run_parser.js | Native demo + error detection | JavaScript |
| run_wasm.js | WASM demo | JavaScript |
| test/corpus/*.txt | Automated tests | Corpus format |
| binding.gyp | Native build config | GYP |
| tree-sitter.json | Parser metadata | JSON |

### 2.3 Build Pipeline

```
grammar.js
    |
    v (tree-sitter generate)
src/parser.c + src/tree_sitter/parser.h
    |                    |
    v (node-gyp)        v (emscripten)
 .node file          .wasm file
    |                    |
    v                    v
Native Runtime      WASM Runtime
```

---

## 3. Module Design

### 3.1 Project Structure

```
salesforce-ast/
├── grammar.js                    # Grammar definition (entry point)
├── package.json                  # npm config, scripts
├── tree-sitter.json              # Parser metadata
├── binding.gyp                   # Native build config
├── src/                          # Generated (DO NOT EDIT)
│   ├── parser.c
│   └── tree_sitter/parser.h
├── bindings/                     # Language bindings
│   ├── node/
│   │   ├── binding.cc
│   │   ├── index.js
│   │   └── index.d.ts
│   ├── python/
│   ├── rust/
│   ├── go/
│   ├── java/
│   ├── swift/
│   └── zig/
├── build/Release/                # Native build output
│   └── tree_sitter_apex_binding.node
├── tree-sitter-apex.wasm         # WASM output
├── run_parser.js                 # Native demo
├── run_wasm.js                   # WASM demo
├── test/corpus/                  # Test cases
│   ├── basic_class.txt
│   ├── variables.txt
│   ├── control_flow.txt
│   ├── dml_statements.txt
│   ├── triggers.txt
│   ├── interfaces.txt
│   ├── enums.txt
│   └── annotations.txt
└── sfapex-source/                # Upstream grammar
    └── apex/grammar.js
```

### 3.2 Key Interfaces

**Native Parser API:**

```javascript
const Parser = require('tree-sitter');
const Language = require('./build/Release/tree_sitter_apex_binding.node');

const parser = new Parser();
parser.setLanguage(Language);
const tree = parser.parse(sourceCode);

// Node API
node.type;           // string
node.text;           // string
node.startPosition;  // { row, column }
node.endPosition;    // { row, column }
node.children;       // SyntaxNode[]
node.namedChildren;  // SyntaxNode[]
node.isMissing;      // boolean
```

**WASM Parser API:**

```javascript
const { Parser, Language } = require('web-tree-sitter');
await Parser.init();
const parser = new Parser();
const lang = await Language.load('tree-sitter-apex.wasm');
parser.setLanguage(lang);
const tree = parser.parse(sourceCode);
```

### 3.3 Grammar Inheritance Pattern

```javascript
const apexGrammar = require('./sfapex-source/apex/grammar.js');

module.exports = grammar(apexGrammar, {
  name: 'apex',
  rules: {
    // Override: rule_name: ($, original) => choice(original, newAlt)
    // Add new: new_rule: $ => seq('keyword', $.expression)
  }
});
```

### 3.4 Error Detection Pattern

```javascript
function findErrors(node, sourceCode, errors = []) {
    if (node.type === 'ERROR' || node.isMissing) {
        errors.push({
            type: node.type,
            row: node.startPosition.row + 1,
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

---

## 4. Build Configuration

### 4.1 binding.gyp

- Target: `tree_sitter_apex_binding`
- Sources: `bindings/node/binding.cc` + `src/parser.c`
- Critical: target name → export symbol `tree_sitter_apex` → grammar name = `apex`

### 4.2 package.json Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| generate | `tree-sitter generate` | Grammar → C parser |
| test | `tree-sitter test` | Run corpus tests |
| build:native | `node-gyp rebuild` | Build .node |
| build:wasm | `tree-sitter build --wasm` | Build .wasm |

---

## 5. Test Infrastructure

### 5.1 Test Format

```
==================
{Test Name}
==================

{Apex Source Code}

---

{Expected AST — S-expression}
```

### 5.2 Test Coverage Requirements

| Category | Min Cases | Priority |
|----------|-----------|----------|
| Class declarations | 2 | High |
| Method declarations | 2 | High |
| Variable declarations | 2 | High |
| Control flow | 3 | High |
| DML statements | 3 | High |
| SOQL/SOSL | 2 | High |
| Triggers | 1 | High |
| Interfaces | 1 | Medium |
| Enums | 1 | Medium |
| Annotations | 1 | Medium |
| Try/catch | 1 | Medium |

---

## 6. Deployment

### 6.1 Distribution Formats

| Format | File | Use Case | Size |
|--------|------|----------|------|
| npm package | package.json | Node.js | ~2MB |
| Native addon | .node | Server-side | ~200KB |
| WASM | .wasm | Browser | ~500KB |
| C library | parser.c | Embed | ~500KB |

### 6.2 Platform Support

| Platform | Native | WASM |
|----------|--------|------|
| Windows x64 | Yes | Yes |
| macOS x64/ARM | Yes | Yes |
| Linux x64 | Yes | Yes |
| Browser | No | Yes |

---

## 7. Security Design

| Threat | Risk | Mitigation |
|--------|------|------------|
| Malicious input | Low | Read-only, no execution |
| Supply chain | Medium | Pin versions, audit |
| WASM escape | Very Low | Browser sandbox |
| Buffer overflow | Low | Tree-Sitter safe codegen |

---

## 8. Performance Targets

| Operation | Target | Platform |
|-----------|--------|----------|
| Parse 100 lines | < 5ms | Native |
| Parse 1000 lines | < 100ms | Native |
| Parse 1000 lines | < 200ms | WASM |
| Incremental parse | < 10ms | Native |
| Generate | < 30s | CLI |
| Native build | < 60s | node-gyp |
| WASM build | < 120s | emscripten |

---

## 9. Implementation Checklist

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | test/corpus/variables.txt | Create | Variable tests |
| 2 | test/corpus/control_flow.txt | Create | If/for/while tests |
| 3 | test/corpus/dml_statements.txt | Create | DML tests |
| 4 | test/corpus/triggers.txt | Create | Trigger tests |
| 5 | test/corpus/interfaces.txt | Create | Interface tests |
| 6 | test/corpus/enums.txt | Create | Enum tests |
| 7 | test/corpus/annotations.txt | Create | Annotation tests |
| 8 | test/corpus/try_catch.txt | Create | Exception tests |
| 9 | test/corpus/methods.txt | Create | Method tests |

---

## 10. Appendix

### Open Questions

| # | Question | Status | Answer |
|---|----------|--------|--------|
| 1 | Apex syntax version? | Resolved | Latest via sfapex v3.0.0 |
| 2 | Publish to npm? | Open | TBD |
| 3 | CI/CD setup? | Open | GitHub Actions recommended |
