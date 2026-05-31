/**
 * Salesforce Metadata TypeScript Interfaces
 * Based on Salesforce Metadata API schema (API v60.0)
 */

// Common Types
export interface Metadata { fullName?: string; }
export type OneOrMany<T> = T | T[];

// Flow Types
export type FlowProcessType =
  | 'AutoLaunchedFlow' | 'Flow' | 'Workflow' | 'CustomEvent'
  | 'InvocableProcess' | 'LoginFlow' | 'ActionPlan'
  | 'UserProvisioningFlow' | 'Survey' | 'Appointments'
  | 'OrchestrationFlow' | 'TransactionSecurityFlow'
  | 'ContactRequestFlow' | 'CheckoutFlow' | 'PromptFlow';

export type FlowRunInMode = 'DefaultMode' | 'SystemModeWithSharing' | 'SystemModeWithoutSharing';

export interface FlowConnector { targetReference: string; isGoTo?: boolean; }
export interface FlowValue { stringValue?: string; numberValue?: number; booleanValue?: boolean; dateValue?: string; dateTimeValue?: string; elementReference?: string; }
export interface FlowCondition { leftValueReference: string; operator: string; rightValue?: FlowValue; }
export interface FlowRecordFilter { field: string; operator: string; value?: FlowValue; }
export interface FlowVariable { name: string; dataType: string; isCollection?: boolean; isInput?: boolean; isOutput?: boolean; objectType?: string; value?: FlowValue; description?: string; }

export interface FlowDecision {
  name: string; label?: string; description?: string;
  rules?: OneOrMany<{ name: string; label?: string; conditionLogic?: string; conditions?: OneOrMany<FlowCondition>; connector?: FlowConnector; }>;
  defaultConnector?: FlowConnector; defaultConnectorLabel?: string;
}

export interface FlowAssignment {
  name: string; label?: string;
  assignmentItems?: OneOrMany<{ assignToReference: string; operator: string; value?: FlowValue; }>;
  connector?: FlowConnector;
}

export interface FlowRecordCreate { name: string; label?: string; object?: string; inputAssignments?: OneOrMany<{ field: string; value?: FlowValue }>; inputReference?: string; assignRecordIdToReference?: string; connector?: FlowConnector; faultConnector?: FlowConnector; }
export interface FlowRecordUpdate { name: string; label?: string; object?: string; filters?: OneOrMany<FlowRecordFilter>; inputAssignments?: OneOrMany<{ field: string; value?: FlowValue }>; inputReference?: string; connector?: FlowConnector; faultConnector?: FlowConnector; }
export interface FlowRecordDelete { name: string; label?: string; object?: string; filters?: OneOrMany<FlowRecordFilter>; inputReference?: string; connector?: FlowConnector; faultConnector?: FlowConnector; }
export interface FlowRecordLookup { name: string; label?: string; object?: string; filters?: OneOrMany<FlowRecordFilter>; outputAssignments?: OneOrMany<{ assignToReference: string; field: string }>; outputReference?: string; queriedFields?: OneOrMany<string>; getFirstRecordOnly?: boolean; storeOutputAutomatically?: boolean; connector?: FlowConnector; faultConnector?: FlowConnector; }
export interface FlowScreen { name: string; label?: string; fields?: OneOrMany<{ name: string; fieldType: string; dataType?: string; isRequired?: boolean; defaultValue?: FlowValue; }>; allowBack?: boolean; allowFinish?: boolean; allowPause?: boolean; connector?: FlowConnector; }
export interface FlowLoop { name: string; label?: string; collectionReference: string; iterationOrder?: string; nextValueConnector?: FlowConnector; noMoreValuesConnector?: FlowConnector; }
export interface FlowActionCall { name: string; label?: string; actionName: string; actionType: string; inputParameters?: OneOrMany<{ name: string; value?: FlowValue }>; outputParameters?: OneOrMany<{ assignToReference: string; name: string }>; connector?: FlowConnector; faultConnector?: FlowConnector; }
export interface FlowSubflow { name: string; label?: string; flowName: string; inputAssignments?: OneOrMany<{ name: string; value?: FlowValue }>; outputAssignments?: OneOrMany<{ assignToReference: string; name: string }>; connector?: FlowConnector; }
export interface FlowWait { name: string; label?: string; waitEvents?: OneOrMany<{ name: string; eventType?: string; conditions?: OneOrMany<FlowCondition>; connector?: FlowConnector; }>; defaultConnector?: FlowConnector; }
export interface FlowStart { connector?: FlowConnector; object?: string; recordTriggerType?: 'Create' | 'Update' | 'CreateAndUpdate' | 'Delete'; triggerType?: 'RecordBeforeSave' | 'RecordAfterSave' | 'RecordBeforeDelete' | 'Scheduled' | 'PlatformEvent'; schedule?: { frequency: string; startDate?: string; startTime?: string }; filters?: OneOrMany<FlowRecordFilter>; filterLogic?: string; }

