# Software Test Cases (STC)

## Salesforce AST Parser — AA-3: Synchronize (Native Binding)

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-3 |
| Title | Synchronize — Test Cases |
| Author | QA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## Test Cases

### TC-001: node-gyp rebuild Success

| Step | Action | Expected |
|------|--------|----------|
| 1 | Run npx node-gyp rebuild | Exit code 0 |
| 2 | Check build/Release/ | .node file exists |
| 3 | Check file size | > 50KB |

### TC-002: require() Load

| Step | Action | Expected |
|------|--------|----------|
| 1 | require('./build/Release/tree_sitter_apex_binding.node') | No error |
| 2 | Check returned object | Has language property |

### TC-003: parser.parse() Works

| Step | Action | Expected |
|------|--------|----------|
| 1 | Create parser, set language | No error |
| 2 | Parse valid Apex class | Tree returned |
| 3 | Check rootNode.type | 'source_file' |
| 4 | Check childCount | > 0 |

### TC-004: ERROR Node Detection

| Step | Action | Expected |
|------|--------|----------|
| 1 | Parse code with syntax error | Tree with ERROR node |
| 2 | Run findErrors() | Returns array with error info |
| 3 | Check error.line | Correct line number |

### TC-005: run_parser.js Script

| Step | Action | Expected |
|------|--------|----------|
| 1 | Run: node run_parser.js test.cls | Output shows parse result |
| 2 | With valid file | "No errors found" |
| 3 | With invalid file | Error report with positions |

### TC-006: No LNK2001 Error

| Step | Action | Expected |
|------|--------|----------|
| 1 | Clean build directory | Removed |
| 2 | Run node-gyp rebuild | No LNK2001 in output |
| 3 | Verify symbol resolution | Build success |

---

## Traceability Matrix

| Requirement | Test Cases |
|-------------|------------|
| UC-01 (Build) | TC-001, TC-006 |
| UC-02 (Error Detection) | TC-004, TC-005 |
| BR-01 (target name) | TC-001 |
| BR-02 (symbol) | TC-006 |
