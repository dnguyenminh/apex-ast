/**
 * @fileoverview Unit tests for LWC parsers.
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { parseLWCJsFile } = require('../../src/parsers/lwc/lwc-js-parser');
const { parseLWCHtmlFile } = require('../../src/parsers/lwc/lwc-html-parser');
const { parseLWCCssFile } = require('../../src/parsers/lwc/lwc-css-parser');

const LWC_FIXTURE = path.resolve(import.meta.dirname, '../fixtures/force-app/main/default/lwc/accountList');

describe('LWC JS Parser', () => {
  it('should parse a LWC JS file', () => {
    const result = parseLWCJsFile(path.join(LWC_FIXTURE, 'accountList.js'));
    expect(result.success).toBe(true);
    expect(result.data.componentName).toBe('accountList');
    expect(result.data.className).toBe('AccountList');
    expect(result.data.extendsLightningElement).toBe(true);
  });

  it('should extract @api properties', () => {
    const result = parseLWCJsFile(path.join(LWC_FIXTURE, 'accountList.js'));
    expect(result.data.apiProperties).toContain('recordId');
    expect(result.data.apiProperties).toContain('maxRecords');
  });

  it('should extract @track properties', () => {
    const result = parseLWCJsFile(path.join(LWC_FIXTURE, 'accountList.js'));
    expect(result.data.trackProperties).toContain('accounts');
  });

  it('should extract @wire decorators', () => {
    const result = parseLWCJsFile(path.join(LWC_FIXTURE, 'accountList.js'));
    expect(result.data.wireDecorators.length).toBeGreaterThan(0);
  });

  it('should extract Apex imports', () => {
    const result = parseLWCJsFile(path.join(LWC_FIXTURE, 'accountList.js'));
    expect(result.data.apexImports).toHaveLength(1);
    expect(result.data.apexImports[0].className).toBe('AccountController');
    expect(result.data.apexImports[0].methodName).toBe('getAccounts');
  });

  it('should extract event dispatches', () => {
    const result = parseLWCJsFile(path.join(LWC_FIXTURE, 'accountList.js'));
    expect(result.data.eventDispatches).toContain('refresh');
  });

  it('should detect lifecycle hooks', () => {
    const result = parseLWCJsFile(path.join(LWC_FIXTURE, 'accountList.js'));
    expect(result.data.lifecycleHooks).toContain('connectedCallback');
    expect(result.data.lifecycleHooks).toContain('renderedCallback');
  });

  it('should detect NavigationMixin usage', () => {
    const result = parseLWCJsFile(path.join(LWC_FIXTURE, 'accountList.js'));
    expect(result.data.usesNavigationMixin).toBe(true);
  });

  it('should detect ShowToastEvent usage', () => {
    const result = parseLWCJsFile(path.join(LWC_FIXTURE, 'accountList.js'));
    expect(result.data.usesToast).toBe(true);
  });
});

describe('LWC HTML Parser', () => {
  it('should parse a LWC HTML file', () => {
    const result = parseLWCHtmlFile(path.join(LWC_FIXTURE, 'accountList.html'));
    expect(result.success).toBe(true);
    expect(result.data.hasTemplate).toBe(true);
  });

  it('should extract child components', () => {
    const result = parseLWCHtmlFile(path.join(LWC_FIXTURE, 'accountList.html'));
    expect(result.data.childComponents).toContain('c-account-card');
    expect(result.data.childComponents).toContain('lightning-card');
    expect(result.data.childComponents).toContain('lightning-spinner');
    expect(result.data.childComponents).toContain('lightning-button');
  });

  it('should separate lightning vs custom components', () => {
    const result = parseLWCHtmlFile(path.join(LWC_FIXTURE, 'accountList.html'));
    expect(result.data.lightningComponents).toContain('lightning-card');
    expect(result.data.customComponents).toContain('c-account-card');
  });

  it('should extract data bindings', () => {
    const result = parseLWCHtmlFile(path.join(LWC_FIXTURE, 'accountList.html'));
    expect(result.data.dataBindings).toContain('isLoading');
    expect(result.data.dataBindings).toContain('accounts');
  });

  it('should extract event handlers', () => {
    const result = parseLWCHtmlFile(path.join(LWC_FIXTURE, 'accountList.html'));
    const handlerNames = result.data.eventHandlers.map(h => h.handler);
    expect(handlerNames).toContain('handleRowClick');
    expect(handlerNames).toContain('handleRefresh');
  });

  it('should extract conditionals (lwc:if)', () => {
    const result = parseLWCHtmlFile(path.join(LWC_FIXTURE, 'accountList.html'));
    expect(result.data.conditionals.length).toBeGreaterThan(0);
    const lwcIf = result.data.conditionals.find(c => c.type === 'lwc:if');
    expect(lwcIf).toBeTruthy();
  });

  it('should extract iterations (for:each)', () => {
    const result = parseLWCHtmlFile(path.join(LWC_FIXTURE, 'accountList.html'));
    expect(result.data.iterations).toHaveLength(1);
    expect(result.data.iterations[0].type).toBe('for:each');
    expect(result.data.iterations[0].item).toBe('account');
  });
});

describe('LWC CSS Parser', () => {
  it('should parse a LWC CSS file', () => {
    const result = parseLWCCssFile(path.join(LWC_FIXTURE, 'accountList.css'));
    expect(result.success).toBe(true);
    expect(result.data.isEmpty).toBe(false);
  });

  it('should extract custom properties defined', () => {
    const result = parseLWCCssFile(path.join(LWC_FIXTURE, 'accountList.css'));
    expect(result.data.customPropertiesDefined).toContain('--account-card-bg');
    expect(result.data.customPropertiesDefined).toContain('--account-card-border');
  });

  it('should extract SLDS tokens', () => {
    const result = parseLWCCssFile(path.join(LWC_FIXTURE, 'accountList.css'));
    expect(result.data.sldsTokens).toContain('--lwc-colorBackground');
  });

  it('should extract :host selectors', () => {
    const result = parseLWCCssFile(path.join(LWC_FIXTURE, 'accountList.css'));
    expect(result.data.hostSelectors.length).toBeGreaterThan(0);
  });

  it('should extract media queries', () => {
    const result = parseLWCCssFile(path.join(LWC_FIXTURE, 'accountList.css'));
    expect(result.data.mediaQueries).toHaveLength(1);
    expect(result.data.mediaQueries[0]).toContain('768px');
  });
});