export interface Flow extends Metadata {
  apiVersion?: string; description?: string; label?: string;
  processType?: FlowProcessType; runInMode?: FlowRunInMode;
  status?: 'Active' | 'Draft' | 'Obsolete' | 'InvalidDraft';
  start?: FlowStart; variables?: OneOrMany<FlowVariable>;
  decisions?: OneOrMany<FlowDecision>; assignments?: OneOrMany<FlowAssignment>;
  recordCreates?: OneOrMany<FlowRecordCreate>; recordUpdates?: OneOrMany<FlowRecordUpdate>;
  recordDeletes?: OneOrMany<FlowRecordDelete>; recordLookups?: OneOrMany<FlowRecordLookup>;
  screens?: OneOrMany<FlowScreen>; subflows?: OneOrMany<FlowSubflow>;
  loops?: OneOrMany<FlowLoop>; waits?: OneOrMany<FlowWait>;
  actionCalls?: OneOrMany<FlowActionCall>;
  formulas?: OneOrMany<{ name: string; dataType: string; expression: string }>;
  constants?: OneOrMany<{ name: string; dataType: string; value?: FlowValue }>;
  textTemplates?: OneOrMany<{ name: string; text: string }>;
  choices?: OneOrMany<{ name: string; choiceText: string; dataType: string; value?: FlowValue }>;
}

// Custom Object Types
export type SharingModel = 'Private' | 'Read' | 'ReadWrite' | 'ReadWriteTransfer' | 'FullAccess' | 'ControlledByParent';
export type DeploymentStatus = 'InDevelopment' | 'Deployed';

export interface CustomObject extends Metadata {
  label?: string; pluralLabel?: string; description?: string;
  nameField?: { label: string; type: 'Text' | 'AutoNumber'; displayFormat?: string };
  sharingModel?: SharingModel; deploymentStatus?: DeploymentStatus;
  enableActivities?: boolean; enableHistory?: boolean; enableReports?: boolean; enableSearch?: boolean;
  fields?: OneOrMany<CustomField>; validationRules?: OneOrMany<ValidationRule>;
  recordTypes?: OneOrMany<{ fullName: string; label: string; active: boolean; description?: string; businessProcess?: string }>;
  listViews?: OneOrMany<{ fullName: string; label: string; filterScope: string; columns?: OneOrMany<string> }>;
  compactLayouts?: OneOrMany<{ fullName: string; label: string; fields?: OneOrMany<string> }>;
  fieldSets?: OneOrMany<{ fullName: string; label: string; displayedFields?: OneOrMany<{ field: string }> }>;
}

// Custom Field Types
export type FieldType = 'AutoNumber' | 'Checkbox' | 'Currency' | 'Date' | 'DateTime' | 'Email' | 'EncryptedText' | 'Html' | 'Location' | 'LongTextArea' | 'Lookup' | 'MasterDetail' | 'MultiselectPicklist' | 'Number' | 'Percent' | 'Phone' | 'Picklist' | 'Summary' | 'Text' | 'TextArea' | 'Time' | 'Url';

