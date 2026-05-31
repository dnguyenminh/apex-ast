/**
 * @fileoverview LWC Indexer — extracts component info for KB.
 * Placeholder for Epic 6 integration. Uses regex-based extraction until
 * Tree-Sitter JS/HTML/CSS parsers are integrated.
 */

const fs = require('fs');
const path = require('path');

/**
 * Index a LWC component directory.
 * @param {string} componentDir - Path to LWC component directory
 * @returns {Object} KB-ready index data
 */
function indexLWCComponent(componentDir) {
  const startTime = Date.now();
  const componentName = path.basename(componentDir);

  try {
    const jsFile = path.join(componentDir, `${componentName}.js`);
    const htmlFile = path.join(componentDir, `${componentName}.html`);
    const cssFile = path.join(componentDir, `${componentName}.css`);
    const metaFile = path.join(componentDir, `${componentName}.js-meta.xml`);

    const jsContent = fs.existsSync(jsFile) ? fs.readFileSync(jsFile, 'utf-8') : '';
    const htmlContent = fs.existsSync(htmlFile) ? fs.readFileSync(htmlFile, 'utf-8') : '';
    const cssContent = fs.existsSync(cssFile) ? fs.readFileSync(cssFile, 'utf-8') : '';

    const data = {
      componentName,
      filePath: componentDir,
      // JS analysis
      apiProperties: extractApiProperties(jsContent),
      trackProperties: extractTrackProperties(jsContent),
      wireDecorators: extractWireDecorators(jsContent),
      apexImports: extractApexImports(jsContent),
      eventDispatches: extractEventDispatches(jsContent),
      lifecycleHooks: extractLifecycleHooks(jsContent),
      // HTML analysis
      childComponents: extractChildComponents(htmlContent),
      dataBindings: extractDataBindings(htmlContent),
      eventHandlers: extractEventHandlers(htmlContent),
      templateDirectives: extractTemplateDirectives(htmlContent),
      // CSS analysis
      customProperties: extractCssCustomProperties(cssContent),
      // Meta
      hasJs: !!jsContent,
      hasHtml: !!htmlContent,
      hasCss: !!cssContent,
      hasMeta: fs.existsSync(metaFile),
      // Search text
      searchText: `lwc ${componentName} ${extractApiProperties(jsContent).join(' ')} ${extractApexImports(jsContent).map(a => a.methodName).join(' ')}`
    };

    return { success: true, data, filePath: componentDir, metadataType: 'LWC', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: componentDir, metadataType: 'LWC', parseTimeMs: Date.now() - startTime };
  }
}

// --- Regex-based extractors (will be replaced by Tree-Sitter in Epic 6) ---

function extractApiProperties(jsContent) {
  const matches = jsContent.matchAll(/@api\s+(\w+)/g);
  return Array.from(matches, m => m[1]);
}

function extractTrackProperties(jsContent) {
  const matches = jsContent.matchAll(/@track\s+(\w+)/g);
  return Array.from(matches, m => m[1]);
}

function extractWireDecorators(jsContent) {
  const matches = jsContent.matchAll(/@wire\(([^)]+)\)/g);
  return Array.from(matches, m => ({ adapter: m[1].trim() }));
}

function extractApexImports(jsContent) {
  const matches = jsContent.matchAll(/import\s+(\w+)\s+from\s+['"]@salesforce\/apex\/(\w+)\.(\w+)['"]/g);
  return Array.from(matches, m => ({
    localName: m[1],
    className: m[2],
    methodName: m[3]
  }));
}

function extractEventDispatches(jsContent) {
  const matches = jsContent.matchAll(/new\s+CustomEvent\(['"](\w+)['"]/g);
  return Array.from(matches, m => m[1]);
}

function extractLifecycleHooks(jsContent) {
  const hooks = ['connectedCallback', 'disconnectedCallback', 'renderedCallback', 'errorCallback'];
  return hooks.filter(h => jsContent.includes(h));
}

function extractChildComponents(htmlContent) {
  const matches = htmlContent.matchAll(/<(c-[\w-]+|lightning-[\w-]+)/g);
  const components = new Set(Array.from(matches, m => m[1]));
  return Array.from(components);
}

function extractDataBindings(htmlContent) {
  const matches = htmlContent.matchAll(/\{(\w+(?:\.\w+)*)\}/g);
  const bindings = new Set(Array.from(matches, m => m[1]));
  return Array.from(bindings);
}

function extractEventHandlers(htmlContent) {
  const matches = htmlContent.matchAll(/on(\w+)=\{/g);
  return Array.from(matches, m => m[1]);
}

function extractTemplateDirectives(htmlContent) {
  const directives = [];
  if (htmlContent.includes('if:true') || htmlContent.includes('if:false')) directives.push('if');
  if (htmlContent.includes('for:each')) directives.push('for:each');
  if (htmlContent.includes('iterator:')) directives.push('iterator');
  if (htmlContent.includes('lwc:if') || htmlContent.includes('lwc:elseif')) directives.push('lwc:if');
  return directives;
}

function extractCssCustomProperties(cssContent) {
  const matches = cssContent.matchAll(/--([\w-]+)/g);
  const props = new Set(Array.from(matches, m => `--${m[1]}`));
  return Array.from(props);
}

module.exports = { indexLWCComponent };
