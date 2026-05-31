# Software Test Cases (STC)

## Salesforce AST Parser - AA-56: LWC/Aura Parsers

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-56 |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |

---

## Test Cases

### 1. LWC JS Parser

#### TC-001: Extract @api Properties
**Input:** LWC JS with @api recordId, @api objectApiName
**Expected:** apiProperties: ['recordId', 'objectApiName']

#### TC-002: Extract @wire Decorators
**Input:** LWC JS with @wire(getRecord, { recordId: ... })
**Expected:** wireAdapters: [{ adapter: 'getRecord', params: {...} }]

#### TC-003: Extract Apex Imports
**Input:** import getAccounts from '@salesforce/apex/AccountController.getAccounts'
**Expected:** apexImports: [{ method: 'getAccounts', className: 'AccountController' }]

#### TC-004: Extract Events
**Input:** this.dispatchEvent(new CustomEvent('select', { detail: data }))
**Expected:** events: [{ name: 'select', hasDetail: true }]

#### TC-005: Extract Lifecycle Hooks
**Input:** LWC with connectedCallback, renderedCallback
**Expected:** lifecycleHooks: ['connectedCallback', 'renderedCallback']

#### TC-006: Complex Component
**Input:** Real-world LWC with multiple decorators
**Expected:** All properties extracted correctly

### 2. LWC HTML Parser

#### TC-010: Extract Component References
**Input:** HTML with <c-child-comp> and <lightning-input>
**Expected:** childComponents: ['c-child-comp', 'lightning-input']

#### TC-011: Extract Data Bindings
**Input:** HTML with {propertyName} bindings
**Expected:** bindings: ['propertyName', ...]

#### TC-012: Extract Directives
**Input:** HTML with if:true, for:each
**Expected:** directives: [{ type: 'if:true', value: '...' }, ...]

#### TC-013: Extract Event Handlers
**Input:** HTML with onclick={handleClick}
**Expected:** eventHandlers: [{ event: 'click', handler: 'handleClick' }]

#### TC-014: Extract Slots
**Input:** HTML with <slot name="header">
**Expected:** slots: [{ name: 'header' }]

### 3. LWC CSS Parser

#### TC-020: Extract Custom Properties
**Input:** CSS with --lwc-colorBrand: #0070d2
**Expected:** customProperties: ['--lwc-colorBrand']

#### TC-021: Extract :host Selectors
**Input:** CSS with :host { display: block }
**Expected:** hostStyles present

#### TC-022: Extract Media Queries
**Input:** CSS with @media queries
**Expected:** mediaQueries: [...]

---

## Traceability Matrix

| Requirement | Test Cases |
|-------------|------------|
| UC-01 (LWC JS) | TC-001 to TC-006 |
| UC-02 (LWC HTML) | TC-010 to TC-014 |
| UC-03 (LWC CSS) | TC-020 to TC-022 |
| BR-01 (@api) | TC-001 |
| BR-02 (@wire) | TC-002 |
| BR-03 (refs) | TC-010 |
| BR-04 (apex) | TC-003 |
