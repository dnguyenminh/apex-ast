/**
 * @fileoverview Salesforce Flow metadata XML parser.
 * Parses .flow-meta.xml files into structured FlowDefinition objects.
 */

const fs = require('fs');
const { parseXml, ensureArray, parseBool } = require('./xml-config');

function parseConnector(node) {
  if (!node) return null;
  return { targetReference: node.targetReference || null, isGoTo: parseBool(node.isGoTo) };
}

function parseConditions(conditions) {
  return ensureArray(conditions).map(c => ({
    leftValueReference: c.leftValueReference || null,
    operator: c.operator || null,
    rightValue: c.rightValue !== undefined ? c.rightValue : null
  }));
}

function parseVariables(variables) {
  return ensureArray(variables).map(v => ({
    name: v.name || null,
    dataType: v.dataType || null,
    isCollection: parseBool(v.isCollection),
    isInput: parseBool(v.isInput),
    isOutput: parseBool(v.isOutput),
    defaultValue: v.value !== undefined ? v.value : null,
    objectType: v.objectType || null
  }));
}

function parseDecisions(decisions) {
  return ensureArray(decisions).map(d => ({
    name: d.name || null,
    label: d.label || null,
    rules: ensureArray(d.rules).map(r => ({
      name: r.name || null,
      label: r.label || null,
      conditionLogic: r.conditionLogic || 'and',
      conditions: parseConditions(r.conditions),
      connector: parseConnector(r.connector)
    })),
    defaultConnector: parseConnector(d.defaultConnector)
  }));
}

function parseAssignments(assignments) {
  return ensureArray(assignments).map(a => ({
    name: a.name || null,
    label: a.label || null,
    assignmentItems: ensureArray(a.assignmentItems).map(item => ({
      assignToReference: item.assignToReference || null,
      operator: item.operator || null,
      value: item.value !== undefined ? item.value : null
    })),
    connector: parseConnector(a.connector)
  }));
}

function parseInputAssignments(inputs) {
  return ensureArray(inputs).map(i => ({
    field: i.field || null,
    value: i.value !== undefined ? i.value : null
  }));
}

function parseRecordCreates(creates) {
  return ensureArray(creates).map(rc => ({
    name: rc.name || null,
    label: rc.label || null,
    object: rc.object || null,
    inputAssignments: parseInputAssignments(rc.inputAssignments),
    assignRecordIdToReference: rc.assignRecordIdToReference || null,
    connector: parseConnector(rc.connector),
    faultConnector: parseConnector(rc.faultConnector)
  }));
}

function parseRecordUpdates(updates) {
  return ensureArray(updates).map(ru => ({
    name: ru.name || null,
    label: ru.label || null,
    object: ru.object || null,
    filters: parseConditions(ru.filters),
    inputAssignments: parseInputAssignments(ru.inputAssignments),
    connector: parseConnector(ru.connector),
    faultConnector: parseConnector(ru.faultConnector)
  }));
}

function parseRecordDeletes(deletes) {
  return ensureArray(deletes).map(rd => ({
    name: rd.name || null,
    label: rd.label || null,
    object: rd.object || null,
    filters: parseConditions(rd.filters),
    connector: parseConnector(rd.connector),
    faultConnector: parseConnector(rd.faultConnector)
  }));
}

function parseRecordLookups(lookups) {
  return ensureArray(lookups).map(rl => ({
    name: rl.name || null,
    label: rl.label || null,
    object: rl.object || null,
    filters: parseConditions(rl.filters),
    queriedFields: ensureArray(rl.queriedFields),
    outputReference: rl.outputReference || null,
    getFirstRecordOnly: parseBool(rl.getFirstRecordOnly, true),
    connector: parseConnector(rl.connector)
  }));
}

function parseScreens(screens) {
  return ensureArray(screens).map(s => ({
    name: s.name || null,
    label: s.label || null,
    fields: ensureArray(s.fields).map(f => ({
      name: f.name || null,
      fieldType: f.fieldType || null,
      dataType: f.dataType || null,
      isRequired: parseBool(f.isRequired)
    })),
    connector: parseConnector(s.connector)
  }));
}

