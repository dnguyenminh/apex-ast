/**
 * @fileoverview Salesforce Page Layout metadata XML parser.
 * Parses .layout-meta.xml files.
 */

const fs = require('fs');
const { parseXml, ensureArray } = require('./xml-config');

function parseLayoutSections(sections) {
  return ensureArray(sections).map(s => ({
    label: s.label || null,
    style: s.style || 'TwoColumnsLeftToRight',
    columns: s.columns || 2,
    layoutColumns: ensureArray(s.layoutColumns).map(col => 
      ensureArray(col.layoutItems).map(item => ({
        field: item.field || null,
        behavior: item.behavior || null,
        component: item.component || null
      }))
    )
  }));
}

function parseRelatedLists(lists) {
  return ensureArray(lists).map(rl => ({
    relatedList: rl.relatedList || null,
    fields: ensureArray(rl.fields),
    sortField: ensureArray(rl.sortField).map(sf => ({
      field: sf.field || sf || null,
      sortOrder: sf.sortOrder || 'Asc'
    })),
    excludeButtons: ensureArray(rl.excludeButtons)
  }));
}

function extractLayoutName(filePath) {
  const match = filePath.match(/([^/\\]+)\.layout-meta\.xml$/);
  return match ? match[1] : 'Unknown';
}

function parseLayoutContent(xmlContent, source, startTime) {
  try {
    const parsed = parseXml(xmlContent);
    const layout = parsed.Layout;
    if (!layout) {
      return { success: false, error: 'No <Layout> root element found', filePath: source, metadataType: 'Layout', parseTimeMs: Date.now() - startTime };
    }

    const data = {
      fullName: layout.fullName || extractLayoutName(source),
      layoutSections: parseLayoutSections(layout.layoutSections),
      relatedLists: parseRelatedLists(layout.relatedLists),
      quickActionList: ensureArray(layout.quickActionList?.quickActionListItems).map(q => q.quickActionName || q),
      miniLayout: ensureArray(layout.miniLayout?.fields),
      feedLayout: layout.feedLayout || null,
      platformActionList: ensureArray(layout.platformActionList?.platformActionListItems).map(p => p.actionName || p)
    };

    return { success: true, data, filePath: source, metadataType: 'Layout', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: source, metadataType: 'Layout', parseTimeMs: Date.now() - startTime };
  }
}

function parseLayoutFile(filePath) {
  const startTime = Date.now();
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    return parseLayoutContent(xmlContent, filePath, startTime);
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'Layout', parseTimeMs: Date.now() - startTime };
  }
}

function parseLayoutString(xmlContent, source = 'string') {
  return parseLayoutContent(xmlContent, source, Date.now());
}

module.exports = { parseLayoutFile, parseLayoutString };
