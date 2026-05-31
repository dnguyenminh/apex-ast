/**
 * @fileoverview Dependency Graph Builder.
 * Builds cross-component relationship graph from indexed data.
 */

class DependencyGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  addNode(type, name, filePath) {
    const id = `${type}:${name}`;
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id, type, name, filePath });
    }
    return id;
  }

  addEdge(fromId, toId, relationship) {
    const exists = this.edges.some(e => e.from === fromId && e.to === toId && e.relationship === relationship);
    if (!exists) {
      this.edges.push({ from: fromId, to: toId, relationship });
    }
  }

  getDependencies(nodeId) {
    return this.edges.filter(e => e.from === nodeId);
  }

  getDependents(nodeId) {
    return this.edges.filter(e => e.to === nodeId);
  }

  getImpact(nodeId, depth = 3) {
    const affected = new Set();
    const queue = [{ id: nodeId, level: 0 }];
    while (queue.length > 0) {
      const { id, level } = queue.shift();
      if (level >= depth) continue;
      const dependents = this.getDependents(id);
      for (const edge of dependents) {
        if (!affected.has(edge.from)) {
          affected.add(edge.from);
          queue.push({ id: edge.from, level: level + 1 });
        }
      }
    }
    return affected;
  }

  getNodesByType(type) {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  search(query) {
    const lower = query.toLowerCase();
    return Array.from(this.nodes.values()).filter(n =>
      n.name.toLowerCase().includes(lower) || n.id.toLowerCase().includes(lower)
    );
  }

  toDot() {
    let dot = 'digraph SalesforceDependencies {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box];\n\n';
    const colors = { apex: '#4A90D9', flow: '#7ED321', object: '#F5A623', lwc: '#BD10E0', aura: '#D0021B' };
    for (const [id, node] of this.nodes) {
      const color = colors[node.type] || '#9B9B9B';
      dot += `  "${id}" [label="${node.name}" style=filled fillcolor="${color}" fontcolor=white];\n`;
    }
    dot += '\n';
    for (const edge of this.edges) {
      dot += `  "${edge.from}" -> "${edge.to}" [label="${edge.relationship}"];\n`;
    }
    dot += '}\n';
    return dot;
  }

  toJSON() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      stats: { nodeCount: this.nodes.size, edgeCount: this.edges.length, nodesByType: this._countByType() }
    };
  }

  _countByType() {
    const counts = {};
    for (const node of this.nodes.values()) {
      counts[node.type] = (counts[node.type] || 0) + 1;
    }
    return counts;
  }
}

function buildDependencyGraph(projectIndex) {
  const graph = new DependencyGraph();

  // Apex nodes
  if (projectIndex.apex) {
    for (const apexData of projectIndex.apex) {
      if (!apexData.data) continue;
      const classes = apexData.data.classes || [];
      for (const cls of classes) {
        const nodeId = graph.addNode('apex', cls.name, apexData.filePath);
        if (cls.superClass) {
          graph.addEdge(nodeId, graph.addNode('apex', cls.superClass, ''), 'extends');
        }
        for (const iface of cls.interfaces || []) {
          graph.addEdge(nodeId, graph.addNode('apex', iface, ''), 'implements');
        }
      }
    }
  }

  // Flow nodes
  if (projectIndex.flows) {
    for (const flowResult of projectIndex.flows) {
      const flow = flowResult.data || flowResult;
      if (!flow.fullName) continue;
      const nodeId = graph.addNode('flow', flow.fullName, flowResult.filePath || '');

      // Handle indexed format (dmlOperations array)
      if (flow.dmlOperations && flow.dmlOperations.length > 0) {
        for (const op of flow.dmlOperations) {
          if (op.object) {
            const rel = op.type === 'create' ? 'creates' : op.type === 'update' ? 'updates' : op.type === 'delete' ? 'deletes' : 'queries';
            graph.addEdge(nodeId, graph.addNode('object', op.object, ''), rel);
          }
        }
      } else {
        // Handle raw parser format
        for (const rc of flow.recordCreates || []) {
          if (rc.object) graph.addEdge(nodeId, graph.addNode('object', rc.object, ''), 'creates');
        }
        for (const ru of flow.recordUpdates || []) {
          if (ru.object) graph.addEdge(nodeId, graph.addNode('object', ru.object, ''), 'updates');
        }
        for (const rd of flow.recordDeletes || []) {
          if (rd.object) graph.addEdge(nodeId, graph.addNode('object', rd.object, ''), 'deletes');
        }
        for (const rl of flow.recordLookups || []) {
          if (rl.object) graph.addEdge(nodeId, graph.addNode('object', rl.object, ''), 'queries');
        }
      }

      // Subflows - handle both formats
      const subflows = flow.referencedSubflows || flow.subflows || [];
      for (const sf of subflows) {
        const sfName = typeof sf === 'string' ? sf : sf.flowName;
        if (sfName) graph.addEdge(nodeId, graph.addNode('flow', sfName, ''), 'calls_subflow');
      }
    }
  }

  // Object nodes
  if (projectIndex.objects) {
    for (const objResult of projectIndex.objects) {
      const obj = objResult.data || objResult;
      if (!obj.fullName) continue;
      const nodeId = graph.addNode('object', obj.fullName, objResult.filePath || '');

      // Relationships from fields
      const fields = obj.fields || obj.relationships || [];
      for (const field of fields) {
        if (field.referenceTo) {
          graph.addEdge(nodeId, graph.addNode('object', field.referenceTo, ''), field.relationshipType || field.type || 'references');
        }
      }
    }
  }

  // LWC nodes
  if (projectIndex.lwc) {
    for (const lwcData of projectIndex.lwc) {
      const lwc = lwcData.data || lwcData;
      if (!lwc.componentName) continue;
      const nodeId = graph.addNode('lwc', lwc.componentName, lwcData.filePath || '');

      for (const apex of lwc.apexImports || []) {
        if (apex.className) graph.addEdge(nodeId, graph.addNode('apex', apex.className, ''), 'calls_apex');
      }
      for (const child of lwc.childComponents || []) {
        graph.addEdge(nodeId, graph.addNode('lwc', child, ''), 'contains');
      }
    }
  }

  return graph;
}

module.exports = { DependencyGraph, buildDependencyGraph };
