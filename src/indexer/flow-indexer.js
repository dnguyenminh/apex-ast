/**
 * @fileoverview Flow Indexer — extracts flow logic for KB ingestion.
 */

const { parseFlowFile } = require('../parsers/xml/flow-parser');

/**
 * Index a single Flow file for KB ingestion.
 * @param {string} filePath - Path to .flow-meta.xml file
 * @returns {Object} KB-ready index data
 */
function indexFlowFile(filePath) {
  const result = parseFlowFile(filePath);
  if (!result.success) return result;

  const flow = result.data;

  const kbData = {
    filePath,
    fullName: flow.fullName,
    label: flow.label,
    processType: flow.processType,
    status: flow.status,
    apiVersion: flow.apiVersion,
    // Node summary
    nodeCount: countNodes(flow),
    // Variables summary
    variables: flow.variables.map(v => ({
      name: v.name,
      dataType: v.dataType,
      isInput: v.isInput,
      isOutput: v.isOutput,
      objectType: v.objectType
    })),
    // DML operations
    dmlOperations: extractDmlOps(flow),
    // Referenced objects
    referencedObjects: extractReferencedObjects(flow),
    // Referenced subflows
    referencedSubflows: flow.subflows.map(sf => sf.flowName).filter(Boolean),
    // Decision count
    decisionCount: flow.decisions.length,
    // Screen count
    screenCount: flow.screens.length,
    // Loop count
    loopCount: flow.loops.length,
    // Search text
    searchText: generateFlowSearchText(flow)
  };

  return { success: true, data: kbData, filePath, metadataType: 'Flow', parseTimeMs: result.parseTimeMs };
}

function countNodes(flow) {
  return flow.decisions.length + flow.assignments.length +
    flow.recordCreates.length + flow.recordUpdates.length +
    flow.recordDeletes.length + flow.recordLookups.length +
    flow.screens.length + flow.loops.length +
    flow.subflows.length + flow.waits.length;
}

function extractDmlOps(flow) {
  const ops = [];
  for (const rc of flow.recordCreates) ops.push({ type: 'create', object: rc.object, name: rc.name });
  for (const ru of flow.recordUpdates) ops.push({ type: 'update', object: ru.object, name: ru.name });
  for (const rd of flow.recordDeletes) ops.push({ type: 'delete', object: rd.object, name: rd.name });
  for (const rl of flow.recordLookups) ops.push({ type: 'lookup', object: rl.object, name: rl.name });
  return ops;
}

function extractReferencedObjects(flow) {
  const objects = new Set();
  for (const rc of flow.recordCreates) if (rc.object) objects.add(rc.object);
  for (const ru of flow.recordUpdates) if (ru.object) objects.add(ru.object);
  for (const rd of flow.recordDeletes) if (rd.object) objects.add(rd.object);
  for (const rl of flow.recordLookups) if (rl.object) objects.add(rl.object);
  return Array.from(objects);
}

function generateFlowSearchText(flow) {
  const parts = [`flow ${flow.fullName}`, `type ${flow.processType}`, `status ${flow.status}`];
  for (const obj of extractReferencedObjects(flow)) parts.push(`object ${obj}`);
  for (const sf of flow.subflows) if (sf.flowName) parts.push(`subflow ${sf.flowName}`);
  return parts.join(' | ');
}

module.exports = { indexFlowFile };
