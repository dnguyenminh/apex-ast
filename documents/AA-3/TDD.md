# Technical Design Document (TDD)

## Salesforce AST Parser — AA-3: Synchronize (Native Binding)

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-3 |
| Title | Synchronize — Thiet ke ky thuat |
| Author | SA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related FSD | documents/AA-3/FSD.md |

---

## Architecture

![Native Binding Architecture](diagrams/native-binding-architecture.png)

---

## 1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Build System | node-gyp | Latest |
| Addon API | node-addon-api | 8.x |
| Compiler (Win) | MSVC (VS Build Tools) | 2022 |
| Compiler (Linux) | GCC | 12+ |
| Runtime | Node.js | 20+ |

---

## 2. Architecture

### 2.1 Build Pipeline

```
src/parser.c + bindings/node/binding.cc
         |
         v (node-gyp rebuild)
build/Release/tree_sitter_apex_binding.node
         |
         v (require)
Node.js Application
```

### 2.2 Symbol Resolution

```
grammar.js: name = 'apex'
    -> generates: tree_sitter_apex (C symbol in parser.c)
binding.cc: extern "C" tree_sitter_apex()
    -> links to parser.c symbol
binding.gyp: target = tree_sitter_apex_binding
    -> output filename
```

---

## 3. Key Files

### 3.1 binding.gyp

`json
{
  "targets": [{
    "target_name": "tree_sitter_apex_binding",
    "sources": ["bindings/node/binding.cc", "src/parser.c"],
    "include_dirs": ["src"],
    "cflags_c": ["-std=c11"]
  }]
}
`

### 3.2 bindings/node/binding.cc

`cpp
#include <napi.h>
extern "C" TSLanguage *tree_sitter_apex();

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports["language"] = Napi::External<TSLanguage>::New(env, tree_sitter_apex());
    return exports;
}
NODE_API_MODULE(tree_sitter_apex_binding, Init)
`

### 3.3 run_parser.js

`javascript
const Parser = require('tree-sitter');
const SfApex = require('./build/Release/tree_sitter_apex_binding.node');
const fs = require('fs');

const parser = new Parser();
parser.setLanguage(SfApex);
const source = fs.readFileSync(process.argv[2], 'utf-8');
const tree = parser.parse(source);
// Traverse and find ERROR nodes
`

---

## 4. Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| LNK2001 unresolved tree_sitter_apex | Name mismatch | Sync grammar.js name with binding |
| ABI mismatch | Version conflict | Match tree-sitter versions |
| MODULE_NOT_FOUND | Build failed | npx node-gyp rebuild |

---

## 5. Implementation Checklist

| # | File | Action |
|---|------|--------|
| 1 | binding.gyp | Verify target name |
| 2 | bindings/node/binding.cc | Verify extern symbol |
| 3 | npx node-gyp rebuild | Execute build |
| 4 | run_parser.js | Create error detection script |
| 5 | Test: require + parse | Verify end-to-end |
