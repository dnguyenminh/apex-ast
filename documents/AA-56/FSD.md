# Functional Specification Document (FSD)

## Salesforce AST Parser - AA-56: LWC/Aura Parsers

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-56 |
| Title | LWC/Aura Parsers - Dac ta chuc nang |
| Author | BA Agent + TA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## Architecture Overview

![LWC Multi-Parser Architecture](diagrams/lwc-multi-parser-architecture.png)

---

## 1. Functional Requirements

### 1.1 LWC JavaScript Parser

**Use Case ID:** UC-01
**Input:** LWC .js file
**Output:** LWCJsDefinition JSON

**Extracted Data:**
- Class name (extends LightningElement)
- @api properties (public API)
- @track properties (reactive)
- @wire decorators (adapter, params)
- Apex method imports (from '@salesforce/apex/...')
- Event dispatches (new CustomEvent)
- Lifecycle hooks (connectedCallback, renderedCallback)
- Navigation mixins

### 1.2 LWC HTML Template Parser

**Use Case ID:** UC-02
**Input:** LWC .html file
**Output:** LWCHtmlDefinition JSON

**Extracted Data:**
- Template directives (if:true, for:each, iterator)
- Component references (<c-child-component>)
- Data bindings ({property})
- Event handlers (onclick, onchange)
- Slot usage
- Lightning base components used

### 1.3 LWC CSS Parser

**Use Case ID:** UC-03
**Input:** LWC .css file
**Output:** LWCCssDefinition JSON

**Extracted Data:**
- Custom CSS properties (--lwc-*)
- :host selectors
- Media queries
- Token references

### 1.4 Aura Component Parser

**Use Case ID:** UC-04
**Input:** .cmp file
**Output:** AuraDefinition JSON

**Extracted Data:**
- Component attributes (aura:attribute)
- Event registrations/handlers
- Component references
- Expression bindings ({!v.attribute})

---

## 2. API Contract

`javascript
// LWC JS
const { parseLWCJsFile, parseLWCJsContent } = require('./src/parsers/lwc/lwc-js-parser');
const result = parseLWCJsFile('/path/to/component.js');

// LWC HTML
const { parseLWCHtmlFile, parseLWCHtmlContent } = require('./src/parsers/lwc/lwc-html-parser');

// LWC CSS
const { parseLWCCssFile, parseLWCCssContent } = require('./src/parsers/lwc/lwc-css-parser');
`

---

## 3. Business Rules

| Rule ID | Rule |
|---------|------|
| BR-01 | @api properties = public API surface |
| BR-02 | @wire = data fetching declarations |
| BR-03 | Component refs in HTML = dependencies |
| BR-04 | Apex imports = server-side dependencies |
