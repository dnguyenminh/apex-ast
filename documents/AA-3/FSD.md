# Functional Specification Document (FSD)

## Salesforce AST Parser — AA-3: Synchronize (Native Binding)

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-3 |
| Title | Synchronize — Native Binding |
| Author | BA Agent + TA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |
| Related BRD | documents/AA-3/BRD.md |

---

## 1. Introduction

### 1.1 Purpose

Dac ta chuc nang build native Node.js C++ addon, giai quyet linking errors, va tao error detection script.

---

## 2. Functional Requirements

### 2.1 Feature: Native Build

**Use Case ID:** UC-01
**Actor:** Developer
**Preconditions:** parser.c generated, C++ compiler available
**Postconditions:** .node file created

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Run node-gyp rebuild | | Trigger build |
| 2 | | Compile parser.c | C compilation |
| 3 | | Compile binding.cc | C++ compilation |
| 4 | | Link | Create .node |
| 5 | | Output | build/Release/*.node |

**Business Rules:**

| Rule ID | Rule |
|---------|------|
| BR-01 | binding.gyp target = tree_sitter_apex_binding |
| BR-02 | Export symbol = tree_sitter_apex |
| BR-03 | Grammar name MUST match export symbol suffix |

### 2.2 Feature: Error Detection (run_parser.js)

**Use Case ID:** UC-02
**Actor:** Developer
**Preconditions:** .node file built
**Postconditions:** Error report output

**Main Flow:**

| Step | Actor | System | Description |
|------|-------|--------|-------------|
| 1 | Provide .cls file path | | CLI argument |
| 2 | | Load parser | require .node |
| 3 | | Parse source | Generate AST |
| 4 | | Traverse tree | Find ERROR nodes |
| 5 | | Report | Line, column, text |

---

## 3. Data Specifications

### 3.1 binding.gyp Structure

| Field | Value |
|-------|-------|
| target_name | tree_sitter_apex_binding |
| sources | bindings/node/binding.cc, src/parser.c |
| include_dirs | src/ |
| cflags | -std=c11 |

### 3.2 Error Report Format

| Field | Type | Description |
|-------|------|-------------|
| type | String | ERROR or MISSING |
| line | Number | 1-indexed line |
| column | Number | Column position |
| text | String | Error source text |
