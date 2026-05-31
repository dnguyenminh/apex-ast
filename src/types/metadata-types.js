/**
 * @fileoverview JSDoc type definitions for Salesforce metadata types.
 * Generated from Salesforce Metadata API schema concepts.
 * These types provide IDE autocomplete and validation for XML parser outputs.
 */

// ============================================================
// Common Types
// ============================================================

/**
 * @typedef {Object} MetadataBase
 * @property {string} fullName - API name of the metadata component
 * @property {string} [label] - Human-readable label
 * @property {string} [description] - Description
 * @property {string} [apiVersion] - Salesforce API version
 */

// ============================================================
// Flow Types
// ============================================================

/**
 * @typedef {'Screen Flow'|'Record-Triggered Flow'|'Scheduled Flow'|'Autolaunched Flow'|'Platform Event-Triggered Flow'} FlowType
 */

/**
 * @typedef {'Active'|'Draft'|'Obsolete'|'InvalidDraft'} FlowStatus
 */

/**
 * @typedef {Object} FlowVariable
 * @property {string} name - Variable API name
 * @property {string} dataType - Data type (String, Number, Boolean, SObject, etc.)
 * @property {boolean} isCollection - Whether it's a collection
 * @property {boolean} isInput - Available for input
 * @property {boolean} isOutput - Available for output
 * @property {*} [defaultValue] - Default value
 * @property {string} [objectType] - SObject type (when dataType is SObject)
 */

/**
 * @typedef {Object} FlowConnector
 * @property {string} targetReference - Target element API name
 * @property {boolean} [isGoTo] - Whether this is a GoTo connector
 */

/**
 * @typedef {Object} FlowCondition
 * @property {string} leftValueReference - Left operand reference
 * @property {string} operator - Comparison operator
 * @property {*} rightValue - Right operand value
 */

/**
 * @typedef {Object} FlowDecisionOutcome
 * @property {string} name - Outcome API name
 * @property {string} [label] - Outcome label
 * @property {FlowCondition[]} conditions - Conditions for this outcome
 * @property {string} conditionLogic - Logic (AND, OR, custom)
 * @property {FlowConnector} [connector] - Next element connector
 */

/**
 * @typedef {Object} FlowDecision
 * @property {string} name - Element API name
 * @property {string} [label] - Element label
 * @property {FlowDecisionOutcome[]} rules - Decision outcomes/rules
 * @property {FlowConnector} [defaultConnector] - Default path connector
 */

/**
 * @typedef {Object} FlowAssignment
 * @property {string} name - Element API name
 * @property {string} [label] - Element label
 * @property {Array<{assignToReference: string, operator: string, value: *}>} assignmentItems
 * @property {FlowConnector} [connector] - Next element connector
 */

/**
 * @typedef {Object} FlowRecordCreate
 * @property {string} name - Element API name
 * @property {string} [label] - Element label
 * @property {string} object - Target SObject type
 * @property {Array<{field: string, value: *}>} inputAssignments - Field assignments
 * @property {string} [assignRecordIdToReference] - Variable to store new record ID
 * @property {FlowConnector} [connector] - Next element connector
 * @property {FlowConnector} [faultConnector] - Fault path connector
 */

/**
 * @typedef {Object} FlowRecordUpdate
 * @property {string} name - Element API name
 * @property {string} [label] - Element label
 * @property {string} object - Target SObject type
 * @property {FlowCondition[]} [filters] - Record filter conditions
 * @property {Array<{field: string, value: *}>} inputAssignments - Field assignments
 * @property {FlowConnector} [connector] - Next element connector
 * @property {FlowConnector} [faultConnector] - Fault path connector
 */

/**
 * @typedef {Object} FlowRecordDelete
 * @property {string} name - Element API name
 * @property {string} [label] - Element label
 * @property {string} object - Target SObject type
 * @property {FlowCondition[]} [filters] - Record filter conditions
 * @property {FlowConnector} [connector] - Next element connector
 * @property {FlowConnector} [faultConnector] - Fault path connector
 */

