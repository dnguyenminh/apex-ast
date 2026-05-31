/**
 * @fileoverview Apex Indexer — extracts structured KB data from .cls and .trigger files.
 */

const { parseApexFile } = require('../parsers/apex-parser');

/**
 * Index a single Apex file for KB ingestion.
 * @param {string} filePath - Path to .cls or .trigger file
 * @returns {Promise<Object>} KB-ready index data
 */
async function indexApexFile(filePath) {
  const result = await parseApexFile(filePath);
  if (!result.success) return result;

  const { data } = result;
  const classes = data.classes || [];

  // Extract KB-optimized data
  const kbData = {
    filePath: data.filePath,
    fileName: data.fileName,
    type: data.type,
    classes: classes.map(cls => ({
      name: cls.name,
      modifiers: cls.modifiers,
      sharing: cls.sharing,
      superClass: cls.superClass,
      interfaces: cls.interfaces,
      annotations: cls.annotations,
      methodCount: cls.methods.length,
      fieldCount: cls.fields.length,
      methods: cls.methods.map(m => ({
        name: m.name,
        returnType: m.returnType,
        parameters: m.parameters,
        modifiers: m.modifiers,
        annotations: m.annotations,
        isTest: m.annotations.some(a => a.includes('isTest') || a.includes('TestMethod')),
        isAuraEnabled: m.annotations.some(a => a.includes('AuraEnabled')),
        isInvocable: m.annotations.some(a => a.includes('InvocableMethod'))
      })),
      fields: cls.fields.map(f => ({
        name: f.name,
        type: f.type,
        modifiers: f.modifiers
      }))
    })),
    errors: data.errors,
    // Search-optimized text
    searchText: generateApexSearchText(classes)
  };

  return { success: true, data: kbData, filePath, metadataType: 'Apex', parseTimeMs: result.parseTimeMs };
}

function generateApexSearchText(classes) {
  const parts = [];
  for (const cls of classes) {
    parts.push(`class ${cls.name}`);
    if (cls.superClass) parts.push(`extends ${cls.superClass}`);
    if (cls.interfaces.length) parts.push(`implements ${cls.interfaces.join(', ')}`);
    for (const m of cls.methods) {
      parts.push(`method ${m.name}(${m.parameters.map(p => p.type).join(', ')}): ${m.returnType}`);
    }
  }
  return parts.join(' | ');
}

module.exports = { indexApexFile };
