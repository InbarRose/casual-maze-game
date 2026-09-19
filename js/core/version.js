/**
 * Casual Maze Game — Versioning & Compatibility Subsystem
 * Centralizes version constants, semver parsing, and compatibility assertions
 * across the engine, level schema, asset catalog, and save data.
 */

export const ENGINE_VERSION = '1.14.0';
export const LEVEL_SCHEMA_VERSION = '1.0.0';
export const ASSET_MANIFEST_VERSION = '1.5.0';
export const LEVEL_MANIFEST_VERSION = '1.2.0';
export const SAVE_PROFILE_SCHEMA_VERSION = '1.0.0';

/**
 * Version metadata registry
 */
export const VERSION_METADATA = Object.freeze({
  engine: ENGINE_VERSION,
  levelSchema: LEVEL_SCHEMA_VERSION,
  assetManifest: ASSET_MANIFEST_VERSION,
  levelManifest: LEVEL_MANIFEST_VERSION,
  saveProfile: SAVE_PROFILE_SCHEMA_VERSION,
  minCompatibleEngine: '1.0.0',
  minCompatibleLevelSchema: '1.0.0',
});

/**
 * Parse semantic version string into numeric components
 * @param {string} versionStr - e.g. "1.14.0" or "v1.2.3"
 * @returns {{ major: number, minor: number, patch: number, raw: string }}
 */
export function parseSemVer(versionStr) {
  if (!versionStr || typeof versionStr !== 'string') {
    return { major: 0, minor: 0, patch: 0, raw: String(versionStr || '') };
  }
  const clean = versionStr.trim().replace(/^v/i, '');
  const parts = clean.split('.');
  const major = parseInt(parts[0], 10) || 0;
  const minor = parseInt(parts[1], 10) || 0;
  const patch = parseInt(parts[2], 10) || 0;
  return { major, minor, patch, raw: versionStr };
}

/**
 * Compare two semver strings
 * @param {string} v1
 * @param {string} v2
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1, v2) {
  const p1 = parseSemVer(v1);
  const p2 = parseSemVer(v2);

  if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1;
  if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1;
  if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1;
  return 0;
}

/**
 * Check if a source version is backwards-compatible with a target required version
 * Standard SemVer rules: same major version and source >= target.
 * @param {string} sourceVersion - Current running version
 * @param {string} targetRequiredVersion - Required minimum version
 * @returns {boolean}
 */
export function isCompatible(sourceVersion, targetVersion) {
  const src = parseSemVer(sourceVersion);
  const tgt = parseSemVer(targetVersion);

  // Different major versions are incompatible
  if (src.major !== tgt.major) {
    return false;
  }

  // Source version must be at least target version
  return compareVersions(sourceVersion, targetVersion) >= 0;
}

/**
 * Validate level version metadata for engine compatibility
 * @param {object} level
 * @returns {{ valid: boolean, error?: string, version: number, schemaVersion: string }}
 */
export function validateLevelVersion(level) {
  if (!level || typeof level !== 'object') {
    return { valid: false, error: 'Level payload is not an object', version: 1, schemaVersion: LEVEL_SCHEMA_VERSION };
  }

  const rawVersion = level.version;
  const versionNum = Number(rawVersion);

  if (rawVersion === undefined || rawVersion === null || Number.isNaN(versionNum) || versionNum < 1) {
    return {
      valid: false,
      error: `Level "${level.id || 'unknown'}" has invalid or missing version field: ${JSON.stringify(rawVersion)}. Must be a positive integer.`,
      version: 1,
      schemaVersion: LEVEL_SCHEMA_VERSION,
    };
  }

  const schemaVersion = level.schemaVersion || LEVEL_SCHEMA_VERSION;
  if (!isCompatible(LEVEL_SCHEMA_VERSION, schemaVersion)) {
    return {
      valid: false,
      error: `Level "${level.id || 'unknown'}" uses schema v${schemaVersion} which is incompatible with engine level schema v${LEVEL_SCHEMA_VERSION}`,
      version: versionNum,
      schemaVersion,
    };
  }

  return {
    valid: true,
    version: versionNum,
    schemaVersion,
  };
}
