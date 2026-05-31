/**
 * @fileoverview Salesforce Permission Set and Profile metadata XML parser.
 * Parses .permissionset-meta.xml and .profile-meta.xml files.
 */

const fs = require('fs');
const { parseXml, ensureArray, parseBool } = require('./xml-config');

function parseObjectPermissions(perms) {
  return ensureArray(perms).map(p => ({
    object: p.object || null,
    allowCreate: parseBool(p.allowCreate),
    allowRead: parseBool(p.allowRead),
    allowEdit: parseBool(p.allowEdit),
    allowDelete: parseBool(p.allowDelete),
    viewAllRecords: parseBool(p.viewAllRecords),
    modifyAllRecords: parseBool(p.modifyAllRecords)
  }));
}

function parseFieldPermissions(perms) {
  return ensureArray(perms).map(p => ({
    field: p.field || null,
    readable: parseBool(p.readable),
    editable: parseBool(p.editable)
  }));
}

function parseTabVisibilities(tabs) {
  return ensureArray(tabs).map(t => ({
    tab: t.tab || null,
    visibility: t.visibility || null
  }));
}

function parseClassAccesses(accesses) {
  return ensureArray(accesses).map(a => ({
    apexClass: a.apexClass || null,
    enabled: parseBool(a.enabled)
  }));
}

function parsePageAccesses(accesses) {
  return ensureArray(accesses).map(a => ({
    apexPage: a.apexPage || null,
    enabled: parseBool(a.enabled)
  }));
}

function parseCustomPermissions(perms) {
  return ensureArray(perms).map(p => ({
    name: p.name || null,
    enabled: parseBool(p.enabled)
  }));
}

function parseLoginIpRanges(ranges) {
  return ensureArray(ranges).map(r => ({
    startAddress: r.startAddress || null,
    endAddress: r.endAddress || null,
    description: r.description || null
  }));
}

function extractPermName(filePath) {
  const match = filePath.match(/([^/\\]+)\.(permissionset|profile)-meta\.xml$/);
  return match ? match[1] : 'Unknown';
}

function parsePermissionContent(xmlContent, source, startTime, metadataType) {
  try {
    const parsed = parseXml(xmlContent);
    const perm = parsed.PermissionSet || parsed.Profile;
    if (!perm) {
      return { success: false, error: 'No <PermissionSet> or <Profile> root element found', filePath: source, metadataType, parseTimeMs: Date.now() - startTime };
    }

    const data = {
      fullName: perm.fullName || extractPermName(source),
      label: perm.label || null,
      description: perm.description || null,
      objectPermissions: parseObjectPermissions(perm.objectPermissions),
      fieldPermissions: parseFieldPermissions(perm.fieldPermissions),
      tabVisibilities: parseTabVisibilities(perm.tabVisibilities || perm.tabSettings),
      classAccesses: parseClassAccesses(perm.classAccesses),
      pageAccesses: parsePageAccesses(perm.pageAccesses),
      customPermissions: parseCustomPermissions(perm.customPermissions),
      loginIpRanges: parseLoginIpRanges(perm.loginIpRanges),
      userLicense: perm.userLicense || null,
      custom: parseBool(perm.custom),
      hasActivationRequired: parseBool(perm.hasActivationRequired)
    };

    return { success: true, data, filePath: source, metadataType, parseTimeMs: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error.message, filePath: source, metadataType, parseTimeMs: Date.now() - startTime };
  }
}

function parsePermissionSetFile(filePath) {
  const startTime = Date.now();
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    return parsePermissionContent(xmlContent, filePath, startTime, 'PermissionSet');
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'PermissionSet', parseTimeMs: Date.now() - startTime };
  }
}

function parseProfileFile(filePath) {
  const startTime = Date.now();
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    return parsePermissionContent(xmlContent, filePath, startTime, 'Profile');
  } catch (error) {
    return { success: false, error: error.message, filePath, metadataType: 'Profile', parseTimeMs: Date.now() - startTime };
  }
}

function parsePermissionString(xmlContent, source = 'string') {
  return parsePermissionContent(xmlContent, source, Date.now(), 'PermissionSet');
}

module.exports = { parsePermissionSetFile, parseProfileFile, parsePermissionString };
