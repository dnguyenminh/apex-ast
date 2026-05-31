/**
 * @fileoverview Object/Field Indexer — extracts data model for KB.
 */

const { parseObjectFile } = require('../parsers/xml/object-parser');
const { parseFieldFile } = require('../parsers/xml/field-parser');

/**
 * Index a Custom Object file for KB.
 * @param {string} filePath - Path to .object-meta.xml
 * @returns {Object} KB-ready index data
 */
function indexObjectFile(filePath) {
  const result = parseObjectFile(filePath);
  if (!result.success) return result;

  const obj = result.data;

  const kbData = {
    filePath,
    fullName: obj.fullName,
    label: obj.label,
    sharingModel: obj.sharingModel,
    fieldCount: obj.fields.length,
    validationRuleCount: obj.validationRules.length,
    recordTypeCount: obj.recordTypes.length,
    // Field summary
    fields: obj.fields.map(f => ({
      fullName: f.fullName,
      label: f.label,
      type: f.type,
      required: f.required,
      referenceTo: f.referenceTo,
      relationshipType: f.relationshipType,
      isFormula: !!f.formula,
      isPicklist: f.type === 'Picklist' || f.type === 'MultiselectPicklist',
      picklistValueCount: (f.picklistValues || []).length
    })),
    // Relationships
    relationships: obj.fields
      .filter(f => f.referenceTo)
      .map(f => ({
        fieldName: f.fullName,
        referenceTo: f.referenceTo,
        relationshipName: f.relationshipName,
        type: f.relationshipType
      })),
    // Validation rules
    validationRules: obj.validationRules.map(r => ({
      fullName: r.fullName,
      active: r.active,
      errorMessage: r.errorMessage
    })),
    // Record types
    recordTypes: obj.recordTypes.map(rt => ({
      fullName: rt.fullName,
      active: rt.active
    })),
    // Search text
    searchText: generateObjectSearchText(obj)
  };

  return { success: true, data: kbData, filePath, metadataType: 'CustomObject', parseTimeMs: result.parseTimeMs };
}

/**
 * Index a standalone Custom Field file.
 * @param {string} filePath - Path to .field-meta.xml
 * @returns {Object} KB-ready index data
 */
function indexFieldFile(filePath) {
  const result = parseFieldFile(filePath);
  if (!result.success) return result;

  const field = result.data;
  return {
    success: true,
    data: {
      filePath,
      fullName: field.fullName,
      label: field.label,
      type: field.type,
      required: field.required,
      referenceTo: field.referenceTo,
      isFormula: !!field.formula,
      formula: field.formula,
      searchText: `field ${field.fullName} type ${field.type} ${field.referenceTo ? 'references ' + field.referenceTo : ''}`
    },
    filePath,
    metadataType: 'CustomField',
    parseTimeMs: result.parseTimeMs
  };
}

function generateObjectSearchText(obj) {
  const parts = [`object ${obj.fullName}`, `label ${obj.label}`];
  for (const f of obj.fields) {
    parts.push(`field ${f.fullName} ${f.type}`);
    if (f.referenceTo) parts.push(`relationship ${f.fullName} -> ${f.referenceTo}`);
  }
  return parts.join(' | ');
}

module.exports = { indexObjectFile, indexFieldFile };