export interface CustomField extends Metadata {
  label?: string; description?: string; helpText?: string; type?: FieldType;
  required?: boolean; unique?: boolean; externalId?: boolean;
  defaultValue?: string; formula?: string; formulaTreatBlanksAs?: 'BlankAsBlank' | 'BlankAsZero';
  length?: number; precision?: number; scale?: number; visibleLines?: number;
  referenceTo?: string; relationshipLabel?: string; relationshipName?: string;
  relationshipOrder?: number; reparentableMasterDetail?: boolean;
  deleteConstraint?: 'SetNull' | 'Restrict' | 'Cascade';
  valueSet?: { restricted?: boolean; controllingField?: string; valueSetDefinition?: { sorted?: boolean; value?: OneOrMany<{ fullName: string; label?: string; default?: boolean; isActive?: boolean }> }; valueSetName?: string };
  summaryForeignKey?: string; summaryOperation?: 'count' | 'sum' | 'min' | 'max';
  summarizedField?: string; trackHistory?: boolean; caseSensitive?: boolean;
}

// Validation Rule
export interface ValidationRule extends Metadata { active: boolean; errorConditionFormula: string; errorMessage: string; errorDisplayField?: string; description?: string; }

// Permission Set / Profile
export interface ObjectPermission { object: string; allowCreate: boolean; allowDelete: boolean; allowEdit: boolean; allowRead: boolean; modifyAllRecords: boolean; viewAllRecords: boolean; }
export interface FieldPermission { field: string; editable: boolean; readable: boolean; }

export interface PermissionSet extends Metadata {
  label?: string; description?: string; license?: string;
  objectPermissions?: OneOrMany<ObjectPermission>; fieldPermissions?: OneOrMany<FieldPermission>;
  classAccesses?: OneOrMany<{ apexClass: string; enabled: boolean }>;
  pageAccesses?: OneOrMany<{ apexPage: string; enabled: boolean }>;
  tabSettings?: OneOrMany<{ tab: string; visibility: string }>;
  customPermissions?: OneOrMany<{ name: string; enabled: boolean }>;
  userPermissions?: OneOrMany<{ name: string; enabled: boolean }>;
  recordTypeVisibilities?: OneOrMany<{ recordType: string; visible: boolean; default?: boolean }>;
}

export interface Profile extends Metadata {
  custom?: boolean; userLicense?: string;
  objectPermissions?: OneOrMany<ObjectPermission>; fieldPermissions?: OneOrMany<FieldPermission>;
  classAccesses?: OneOrMany<{ apexClass: string; enabled: boolean }>;
  pageAccesses?: OneOrMany<{ apexPage: string; enabled: boolean }>;
  tabVisibilities?: OneOrMany<{ tab: string; visibility: string }>;
  loginIpRanges?: OneOrMany<{ startAddress: string; endAddress: string }>;
  layoutAssignments?: OneOrMany<{ layout: string; recordType?: string }>;
  userPermissions?: OneOrMany<{ name: string; enabled: boolean }>;
}

// Custom Labels
export interface CustomLabel extends Metadata { value: string; language?: string; protected?: boolean; shortDescription?: string; categories?: string; }
export interface CustomLabels extends Metadata { labels?: OneOrMany<CustomLabel>; }

// Page Layout
export interface LayoutItem { field?: string; behavior?: 'Edit' | 'Readonly' | 'Required'; customLink?: string; emptySpace?: boolean; }
export interface LayoutSection { label?: string; style?: 'TwoColumnsTopToBottom' | 'TwoColumnsLeftToRight' | 'OneColumn' | 'CustomLinks'; detailHeading?: boolean; editHeading?: boolean; layoutColumns?: OneOrMany<{ layoutItems?: OneOrMany<LayoutItem> }>; }
export interface RelatedList { relatedList: string; fields?: OneOrMany<string>; sortField?: string; sortOrder?: 'Asc' | 'Desc'; }
export interface Layout extends Metadata { layoutSections?: OneOrMany<LayoutSection>; relatedLists?: OneOrMany<RelatedList>; showEmailCheckbox?: boolean; showHighlightsPanel?: boolean; }
