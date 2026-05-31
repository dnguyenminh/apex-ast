/**
 * @fileoverview Integration test - full pipeline scan -> parse -> output.
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { scanProject, getManifestSummary } = require('../../src/indexer/scanner');
const { indexFlowFile } = require('../../src/indexer/flow-indexer');
const { indexObjectFile } = require('../../src/indexer/object-indexer');
const { indexLWCComponent } = require('../../src/indexer/lwc-indexer');
const { buildDependencyGraph } = require('../../src/indexer/dependency-graph');

const FIXTURES_ROOT = path.resolve(import.meta.dirname, '../fixtures');

describe('SFDX Project Scanner', () => {
  it('should scan project and find all metadata types', () => {
    const manifest = scanProject(FIXTURES_ROOT);
    expect(manifest.flows.length).toBeGreaterThan(0);
    expect(manifest.objects.length).toBeGreaterThan(0);
    expect(manifest.permissionSets.length).toBeGreaterThan(0);
    expect(manifest.labels.length).toBeGreaterThan(0);
    expect(manifest.lwc.length).toBeGreaterThan(0);
  });

  it('should return correct summary', () => {
    const manifest = scanProject(FIXTURES_ROOT);
    const summary = getManifestSummary(manifest);
    expect(summary.total).toBeGreaterThan(0);
    expect(summary.flows).toBe(1);
    expect(summary.objects).toBe(1);
    expect(summary.lwc).toBe(1);
  });
});

describe('Flow Indexer', () => {
  it('should index a flow file for KB', () => {
    const manifest = scanProject(FIXTURES_ROOT);
    const result = indexFlowFile(manifest.flows[0]);
    expect(result.success).toBe(true);
    expect(result.data.fullName).toBeTruthy();
    expect(result.data.referencedObjects).toContain('Account');
    expect(result.data.dmlOperations.length).toBeGreaterThan(0);
  });
});

describe('Object Indexer', () => {
  it('should index an object file for KB', () => {
    const manifest = scanProject(FIXTURES_ROOT);
    const result = indexObjectFile(manifest.objects[0]);
    expect(result.success).toBe(true);
    expect(result.data.fieldCount).toBe(3);
    expect(result.data.validationRuleCount).toBe(1);
    expect(result.data.relationships.length).toBeGreaterThan(0);
  });
});

describe('LWC Indexer', () => {
  it('should index a LWC component', () => {
    const manifest = scanProject(FIXTURES_ROOT);
    const result = indexLWCComponent(manifest.lwc[0]);
    expect(result.success).toBe(true);
    expect(result.data.componentName).toBe('accountList');
    expect(result.data.apiProperties).toContain('recordId');
    expect(result.data.apexImports.length).toBeGreaterThan(0);
  });
});

describe('Dependency Graph', () => {
  it('should build graph from indexed data', () => {
    const manifest = scanProject(FIXTURES_ROOT);
    const flows = [indexFlowFile(manifest.flows[0])];
    const objects = [indexObjectFile(manifest.objects[0])];
    const lwc = [indexLWCComponent(manifest.lwc[0])];

    const graph = buildDependencyGraph({
      apex: [],
      flows: flows.filter(r => r.success),
      objects: objects.filter(r => r.success),
      lwc: lwc.filter(r => r.success)
    });

    const json = graph.toJSON();
    expect(json.nodes.length).toBeGreaterThan(0);
    expect(json.edges.length).toBeGreaterThan(0);
  });

  it('should track flow -> object relationships', () => {
    const manifest = scanProject(FIXTURES_ROOT);
    const flows = [indexFlowFile(manifest.flows[0])];

    const graph = buildDependencyGraph({
      apex: [],
      flows: flows.filter(r => r.success),
      objects: [],
      lwc: []
    });

    const json = graph.toJSON();
    const createEdges = json.edges.filter(e => e.relationship === 'creates');
    expect(createEdges.length).toBeGreaterThan(0);
  });

  it('should export DOT format', () => {
    const manifest = scanProject(FIXTURES_ROOT);
    const flows = [indexFlowFile(manifest.flows[0])];

    const graph = buildDependencyGraph({
      apex: [],
      flows: flows.filter(r => r.success),
      objects: [],
      lwc: []
    });

    const dot = graph.toDot();
    expect(dot).toContain('digraph');
    expect(dot).toContain('->');
  });
});
