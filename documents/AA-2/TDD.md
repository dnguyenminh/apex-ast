# Technical Design Document (TDD)

## Salesforce AST Parser — AA-2: Verify Project

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-2 |
| Title | Verify Project — Thiết kế kỹ thuật |
| Author | SA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related BRD | documents/AA-2/BRD.md |
| Related FSD | documents/AA-2/FSD.md |

---

## 1. Introduction

### 1.1 Purpose

Thiết kế kỹ thuật cho quy trình verify parser: test corpus mở rộng, error detection script, grammar patching workflow.

### 1.2 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Test Framework | tree-sitter test (corpus) | 0.26.9 |
| Reference Grammar | ANTLR4 (forcedotcom/apex-parser) | Latest |
| Runtime | Node.js | 20+ |

---

## 2. System Architecture

### 2.1 Test Corpus Structure

```
test/corpus/
├── basic_class.txt       (from AA-1)
├── soql_queries.txt      (SOQL/SOSL)
├── dml_statements.txt    (DML operations)
├── triggers.txt          (Trigger declarations)
├── control_flow.txt      (if/for/while/switch)
├── interfaces.txt        (Interface declarations)
├── enums.txt             (Enum declarations)
├── annotations.txt       (Decorators)
├── try_catch.txt         (Exception handling)
└── methods.txt           (Method declarations)
```

### 2.2 Patch Workflow

![ANTLR to AI to Tree-Sitter Patching Workflow](diagrams/antlr-ai-treesitter-workflow.png)

```
1. Run tests -> identify ERROR
2. Extract failing source code
3. Lookup ANTLR4 rule in .g4 files
4. Translate: ANTLR4 -> Tree-Sitter JS DSL
5. Add to grammar.js override section
6. tree-sitter generate
7. tree-sitter test (full regression)
8. If pass -> commit; If fail -> iterate
```

---

## 3. Module Design

### 3.1 Error Detection Script (run_parser.js)

```javascript
const Parser = require('tree-sitter');
const SfApex = require('./build/Release/tree_sitter_apex_binding.node');
const fs = require('fs');

const parser = new Parser();
parser.setLanguage(SfApex);

const sourceCode = fs.readFileSync(process.argv[2], 'utf-8');
const tree = parser.parse(sourceCode);

function findErrors(node, errors = []) {
    if (node.type === 'ERROR' || node.isMissing) {
        errors.push({
            type: node.type,
            line: node.startPosition.row + 1,
            column: node.startPosition.column,
            text: sourceCode.substring(node.startIndex, node.endIndex)
        });
    }
    for (let i = 0; i < node.childCount; i++) {
        findErrors(node.child(i), errors);
    }
    return errors;
}

const errors = findErrors(tree.rootNode);
if (errors.length === 0) {
    console.log('No errors found.');
} else {
    console.log(`Found ${errors.length} error(s):`);
    errors.forEach(e => console.log(`  Line ${e.line}:${e.column} [${e.type}] "${e.text}"`));
}
```

### 3.2 ANTLR4 to Tree-Sitter Translation Guide

| ANTLR4 | Tree-Sitter | Example |
|--------|-------------|---------|
| `rule: a b ;` | `$ => seq($.a, $.b)` | Sequence |
| `rule: a \| b ;` | `$ => choice($.a, $.b)` | Choice |
| `rule: a? ;` | `$ => optional($.a)` | Optional |
| `rule: a* ;` | `$ => repeat($.a)` | Zero or more |
| `rule: a+ ;` | `$ => repeat1($.a)` | One or more |
| `'keyword'` | `'keyword'` | Literal |

---

## 4. Test Coverage Requirements

| Category | Min Cases | Priority |
|----------|-----------|----------|
| SOQL basic | 3 | High |
| SOQL nested | 2 | High |
| DML statements | 6 | High |
| Triggers | 2 | High |
| Control flow | 5 | High |
| Interfaces | 2 | Medium |
| Enums | 2 | Medium |
| Annotations | 3 | Medium |
| Try/catch | 2 | Medium |
| **Total** | **27+** | |

---

## 5. Implementation Checklist

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | test/corpus/soql_queries.txt | Create | SOQL test cases |
| 2 | test/corpus/dml_statements.txt | Create | DML test cases |
| 3 | test/corpus/triggers.txt | Create | Trigger tests |
| 4 | test/corpus/control_flow.txt | Create | Control flow tests |
| 5 | test/corpus/interfaces.txt | Create | Interface tests |
| 6 | test/corpus/enums.txt | Create | Enum tests |
| 7 | test/corpus/annotations.txt | Create | Annotation tests |
| 8 | test/corpus/try_catch.txt | Create | Exception tests |
| 9 | run_parser.js | Create | Error detection script |
| 10 | grammar.js | Update | Add overrides as needed |
