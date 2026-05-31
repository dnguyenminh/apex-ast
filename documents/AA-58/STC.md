# Software Test Cases (STC)

## Salesforce AST Parser - AA-58: Testing and Documentation

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-58 |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |

---

## Test Case Summary

| Category | Count | Priority |
|----------|-------|----------|
| XML Parser Unit Tests | 25 | High |
| LWC Parser Unit Tests | 15 | High |
| Integration Tests | 8 | High |
| Documentation Tests | 5 | Medium |

**Total: 53 test cases**

---

## 1. XML Parser Unit Tests (25)

### Flow Parser (6 tests)
- TC-001: Parse screen flow (happy path)
- TC-002: Parse record-triggered flow
- TC-003: Parse flow with subflows
- TC-004: Parse flow with loops and waits
- TC-005: Handle empty flow
- TC-006: Handle invalid XML

### Object Parser (5 tests)
- TC-010: Parse custom object with fields
- TC-011: Parse object relationships
- TC-012: Parse object with record types
- TC-013: Handle minimal object
- TC-014: Handle invalid XML

### Field Parser (5 tests)
- TC-020: Parse text field
- TC-021: Parse formula field
- TC-022: Parse picklist field
- TC-023: Parse lookup field
- TC-024: Handle missing optional fields

### Validation Rule Parser (3 tests)
- TC-030: Parse active rule
- TC-031: Parse rule from object XML
- TC-032: Handle inactive rule

### Permission Parser (3 tests)
- TC-040: Parse permission set
- TC-041: Parse profile
- TC-042: Extract field permissions

### Label Parser (2 tests)
- TC-050: Parse labels file
- TC-051: Handle single label

### Layout Parser (2 tests)
- TC-060: Parse layout with sections
- TC-061: Parse related lists

---

## 2. LWC Parser Unit Tests (15)

### LWC JS Parser (7 tests)
- TC-100: Extract @api properties
- TC-101: Extract @wire decorators
- TC-102: Extract apex imports
- TC-103: Extract custom events
- TC-104: Extract lifecycle hooks
- TC-105: Complex real-world component
- TC-106: Handle empty component

### LWC HTML Parser (6 tests)
- TC-110: Extract component references
- TC-111: Extract data bindings
- TC-112: Extract directives (if:true, for:each)
- TC-113: Extract event handlers
- TC-114: Extract slots
- TC-115: Handle empty template

### LWC CSS Parser (3 tests)
- TC-120: Extract custom properties
- TC-121: Extract :host selectors
- TC-122: Handle empty CSS

---

## 3. Integration Tests (8)

- TC-200: Full project scan detects all types
- TC-201: Full parse pipeline produces valid output
- TC-202: Dependency graph has correct relationships
- TC-203: parseProject() returns complete index
- TC-204: Error resilience (bad files dont break pipeline)
- TC-205: Performance (< 5s for sample project)
- TC-206: KB payload format correct
- TC-207: Include/exclude filters work

---

## 4. Documentation Tests (5)

- TC-300: README quick start example runs
- TC-301: parseProject() example produces output
- TC-302: Individual parser examples work
- TC-303: Dependency graph query example works
- TC-304: CLI usage example works

---

## 5. Traceability Matrix

| Requirement | Test Cases |
|-------------|------------|
| BRD Story 1 (XML tests) | TC-001 to TC-061 |
| BRD Story 2 (LWC tests) | TC-100 to TC-122 |
| BRD Story 3 (Integration) | TC-200 to TC-207 |
| BRD Story 4 (Fixtures) | Used by all integration tests |
| BRD Story 5 (Docs) | TC-300 to TC-304 |
| BR-02 (Coverage) | Measured via vitest coverage |
