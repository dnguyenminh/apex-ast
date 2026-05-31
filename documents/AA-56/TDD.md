# Technical Design Document (TDD)

## Salesforce AST Parser - AA-56: LWC/Aura Parsers

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-56 |
| Title | LWC/Aura Parsers - Thiet ke ky thuat |
| Author | SA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## Architecture

![LWC Multi-Parser Architecture](diagrams/lwc-multi-parser-architecture.png)

---

## 1. Architecture

### 1.1 Module Structure

`
src/parsers/lwc/
  lwc-js-parser.js    -- JavaScript parser
  lwc-html-parser.js  -- HTML template parser
  lwc-css-parser.js   -- CSS parser
  index.js            -- Barrel export
`

### 1.2 Parsing Approach

| Parser | Technique | Reason |
|--------|-----------|--------|
| LWC JS | Regex + AST patterns | Extract decorators, imports |
| LWC HTML | Regex + DOM-like | Extract directives, bindings |
| LWC CSS | Regex | Extract custom properties |

---

## 2. LWC JS Parser Design

### 2.1 Extraction Patterns

`javascript
// @api detection
const apiPattern = /@api\s+(\w+)/g;

// @wire detection
const wirePattern = /@wire\(([^)]+)\)\s+(\w+)/g;

// Apex imports
const apexImportPattern = /import\s+(\w+)\s+from\s+'@salesforce\/apex\/([^']+)'/g;

// Event dispatch
const eventPattern = /new\s+CustomEvent\s*\(\s*['"]([^'"]+)['"]/g;

// Lifecycle hooks
const lifecycleHooks = ['connectedCallback', 'disconnectedCallback', 'renderedCallback', 'errorCallback'];
`

---

## 3. LWC HTML Parser Design

### 3.1 Extraction Patterns

`javascript
// Component references
const componentRefPattern = /<(c-[\w-]+|lightning-[\w-]+)/g;

// Data bindings
const bindingPattern = /\{([^}]+)\}/g;

// Directives
const directivePattern = /(if:true|if:false|for:each|iterator:\w+)="\{([^}]+)\}"/g;

// Event handlers
const handlerPattern = /on(\w+)=\{([^}]+)\}/g;
`

---

## 4. Implementation Checklist

| # | File | Action |
|---|------|--------|
| 1 | src/parsers/lwc/lwc-js-parser.js | Create |
| 2 | src/parsers/lwc/lwc-html-parser.js | Create |
| 3 | src/parsers/lwc/lwc-css-parser.js | Create |
| 4 | src/parsers/lwc/index.js | Create |
| 5 | tests/lwc-js-parser.test.js | Create |
| 6 | tests/lwc-html-parser.test.js | Create |
| 7 | tests/lwc-css-parser.test.js | Create |
