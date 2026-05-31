# Functional Specification Document (FSD)

## Salesforce AST Parser - AA-55: XML Metadata Parsers

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-55 |
| Title | XML Metadata Parsers - Dac ta chuc nang |
| Author | BA Agent + TA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## Data Flow Overview

![XML Parsing Data Flow](diagrams/xml-parsing-data-flow.png)

---

## 1. Functional Requirements

### 1.1 Flow Parser

**Use Case ID:** UC-01
**Input:** .flow-meta.xml file
**Output:** FlowDefinition JSON

**Extracted Data:**
- Flow type, status, API version
- Variables (name, type, isInput, isOutput)
- Decisions (conditions, outcomes, connectors)
- Assignments (items, connectors)
- Record operations (Create, Update, Delete, Lookup)
- Screens (fields, components)
- Loops, Subflows, Waits

### 1.2 Object Parser

**Use Case ID:** UC-02
**Input:** .object-meta.xml file
**Output:** ObjectDefinition JSON

**Extracted Data:**
- Object name, label, plural label
- Fields, Relationships
- Record Types, Validation Rules
- List Views, Sharing model

### 1.3 Field Parser

**Use Case ID:** UC-03
**Input:** .field-meta.xml file
**Output:** FieldDefinition JSON

**Extracted Data:**
- Field API name, label, type
- Formula expression
- Picklist values
- Relationship info
- Required, unique, externalId flags

### 1.4 Validation Rule Parser

**Use Case ID:** UC-04
**Input:** Validation rule XML
**Output:** ValidationRule JSON

**Extracted Data:**
- Rule name, active status
- Error condition formula
- Error message, display field

### 1.5 Permission Set/Profile Parser

**Use Case ID:** UC-05
**Input:** .permissionset-meta.xml or .profile-meta.xml
**Output:** PermissionMatrix JSON

**Extracted Data:**
- Object permissions (CRUD)
- Field permissions (read/edit)
- Tab visibility, Apex class access

### 1.6 Label Parser

**Use Case ID:** UC-06
**Input:** .labels-meta.xml
**Output:** LabelDefinition[] JSON

**Extracted Data:**
- Label name, value, category, language

### 1.7 Layout Parser

**Use Case ID:** UC-07
**Input:** .layout-meta.xml
**Output:** LayoutDefinition JSON

**Extracted Data:**
- Sections (columns, style)
- Field arrangement
- Related lists

---

## 2. API Contract

### 2.1 Common Pattern

`javascript
// File-based
const result = parseFlowFile('/path/to/MyFlow.flow-meta.xml');
// String-based
const result = parseFlowString(xmlContent);

// Result format
{ success: true, data: {...}, filePath, metadataType, parseTimeMs }
{ success: false, error: 'message', filePath, metadataType, parseTimeMs }
`

---

## 3. Business Rules

| Rule ID | Rule |
|---------|------|
| BR-01 | All parsers return { success, data/error } format |
| BR-02 | Missing optional fields = null (not undefined) |
| BR-03 | Arrays always returned as arrays (even single item) |
| BR-04 | Parse time < 50ms per file |
