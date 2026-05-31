# LWC/Aura Component Parsers

Parse Lightning Web Component files to extract component API surface, template structure, and styles.

## Parsers

| Parser | File Type | Extracts |
|--------|-----------|----------|
| LWC JS Parser | `.js` | @api, @track, @wire, Apex imports, events, lifecycle hooks |
| LWC HTML Parser | `.html` | Components, bindings, handlers, directives, iterations |
| LWC CSS Parser | `.css` | Custom properties, :host, media queries, SLDS tokens |

## Usage

```javascript
const { parseLWCJsFile, parseLWCHtmlFile, parseLWCCssFile } = require('salesforce-ast/parsers/lwc');

const jsResult = parseLWCJsFile('/path/to/myComponent/myComponent.js');
console.log(jsResult.data.apiProperties);   // ['recordId', 'title']
console.log(jsResult.data.apexImports);     // [{className, methodName}]
console.log(jsResult.data.wireDecorators);  // [{adapter, params, property}]

const htmlResult = parseLWCHtmlFile('/path/to/myComponent/myComponent.html');
console.log(htmlResult.data.childComponents);  // ['c-child', 'lightning-input']
console.log(htmlResult.data.iterations);       // [{type, collection, item}]
```

## Note

Current implementation uses regex-based extraction. Tree-Sitter JS/HTML/CSS integration planned for higher accuracy.