/**
 * @typedef {Object} FlowRecordLookup
 * @property {string} name - Element API name
 * @property {string} [label] - Element label
 * @property {string} object - Target SObject type
 * @property {FlowCondition[]} [filters] - Record filter conditions
 * @property {string[]} [queriedFields] - Fields to retrieve
 * @property {string} [outputReference] - Variable to store result
 * @property {boolean} [getFirstRecordOnly] - Whether to get only first record
 * @property {FlowConnector} [connector] - Next element connector
 */

/**
 * @typedef {Object} FlowScreen
 * @property {string} name - Element API name
 * @property {string} [label] - Screen label
 * @property {Array<{name: string, fieldType: string, dataType: string, isRequired: boolean}>} fields
 * @property {FlowConnector} [connector] - Next element connector
 */

/**
 * @typedef {Object} FlowLoop
 * @property {string} name - Element API name
 * @property {string} [label] - Element label
 * @property {string} collectionReference - Collection to iterate
 * @property {string} iterationOrder - Asc or Desc
 * @property {FlowConnector} [nextValueConnector] - Loop body connector
 * @property {FlowConnector} [noMoreValuesConnector] - After loop connector
 */

/**
 * @typedef {Object} FlowSubflow
 * @property {string} name - Element API name
 * @property {string} flowName - Referenced flow API name
 * @property {Array<{name: string, value: *}>} [inputAssignments] - Input params
 * @property {Array<{assignToReference: string, name: string}>} [outputAssignments] - Output params
 * @property {FlowConnector} [connector] - Next element connector
 */

/**
 * @typedef {Object} FlowWait
 * @property {string} name - Element API name
 * @property {string} [label] - Element label
 * @property {Array<{name: string, conditionLogic: string, conditions: FlowCondition[], connector: FlowConnector}>} waitEvents
 * @property {FlowConnector} [defaultConnector] - Default connector
 */

/**
 * @typedef {Object} FlowDefinition
 * @property {string} fullName - Flow API name
 * @property {string} [label] - Flow label
 * @property {string} [description] - Flow description
 * @property {FlowType} processType - Flow type
 * @property {FlowStatus} status - Flow status
 * @property {string} [apiVersion] - API version
 * @property {string} [startElementReference] - First element reference
 * @property {FlowVariable[]} variables - Flow variables
 * @property {FlowDecision[]} decisions - Decision elements
 * @property {FlowAssignment[]} assignments - Assignment elements
 * @property {FlowRecordCreate[]} recordCreates - Record create elements
 * @property {FlowRecordUpdate[]} recordUpdates - Record update elements
 * @property {FlowRecordDelete[]} recordDeletes - Record delete elements
 * @property {FlowRecordLookup[]} recordLookups - Record lookup elements
 * @property {FlowScreen[]} screens - Screen elements
 * @property {FlowLoop[]} loops - Loop elements
 * @property {FlowSubflow[]} subflows - Subflow elements
 * @property {FlowWait[]} waits - Wait elements
 */

// ============================================================
// Custom Object Types
// ============================================================

/**
 * @typedef {'Lookup'|'MasterDetail'|'ExternalLookup'|'IndirectLookup'|'Hierarchy'} RelationshipType
 */

/**
 * @typedef {Object} CustomField
 * @property {string} fullName - Field API name
 * @property {string} [label] - Field label
 * @property {string} type - Field type (Text, Number, Picklist, Formula, Lookup, etc.)
 * @property {string} [description] - Field description
 * @property {string} [inlineHelpText] - Help text
 * @property {boolean} [required] - Whether field is required
 * @property {boolean} [unique] - Whether field is unique
 * @property {boolean} [externalId] - Whether field is external ID
 * @property {number} [length] - Text length
 * @property {number} [precision] - Number precision
 * @property {number} [scale] - Number scale
 * @property {*} [defaultValue] - Default value
 * @property {string} [formula] - Formula expression
 * @property {string} [referenceTo] - Referenced object (for lookups)
 * @property {string} [relationshipName] - Relationship name
 * @property {RelationshipType} [relationshipType] - Relationship type
 * @property {string} [deleteConstraint] - Delete constraint for lookups
 * @property {Array<{fullName: string, label: string, isActive: boolean, default: boolean}>} [picklistValues] - Picklist values
 * @property {string} [summaryForeignKey] - Roll-up summary foreign key
 * @property {string} [summaryOperation] - Roll-up summary operation
 * @property {string} [summarizedField] - Roll-up summary field
 */

