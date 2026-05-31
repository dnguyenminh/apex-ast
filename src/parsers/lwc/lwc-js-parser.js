/**
 * @fileoverview LWC JavaScript Parser.
 * Parses Lightning Web Component JS files to extract component API surface.
 * Uses regex-based extraction (Tree-Sitter JS integration planned).
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a LWC JavaScript file.
 * @param {string} filePath - Path to LWC .js file
 * @returns {Object} Parse result with component data
 */
function parseLWCJsFile(filePath) {
  const startTime = Date.now();
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseLWCJsContent(content, filePath, startTime);
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'LWC-JS', parseTimeMs: Date.now() - startTime };
  }
}

function parseLWCJsContent(content, source, startTime) {
  try {
    const data = {
      componentName: extractComponentName(source),
      className: extractClassName(content),
      extendsLightningElement: content.includes('LightningElement'),
      // Decorators
      apiProperties: extractDecorated(content, 'api'),
      trackProperties: extractDecorated(content, 'track'),
      wireDecorators: extractWireDetails(content),
      // Imports
      apexImports: extractApexImports(content),
      salesforceImports: extractSalesforceImports(content),
      // Events
      eventDispatches: extractEvents(content),
      // Lifecycle
      lifecycleHooks: extractLifecycle(content),
      // Methods
      publicMethods: extractPublicMethods(content),
      // Navigation
      usesNavigationMixin: content.includes('NavigationMixin'),
      // Toast
      usesToast: content.includes('ShowToastEvent')
    };

    return { success: true, data, filePath: source, metadataType: 'LWC-JS', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: source, metadataType: 'LWC-JS', parseTimeMs: Date.now() - startTime };
  }
}

function extractComponentName(filePath) {
  return path.basename(filePath, '.js');
}

function extractClassName(content) {
  const match = content.match(/export\s+default\s+class\s+(\w+)/);
  return match ? match[1] : null;
}

function extractDecorated(content, decorator) {
  const regex = new RegExp(`@${decorator}\\s*(?:\\([^)]*\\))?\\s*(\\w+)`, 'g');
  const results = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    results.push(match[1]);
  }
  return results;
}

function extractWireDetails(content) {
  const wires = [];
  const regex = /@wire\(([^,)]+)(?:,\s*\{([^}]*)\})?\)\s*(\w+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    wires.push({
      adapter: match[1].trim(),
      params: match[2] ? match[2].trim() : null,
      property: match[3]
    });
  }
  return wires;
}

function extractApexImports(content) {
  const imports = [];
  const regex = /import\s+(\w+)\s+from\s+['"]@salesforce\/apex\/(\w+)\.(\w+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    imports.push({ localName: match[1], className: match[2], methodName: match[3] });
  }
  return imports;
}

function extractSalesforceImports(content) {
  const imports = [];
  const regex = /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]@salesforce\/([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const names = match[1] ? match[1].split(',').map(s => s.trim()) : [match[2]];
    imports.push({ names, module: `@salesforce/${match[3]}` });
  }
  return imports;
}

function extractEvents(content) {
  const events = [];
  const regex = /new\s+CustomEvent\(\s*['"](\w+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    events.push(match[1]);
  }
  return [...new Set(events)];
}

function extractLifecycle(content) {
  const hooks = ['connectedCallback', 'disconnectedCallback', 'renderedCallback', 'errorCallback', 'constructor'];
  return hooks.filter(h => {
    const regex = new RegExp(`\\b${h}\\s*\\(`);
    return regex.test(content);
  });
}

function extractPublicMethods(content) {
  const methods = [];
  const regex = /@api\s*\n?\s*(\w+)\s*\(/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    // Filter out properties (already captured by extractDecorated)
    if (!content.substring(match.index - 50, match.index).includes('get ') &&
        !content.substring(match.index - 50, match.index).includes('set ')) {
      methods.push(match[1]);
    }
  }
  return methods;
}

module.exports = { parseLWCJsFile, parseLWCJsContent: (content, source) => parseLWCJsContent(content, source, Date.now()) };

