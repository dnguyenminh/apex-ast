/**
 * @fileoverview Salesforce Custom Object metadata XML parser.
 * Parses .object-meta.xml files into structured CustomObject objects.
 */

const fs = require('fs');
const { parseXml, ensureArray, parseBool } = require('./xml-config');

function parseFields(fields) {
  return ensureArray(fields).map(f => ({
    fullName: f.fullName || null,
    label: f.label || null,
    type: f.type || null,
    description: f.description || null,
    inlineHelpText: f.inlineHelpText || null,
    required: parseBool(f.required),
    unique: parseBool(f.unique),
    externalId: parseBool(f.externalId),
    length: f.length || null,
    precision: f.precision || null,
    scale: f.scale || null,
    defaultValue: f.defaultValue !== undefined ? f.defaultValue : null,
    formula: f.formula || null,
    referenceTo: f.referenceTo || null,
    relationshipName: f.relationshipName || null,
    relationshipType: f.type === 'MasterDetail' ? 'MasterDetail' : f.type === 'Lookup' ? 'Lookup' : null,
    deleteConstraint: f.deleteConstraint || null,
    picklistValues: ensureArray(f.valueSet?.valueSetDefinition?.value || f.picklist?.picklistValues).map(pv => ({
      fullName: pv.fullName || pv.valueName || null,
      label: pv.label || pv.fullName || null,
      isActive: parseBool(pv.isActive, true),
      default: parseBool(pv.default)
    })),
    summaryForeignKey: f.summaryForeignKey || null,
    summaryOperation: f.summaryOperation || null,
    summarizedField: f.summarizedField || null
  }));
}

function parseValidationRules(rules) {
  return ensureArray(rules).map(r => ({
    fullName: r.fullName || null,
    active: parseBool(r.active),
    errorConditionFormula: r.errorConditionFormula || null,
    errorMessage: r.errorMessage || null,
    errorDisplayField: r.errorDisplayField || null,
    description: r.description || null
  }));
}

function parseRecordTypes(recordTypes) {
  return ensureArray(recordTypes).map(rt => ({
    fullName: rt.fullName || null,
    label: rt.label || null,
    active: parseBool(rt.active),
    businessProcess: rt.businessProcess || null,
    description: rt.description || null
  }));
}

function parseListViews(listViews) {
  return ensureArray(listViews).map(lv => ({
    fullName: lv.fullName || null,
    label: lv.label || null,
    columns: ensureArray(lv.columns),
    filterScope: lv.filterScope || 'Everything',
    filters: ensureArray(lv.filters).map(f => ({
      field: f.field || null,
      operation: f.operation || null,
      value: f.value || null
    }))
  }));
}

function parseCompactLayouts(layouts) {
  return ensureArray(layouts).map(cl => ({
    fullName: cl.fullName || null,
    label: cl.label || null,
    fields: ensureArray(cl.fields)
  }));
}

function parseFieldSets(fieldSets) {
  return ensureArray(fieldSets).map(fset => ({
    fullName: fset.fullName || null,
    label: fset.label || null,
    description: fset.description || null,
    availableFields: ensureArray(fset.availableFields).map(f => ({
      field: f.field || null,
      isFieldManaged: parseBool(f.isFieldManaged),
      isRequired: parseBool(f.isRequired)
    })),
    displayedFields: ensureArray(fset.displayedFields).map(f => ({
      field: f.field || null,
      isFieldManaged: parseBool(f.isFieldManaged),
      isRequired: parseBool(f.isRequired)
    }))
  }));
}

function extractObjectName(filePath) {
  const match = filePath.match(/([^/\\]+)\.object-meta\.xml$/);
  return match ? match[1] : 'Unknown';
}

function parseObjectFile(filePath) {
  const startTime = Date.now();
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    return parseObjectContent(xmlContent, filePath, startTime);
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'CustomObject', parseTimeMs: Date.now() - startTime };
  }
}

function parseObjectString(xmlContent, source = 'string') {
  return parseObjectContent(xmlContent, source, Date.now());
}

function parseObjectContent(xmlContent, source, startTime) {
  try {
    const parsed = parseXml(xmlContent);
    const obj = parsed.CustomObject;
    if (!obj) {
      return { success: false, error: 'No <CustomObject> root element found', filePath: source, metadataType: 'CustomObject', parseTimeMs: Date.now() - startTime };
    }

    const data = {
      fullName: obj.fullName || extractObjectName(source),
      label: obj.label || null,
      pluralLabel: obj.pluralLabel || null,
      description: obj.description || null,
      sharingModel: obj.sharingModel || null,
      fields: parseFields(obj.fields),
      validationRules: parseValidationRules(obj.validationRules),
      recordTypes: parseRecordTypes(obj.recordTypes),
      listViews: parseListViews(obj.listViews),
      compactLayouts: parseCompactLayouts(obj.compactLayouts),
      fieldSets: parseFieldSets(obj.fieldSets),
      nameField: obj.nameField?.type || null,
      enableActivities: parseBool(obj.enableActivities),
      enableHistory: parseBool(obj.enableHistory),
      enableReports: parseBool(obj.enableReports)
    };

    return { success: true, data, filePath: source, metadataType: 'CustomObject', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: source, metadataType: 'CustomObject', parseTimeMs: Date.now() - startTime };
  }
}

module.exports = { parseObjectFile, parseObjectString };
