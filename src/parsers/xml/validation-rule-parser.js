/**
 * @fileoverview Salesforce Validation Rule metadata XML parser.
 * Parses validation rules from standalone XML or within object metadata.
 */

const fs = require('fs');
const { parseXml, ensureArray, parseBool } = require('./xml-config');

function extractRuleName(filePath) {
  const match = filePath.match(/([^/\\]+)\.validationRule-meta\.xml$/);
  return match ? match[1] : 'Unknown';
}

function parseRuleContent(xmlContent, source, startTime) {
  try {
    const parsed = parseXml(xmlContent);
    const rule = parsed.ValidationRule;
    if (!rule) {
      return { success: false, error: 'No <ValidationRule> root element found', filePath: source, metadataType: 'ValidationRule', parseTimeMs: Date.now() - startTime };
    }

    const data = {
      fullName: rule.fullName || extractRuleName(source),
      active: parseBool(rule.active),
      errorConditionFormula: rule.errorConditionFormula || null,
      errorMessage: rule.errorMessage || null,
      errorDisplayField: rule.errorDisplayField || null,
      description: rule.description || null
    };

    return { success: true, data, filePath: source, metadataType: 'ValidationRule', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: source, metadataType: 'ValidationRule', parseTimeMs: Date.now() - startTime };
  }
}

function parseValidationRuleFile(filePath) {
  const startTime = Date.now();
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    return parseRuleContent(xmlContent, filePath, startTime);
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'ValidationRule', parseTimeMs: Date.now() - startTime };
  }
}

function parseValidationRuleString(xmlContent, source = 'string') {
  return parseRuleContent(xmlContent, source, Date.now());
}

/**
 * Extract validation rules from within a CustomObject XML.
 * @param {string} objectXmlContent - Full object XML content
 * @returns {Array} Array of parsed validation rules
 */
function extractValidationRulesFromObject(objectXmlContent) {
  try {
    const parsed = parseXml(objectXmlContent);
    const obj = parsed.CustomObject;
    if (!obj || !obj.validationRules) return [];
    return ensureArray(obj.validationRules).map(r => ({
      fullName: r.fullName || null,
      active: parseBool(r.active),
      errorConditionFormula: r.errorConditionFormula || null,
      errorMessage: r.errorMessage || null,
      errorDisplayField: r.errorDisplayField || null,
      description: r.description || null
    }));
  } catch (error) {
    return [];
  }
}

module.exports = { parseValidationRuleFile, parseValidationRuleString, extractValidationRulesFromObject };
