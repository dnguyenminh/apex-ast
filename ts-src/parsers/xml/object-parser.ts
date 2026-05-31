/**
 * Custom Object Parser — Parse .object-meta.xml files
 */
import { parseXmlFile, parseXml, ensureArray } from '../utils/xml-utils';
import { CustomObject, CustomField, ValidationRule } from '../types/metadata-types';

export interface ParsedCustomObject {
  name: string;
  label: string;
  pluralLabel?: string;
  description?: string;
  sharingModel?: string;
  deploymentStatus?: string;
  nameField?: { label: string; type: string; displayFormat?: string };
  fields: ParsedField[];
  validationRules: ParsedValidationRule[];
  recordTypes: Array<{ fullName: string; label: string; active: boolean }>;
  listViews: Array<{ fullName: string; label: string; filterScope: string; columns: string[] }>;
  relationships: ParsedRelationship[];
  enableActivities: boolean;
  enableHistory: boolean;
  enableReports: boolean;
  enableSearch: boolean;
}

export interface ParsedField {
  fullName: string;
  label?: string;
  type?: string;
  required: boolean;
  unique: boolean;
  externalId: boolean;
  formula?: string;
  referenceTo?: string;
  relationshipName?: string;
  length?: number;
  precision?: number;
  scale?: number;
  picklistValues?: Array<{ fullName: string; label?: string; default?: boolean; isActive?: boolean }>;
  description?: string;
  helpText?: string;
  defaultValue?: string;
}

export interface ParsedRelationship {
  fieldName: string;
  type: 'Lookup' | 'MasterDetail' | 'ExternalLookup';
  referenceTo: string;
  relationshipName?: string;
  relationshipLabel?: string;
  deleteConstraint?: string;
}

export interface ParsedValidationRule {
  fullName: string;
  active: boolean;
  errorConditionFormula: string;
  errorMessage: string;
  errorDisplayField?: string;
  description?: string;
}

export async function parseObjectFile(filePath: string): Promise<ParsedCustomObject> {
  const obj = await parseXmlFile<CustomObject>(filePath, 'CustomObject');
  return parseObjectData(obj, filePath);
}

export function parseObjectString(xmlContent: string): ParsedCustomObject {
  const obj = parseXml<CustomObject>(xmlContent, 'CustomObject');
  return parseObjectData(obj);
}

function parseObjectData(obj: CustomObject, filePath?: string): ParsedCustomObject {
  const fields = ensureArray(obj.fields).map(mapField);
  const validationRules = ensureArray(obj.validationRules).map(mapValidationRule);
  const recordTypes = ensureArray(obj.recordTypes).map(rt => ({
    fullName: rt.fullName, label: rt.label, active: rt.active
  }));
  const listViews = ensureArray(obj.listViews).map(lv => ({
    fullName: lv.fullName, label: lv.label, filterScope: lv.filterScope,
    columns: ensureArray(lv.columns)
  }));

  // Extract relationships from fields
  const relationships: ParsedRelationship[] = fields
    .filter(f => f.type === 'Lookup' || f.type === 'MasterDetail')
    .map(f => ({
      fieldName: f.fullName,
      type: f.type as 'Lookup' | 'MasterDetail',
      referenceTo: f.referenceTo || '',
      relationshipName: f.relationshipName,
    }));

  return {
    name: obj.fullName || extractNameFromPath(filePath),
    label: obj.label || '',
    pluralLabel: obj.pluralLabel,
    description: obj.description,
    sharingModel: obj.sharingModel,
    deploymentStatus: obj.deploymentStatus,
    nameField: obj.nameField,
    fields,
    validationRules,
    recordTypes,
    listViews,
    relationships,
    enableActivities: obj.enableActivities || false,
    enableHistory: obj.enableHistory || false,
    enableReports: obj.enableReports || false,
    enableSearch: obj.enableSearch || false,
  };
}

function mapField(field: CustomField): ParsedField {
  const picklistValues = field.valueSet?.valueSetDefinition?.value
    ? ensureArray(field.valueSet.valueSetDefinition.value)
    : undefined;

  return {
    fullName: field.fullName || '',
    label: field.label,
    type: field.type,
    required: field.required || false,
    unique: field.unique || false,
    externalId: field.externalId || false,
    formula: field.formula,
    referenceTo: field.referenceTo,
    relationshipName: field.relationshipName,
    length: field.length,
    precision: field.precision,
    scale: field.scale,
    picklistValues,
    description: field.description,
    helpText: field.helpText,
    defaultValue: field.defaultValue,
  };
}

function mapValidationRule(rule: ValidationRule): ParsedValidationRule {
  return {
    fullName: rule.fullName || '',
    active: rule.active,
    errorConditionFormula: rule.errorConditionFormula,
    errorMessage: rule.errorMessage,
    errorDisplayField: rule.errorDisplayField,
    description: rule.description,
  };
}

function extractNameFromPath(filePath?: string): string {
  if (!filePath) return 'Unknown';
  const parts = filePath.replace(/\\/g, '/').split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace('.object-meta.xml', '');
}
