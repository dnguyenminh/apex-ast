/**
 * @fileoverview salesforce-ast — Salesforce AST Parser & Indexer
 * 
 * Main entry point for the npm package.
 * Provides parsers for Apex (Tree-Sitter), XML metadata, and LWC components,
 * plus a full project indexer with dependency graph.
 * 
 * @example
 * const { parseProject } = require('salesforce-ast');
 * const index = await parseProject('/path/to/sfdx-project');
 * 
 * @example
 * const { parseFlowFile } = require('salesforce-ast');
 * const result = parseFlowFile('/path/to/MyFlow.flow-meta.xml');
 */

// Main indexer API
const { parseProject, toKBPayload } = require('./src/indexer');
const { scanProject, getManifestSummary } = require('./src/indexer/scanner');
const { DependencyGraph, buildDependencyGraph } = require('./src/indexer/dependency-graph');

// Individual parsers — XML
const { parseFlowFile, parseFlowString } = require('./src/parsers/xml/flow-parser');
const { parseObjectFile, parseObjectString } = require('./src/parsers/xml/object-parser');
const { parseFieldFile, parseFieldString } = require('./src/parsers/xml/field-parser');
const { parseValidationRuleFile, parseValidationRuleString, extractValidationRulesFromObject } = require('./src/parsers/xml/validation-rule-parser');
const { parsePermissionSetFile, parseProfileFile, parsePermissionString } = require('./src/parsers/xml/permission-parser');
const { parseLabelFile, parseLabelString } = require('./src/parsers/xml/label-parser');
const { parseLayoutFile, parseLayoutString } = require('./src/parsers/xml/layout-parser');

// Individual parsers — LWC
const { parseLWCJsFile, parseLWCJsContent } = require('./src/parsers/lwc/lwc-js-parser');
const { parseLWCHtmlFile, parseLWCHtmlContent } = require('./src/parsers/lwc/lwc-html-parser');
const { parseLWCCssFile, parseLWCCssContent } = require('./src/parsers/lwc/lwc-css-parser');

// Apex parser
const { parseApexFile, initParser } = require('./src/parsers/apex-parser');

module.exports = {
  // Main API
  parseProject,
  toKBPayload,
  scanProject,
  getManifestSummary,
  DependencyGraph,
  buildDependencyGraph,

  // XML Parsers
  parseFlowFile,
  parseFlowString,
  parseObjectFile,
  parseObjectString,
  parseFieldFile,
  parseFieldString,
  parseValidationRuleFile,
  parseValidationRuleString,
  extractValidationRulesFromObject,
  parsePermissionSetFile,
  parseProfileFile,
  parsePermissionString,
  parseLabelFile,
  parseLabelString,
  parseLayoutFile,
  parseLayoutString,

  // LWC Parsers
  parseLWCJsFile,
  parseLWCJsContent,
  parseLWCHtmlFile,
  parseLWCHtmlContent,
  parseLWCCssFile,
  parseLWCCssContent,

  // Apex Parser
  parseApexFile,
  initParser
};