function parseLoops(loops) {
  return ensureArray(loops).map(l => ({
    name: l.name || null,
    label: l.label || null,
    collectionReference: l.collectionReference || null,
    iterationOrder: l.iterationOrder || 'Asc',
    nextValueConnector: parseConnector(l.nextValueConnector),
    noMoreValuesConnector: parseConnector(l.noMoreValuesConnector)
  }));
}

function parseSubflows(subflows) {
  return ensureArray(subflows).map(sf => ({
    name: sf.name || null,
    flowName: sf.flowName || null,
    inputAssignments: ensureArray(sf.inputAssignments).map(i => ({
      name: i.name || null,
      value: i.value !== undefined ? i.value : null
    })),
    outputAssignments: ensureArray(sf.outputAssignments).map(o => ({
      assignToReference: o.assignToReference || null,
      name: o.name || null
    })),
    connector: parseConnector(sf.connector)
  }));
}

function parseWaits(waits) {
  return ensureArray(waits).map(w => ({
    name: w.name || null,
    label: w.label || null,
    waitEvents: ensureArray(w.waitEvents).map(e => ({
      name: e.name || null,
      conditionLogic: e.conditionLogic || 'and',
      conditions: parseConditions(e.conditions),
      connector: parseConnector(e.connector)
    })),
    defaultConnector: parseConnector(w.defaultConnector)
  }));
}

function extractFlowName(filePath) {
  const match = filePath.match(/([^/\\]+)\.flow-meta\.xml$/);
  return match ? match[1] : 'Unknown';
}

/**
 * Parse a Salesforce Flow metadata XML file.
 * @param {string} filePath - Path to .flow-meta.xml file
 * @returns {import('../../types/metadata-types').ParseResult}
 */
function parseFlowFile(filePath) {
  const startTime = Date.now();
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    return parseFlowContent(xmlContent, filePath, startTime);
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'Flow', parseTimeMs: Date.now() - startTime };
  }
}

/**
 * Parse flow from XML string content.
 * @param {string} xmlContent - XML string
 * @param {string} [source='string'] - Source identifier
 * @returns {import('../../types/metadata-types').ParseResult}
 */
function parseFlowString(xmlContent, source = 'string') {
  return parseFlowContent(xmlContent, source, Date.now());
}

function parseFlowContent(xmlContent, source, startTime) {
  try {
    const parsed = parseXml(xmlContent);
    const flow = parsed.Flow;
    if (!flow) {
      return { success: false, error: 'No <Flow> root element found', filePath: source, metadataType: 'Flow', parseTimeMs: Date.now() - startTime };
    }

    const data = {
      fullName: flow.fullName || extractFlowName(source),
      label: flow.label || null,
      description: flow.description || null,
      processType: flow.processType || null,
      status: flow.status || null,
      apiVersion: flow.apiVersion || null,
      startElementReference: flow.startElementReference || flow.start?.connector?.targetReference || null,
      variables: parseVariables(flow.variables),
      decisions: parseDecisions(flow.decisions),
      assignments: parseAssignments(flow.assignments),
      recordCreates: parseRecordCreates(flow.recordCreates),
      recordUpdates: parseRecordUpdates(flow.recordUpdates),
      recordDeletes: parseRecordDeletes(flow.recordDeletes),
      recordLookups: parseRecordLookups(flow.recordLookups),
      screens: parseScreens(flow.screens),
      loops: parseLoops(flow.loops),
      subflows: parseSubflows(flow.subflows),
      waits: parseWaits(flow.waits)
    };

    return { success: true, data, filePath: source, metadataType: 'Flow', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: source, metadataType: 'Flow', parseTimeMs: Date.now() - startTime };
  }
}

module.exports = { parseFlowFile, parseFlowString };
