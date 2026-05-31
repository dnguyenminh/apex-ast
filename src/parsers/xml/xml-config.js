/**
 * @fileoverview Shared XML parser configuration for Salesforce metadata files.
 * Uses fast-xml-parser with options optimized for Salesforce metadata XML format.
 */

const { XMLParser } = require('fast-xml-parser');

/**
 * Default parser options for Salesforce metadata XML.
 */
const DEFAULT_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  trimValues: true,
  parseTagValue: true,
  processEntities: true,
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    const alwaysArray = [
      'fields', 'validationRules', 'recordTypes', 'listViews',
      'compactLayouts', 'fieldSets', 'objectPermissions', 'fieldPermissions',
      'tabVisibilities', 'classAccesses', 'pageAccesses', 'customPermissions',
      'labels', 'layoutSections', 'relatedLists', 'layoutColumns',
      'layoutItems', 'variables', 'decisions', 'assignments',
      'recordCreates', 'recordUpdates', 'recordDeletes', 'recordLookups',
      'screens', 'loops', 'subflows', 'waits', 'rules', 'conditions',
      'assignmentItems', 'inputAssignments', 'outputAssignments',
      'filters', 'columns', 'picklistValues', 'waitEvents',
      'queriedFields', 'availableFields', 'displayedFields',
      'quickActionList', 'miniLayout', 'platformActionList',
      'loginIpRanges', 'sortField', 'excludeButtons'
    ];
    return alwaysArray.includes(name);
  }
};

/**
 * Create a configured XML parser instance.
 * @param {Object} [overrides] - Options to override defaults
 * @returns {XMLParser} Configured parser instance
 */
function createParser(overrides = {}) {
  return new XMLParser({ ...DEFAULT_OPTIONS, ...overrides });
}

/**
 * Parse XML string to JavaScript object.
 * @param {string} xmlContent - Raw XML string
 * @param {Object} [options] - Parser option overrides
 * @returns {Object} Parsed JavaScript object
 */
function parseXml(xmlContent, options = {}) {
  const parser = createParser(options);
  return parser.parse(xmlContent);
}

/**
 * Ensure a value is always an array.
 * @param {*} value - Value that might be an array or single item
 * @returns {Array} Always returns an array
 */
function ensureArray(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

/**
 * Extract text value from a potentially complex XML node.
 * @param {*} node - XML node value
 * @returns {string|null} Text value or null
 */
function extractText(node) {
  if (node === undefined || node === null) return null;
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return String(node);
  }
  if (node['#text'] !== undefined) return String(node['#text']);
  return null;
}

/**
 * Parse a boolean value from XML.
 * @param {*} value - Value to parse
 * @param {boolean} [defaultValue=false] - Default if value is undefined
 * @returns {boolean}
 */
function parseBool(value, defaultValue = false) {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

module.exports = {
  createParser,
  parseXml,
  ensureArray,
  extractText,
  parseBool,
  DEFAULT_OPTIONS
};
