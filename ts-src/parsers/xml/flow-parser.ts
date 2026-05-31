/**
 * Flow Parser — Parse .flow-meta.xml files
 * Extracts structured flow logic from Salesforce Flow metadata
 */
import { parseXmlFile, parseXml, ensureArray } from '../utils/xml-utils';
import { Flow, FlowVariable, FlowDecision, FlowAssignment, FlowRecordCreate, FlowRecordUpdate, FlowRecordDelete, FlowRecordLookup, FlowScreen, FlowLoop, FlowActionCall, FlowSubflow, FlowWait, FlowStart, FlowConnector } from '../types/metadata-types';

/** Parsed flow output with structured data */
export interface ParsedFlow {
  name: string;
  label: string;
  description?: string;
  apiVersion?: string;
  processType: string;
  runInMode?: string;
  status: string;
  triggerType?: string;
  triggerObject?: string;
  recordTriggerType?: string;
  variables: FlowVariable[];
  decisions: FlowDecision[];
  assignments: FlowAssignment[];
  recordCreates: FlowRecordCreate[];
  recordUpdates: FlowRecordUpdate[];
  recordDeletes: FlowRecordDelete[];
  recordLookups: FlowRecordLookup[];
  screens: FlowScreen[];
  loops: FlowLoop[];
  actionCalls: FlowActionCall[];
  subflows: FlowSubflow[];
  waits: FlowWait[];
  start?: FlowStart;
  /** All node names in execution order (best effort) */
  nodeNames: string[];
  /** Connector map: source -> target */
  connections: Array<{ from: string; to: string; label?: string }>;
}

/** Parse a .flow-meta.xml file */
export async function parseFlowFile(filePath: string): Promise<ParsedFlow> {
  const flow = await parseXmlFile<Flow>(filePath, 'Flow');
  return parseFlowData(flow, filePath);
}

/** Parse flow XML string */
export function parseFlowString(xmlContent: string): ParsedFlow {
  const flow = parseXml<Flow>(xmlContent, 'Flow');
  return parseFlowData(flow);
}

function parseFlowData(flow: Flow, filePath?: string): ParsedFlow {
  const variables = ensureArray(flow.variables);
  const decisions = ensureArray(flow.decisions);
  const assignments = ensureArray(flow.assignments);
  const recordCreates = ensureArray(flow.recordCreates);
  const recordUpdates = ensureArray(flow.recordUpdates);
  const recordDeletes = ensureArray(flow.recordDeletes);
  const recordLookups = ensureArray(flow.recordLookups);
  const screens = ensureArray(flow.screens);
  const loops = ensureArray(flow.loops);
  const actionCalls = ensureArray(flow.actionCalls);
  const subflows = ensureArray(flow.subflows);
  const waits = ensureArray(flow.waits);

  // Build connections map
  const connections = buildConnections(flow);
  
  // Build node names list
  const nodeNames = [
    ...decisions.map(d => d.name),
    ...assignments.map(a => a.name),
    ...recordCreates.map(r => r.name),
    ...recordUpdates.map(r => r.name),
    ...recordDeletes.map(r => r.name),
    ...recordLookups.map(r => r.name),
    ...screens.map(s => s.name),
    ...loops.map(l => l.name),
    ...actionCalls.map(a => a.name),
    ...subflows.map(s => s.name),
    ...waits.map(w => w.name),
  ];

  return {
    name: flow.fullName || extractNameFromPath(filePath),
    label: flow.label || '',
    description: flow.description,
    apiVersion: flow.apiVersion,
    processType: flow.processType || 'Flow',
    runInMode: flow.runInMode,
    status: flow.status || 'Draft',
    triggerType: flow.start?.triggerType,
    triggerObject: flow.start?.object,
    recordTriggerType: flow.start?.recordTriggerType,
    variables,
    decisions,
    assignments,
    recordCreates,
    recordUpdates,
    recordDeletes,
    recordLookups,
    screens,
    loops,
    actionCalls,
    subflows,
    waits,
    start: flow.start,
    nodeNames,
    connections,
  };
}

function buildConnections(flow: Flow): Array<{ from: string; to: string; label?: string }> {
  const connections: Array<{ from: string; to: string; label?: string }> = [];

  function addConnection(from: string, connector?: FlowConnector, label?: string) {
    if (connector?.targetReference) {
      connections.push({ from, to: connector.targetReference, label });
    }
  }

  // Start connector
  if (flow.start?.connector) {
    addConnection('START', flow.start.connector);
  }

  // Decisions
  for (const decision of ensureArray(flow.decisions)) {
    const rules = ensureArray(decision.rules);
    for (const rule of rules) {
      addConnection(decision.name, rule.connector, rule.label || rule.name);
    }
    addConnection(decision.name, decision.defaultConnector, decision.defaultConnectorLabel || 'Default');
  }

  // Assignments
  for (const assignment of ensureArray(flow.assignments)) {
    addConnection(assignment.name, assignment.connector);
  }

  // Record operations
  for (const op of ensureArray(flow.recordCreates)) {
    addConnection(op.name, op.connector);
    addConnection(op.name, op.faultConnector, 'Fault');
  }
  for (const op of ensureArray(flow.recordUpdates)) {
    addConnection(op.name, op.connector);
    addConnection(op.name, op.faultConnector, 'Fault');
  }
  for (const op of ensureArray(flow.recordDeletes)) {
    addConnection(op.name, op.connector);
    addConnection(op.name, op.faultConnector, 'Fault');
  }
  for (const op of ensureArray(flow.recordLookups)) {
    addConnection(op.name, op.connector);
    addConnection(op.name, op.faultConnector, 'Fault');
  }

  // Screens
  for (const screen of ensureArray(flow.screens)) {
    addConnection(screen.name, screen.connector);
  }

  // Loops
  for (const loop of ensureArray(flow.loops)) {
    addConnection(loop.name, loop.nextValueConnector, 'Next');
    addConnection(loop.name, loop.noMoreValuesConnector, 'Done');
  }

  // Action calls
  for (const action of ensureArray(flow.actionCalls)) {
    addConnection(action.name, action.connector);
    addConnection(action.name, action.faultConnector, 'Fault');
  }

  // Subflows
  for (const subflow of ensureArray(flow.subflows)) {
    addConnection(subflow.name, subflow.connector);
  }

  // Waits
  for (const wait of ensureArray(flow.waits)) {
    const events = ensureArray(wait.waitEvents);
    for (const event of events) {
      addConnection(wait.name, event.connector, event.name);
    }
    addConnection(wait.name, wait.defaultConnector, 'Default');
  }

  return connections;
}

function extractNameFromPath(filePath?: string): string {
  if (!filePath) return 'Unknown';
  const parts = filePath.replace(/\\/g, '/').split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace('.flow-meta.xml', '');
}