/**
 * @typedef {Object} ValidationRule
 * @property {string} fullName - Rule API name
 * @property {boolean} active - Whether rule is active
 * @property {string} errorConditionFormula - Condition formula
 * @property {string} errorMessage - Error message
 * @property {string} [errorDisplayField] - Field to display error on
 * @property {string} [description] - Rule description
 */

/**
 * @typedef {Object} RecordType
 * @property {string} fullName - Record type API name
 * @property {string} [label] - Record type label
 * @property {boolean} active - Whether active
 * @property {string} [businessProcess] - Associated business process
 * @property {string} [description] - Description
 */

/**
 * @typedef {Object} ListView
 * @property {string} fullName - List view API name
 * @property {string} [label] - List view label
 * @property {string[]} columns - Columns to display
 * @property {string} filterScope - Filter scope (Everything, Mine, etc.)
 * @property {Array<{field: string, operation: string, value: string}>} [filters] - Filters
 */

/**
 * @typedef {Object} CompactLayout
 * @property {string} fullName - Compact layout API name
 * @property {string} [label] - Label
 * @property {string[]} fields - Fields in compact layout
 */

/**
 * @typedef {Object} FieldSet
 * @property {string} fullName - Field set API name
 * @property {string} [label] - Label
 * @property {string} [description] - Description
 * @property {Array<{field: string, isFieldManaged: boolean, isRequired: boolean}>} availableFields
 * @property {Array<{field: string, isFieldManaged: boolean, isRequired: boolean}>} displayedFields
 */

/**
 * @typedef {Object} CustomObject
 * @property {string} fullName - Object API name
 * @property {string} [label] - Object label
 * @property {string} [pluralLabel] - Plural label
 * @property {string} [description] - Description
 * @property {string} [sharingModel] - Sharing model (ReadWrite, Read, Private, etc.)
 * @property {CustomField[]} fields - Field definitions
 * @property {ValidationRule[]} validationRules - Validation rules
 * @property {RecordType[]} recordTypes - Record types
 * @property {ListView[]} listViews - List views
 * @property {CompactLayout[]} compactLayouts - Compact layouts
 * @property {FieldSet[]} fieldSets - Field sets
 * @property {string} [nameField] - Name field type
 * @property {boolean} [enableActivities] - Activities enabled
 * @property {boolean} [enableHistory] - Field history enabled
 * @property {boolean} [enableReports] - Reports enabled
 */

// ============================================================
// Permission Set / Profile Types
// ============================================================

/**
 * @typedef {Object} ObjectPermission
 * @property {string} object - Object API name
 * @property {boolean} allowCreate - Create permission
 * @property {boolean} allowRead - Read permission
 * @property {boolean} allowEdit - Edit permission
 * @property {boolean} allowDelete - Delete permission
 * @property {boolean} viewAllRecords - View all records
 * @property {boolean} modifyAllRecords - Modify all records
 */

/**
 * @typedef {Object} FieldPermission
 * @property {string} field - Field API name (Object.Field format)
 * @property {boolean} readable - Read permission
 * @property {boolean} editable - Edit permission
 */

/**
 * @typedef {Object} TabVisibility
 * @property {string} tab - Tab name
 * @property {string} visibility - Visibility (DefaultOn, DefaultOff, Hidden)
 */

