# Business Requirements Document (BRD)

## Salesforce AST Parser - AA-56: LWC/Aura Parsers

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-56 |
| Title | LWC/Aura Component Parsers |
| Author | BA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## 1. Introduction

### 1.1 Scope

Parse Lightning Web Components (LWC) va Aura components. LWC JS parser extract @api, @wire, apex imports, events. LWC HTML parser extract directives, bindings, component refs. LWC CSS parser extract custom properties. Aura parser cho .cmp va controller.js.

### 1.2 Preliminary Requirement

- AA-1 hoan thanh (project structure)
- Tree-Sitter JS/HTML/CSS parsers (optional, co the dung regex/AST)

---

## 2. Business Requirements

### 2.1 User Stories

| # | Story | Priority |
|---|-------|----------|
| 1 | Parse LWC JavaScript (@api, @wire, apex imports, events) | MUST HAVE |
| 2 | Parse LWC HTML (directives, bindings, component refs) | MUST HAVE |
| 3 | Parse LWC CSS (custom properties, :host) | SHOULD HAVE |
| 4 | Parse Aura .cmp (attributes, events, handlers) | COULD HAVE |
| 5 | Parse Aura controller.js (actions, server calls) | COULD HAVE |

### 2.2 Acceptance Criteria

1. LWC JS parser extract @api properties, @wire decorators, apex imports
2. LWC HTML parser extract component references, data bindings, directives
3. LWC CSS parser extract custom CSS properties
4. All parsers return consistent { success, data } format
5. Handle real-world LWC components correctly

---

## 3. Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| tree-sitter-javascript | Optional | JS AST parsing |
| tree-sitter-html | Optional | HTML parsing |
| Regex-based parsing | Alternative | Simpler approach |

---

## 4. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex JS patterns | Medium | Focus on common patterns |
| LWC-specific syntax | Medium | Test with real components |
| Aura legacy complexity | Low | Lower priority |
