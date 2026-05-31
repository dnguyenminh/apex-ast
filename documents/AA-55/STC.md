# Software Test Cases (STC)

## Salesforce AST Parser - AA-55: XML Metadata Parsers

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-55 |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |

---

## Test Cases

### 1. Flow Parser

#### TC-001: Parse Screen Flow
**Input:** Valid .flow-meta.xml with decisions, assignments, screens
**Expected:** { success: true, data: { fullName, processType, variables[], decisions[], screens[] } }

#### TC-002: Parse Record-Triggered Flow
**Input:** Flow with recordCreates, recordUpdates, recordLookups
**Expected:** DML operations extracted correctly

#### TC-003: Parse Flow with Subflows
**Input:** Flow referencing other flows
**Expected:** subflows[] populated with flowName

#### TC-004: Invalid Flow XML
**Input:** Malformed XML
**Expected:** { success: false, error: '...' }

#### TC-005: Empty Flow
**Input:** Flow with no elements
**Expected:** { success: true, data: { variables: [], decisions: [], ... } }

### 2. Object Parser

#### TC-010: Parse Custom Object
**Input:** .object-meta.xml with fields, record types
**Expected:** Object schema with all fields

#### TC-011: Parse Object Relationships
**Input:** Object with Lookup and Master-Detail fields
**Expected:** Relationships extracted with referenceTo

#### TC-012: Parse Validation Rules in Object
**Input:** Object containing validation rules
**Expected:** validationRules[] extracted

#### TC-013: Empty Object
**Input:** Minimal object XML
**Expected:** { success: true, data: { fullName, fields: [] } }

### 3. Field Parser

#### TC-020: Parse Text Field
**Input:** Text field XML
**Expected:** { type: 'Text', length: N }

#### TC-021: Parse Formula Field
**Input:** Formula field XML
**Expected:** { type: 'Formula', formula: '...' }

#### TC-022: Parse Picklist Field
**Input:** Picklist field XML
**Expected:** { type: 'Picklist', picklistValues: [...] }

#### TC-023: Parse Lookup Field
**Input:** Lookup field XML
**Expected:** { type: 'Lookup', referenceTo: 'ObjectName' }

### 4. Permission Parser

#### TC-030: Parse Permission Set
**Input:** .permissionset-meta.xml
**Expected:** Object permissions, field permissions extracted

#### TC-031: Parse Profile
**Input:** .profile-meta.xml
**Expected:** Same structure as permission set

### 5. Label Parser

#### TC-040: Parse Labels File
**Input:** CustomLabels.labels-meta.xml
**Expected:** Array of { fullName, value, category }

### 6. Layout Parser

#### TC-050: Parse Layout
**Input:** .layout-meta.xml
**Expected:** { sections[], relatedLists[] }

### 7. Error Handling

#### TC-060: File Not Found
**Input:** Non-existent file path
**Expected:** { success: false, error: 'ENOENT...' }

#### TC-061: Invalid XML
**Input:** Non-XML content
**Expected:** { success: false, error: '...' }

#### TC-062: Missing Root Element
**Input:** XML without expected root (e.g., no <Flow>)
**Expected:** { success: false, error: 'No <Flow> root element found' }

---

## Traceability Matrix

| Requirement | Test Cases |
|-------------|------------|
| UC-01 (Flow) | TC-001 to TC-005 |
| UC-02 (Object) | TC-010 to TC-013 |
| UC-03 (Field) | TC-020 to TC-023 |
| UC-04 (VR) | TC-012 |
| UC-05 (Permission) | TC-030, TC-031 |
| UC-06 (Label) | TC-040 |
| UC-07 (Layout) | TC-050 |
| BR-01 (Format) | All TCs |
| BR-04 (Performance) | Measured in all |
