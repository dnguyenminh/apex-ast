/**
 * @fileoverview XML Metadata Parsers barrel export.
 * Re-exports all Salesforce metadata XML parsers.
 */

const { parseFlowFile, parseFlowString } = require('./flow-parser');
const { parseObjectFile, parseObjectString } = require('./object-parser');
const { parseFieldFile, parseFieldString } = require('./field-parser');
const { parseValidationRuleFile, parseValidationRuleString, extractValidationRulesFromObject } = require('./validation-rule-parser');
const { parsePermissionSetFile, parseProfileFile, parsePermissionString } = require('./permission-parser');
const { parseLabelFile, parseLabelString } = require('./label-parser');
const { parseLayoutFile, parseLayoutString } = require('./layout-parser');

module.exports = {
  // Flow
  parseFlowFile,
  parseFlowString,
  // Object
  parseObjectFile,
  parseObjectString,
  // Field
  parseFieldFile,
  parseFieldString,
  // Validation Rule
  parseValidationRuleFile,
  parseValidationRuleString,
  extractValidationRulesFromObject,
  // Permission Set / Profile
  parsePermissionSetFile,
  parseProfileFile,
  parsePermissionString,
  // Labels
  parseLabelFile,
  parseLabelString,
  // Layout
  parseLayoutFile,
  parseLayoutString
};
