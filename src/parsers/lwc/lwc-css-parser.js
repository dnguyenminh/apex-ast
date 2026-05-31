/**
 * @fileoverview LWC CSS Parser.
 * Parses Lightning Web Component CSS files.
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a LWC CSS file.
 * @param {string} filePath - Path to LWC .css file
 * @returns {Object} Parse result with style data
 */
function parseLWCCssFile(filePath) {
  const startTime = Date.now();
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseLWCCssContent(content, filePath, startTime);
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'LWC-CSS', parseTimeMs: Date.now() - startTime };
  }
}

function parseLWCCssContent(content, source, startTime) {
  try {
    const data = {
      componentName: path.basename(source, '.css'),
      // Custom properties defined
      customPropertiesDefined: extractDefinedProperties(content),
      // Custom properties used
      customPropertiesUsed: extractUsedProperties(content),
      // Host selectors
      hostSelectors: extractHostSelectors(content),
      // Media queries
      mediaQueries: extractMediaQueries(content),
      // SLDS token references
      sldsTokens: extractSldsTokens(content),
      // Selectors
      selectors: extractSelectors(content),
      // Stats
      ruleCount: (content.match(/\{/g) || []).length,
      lineCount: content.split('\n').length,
      isEmpty: content.trim().length === 0
    };

    return { success: true, data, filePath: source, metadataType: 'LWC-CSS', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: source, metadataType: 'LWC-CSS', parseTimeMs: Date.now() - startTime };
  }
}

function extractDefinedProperties(content) {
  const props = [];
  const regex = /(--[\w-]+)\s*:/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    props.push(match[1]);
  }
  return [...new Set(props)];
}

function extractUsedProperties(content) {
  const props = [];
  const regex = /var\(\s*(--[\w-]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    props.push(match[1]);
  }
  return [...new Set(props)];
}

function extractHostSelectors(content) {
  const selectors = [];
  const regex = /:host(?:\(([^)]*)\))?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    selectors.push(match[0]);
  }
  return selectors;
}

function extractMediaQueries(content) {
  const queries = [];
  const regex = /@media\s*([^{]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    queries.push(match[1].trim());
  }
  return queries;
}

function extractSldsTokens(content) {
  const tokens = [];
  const regex = /var\(\s*(--lwc-[\w-]+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    tokens.push(match[1]);
  }
  return [...new Set(tokens)];
}

function extractSelectors(content) {
  const selectors = [];
  const regex = /([^{}@]+)\s*\{/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const sel = match[1].trim();
    if (sel && !sel.startsWith('/*') && !sel.startsWith('@')) {
      selectors.push(sel);
    }
  }
  return selectors;
}

module.exports = { parseLWCCssFile, parseLWCCssContent: (content, source) => parseLWCCssContent(content, source, Date.now()) };
