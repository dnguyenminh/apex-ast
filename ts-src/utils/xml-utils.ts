/**
 * XML Parser Configuration & Utilities
 * Wraps fast-xml-parser with Salesforce-optimized settings
 */
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { OneOrMany } from '../types/metadata-types';

/** Default parser options optimized for Salesforce metadata XML */
const DEFAULT_PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  isArray: (name: string, jpath: string, isLeafNode: boolean, isAttribute: boolean) => {
    // Force certain elements to always be arrays for consistency
    const alwaysArray = [
      'fields', 'validationRules', 'recordTypes', 'listViews',
      'compactLayouts', 'fieldSets', 'variables', 'decisions',
      'assignments', 'recordCreates', 'recordUpdates', 'recordDeletes',
      'recordLookups', 'screens', 'subflows', 'loops', 'waits',
      'actionCalls', 'formulas', 'constants', 'textTemplates',
      'choices', 'rules', 'conditions', 'filters', 'inputAssignments',
      'outputAssignments', 'assignmentItems', 'waitEvents',
      'inputParameters', 'outputParameters', 'queriedFields',
      'objectPermissions', 'fieldPermissions', 'classAccesses',
      'pageAccesses', 'tabSettings', 'customPermissions',
      'userPermissions', 'recordTypeVisibilities', 'tabVisibilities',
      'loginIpRanges', 'layoutAssignments', 'labels',
      'layoutSections', 'layoutColumns', 'layoutItems', 'relatedLists',
      'columns', 'excludeButtons', 'customButtons',
    ];
    return alwaysArray.includes(name);
  },
};

/** Create a configured XML parser instance */
export function createXmlParser(options?: Partial<typeof DEFAULT_PARSER_OPTIONS>): XMLParser {
  return new XMLParser({ ...DEFAULT_PARSER_OPTIONS, ...options });
}

/** Parse XML string to JavaScript object */
export function parseXml<T>(xmlContent: string, rootElement?: string): T {
  const parser = createXmlParser();
  const parsed = parser.parse(xmlContent);
  
  if (rootElement && parsed[rootElement]) {
    return parsed[rootElement] as T;
  }
  
  // Auto-detect root element (skip XML declaration)
  const keys = Object.keys(parsed).filter(k => k !== '?xml');
  if (keys.length === 1) {
    return parsed[keys[0]] as T;
  }
  
  return parsed as T;
}

/** Ensure a value is always an array */
export function ensureArray<T>(value: OneOrMany<T> | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** Read and parse an XML file */
export async function parseXmlFile<T>(filePath: string, rootElement?: string): Promise<T> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');
  return parseXml<T>(content, rootElement);
}

export { XMLParser, XMLBuilder };