/**
 * @typedef {Object} PermissionSet
 * @property {string} fullName - Permission set API name
 * @property {string} [label] - Label
 * @property {string} [description] - Description
 * @property {ObjectPermission[]} objectPermissions - Object permissions
 * @property {FieldPermission[]} fieldPermissions - Field permissions
 * @property {TabVisibility[]} tabVisibilities - Tab visibilities
 * @property {Array<{apexClass: string, enabled: boolean}>} classAccesses - Apex class access
 * @property {Array<{apexPage: string, enabled: boolean}>} pageAccesses - VF page access
 * @property {Array<{name: string, enabled: boolean}>} customPermissions - Custom permissions
 * @property {Array<{ipRange: {start: string, end: string}}>} [loginIpRanges] - Login IP ranges
 */

// ============================================================
// Custom Labels Types
// ============================================================

/**
 * @typedef {Object} CustomLabel
 * @property {string} fullName - Label API name
 * @property {string} value - Label text value
 * @property {string} [language] - Language code
 * @property {string} [shortDescription] - Short description
 * @property {string} [categories] - Categories (comma-separated)
 * @property {boolean} [protected] - Whether protected
 */

/**
 * @typedef {Object} CustomLabels
 * @property {CustomLabel[]} labels - Array of custom labels
 */

// ============================================================
// Layout Types
// ============================================================

/**
 * @typedef {Object} LayoutSection
 * @property {string} [label] - Section label
 * @property {string} style - Section style (TwoColumnsLeftToRight, OneColumn, etc.)
 * @property {number} columns - Number of columns
 * @property {Array<Array<{field: string, behavior: string}>>} layoutColumns - Column items
 */

/**
 * @typedef {Object} RelatedList
 * @property {string} relatedList - Related list name
 * @property {string[]} fields - Fields to display
 * @property {Array<{field: string, sortOrder: string}>} [sortField] - Sort configuration
 * @property {string[]} [excludeButtons] - Excluded buttons
 */

/**
 * @typedef {Object} PageLayout
 * @property {string} fullName - Layout API name
 * @property {LayoutSection[]} layoutSections - Layout sections
 * @property {RelatedList[]} relatedLists - Related lists
 * @property {string[]} [quickActionList] - Quick actions
 * @property {string[]} [miniLayout] - Mini layout fields
 * @property {Object} [feedLayout] - Feed layout settings
 * @property {string[]} [platformActionList] - Platform actions
 */

// ============================================================
// Indexer Output Types
// ============================================================

/**
 * @typedef {Object} ParseResult
 * @property {boolean} success - Whether parsing succeeded
 * @property {*} [data] - Parsed data (type depends on parser)
 * @property {string} [error] - Error message if failed
 * @property {string} filePath - Source file path
 * @property {string} metadataType - Type of metadata parsed
 * @property {number} parseTimeMs - Parse duration in milliseconds
 */

/**
 * @typedef {Object} FileManifest
 * @property {string[]} apex - Apex class/trigger files
 * @property {string[]} flows - Flow metadata files
 * @property {string[]} objects - Object metadata files
 * @property {string[]} fields - Field metadata files
 * @property {string[]} validationRules - Validation rule files
 * @property {string[]} permissionSets - Permission set files
 * @property {string[]} profiles - Profile files
 * @property {string[]} labels - Label files
 * @property {string[]} layouts - Layout files
 * @property {string[]} lwc - LWC component directories
 * @property {string[]} aura - Aura component directories
 */

/**
 * @typedef {Object} ProjectIndex
 * @property {Object} metadata - Project metadata
 * @property {string} metadata.projectPath - Project root path
 * @property {string} metadata.indexedAt - ISO timestamp
 * @property {number} metadata.totalFiles - Total files indexed
 * @property {Object[]} apex - Apex index data
 * @property {FlowDefinition[]} flows - Flow index data
 * @property {CustomObject[]} objects - Object index data
 * @property {Object[]} lwc - LWC index data
 * @property {Object[]} aura - Aura index data
 * @property {PermissionSet[]} permissions - Permission index data
 * @property {CustomLabels} labels - Label index data
 * @property {PageLayout[]} layouts - Layout index data
 * @property {Object} [graph] - Dependency graph
 */

module.exports = {};
