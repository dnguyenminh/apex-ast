/**
 * @fileoverview LWC HTML Template Parser.
 * Parses Lightning Web Component HTML template files.
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a LWC HTML template file.
 * @param {string} filePath - Path to LWC .html file
 * @returns {Object} Parse result with template data
 */
function parseLWCHtmlFile(filePath) {
  const startTime = Date.now();
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseLWCHtmlContent(content, filePath, startTime);
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'LWC-HTML', parseTimeMs: Date.now() - startTime };
  }
}

function parseLWCHtmlContent(content, source, startTime) {
  try {
    const data = {
      componentName: path.basename(source, '.html'),
      // Component references
      childComponents: extractComponents(content),
      lightningComponents: extractLightningComponents(content),
      customComponents: extractCustomComponents(content),
      // Data bindings
      dataBindings: extractBindings(content),
      // Event handlers
      eventHandlers: extractHandlers(content),
      // Directives
      conditionals: extractConditionals(content),
      iterations: extractIterations(content),
      // Slots
      slots: extractSlots(content),
      // Template structure
      hasTemplate: content.includes('<template'),
      templateCount: (content.match(/<template/g) || []).length
    };

    return { success: true, data, filePath: source, metadataType: 'LWC-HTML', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: source, metadataType: 'LWC-HTML', parseTimeMs: Date.now() - startTime };
  }
}

function extractComponents(content) {
  const regex = /<(c-[\w-]+|lightning-[\w-]+)/g;
  const components = new Set();
  let match;
  while ((match = regex.exec(content)) !== null) {
    components.add(match[1]);
  }
  return Array.from(components);
}

function extractLightningComponents(content) {
  const regex = /<(lightning-[\w-]+)/g;
  const components = new Set();
  let match;
  while ((match = regex.exec(content)) !== null) {
    components.add(match[1]);
  }
  return Array.from(components);
}

function extractCustomComponents(content) {
  const regex = /<(c-[\w-]+)/g;
  const components = new Set();
  let match;
  while ((match = regex.exec(content)) !== null) {
    components.add(match[1]);
  }
  return Array.from(components);
}

function extractBindings(content) {
  const regex = /\{(\w+(?:\.\w+)*)\}/g;
  const bindings = new Set();
  let match;
  while ((match = regex.exec(content)) !== null) {
    bindings.add(match[1]);
  }
  return Array.from(bindings);
}

function extractHandlers(content) {
  const handlers = [];
  const regex = /on(\w+)\s*=\s*\{(\w+)\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    handlers.push({ event: match[1], handler: match[2] });
  }
  return handlers;
}

function extractConditionals(content) {
  const conditionals = [];
  // Legacy if:true/if:false
  const legacyRegex = /(if:true|if:false)\s*=\s*\{([^}]+)\}/g;
  let match;
  while ((match = legacyRegex.exec(content)) !== null) {
    conditionals.push({ type: match[1], expression: match[2] });
  }
  // New lwc:if/lwc:elseif
  const newRegex = /(lwc:if|lwc:elseif)\s*=\s*\{([^}]+)\}/g;
  while ((match = newRegex.exec(content)) !== null) {
    conditionals.push({ type: match[1], expression: match[2] });
  }
  if (content.includes('lwc:else')) {
    conditionals.push({ type: 'lwc:else', expression: null });
  }
  return conditionals;
}

function extractIterations(content) {
  const iterations = [];
  // for:each
  const forEachRegex = /for:each\s*=\s*\{([^}]+)\}\s+for:item\s*=\s*"([^"]+)"/g;
  let match;
  while ((match = forEachRegex.exec(content)) !== null) {
    iterations.push({ type: 'for:each', collection: match[1], item: match[2] });
  }
  // iterator
  const iteratorRegex = /iterator:(\w+)\s*=\s*\{([^}]+)\}/g;
  while ((match = iteratorRegex.exec(content)) !== null) {
    iterations.push({ type: 'iterator', name: match[1], collection: match[2] });
  }
  return iterations;
}

function extractSlots(content) {
  const slots = [];
  const regex = /<slot(?:\s+name\s*=\s*"([^"]*)")?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    slots.push({ name: match[1] || 'default' });
  }
  return slots;
}

module.exports = { parseLWCHtmlFile, parseLWCHtmlContent: (content, source) => parseLWCHtmlContent(content, source, Date.now()) };
