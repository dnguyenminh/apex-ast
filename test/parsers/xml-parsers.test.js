/**
 * @fileoverview Unit tests for XML metadata parsers.
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { parseFlowFile, parseFlowString } = require('../../src/parsers/xml/flow-parser');
const { parseObjectFile, parseObjectString } = require('../../src/parsers/xml/object-parser');
const { parseFieldString } = require('../../src/parsers/xml/field-parser');
const { parseValidationRuleString } = require('../../src/parsers/xml/validation-rule-parser');
const { parsePermissionSetFile } = require('../../src/parsers/xml/permission-parser');
const { parseLabelFile } = require('../../src/parsers/xml/label-parser');
const { parseLayoutString } = require('../../src/parsers/xml/layout-parser');

const FIXTURES = path.resolve(import.meta.dirname, '../fixtures/force-app/main/default');

describe('Flow Parser', () => {
  it('should parse a valid flow file', () => {
    const result = parseFlowFile(path.join(FIXTURES, 'flows/Create_Account.flow-meta.xml'));
    expect(result.success).toBe(true);
    expect(result.data.processType).toBe('Flow');
    expect(result.data.status).toBe('Active');
    expect(result.data.variables).toHaveLength(3);
    expect(result.data.decisions).toHaveLength(1);
    expect(result.data.recordCreates).toHaveLength(2);
  });

  it('should extract flow variables correctly', () => {
    const result = parseFlowFile(path.join(FIXTURES, 'flows/Create_Account.flow-meta.xml'));
    const inputVar = result.data.variables.find(v => v.name === 'accountName');
    expect(inputVar.dataType).toBe('String');
    expect(inputVar.isInput).toBe(true);
    expect(inputVar.isOutput).toBe(false);
  });

  it('should extract decision rules', () => {
    const result = parseFlowFile(path.join(FIXTURES, 'flows/Create_Account.flow-meta.xml'));
    const decision = result.data.decisions[0];
    expect(decision.name).toBe('Check_Account_Type');
    expect(decision.rules).toHaveLength(1);
    expect(decision.rules[0].name).toBe('Is_Enterprise');
    expect(decision.rules[0].conditions[0].operator).toBe('EqualTo');
  });

  it('should extract record creates with input assignments', () => {
    const result = parseFlowFile(path.join(FIXTURES, 'flows/Create_Account.flow-meta.xml'));
    const create = result.data.recordCreates.find(rc => rc.name === 'Create_Enterprise_Account');
    expect(create.object).toBe('Account');
    expect(create.inputAssignments).toHaveLength(2);
    expect(create.assignRecordIdToReference).toBe('newAccountId');
  });

  it('should handle missing file gracefully', () => {
    const result = parseFlowFile('/nonexistent/file.flow-meta.xml');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should parse flow from string', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <processType>AutoLaunchedFlow</processType>
    <status>Draft</status>
</Flow>`;
    const result = parseFlowString(xml, 'test');
    expect(result.success).toBe(true);
    expect(result.data.processType).toBe('AutoLaunchedFlow');
    expect(result.data.status).toBe('Draft');
  });

  it('should handle invalid XML', () => {
    const result = parseFlowString('<not-a-flow></not-a-flow>', 'test');
    expect(result.success).toBe(false);
  });
});

describe('Object Parser', () => {
  it('should parse a valid object file', () => {
    const result = parseObjectFile(path.join(FIXTURES, 'objects/Account__c/Account__c.object-meta.xml'));
    expect(result.success).toBe(true);
    expect(result.data.label).toBe('Custom Account');
    expect(result.data.sharingModel).toBe('ReadWrite');
    expect(result.data.fields).toHaveLength(3);
    expect(result.data.validationRules).toHaveLength(1);
    expect(result.data.recordTypes).toHaveLength(1);
  });

  it('should parse field types correctly', () => {
    const result = parseObjectFile(path.join(FIXTURES, 'objects/Account__c/Account__c.object-meta.xml'));
    const emailField = result.data.fields.find(f => f.fullName === 'Email__c');
    expect(emailField.type).toBe('Email');
    expect(emailField.required).toBe(true);
    expect(emailField.unique).toBe(true);
  });

  it('should parse picklist values', () => {
    const result = parseObjectFile(path.join(FIXTURES, 'objects/Account__c/Account__c.object-meta.xml'));
    const statusField = result.data.fields.find(f => f.fullName === 'Status__c');
    expect(statusField.type).toBe('Picklist');
    expect(statusField.picklistValues).toHaveLength(2);
    expect(statusField.picklistValues[0].fullName).toBe('Active');
  });

  it('should parse lookup relationships', () => {
    const result = parseObjectFile(path.join(FIXTURES, 'objects/Account__c/Account__c.object-meta.xml'));
    const lookupField = result.data.fields.find(f => f.fullName === 'Parent_Account__c');
    expect(lookupField.type).toBe('Lookup');
    expect(lookupField.referenceTo).toBe('Account');
    expect(lookupField.relationshipName).toBe('ChildAccounts');
    expect(lookupField.relationshipType).toBe('Lookup');
  });

  it('should parse validation rules', () => {
    const result = parseObjectFile(path.join(FIXTURES, 'objects/Account__c/Account__c.object-meta.xml'));
    const rule = result.data.validationRules[0];
    expect(rule.fullName).toBe('Email_Required_For_Active');
    expect(rule.active).toBe(true);
    expect(rule.errorMessage).toBe('Email is required for active accounts.');
  });
});

describe('Field Parser', () => {
  it('should parse a formula field', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Full_Name__c</fullName>
    <label>Full Name</label>
    <type>Text</type>
    <formula>FirstName__c &amp; " " &amp; LastName__c</formula>
    <length>255</length>
</CustomField>`;
    const result = parseFieldString(xml);
    expect(result.success).toBe(true);
    expect(result.data.fullName).toBe('Full_Name__c');
    expect(result.data.formula).toContain('FirstName__c');
  });

  it('should parse a lookup field', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Manager__c</fullName>
    <label>Manager</label>
    <type>Lookup</type>
    <referenceTo>User</referenceTo>
    <relationshipName>ManagedEmployees</relationshipName>
</CustomField>`;
    const result = parseFieldString(xml);
    expect(result.success).toBe(true);
    expect(result.data.referenceTo).toBe('User');
    expect(result.data.relationshipType).toBe('Lookup');
  });
});

describe('Validation Rule Parser', () => {
  it('should parse a standalone validation rule', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ValidationRule xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Phone_Required</fullName>
    <active>true</active>
    <errorConditionFormula>ISBLANK(Phone)</errorConditionFormula>
    <errorMessage>Phone number is required.</errorMessage>
</ValidationRule>`;
    const result = parseValidationRuleString(xml);
    expect(result.success).toBe(true);
    expect(result.data.fullName).toBe('Phone_Required');
    expect(result.data.active).toBe(true);
  });
});

describe('Permission Set Parser', () => {
  it('should parse a permission set file', () => {
    const result = parsePermissionSetFile(path.join(FIXTURES, 'permissionsets/Sales_User.permissionset-meta.xml'));
    expect(result.success).toBe(true);
    expect(result.data.label).toBe('Sales User');
    expect(result.data.objectPermissions).toHaveLength(2);
    expect(result.data.fieldPermissions).toHaveLength(2);
  });

  it('should parse object permissions correctly', () => {
    const result = parsePermissionSetFile(path.join(FIXTURES, 'permissionsets/Sales_User.permissionset-meta.xml'));
    const accountPerm = result.data.objectPermissions.find(p => p.object === 'Account');
    expect(accountPerm.allowCreate).toBe(true);
    expect(accountPerm.allowDelete).toBe(false);
  });
});

describe('Label Parser', () => {
  it('should parse custom labels file', () => {
    const result = parseLabelFile(path.join(FIXTURES, 'labels/CustomLabels.labels-meta.xml'));
    expect(result.success).toBe(true);
    expect(result.data.labels).toHaveLength(3);
    expect(result.data.labels[0].fullName).toBe('Welcome_Message');
  });
});

describe('Layout Parser', () => {
  it('should parse a layout from string', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Layout xmlns="http://soap.sforce.com/2006/04/metadata">
    <layoutSections>
        <label>Account Information</label>
        <style>TwoColumnsLeftToRight</style>
        <layoutColumns>
            <layoutItems>
                <field>Name</field>
                <behavior>Required</behavior>
            </layoutItems>
        </layoutColumns>
    </layoutSections>
    <relatedLists>
        <relatedList>Contact.AccountId</relatedList>
        <fields>Name</fields>
        <fields>Email</fields>
    </relatedLists>
</Layout>`;
    const result = parseLayoutString(xml);
    expect(result.success).toBe(true);
    expect(result.data.layoutSections).toHaveLength(1);
    expect(result.data.relatedLists).toHaveLength(1);
  });
});
