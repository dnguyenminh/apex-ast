# Technical Design Document (TDD)

## Salesforce AST Parser - AA-55: XML Metadata Parsers

---

## Document Information

| Field | Value |
|-------|-------|
| Jira Ticket | AA-55 |
| Title | XML Metadata Parsers - Thiet ke ky thuat |
| Author | SA Agent |
| Version | 1.0 |
| Date | 2025-01-27 |
| Status | Draft |

---

## Architecture

![Parser Class Diagram](diagrams/parser-class-diagram.png)

---

## 1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| XML Parser | fast-xml-parser | 5.x |
| Language | JavaScript (CommonJS) | ES2020 |
| Types | JSDoc + metadata-types.js | N/A |

---

## 2. Architecture

### 2.1 Module Structure

`
src/parsers/xml/
  xml-config.js       -- Shared XML parser config
  flow-parser.js      -- Flow metadata parser
  object-parser.js    -- Object metadata parser
  field-parser.js     -- Field metadata parser
  validation-rule-parser.js
  permission-parser.js
  label-parser.js
  layout-parser.js
  index.js            -- Barrel export
`

### 2.2 Shared Configuration (xml-config.js)

`javascript
const { XMLParser } = require('fast-xml-parser');

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: true,
  trimValues: true
};

function parseXml(content) {
  const parser = new XMLParser(parserOptions);
  return parser.parse(content);
}

function ensureArray(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function parseBool(val, defaultVal = false) {
  if (val === undefined || val === null) return defaultVal;
  return val === true || val === 'true';
}

module.exports = { parseXml, ensureArray, parseBool };
`

---

## 3. Parser Design Pattern

Each parser follows:

`javascript
function parseXxxFile(filePath) {
  const startTime = Date.now();
  try {
    const xml = fs.readFileSync(filePath, 'utf-8');
    return parseXxxContent(xml, filePath, startTime);
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'Xxx', parseTimeMs: Date.now() - startTime };
  }
}

function parseXxxString(xmlContent, source = 'string') {
  return parseXxxContent(xmlContent, source, Date.now());
}

function parseXxxContent(xmlContent, source, startTime) {
  // Parse XML, extract data, return result
}
`

---

## 4. Type Definitions (metadata-types.js)

`javascript
/**
 * @typedef {Object} ParseResult
 * @property {boolean} success
 * @property {Object} [data]
 * @property {string} [error]
 * @property {string} filePath
 * @property {string} metadataType
 * @property {number} parseTimeMs
 */
`

---

## 5. Implementation Checklist

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | src/parsers/xml/xml-config.js | Create | Shared config |
| 2 | src/parsers/xml/flow-parser.js | Create | Flow parser |
| 3 | src/parsers/xml/object-parser.js | Create | Object parser |
| 4 | src/parsers/xml/field-parser.js | Create | Field parser |
| 5 | src/parsers/xml/validation-rule-parser.js | Create | VR parser |
| 6 | src/parsers/xml/permission-parser.js | Create | Perm parser |
| 7 | src/parsers/xml/label-parser.js | Create | Label parser |
| 8 | src/parsers/xml/layout-parser.js | Create | Layout parser |
| 9 | src/parsers/xml/index.js | Create | Barrel export |
| 10 | src/types/metadata-types.js | Create | Type defs |
