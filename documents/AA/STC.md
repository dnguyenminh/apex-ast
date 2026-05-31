# Software Test Cases (STC)

## Salesforce Apex AST Parser — AA: Danh sách Test Cases

---

## Document Information

| Field | Value |
|-------|-------|
| Project | AA (Salesforce Apex AST Parser) |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Related STP | documents/AA/STP.md |

---

## Test Case Summary

| Category | ID Range | Count | Priority |
|----------|----------|-------|----------|
| Class Declarations | TC-001 to TC-003 | 3 | High |
| Method Declarations | TC-010 to TC-012 | 3 | High |
| Variable Declarations | TC-020 to TC-022 | 3 | High |
| Control Flow | TC-030 to TC-034 | 5 | High |
| DML Statements | TC-040 to TC-045 | 6 | High |
| SOQL/SOSL | TC-050 to TC-052 | 3 | High |
| Triggers | TC-060 to TC-061 | 2 | High |
| Interfaces | TC-070 to TC-071 | 2 | Medium |
| Enums | TC-080 to TC-081 | 2 | Medium |
| Annotations | TC-090 to TC-092 | 3 | Medium |
| Try/Catch | TC-100 to TC-101 | 2 | Medium |
| Error Recovery | TC-110 to TC-111 | 2 | High |
| Integration (Native) | TC-200 to TC-201 | 2 | High |
| Integration (WASM) | TC-210 to TC-211 | 2 | High |

**Total: 38 test cases**

---

## 1. Class Declarations

### TC-001: Basic Class

| Field | Value |
|-------|-------|
| **ID** | TC-001 |
| **Priority** | High |
| **Type** | Corpus Test |
| **Requirement** | UC-02, BR-04 |

**Input:**
```apex
public class MyHelloWorld {
    public void sayHello() {
        System.debug('Hello World');
    }
}
```

**Expected AST:** source_file > class_declaration (modifiers, identifier, class_body > method_declaration)

---

### TC-002: Class with Multiple Modifiers

| Field | Value |
|-------|-------|
| **ID** | TC-002 |
| **Priority** | High |

**Input:**
```apex
public virtual class BaseService {
    protected abstract void execute();
}
```

**Expected:** class_declaration with modifiers containing public + virtual

---

### TC-003: Nested Class

| Field | Value |
|-------|-------|
| **ID** | TC-003 |
| **Priority** | High |

**Input:**
```apex
public class Outer {
    public class Inner {
        public String name;
    }
}
```

**Expected:** class_declaration > class_body > class_declaration (nested)

---

## 2. Method Declarations

### TC-010: Static Method

**Input:**
```apex
public class Utils {
    public static String getName() {
        return 'test';
    }
}
```

**Expected:** method_declaration with static modifier, return type

---

### TC-011: Method with Parameters

**Input:**
```apex
public class Service {
    public void process(String name, Integer count) {
        System.debug(name);
    }
}
```

**Expected:** method_declaration > formal_parameters with 2 params

---

### TC-012: Instance Method with Return

**Input:**
```apex
public class Calculator {
    public Integer add(Integer a, Integer b) {
        return a + b;
    }
}
```

**Expected:** method_declaration > block > return_statement

---

## 3. Variable Declarations

### TC-020: Simple Variable

**Input:**
```apex
public class Vars {
    public void test() {
        String name = 'hello';
    }
}
```

**Expected:** local_variable_declaration > variable_declarator

---

### TC-021: List Variable

**Input:**
```apex
public class Vars {
    public void test() {
        List<String> names = new List<String>();
    }
}
```

**Expected:** local_variable_declaration with generic_type

---

### TC-022: Map Variable

**Input:**
```apex
public class Vars {
    public void test() {
        Map<String, Integer> counts = new Map<String, Integer>();
    }
}
```

---

## 4. Control Flow

### TC-030: If/Else

**Input:**
```apex
public class Flow {
    public void test(Integer x) {
        if (x > 0) {
            System.debug('positive');
        } else {
            System.debug('non-positive');
        }
    }
}
```

**Expected:** if_statement with condition + consequence + alternative

---

### TC-031: Traditional For Loop

**Input:**
```apex
public class Flow {
    public void test() {
        for (Integer i = 0; i < 10; i++) {
            System.debug(i);
        }
    }
}
```

---

### TC-032: Enhanced For Loop

**Input:**
```apex
public class Flow {
    public void test(List<String> items) {
        for (String item : items) {
            System.debug(item);
        }
    }
}
```

