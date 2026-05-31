/**
 * @fileoverview SFDX Project Scanner.
 * Scans Salesforce DX project structure and detects all metadata files.
 */

const fs = require('fs');
const path = require('path');

/** File extension patterns for each metadata type */
const METADATA_PATTERNS = {
  apex: ['.cls', '.trigger'],
  flows: ['.flow-meta.xml'],
  objects: ['.object-meta.xml'],
  fields: ['.field-meta.xml'],
  validationRules: ['.validationRule-meta.xml'],
  permissionSets: ['.permissionset-meta.xml'],
  profiles: ['.profile-meta.xml'],
  labels: ['.labels-meta.xml'],
  layouts: ['.layout-meta.xml']
};

/**
 * Read and parse sfdx-project.json to get package directories.
 * @param {string} projectRoot - Project root path
 * @returns {string[]} Package directory paths (relative)
 */
function getPackageDirectories(projectRoot) {
  const sfdxPath = path.join(projectRoot, 'sfdx-project.json');
  if (!fs.existsSync(sfdxPath)) {
    // Default SFDX structure
    return ['force-app/main/default'];
  }
  try {
    const config = JSON.parse(fs.readFileSync(sfdxPath, 'utf-8'));
    return (config.packageDirectories || []).map(d => d.path || d);
  } catch (e) {
    return ['force-app/main/default'];
  }
}

/**
 * Read .forceignore patterns.
 * @param {string} projectRoot - Project root path
 * @returns {string[]} Ignore patterns
 */
function getIgnorePatterns(projectRoot) {
  const ignorePath = path.join(projectRoot, '.forceignore');
  if (!fs.existsSync(ignorePath)) return [];
  try {
    return fs.readFileSync(ignorePath, 'utf-8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));
  } catch (e) {
    return [];
  }
}

/**
 * Check if a file path matches any ignore pattern (simple glob matching).
 * @param {string} filePath - File path to check
 * @param {string[]} patterns - Ignore patterns
 * @returns {boolean} True if file should be ignored
 */
function shouldIgnore(filePath, patterns) {
  const normalized = filePath.replace(/\\/g, '/');
  for (const pattern of patterns) {
    if (pattern.startsWith('*')) {
      if (normalized.endsWith(pattern.slice(1))) return true;
    } else if (pattern.endsWith('*')) {
      if (normalized.includes(pattern.slice(0, -1))) return true;
    } else if (normalized.includes(pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Recursively scan a directory for files.
 * @param {string} dir - Directory to scan
 * @param {string[]} ignorePatterns - Patterns to ignore
 * @returns {string[]} All file paths found
 */
function scanDirectory(dir, ignorePatterns = []) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldIgnore(fullPath, ignorePatterns)) continue;

    if (entry.isDirectory()) {
      // Skip common non-metadata directories
      if (['node_modules', '.git', '.sfdx', '.sf'].includes(entry.name)) continue;
      results.push(...scanDirectory(fullPath, ignorePatterns));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Detect LWC component directories.
 * @param {string} baseDir - Base directory to scan
 * @param {string[]} ignorePatterns - Ignore patterns
 * @returns {string[]} LWC component directory paths
 */
function detectLWCComponents(baseDir, ignorePatterns) {
  const lwcDirs = [];
  const lwcBase = path.join(baseDir, 'lwc');
  if (!fs.existsSync(lwcBase)) return lwcDirs;

  const entries = fs.readdirSync(lwcBase, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('__')) {
      const compDir = path.join(lwcBase, entry.name);
      if (!shouldIgnore(compDir, ignorePatterns)) {
        // Verify it has a .js file (valid LWC component)
        const jsFile = path.join(compDir, `${entry.name}.js`);
        if (fs.existsSync(jsFile)) {
          lwcDirs.push(compDir);
        }
      }
    }
  }
  return lwcDirs;
}

/**
 * Detect Aura component directories.
 * @param {string} baseDir - Base directory to scan
 * @param {string[]} ignorePatterns - Ignore patterns
 * @returns {string[]} Aura component directory paths
 */
function detectAuraComponents(baseDir, ignorePatterns) {
  const auraDirs = [];
  const auraBase = path.join(baseDir, 'aura');
  if (!fs.existsSync(auraBase)) return auraDirs;

  const entries = fs.readdirSync(auraBase, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const compDir = path.join(auraBase, entry.name);
      if (!shouldIgnore(compDir, ignorePatterns)) {
        // Verify it has a .cmp file (valid Aura component)
        const cmpFile = path.join(compDir, `${entry.name}.cmp`);
        if (fs.existsSync(cmpFile)) {
          auraDirs.push(compDir);
        }
      }
    }
  }
  return auraDirs;
}

/**
 * Scan an SFDX project and return a manifest of all metadata files grouped by type.
 * @param {string} projectRoot - SFDX project root path
 * @returns {import('../types/metadata-types').FileManifest} File manifest grouped by type
 */
function scanProject(projectRoot) {
  const packageDirs = getPackageDirectories(projectRoot);
  const ignorePatterns = getIgnorePatterns(projectRoot);

  /** @type {import('../types/metadata-types').FileManifest} */
  const manifest = {
    apex: [],
    flows: [],
    objects: [],
    fields: [],
    validationRules: [],
    permissionSets: [],
    profiles: [],
    labels: [],
    layouts: [],
    lwc: [],
    aura: []
  };

  for (const pkgDir of packageDirs) {
    const fullPkgDir = path.join(projectRoot, pkgDir);
    if (!fs.existsSync(fullPkgDir)) continue;

    // Scan all files
    const allFiles = scanDirectory(fullPkgDir, ignorePatterns);

    // Classify files by type
    for (const filePath of allFiles) {
      for (const [type, extensions] of Object.entries(METADATA_PATTERNS)) {
        if (extensions.some(ext => filePath.endsWith(ext))) {
          manifest[type].push(filePath);
          break;
        }
      }
    }

    // Detect LWC and Aura components
    manifest.lwc.push(...detectLWCComponents(fullPkgDir, ignorePatterns));
    manifest.aura.push(...detectAuraComponents(fullPkgDir, ignorePatterns));
  }

  return manifest;
}

/**
 * Get summary statistics for a file manifest.
 * @param {import('../types/metadata-types').FileManifest} manifest
 * @returns {Object} Summary with counts per type
 */
function getManifestSummary(manifest) {
  const summary = {};
  let total = 0;
  for (const [type, files] of Object.entries(manifest)) {
    summary[type] = files.length;
    total += files.length;
  }
  summary.total = total;
  return summary;
}

module.exports = { scanProject, getManifestSummary, getPackageDirectories, getIgnorePatterns };
