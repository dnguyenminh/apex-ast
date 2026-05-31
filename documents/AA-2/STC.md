# Software Test Cases (STC)

## Salesforce AST Parser — AA-2: Verify Project

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-2 |
| Title | Verify Project — Test Cases |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## Test Case Summary

| Category | ID Range | Count | Priority |
|----------|----------|-------|----------|
| SOQL Queries | TC-001 to TC-005 | 5 | High |
| DML Statements | TC-010 to TC-015 | 6 | High |
| Triggers | TC-020 to TC-021 | 2 | High |
| Control Flow | TC-030 to TC-034 | 5 | High |
| Error Detection | TC-040 to TC-042 | 3 | High |
| Regression | TC-050 to TC-051 | 2 | High |

**Total: 23 test cases**

---

## 1. SOQL Queries

### TC-001: Basic SOQL

| Field | Value |
|-------|-------|
| **ID** | TC-001 |
| **Priority** | High |
| **Requirement** | UC-01, BR-01 |

**Input:**
```apex
List<Account> accts = [SELECT Id, Name FROM Account];
```
**Expected:** query_expression > soql_query_body (select_clause, from_clause)

---

### TC-002: SOQL with WHERE

**Input:**
```apex
List<Account> accts = [SELECT Id FROM Account WHERE Name = 'Test'];
```
**Expected:** soql_query_body with where_clause

---

### TC-003: Nested SOQL (Subquery)

| Field | Value |
|-------|-------|
| **ID** | TC-003 |
| **Priority** | High |
| **Requirement** | UC-01, BR-02 |

**Input:**
```apex
List<Account> accts = [SELECT Id, (SELECT LastName FROM Contacts) FROM Account];
```
**Expected:** soql_query_body > select_clause > subquery

---

### TC-004: SOQL Aggregate

**Input:**
```apex
Integer cnt = [SELECT COUNT() FROM Account];
```
**Expected:** query_expression with count function

---

### TC-005: SOQL ORDER BY + LIMIT

**Input:**
```apex
List<Account> accts = [SELECT Id FROM Account ORDER BY Name LIMIT 10];
```
**Expected:** soql_query_body with order_by_clause, limit_clause

---

## 2. DML Statements

### TC-010: Insert
**Input:** `insert new Account(Name='Test');`
**Expected:** dml_expression (dml_type: insert)

### TC-011: Update
**Input:** `update acc;`
**Expected:** dml_expression (dml_type: update)

### TC-012: Delete
**Input:** `delete acc;`
**Expected:** dml_expression (dml_type: delete)

### TC-013: Upsert
**Input:** `upsert acc Account.ExternalId__c;`
**Expected:** dml_expression (dml_type: upsert)

### TC-014: Undelete
**Input:** `undelete acc;`
**Expected:** dml_expression (dml_type: undelete)

### TC-015: Merge
**Input:** `merge master duplicate;`
**Expected:** dml_expression (dml_type: merge)

---

## 3. Triggers

### TC-020: Basic Trigger

**Input:**
```apex
trigger AccountTrigger on Account (before insert, after update) {
    for (Account a : Trigger.new) {
        a.Name = 'Updated';
    }
}
```
**Expected:** trigger_declaration

### TC-021: Trigger with Context Variables

**Input:**
```apex
trigger ContactTrigger on Contact (after insert) {
    List<Contact> newContacts = Trigger.new;
}
```
**Expected:** trigger_declaration with Trigger.new reference

---

## 4. Control Flow

### TC-030: If/Else
**Input:** `if (x > 0) { } else { }`
**Expected:** if_statement with alternative

### TC-031: For Loop
**Input:** `for (Integer i = 0; i < 10; i++) { }`
**Expected:** for_statement

### TC-032: Enhanced For
**Input:** `for (String s : items) { }`
**Expected:** enhanced_for_statement

### TC-033: While Loop
**Input:** `while (x < 10) { x++; }`
**Expected:** while_statement

### TC-034: Do-While
**Input:** `do { x++; } while (x < 10);`
**Expected:** do_statement

---

## 5. Error Detection

### TC-040: Detect ERROR Node

**Input:** Code with invalid syntax
**Expected:** ERROR node reported with line/column

### TC-041: Error Recovery

**Input:** Class with one broken method + one valid method
**Expected:** ERROR for broken, correct AST for valid

### TC-042: No Errors in Valid Code

**Input:** Complete valid Apex class
**Expected:** 0 ERROR nodes

---

## 6. Regression

### TC-050: All Tests Pass After Patch

**Steps:**
1. Add grammar override
2. Run generate
3. Run test
**Expected:** 100% pass rate

### TC-051: New Test Accompanies Patch

**Steps:**
1. Add grammar override
2. Verify new test file exists for the fix
**Expected:** Test file present and passing

---

## 7. Traceability Matrix

| Requirement | Test Cases | Coverage |
|-------------|------------|----------|
| UC-01 (SOQL) | TC-001 to TC-005 | 100% |
| UC-02 (Patch) | TC-050, TC-051 | 100% |
| UC-03 (Error) | TC-040 to TC-042 | 100% |
| BR-01 (query_expression) | TC-001 | 100% |
| BR-02 (subquery) | TC-003 | 100% |
| BR-05 (regression) | TC-050 | 100% |
