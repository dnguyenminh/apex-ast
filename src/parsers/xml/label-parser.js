/**
 * @fileoverview Salesforce Custom Labels metadata XML parser.
 * Parses CustomLabels.labels-meta.xml files.
 */

const fs = require('fs');
const { parseXml, ensureArray, parseBool } = require('./xml-config');

function parseLabelContent(xmlContent, source, startTime) {
  try {
    const parsed = parseXml(xmlContent);
    const root = parsed.CustomLabels;
    if (!root) {
      return { success: false, error: 'No <CustomLabels> root element found', filePath: source, metadataType: 'CustomLabels', parseTimeMs: Date.now() - startTime };
    }

    const labels = ensureArray(root.labels).map(l => ({
      fullName: l.fullName || null,
      value: l.value || null,
      language: l.language || 'en_US',
      shortDescription: l.shortDescription || null,
      categories: l.categories || null,
      protected: parseBool(l.protected)
    }));

    const data = { labels };

    return { success: true, data, filePath: source, metadataType: 'CustomLabels', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: source, metadataType: 'CustomLabels', parseTimeMs: Date.now() - startTime };
  }
}

function parseLabelFile(filePath) {
  const startTime = Date.now();
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    return parseLabelContent(xmlContent, filePath, startTime);
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'CustomLabels', parseTimeMs: Date.now() - startTime };
  }
}

function parseLabelString(xmlContent, source = 'string') {
  return parseLabelContent(xmlContent, source, Date.now());
}

module.exports = { parseLabelFile, parseLabelString };
