/**
 * @fileoverview Salesforce Custom Field metadata XML parser.
 * Parses .field-meta.xml files into structured CustomField objects.
 */

const fs = require('fs');
const { parseXml, ensureArray, parseBool } = require('./xml-config');

function extractFieldName(filePath) {
  const match = filePath.match(/([^/\\]+)\.field-meta\.xml$/);
  return match ? match[1] : 'Unknown';
}

function parseFieldContent(xmlContent, source, startTime) {
  try {
    const parsed = parseXml(xmlContent);
    const field = parsed.CustomField;
    if (!field) {
      return { success: false, error: 'No <CustomField> root element found', filePath: source, metadataType: 'CustomField', parseTimeMs: Date.now() - startTime };
    }

    const data = {
      fullName: field.fullName || extractFieldName(source),
      label: field.label || null,
      type: field.type || null,
      description: field.description || null,
      inlineHelpText: field.inlineHelpText || null,
      required: parseBool(field.required),
      unique: parseBool(field.unique),
      externalId: parseBool(field.externalId),
      length: field.length || null,
      precision: field.precision || null,
      scale: field.scale || null,
      defaultValue: field.defaultValue !== undefined ? field.defaultValue : null,
      formula: field.formula || null,
      referenceTo: field.referenceTo || null,
      relationshipName: field.relationshipName || null,
      relationshipType: field.type === 'MasterDetail' ? 'MasterDetail' : field.type === 'Lookup' ? 'Lookup' : field.type === 'ExternalLookup' ? 'ExternalLookup' : null,
      deleteConstraint: field.deleteConstraint || null,
      picklistValues: ensureArray(field.valueSet?.valueSetDefinition?.value || field.picklist?.picklistValues).map(pv => ({
        fullName: pv.fullName || pv.valueName || null,
        label: pv.label || pv.fullName || null,
        isActive: parseBool(pv.isActive, true),
        default: parseBool(pv.default)
      })),
      summaryForeignKey: field.summaryForeignKey || null,
      summaryOperation: field.summaryOperation || null,
      summarizedField: field.summarizedField || null,
      formulaTreatBlanksAs: field.formulaTreatBlanksAs || null,
      trackHistory: parseBool(field.trackHistory),
      trackFeedHistory: parseBool(field.trackFeedHistory)
    };

    return { success: true, data, filePath: source, metadataType: 'CustomField', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: source, metadataType: 'CustomField', parseTimeMs: Date.now() - startTime };
  }
}

function parseFieldFile(filePath) {
  const startTime = Date.now();
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    return parseFieldContent(xmlContent, filePath, startTime);
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'CustomField', parseTimeMs: Date.now() - startTime };
  }
}

function parseFieldString(xmlContent, source = 'string') {
  return parseFieldContent(xmlContent, source, Date.now());
}

module.exports = { parseFieldFile, parseFieldString };
