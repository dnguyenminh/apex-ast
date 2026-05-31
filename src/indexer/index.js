/**
 * @fileoverview Main Indexer Entry Point.
 * Orchestrates the full SFDX project indexing pipeline.
 * 
 * Usage:
 *   const { parseProject } = require('./src/indexer');
 *   const index = await parseProject('/path/to/sfdx-project');
 */

const { scanProject, getManifestSummary } = require('./scanner');
const { indexApexFile } = require('./apex-indexer');
const { indexFlowFile } = require('./flow-indexer');
const { indexObjectFile, indexFieldFile } = require('./object-indexer');
const { indexLWCComponent } = require('./lwc-indexer');
const { parsePermissionSetFile, parseProfileFile } = require('../parsers/xml/permission-parser');
const { parseLabelFile } = require('../parsers/xml/label-parser');
const { parseLayoutFile } = require('../parsers/xml/layout-parser');
const { buildDependencyGraph } = require('./dependency-graph');

/**
 * @typedef {Object} ParseOptions
 * @property {string[]} [include] - Only include these metadata types
 * @property {string[]} [exclude] - Exclude these metadata types
 * @property {boolean} [includeGraph=true] - Build dependency graph
 * @property {'json'|'kb-payload'} [outputFormat='json'] - Output format
 */

/**
 * Parse an entire SFDX project and return structured index data.
 * @param {string} projectPath - Path to SFDX project root
 * @param {ParseOptions} [options={}] - Parse options
 * @returns {Promise<import('../types/metadata-types').ProjectIndex>} Complete project index
 */
async function parseProject(projectPath, options = {}) {
  const startTime = Date.now();
  const { include, exclude, includeGraph = true, outputFormat = 'json' } = options;

  // Step 1: Scan project
  const manifest = scanProject(projectPath);
  const summary = getManifestSummary(manifest);

  // Step 2: Parse each type
  const results = {
    apex: [],
    flows: [],
    objects: [],
    fields: [],
    lwc: [],
    aura: [],
    permissions: [],
    labels: null,
    layouts: []
  };

  const shouldProcess = (type) => {
    if (include && !include.includes(type)) return false;
    if (exclude && exclude.includes(type)) return false;
    return true;
  };

  // Apex (async)
  if (shouldProcess('apex')) {
    for (const filePath of manifest.apex) {
      const result = await indexApexFile(filePath);
      results.apex.push(result);
    }
  }

  // Flows
  if (shouldProcess('flows')) {
    for (const filePath of manifest.flows) {
      results.flows.push(indexFlowFile(filePath));
    }
  }

  // Objects
  if (shouldProcess('objects')) {
    for (const filePath of manifest.objects) {
      results.objects.push(indexObjectFile(filePath));
    }
  }

  // Fields
  if (shouldProcess('fields')) {
    for (const filePath of manifest.fields) {
      results.fields.push(indexFieldFile(filePath));
    }
  }

  // Permission Sets
  if (shouldProcess('permissionSets')) {
    for (const filePath of manifest.permissionSets) {
      results.permissions.push(parsePermissionSetFile(filePath));
    }
  }

  // Profiles
  if (shouldProcess('profiles')) {
    for (const filePath of manifest.profiles) {
      results.permissions.push(parseProfileFile(filePath));
    }
  }

  // Labels
  if (shouldProcess('labels') && manifest.labels.length > 0) {
    results.labels = parseLabelFile(manifest.labels[0]);
  }

  // Layouts
  if (shouldProcess('layouts')) {
    for (const filePath of manifest.layouts) {
      results.layouts.push(parseLayoutFile(filePath));
    }
  }

  // LWC
  if (shouldProcess('lwc')) {
    for (const compDir of manifest.lwc) {
      results.lwc.push(indexLWCComponent(compDir));
    }
  }

  // Step 3: Build dependency graph
  let graph = null;
  if (includeGraph) {
    graph = buildDependencyGraph({
      apex: results.apex.filter(r => r.success),
      flows: results.flows.filter(r => r.success),
      objects: results.objects.filter(r => r.success),
      lwc: results.lwc.filter(r => r.success)
    });
  }

  // Step 4: Assemble output
  const projectIndex = {
    metadata: {
      projectPath,
      indexedAt: new Date().toISOString(),
      totalFiles: summary.total,
      parseTimeMs: Date.now() - startTime,
      summary
    },
    apex: results.apex,
    flows: results.flows,
    objects: results.objects,
    fields: results.fields,
    lwc: results.lwc,
    aura: results.aura,
    permissions: results.permissions,
    labels: results.labels,
    layouts: results.layouts,
    graph: graph ? graph.toJSON() : null
  };

  if (outputFormat === 'kb-payload') {
    return toKBPayload(projectIndex);
  }

  return projectIndex;
}

/**
 * Convert project index to KB ingestion payload format.
 * @param {Object} projectIndex - Project index data
 * @returns {Object[]} Array of KB payloads
 */
function toKBPayload(projectIndex) {
  const payloads = [];

  // Apex payloads
  for (const item of projectIndex.apex.filter(r => r.success)) {
    payloads.push({
      id: `apex:${item.data.fileName}`,
      type: 'apex',
      title: item.data.fileName,
      content: JSON.stringify(item.data),
      searchText: item.data.searchText,
      tags: ['apex', item.data.type]
    });
  }

  // Flow payloads
  for (const item of projectIndex.flows.filter(r => r.success)) {
    payloads.push({
      id: `flow:${item.data.fullName}`,
      type: 'flow',
      title: item.data.fullName,
      content: JSON.stringify(item.data),
      searchText: item.data.searchText,
      tags: ['flow', item.data.processType]
    });
  }

  // Object payloads
  for (const item of projectIndex.objects.filter(r => r.success)) {
    payloads.push({
      id: `object:${item.data.fullName}`,
      type: 'object',
      title: item.data.fullName,
      content: JSON.stringify(item.data),
      searchText: item.data.searchText,
      tags: ['object', 'data-model']
    });
  }

  // LWC payloads
  for (const item of projectIndex.lwc.filter(r => r.success)) {
    payloads.push({
      id: `lwc:${item.data.componentName}`,
      type: 'lwc',
      title: item.data.componentName,
      content: JSON.stringify(item.data),
      searchText: item.data.searchText,
      tags: ['lwc', 'component']
    });
  }

  return payloads;
}

module.exports = { parseProject, toKBPayload };