---

### TC-033: While Loop

**Input:**
```apex
public class Flow {
    public void test() {
        Integer i = 0;
        while (i < 10) {
            i++;
        }
    }
}
```

---

### TC-034: Do-While Loop

**Input:**
```apex
public class Flow {
    public void test() {
        Integer i = 0;
        do {
            i++;
        } while (i < 10);
    }
}
```

---

## 5. DML Statements

### TC-040: Insert

**Input:** `insert new Account(Name='Test');`

### TC-041: Update

**Input:** `update accountRecord;`

### TC-042: Delete

**Input:** `delete accountRecord;`

### TC-043: Upsert

**Input:** `upsert accountRecord Account.ExternalId__c;`

### TC-044: Undelete

**Input:** `undelete accountRecord;`

### TC-045: Merge

**Input:** `merge masterAccount duplicateAccount;`

---

## 6. SOQL/SOSL

### TC-050: Basic SOQL

**Input:**
```apex
List<Account> accts = [SELECT Id, Name FROM Account WHERE Name = 'Test'];
```

**Expected:** query_expression > soql_query_body (select, from, where)

---

### TC-051: Nested SOQL

**Input:**
```apex
List<Account> accts = [SELECT Id, (SELECT LastName FROM Contacts) FROM Account];
```

**Expected:** soql_query_body > select_clause > subquery

---

### TC-052: Aggregate SOQL

**Input:**
```apex
Integer cnt = [SELECT COUNT() FROM Account];
```

---

## 7. Triggers

### TC-060: Basic Trigger

**Input:**
```apex
trigger AccountTrigger on Account (before insert, after update) {
    for (Account a : Trigger.new) {
        a.Name = 'Updated';
    }
}
```

**Expected:** trigger_declaration

---

### TC-061: Trigger Context Variables

**Input:**
```apex
trigger ContactTrigger on Contact (after insert) {
    List<Contact> newContacts = Trigger.new;
}
```

---

## 8. Interfaces

### TC-070: Basic Interface

**Input:**
```apex
public interface Callable {
    void execute(String action);
}
```

**Expected:** interface_declaration

---

### TC-071: Multi-Method Interface

**Input:**
```apex
public interface DataService {
    List<Account> getAccounts();
    void saveAccount(Account a);
}
```

---

## 9. Enums

### TC-080: Basic Enum

**Input:**
```apex
public enum Season { SPRING, SUMMER, FALL, WINTER }
```

**Expected:** enum_declaration

---

### TC-081: Enum Usage

**Input:**
```apex
Season s = Season.SPRING;
```

---

## 10. Annotations

### TC-090: @isTest

**Input:**
```apex
@isTest
public class MyTest {
    @isTest
    static void testMethod() {
        System.assert(true);
    }
}
```

---

### TC-091: @AuraEnabled

**Input:**
```apex
@AuraEnabled(cacheable=true)
public static List<Account> getAccounts() {
    return [SELECT Id FROM Account];
}
```

---

### TC-092: @InvocableMethod

**Input:**
```apex
@InvocableMethod(label='Process')
public static void process(List<Id> ids) {}
```

---

## 11. Try/Catch

### TC-100: Basic Try/Catch

**Input:**
```apex
try {
    insert new Account();
} catch (DmlException e) {
    System.debug(e.getMessage());
}
```

**Expected:** try_statement > block + catch_clause

---

### TC-101: Try/Catch/Finally

**Input:**
```apex
try {
    callService();
} catch (CalloutException e) {
    logError(e);
} finally {
    cleanup();
}
```

---

## 12. Error Recovery

### TC-110: Syntax Error Detection

**Input:** Code with `insert_special_mode myAccount;`
**Expected:** ERROR node at that line

---

### TC-111: Partial Parse

**Input:** Class with one broken method + one valid method
**Expected:** ERROR for broken, correct AST for valid

---

## 13-14. Integration Tests

### TC-200/201: Native binding load, parse, error detect
### TC-210/211: WASM load, parse, consistency with native

---

## 15. Traceability Matrix

| Requirement | Test Cases | Coverage |
|-------------|------------|----------|
| UC-02 (Parse) | TC-001 to TC-101 | 100% |
| UC-03 (WASM) | TC-210, TC-211 | 100% |
| UC-04 (Error) | TC-110, TC-111 | 100% |
| BR-04 (No crash) | TC-110, TC-111 | 100% |
| BR-06 (Consistency) | TC-211 | 100% |
