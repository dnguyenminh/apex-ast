# Technical Design Document (TDD)

## Salesforce AST Parser - AA-58: Testing and Documentation

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-58 |
| Title | Testing and Documentation - Thiet ke ky thuat |
| Author | SA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## 1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Test Framework | vitest | 4.x |
| Coverage | @vitest/coverage-v8 | Latest |
| Assertions | vitest built-in | N/A |
| Fixtures | Static files | N/A |
| Docs | JSDoc + README.md | N/A |

---

## 2. Test Architecture

### 2.1 Directory Structure

`
tests/
  parsers/
    xml/
      flow-parser.test.js
      object-parser.test.js
      field-parser.test.js
      validation-rule-parser.test.js
      permission-parser.test.js
      label-parser.test.js
      layout-parser.test.js
    lwc/
      lwc-js-parser.test.js
      lwc-html-parser.test.js
      lwc-css-parser.test.js
  indexer/
    scanner.test.js
    apex-indexer.test.js
    flow-indexer.test.js
    object-indexer.test.js
    lwc-indexer.test.js
    dependency-graph.test.js
    integration.test.js
  fixtures/
    sample-sfdx-project/
      sfdx-project.json
      force-app/...
`

### 2.2 vitest Configuration

`javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/parser.c', 'node_modules']
    }
  }
});
`

---

## 3. Test Patterns

### 3.1 Parser Test Pattern

`javascript
import { describe, it, expect } from 'vitest';
import { parseFlowFile, parseFlowString } from '../../src/parsers/xml/flow-parser';

describe('Flow Parser', () => {
  it('should parse screen flow', () => {
    const result = parseFlowFile('tests/fixtures/.../Screen_Flow.flow-meta.xml');
    expect(result.success).toBe(true);
    expect(result.data.processType).toBe('Flow');
    expect(result.data.screens.length).toBeGreaterThan(0);
  });

  it('should handle invalid XML', () => {
    const result = parseFlowString('not xml');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
`

### 3.2 Integration Test Pattern

`javascript
import { describe, it, expect } from 'vitest';
import { parseProject } from '../../src/indexer';

describe('Integration: Full Pipeline', () => {
  it('should index sample project', async () => {
    const index = await parseProject('tests/fixtures/sample-sfdx-project');
    expect(index.apex.length).toBeGreaterThan(0);
    expect(index.flows.length).toBeGreaterThan(0);
    expect(index.graph).toBeDefined();
    expect(index.graph.nodes.length).toBeGreaterThan(0);
  });
});
`

---

## 4. Documentation Design

### 4.1 JSDoc Pattern

`javascript
/**
 * Parse an entire SFDX project and return structured index data.
 * @param {string} projectPath - Path to SFDX project root
 * @param {ParseOptions} [options={}] - Parse options
 * @returns {Promise<ProjectIndex>} Complete project index
 * @example
 * const index = await parseProject('/path/to/sfdx-project');
 * console.log(index.apex.length); // Number of Apex files indexed
 */
async function parseProject(projectPath, options = {}) { ... }
`

---

## 5. Implementation Checklist

| # | File | Action |
|---|------|--------|
| 1 | vitest.config.js | Create |
| 2 | tests/fixtures/sample-sfdx-project/ | Create |
| 3 | tests/parsers/xml/*.test.js | Create (7 files) |
| 4 | tests/parsers/lwc/*.test.js | Create (3 files) |
| 5 | tests/indexer/*.test.js | Create (7 files) |
| 6 | README.md | Update |
| 7 | Add JSDoc to all public functions | Update |
| 8 | package.json scripts | Add test:coverage |
