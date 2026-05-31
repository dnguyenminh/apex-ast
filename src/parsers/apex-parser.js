/**
 * @fileoverview Apex parser wrapper using Tree-Sitter.
 * Provides structured AST extraction from .cls and .trigger files.
 */

const fs = require('fs');
const path = require('path');

let Parser, ApexLanguage;

/**
 * Initialize the Tree-Sitter parser with Apex language.
 * Tries native binding first, falls back to WASM.
 */
async function initParser() {
  if (Parser && ApexLanguage) return;

  try {
    // Try native binding first
    const TreeSitter = require('tree-sitter');
    const bindingPath = path.resolve(__dirname, '../../build/Release/tree_sitter_apex_binding.node');
    ApexLanguage = require(bindingPath);
    Parser = new TreeSitter();
    Parser.setLanguage(ApexLanguage);
  } catch (e) {
    // Fallback to WASM
    try {
      const TreeSitterWasm = require('web-tree-sitter');
      await TreeSitterWasm.init();
      Parser = new TreeSitterWasm();
      const wasmPath = path.resolve(__dirname, '../../tree-sitter-apex.wasm');
      ApexLanguage = await TreeSitterWasm.Language.load(wasmPath);
      Parser.setLanguage(ApexLanguage);
    } catch (e2) {
      throw new Error(`Failed to initialize Apex parser: ${e.message} | WASM fallback: ${e2.message}`);
    }
  }
}

/**
 * Parse an Apex source file and extract structured data.
 * @param {string} filePath - Path to .cls or .trigger file
 * @returns {Promise<Object>} Parsed Apex data
 */
async function parseApexFile(filePath) {
  const startTime = Date.now();
  try {
    await initParser();
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const tree = Parser.parse(sourceCode);
    const rootNode = tree.rootNode;

    const data = {
      filePath,
      fileName: path.basename(filePath),
      type: filePath.endsWith('.trigger') ? 'trigger' : 'class',
      classes: extractClasses(rootNode, sourceCode),
      errors: extractErrors(rootNode, sourceCode)
    };

    return { success: true, data, filePath, metadataType: 'Apex', parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'Apex', parseTimeMs: Date.now() - startTime };
  }
}

/**
 * Extract class definitions from AST.
 */
function extractClasses(node, source) {
  const classes = [];
  walkTree(node, (child) => {
    if (child.type === 'class_declaration') {
      classes.push(extractClassInfo(child, source));
    }
  });
  return classes;
}

/**
 * Extract class information.
 */
function extractClassInfo(node, source) {
  const info = {
    name: null,
    modifiers: [],
    superClass: null,
    interfaces: [],
    annotations: [],
    methods: [],
    fields: [],
    innerClasses: [],
    sharing: null
  };

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    switch (child.type) {
      case 'identifier':
        if (!info.name) info.name = child.text;
        break;
      case 'modifiers':
        info.modifiers = extractModifiers(child);
        info.annotations = extractAnnotations(child, source);
        info.sharing = extractSharing(child);
        break;
      case 'superclass':
        info.superClass = child.child(1)?.text || null;
        break;
      case 'interfaces':
        info.interfaces = extractInterfaces(child);
        break;
      case 'class_body':
        info.methods = extractMethods(child, source);
        info.fields = extractFields(child, source);
        info.innerClasses = extractInnerClasses(child, source);
        break;
    }
  }

  return info;
}

function extractModifiers(node) {
  const mods = [];
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type !== 'annotation' && child.type !== 'marker_annotation') {
      mods.push(child.text);
    }
  }
  return mods;
}

function extractAnnotations(node, source) {
  const annotations = [];
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type === 'annotation' || child.type === 'marker_annotation') {
      annotations.push(child.text);
    }
  }
  return annotations;
}

function extractSharing(node) {
  const text = node.text;
  if (text.includes('with sharing')) return 'with sharing';
  if (text.includes('without sharing')) return 'without sharing';
  if (text.includes('inherited sharing')) return 'inherited sharing';
  return null;
}

function extractInterfaces(node) {
  const interfaces = [];
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type === 'type_identifier' || child.type === 'identifier') {
      interfaces.push(child.text);
    }
  }
  return interfaces;
}

function extractMethods(classBody, source) {
  const methods = [];
  for (let i = 0; i < classBody.childCount; i++) {
    const child = classBody.child(i);
    if (child.type === 'method_declaration') {
      methods.push(extractMethodInfo(child, source));
    }
  }
  return methods;
}

function extractMethodInfo(node, source) {
  const info = {
    name: null,
    returnType: null,
    parameters: [],
    modifiers: [],
    annotations: [],
    startLine: node.startPosition.row + 1,
    endLine: node.endPosition.row + 1
  };

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    switch (child.type) {
      case 'identifier':
        if (!info.name) info.name = child.text;
        break;
      case 'modifiers':
        info.modifiers = extractModifiers(child);
        info.annotations = extractAnnotations(child, source);
        break;
      case 'type_identifier':
      case 'void_type':
      case 'generic_type':
        if (!info.returnType) info.returnType = child.text;
        break;
      case 'formal_parameters':
        info.parameters = extractParameters(child);
        break;
    }
  }

  return info;
}

function extractParameters(node) {
  const params = [];
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type === 'formal_parameter') {
      const param = { type: null, name: null };
      for (let j = 0; j < child.childCount; j++) {
        const pChild = child.child(j);
        if (pChild.type === 'type_identifier' || pChild.type === 'generic_type') {
          param.type = pChild.text;
        } else if (pChild.type === 'identifier') {
          param.name = pChild.text;
        }
      }
      params.push(param);
    }
  }
  return params;
}

function extractFields(classBody, source) {
  const fields = [];
  for (let i = 0; i < classBody.childCount; i++) {
    const child = classBody.child(i);
    if (child.type === 'field_declaration') {
      fields.push({
        name: findIdentifier(child),
        type: findType(child),
        modifiers: child.child(0)?.type === 'modifiers' ? extractModifiers(child.child(0)) : [],
        line: child.startPosition.row + 1
      });
    }
  }
  return fields;
}

function extractInnerClasses(classBody, source) {
  const classes = [];
  for (let i = 0; i < classBody.childCount; i++) {
    const child = classBody.child(i);
    if (child.type === 'class_declaration') {
      classes.push(extractClassInfo(child, source));
    }
  }
  return classes;
}

function findIdentifier(node) {
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type === 'variable_declarator') {
      for (let j = 0; j < child.childCount; j++) {
        if (child.child(j).type === 'identifier') return child.child(j).text;
      }
    }
  }
  return null;
}

function findType(node) {
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type === 'type_identifier' || child.type === 'generic_type') {
      return child.text;
    }
  }
  return null;
}

function extractErrors(node, source) {
  const errors = [];
  walkTree(node, (child) => {
    if (child.type === 'ERROR' || child.isMissing) {
      errors.push({
        line: child.startPosition.row + 1,
        column: child.startPosition.column,
        text: source.substring(child.startIndex, Math.min(child.endIndex, child.startIndex + 50))
      });
    }
  });
  return errors;
}

function walkTree(node, callback) {
  callback(node);
  for (let i = 0; i < node.childCount; i++) {
    walkTree(node.child(i), callback);
  }
}

module.exports = { parseApexFile, initParser };
