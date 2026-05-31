# Software Test Cases (STC)

## Salesforce AST Parser — AA-1: Project Initialize

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-1 |
| Title | Project Initialize — Test Cases |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related STP | documents/AA-1/STP.md |

---

## Test Case Summary

| Category | ID Range | Count | Priority |
|----------|----------|-------|----------|
| Project Setup | TC-001 to TC-004 | 4 | High |
| Grammar Config | TC-010 to TC-013 | 4 | High |
| Parser Generation | TC-020 to TC-023 | 4 | High |
| Test Infrastructure | TC-030 to TC-032 | 3 | High |

**Total: 15 test cases**

---

## 1. Project Setup

### TC-001: npm install Success

| Field | Value |
|-------|-------|
| **ID** | TC-001 |
| **Priority** | High |
| **Requirement** | UC-01, BR-01 |
| **Preconditions** | Node.js 20+ installed, network available |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run `npm install` | Exit code 0 |
| 2 | Check node_modules/ exists | Directory created |
| 3 | Check tree-sitter-cli installed | `npx tree-sitter --version` shows >= 0.26.0 |

---

### TC-002: package.json Scripts Exist

| Field | Value |
|-------|-------|
| **ID** | TC-002 |
| **Priority** | High |
| **Requirement** | BR-01 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Read package.json | File exists |
| 2 | Check scripts.generate | Value = "tree-sitter generate" |
| 3 | Check scripts.test | Value contains "test" |

---

### TC-003: sfapex-source Clone

| Field | Value |
|-------|-------|
| **ID** | TC-003 |
| **Priority** | High |
| **Requirement** | UC-01 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check sfapex-source/ directory | Exists |
| 2 | Check sfapex-source/apex/grammar.js | File exists, non-empty |
| 3 | Verify grammar exports | Contains grammar function call |

---

### TC-004: Directory Structure

| Field | Value |
|-------|-------|
| **ID** | TC-004 |
| **Priority** | High |
| **Requirement** | UC-01 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check src/ directory | Exists |
| 2 | Check test/corpus/ directory | Exists |
| 3 | Check bindings/ directory | Exists |

---

## 2. Grammar Configuration

### TC-010: grammar.js Exists and Valid

| Field | Value |
|-------|-------|
| **ID** | TC-010 |
| **Priority** | High |
| **Requirement** | UC-02, BR-03 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check grammar.js at root | File exists |
| 2 | Read content | Contains require sfapex path |
| 3 | Check grammar name | name: 'apex' present |

---

### TC-011: tree-sitter.json Valid

| Field | Value |
|-------|-------|
| **ID** | TC-011 |
| **Priority** | High |
| **Requirement** | UC-02, BR-05 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check tree-sitter.json at root | File exists |
| 2 | Parse JSON | Valid JSON |
| 3 | Check grammars[0].name | Value = "apex" |
| 4 | Check grammars[0].scope | Value = "source.apex" |

---

### TC-012: Grammar Name Consistency

| Field | Value |
|-------|-------|
| **ID** | TC-012 |
| **Priority** | High |
| **Requirement** | BR-03 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Read grammar.js name field | "apex" |
| 2 | Read tree-sitter.json name | "apex" |
| 3 | Compare | Both match |

---

### TC-013: Grammar Require Resolution

| Field | Value |
|-------|-------|
| **ID** | TC-013 |
| **Priority** | High |
| **Requirement** | BR-04 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run node require on sfapex grammar | No error thrown |
| 2 | Verify returned object | Has grammar structure |

---

## 3. Parser Generation

### TC-020: Generate Command Success

| Field | Value |
|-------|-------|
| **ID** | TC-020 |
| **Priority** | High |
| **Requirement** | UC-03 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run `npm run generate` | Exit code 0 |
| 2 | Check stdout | No error or conflict messages |
| 3 | Measure time | < 30 seconds |

---

### TC-021: Generated Files Exist

| Field | Value |
|-------|-------|
| **ID** | TC-021 |
| **Priority** | High |
| **Requirement** | UC-03 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check src/parser.c | File exists, size > 100KB |
| 2 | Check src/tree_sitter/parser.h | File exists |
| 3 | Check src/grammar.json | File exists, valid JSON |
| 4 | Check src/node-types.json | File exists, valid JSON |

---

### TC-022: node-types.json Contains Apex Nodes

| Field | Value |
|-------|-------|
| **ID** | TC-022 |
| **Priority** | High |
| **Requirement** | UC-03 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Parse src/node-types.json | Valid JSON array |
| 2 | Search for "class_declaration" | Found |
| 3 | Search for "method_declaration" | Found |
| 4 | Search for "query_expression" | Found |

---

### TC-023: Idempotent Generation

| Field | Value |
|-------|-------|
| **ID** | TC-023 |
| **Priority** | Medium |
| **Requirement** | UC-03 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run generate first time | Success |
| 2 | Record parser.c hash | Hash A |
| 3 | Run generate second time | Success |
| 4 | Record parser.c hash | Hash B = Hash A |

---

## 4. Test Infrastructure

### TC-030: Corpus Test File Format

| Field | Value |
|-------|-------|
| **ID** | TC-030 |
| **Priority** | High |
| **Requirement** | UC-04, BR-06 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check test/corpus/basic_class.txt exists | File exists |
| 2 | Verify format has === separator | Present |
| 3 | Verify format has --- separator | Present |
| 4 | Verify has source code section | Non-empty Apex code |
| 5 | Verify has expected AST section | S-expression format |

---

### TC-031: Corpus Test Pass

| Field | Value |
|-------|-------|
| **ID** | TC-031 |
| **Priority** | High |
| **Requirement** | UC-04, BR-08 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run `npm run test` | Exit code 0 |
| 2 | Check output | Shows pass for basic_class |
| 3 | No failures | 0 failures reported |

---

### TC-032: Test Detects Failure

| Field | Value |
|-------|-------|
| **ID** | TC-032 |
| **Priority** | Medium |
| **Requirement** | UC-04 |

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create test with wrong expected AST | File created |
| 2 | Run test command | Exit code != 0 |
| 3 | Check output | Shows failure with diff |
| 4 | Remove bad test file | Cleanup |

---

## 5. Traceability Matrix

| Requirement | Test Cases | Coverage |
|-------------|------------|----------|
| UC-01 (Project Init) | TC-001, TC-003, TC-004 | 100% |
| UC-02 (Grammar Config) | TC-010, TC-011, TC-012, TC-013 | 100% |
| UC-03 (Generate) | TC-020, TC-021, TC-022, TC-023 | 100% |
| UC-04 (Test Infra) | TC-030, TC-031, TC-032 | 100% |
| BR-01 (Scripts) | TC-002 | 100% |
| BR-03 (Name=apex) | TC-010, TC-012 | 100% |
| BR-04 (Require path) | TC-013 | 100% |
| BR-08 (100% pass) | TC-031 | 100% |
