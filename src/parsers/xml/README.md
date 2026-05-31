# XML Metadata Parsers

Parse Salesforce metadata XML files into structured JavaScript objects.

## Supported Types

| Parser | File Pattern | Output |
|--------|-------------|--------|
| Flow Parser | `.flow-meta.xml` | FlowDefinition |
| Object Parser | `.object-meta.xml` | CustomObject |
| Field Parser | `.field-meta.xml` | CustomField |
| Validation Rule Parser | `.validationRule-meta.xml` | ValidationRule |
| Permission Set Parser | `.permissionset-meta.xml` | PermissionSet |
| Profile Parser | `.profile-meta.xml` | Profile (same as PermissionSet) |
| Label Parser | `.labels-meta.xml` | CustomLabels |
| Layout Parser | `.layout-meta.xml` | PageLayout |

## Usage

```javascript
const { parseFlowFile, parseObjectFile } = require('salesforce-ast/parsers/xml');

// Parse a flow
const flowResult = parseFlowFile('/path/to/MyFlow.flow-meta.xml');
if (flowResult.success) {
  console.log(flowResult.data.decisions);
  console.log(flowResult.data.recordCreates);
}

// Parse from string
const { parseFlowString } = require('salesforce-ast/parsers/xml');
const result = parseFlowString(xmlContent, 'MyFlow');
```

## Output Format

All parsers return a `ParseResult`:

```javascript
{
  success: true,          // boolean
  data: { ... },          // parsed data (type-specific)
  filePath: '/path/...',  // source file
  metadataType: 'Flow',   // metadata type name
  parseTimeMs: 5          // parse duration
}
```

## Configuration

Uses `fast-xml-parser` with Salesforce-optimized options. See `xml-config.js` for details.
