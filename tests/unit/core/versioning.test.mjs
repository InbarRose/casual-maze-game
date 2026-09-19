/**
 * Unit Tests: Versioning & Compatibility Subsystem
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import {
  ENGINE_VERSION,
  LEVEL_SCHEMA_VERSION,
  ASSET_MANIFEST_VERSION,
  LEVEL_MANIFEST_VERSION,
  SAVE_PROFILE_SCHEMA_VERSION,
  VERSION_METADATA,
  parseSemVer,
  compareVersions,
  isCompatible,
  validateLevelVersion,
} from '../../../js/core/version.js';

describe('Core > Versioning & Compatibility', () => {
  it('validates canonical version constants and metadata registry', () => {
    assert(ENGINE_VERSION && typeof ENGINE_VERSION === 'string', 'ENGINE_VERSION is defined');
    assert(LEVEL_SCHEMA_VERSION && typeof LEVEL_SCHEMA_VERSION === 'string', 'LEVEL_SCHEMA_VERSION is defined');
    assert(ASSET_MANIFEST_VERSION && typeof ASSET_MANIFEST_VERSION === 'string', 'ASSET_MANIFEST_VERSION is defined');
    assert(LEVEL_MANIFEST_VERSION && typeof LEVEL_MANIFEST_VERSION === 'string', 'LEVEL_MANIFEST_VERSION is defined');
    assert(SAVE_PROFILE_SCHEMA_VERSION && typeof SAVE_PROFILE_SCHEMA_VERSION === 'string', 'SAVE_PROFILE_SCHEMA_VERSION is defined');

    assertEqual(VERSION_METADATA.engine, ENGINE_VERSION);
    assertEqual(VERSION_METADATA.levelSchema, LEVEL_SCHEMA_VERSION);
    assertEqual(VERSION_METADATA.assetManifest, ASSET_MANIFEST_VERSION);
    assertEqual(VERSION_METADATA.levelManifest, LEVEL_MANIFEST_VERSION);
  });

  it('correctly parses semantic version strings', () => {
    const v1 = parseSemVer('1.14.0');
    assertEqual(v1.major, 1);
    assertEqual(v1.minor, 14);
    assertEqual(v1.patch, 0);

    const v2 = parseSemVer('v2.5.9');
    assertEqual(v2.major, 2);
    assertEqual(v2.minor, 5);
    assertEqual(v2.patch, 9);

    const vEmpty = parseSemVer(null);
    assertEqual(vEmpty.major, 0);
    assertEqual(vEmpty.minor, 0);
    assertEqual(vEmpty.patch, 0);
  });

  it('compares semantic versions accurately', () => {
    assertEqual(compareVersions('1.14.0', '1.13.0'), 1);
    assertEqual(compareVersions('1.13.0', '1.14.0'), -1);
    assertEqual(compareVersions('1.14.0', '1.14.0'), 0);
    assertEqual(compareVersions('2.0.0', '1.99.99'), 1);
    assertEqual(compareVersions('1.5.0', '1.5.1'), -1);
  });

  it('evaluates backward compatibility rules correctly', () => {
    // Same major version, source >= required is compatible
    assert(isCompatible('1.14.0', '1.12.0'), 'v1.14.0 is compatible with v1.12.0');
    assert(isCompatible('1.14.0', '1.14.0'), 'v1.14.0 is compatible with v1.14.0');
    assert(!isCompatible('1.12.0', '1.14.0'), 'v1.12.0 is NOT compatible with v1.14.0');

    // Breaking major versions are incompatible
    assert(!isCompatible('2.0.0', '1.0.0'), 'v2.0.0 is not compatible with v1.0.0');
    assert(!isCompatible('1.0.0', '2.0.0'), 'v1.0.0 is not compatible with v2.0.0');
  });

  it('validates level version metadata and detects incompatible schemas', () => {
    // Valid level
    const validLevel = { id: 'lvl_test', version: 1, schemaVersion: '1.0.0' };
    const res1 = validateLevelVersion(validLevel);
    assertEqual(res1.valid, true);
    assertEqual(res1.version, 1);

    // Missing version
    const missingVersionLevel = { id: 'lvl_no_v' };
    const res2 = validateLevelVersion(missingVersionLevel);
    assertEqual(res2.valid, false);
    assert(res2.error.includes('invalid or missing version'), 'Reports missing version');

    // Negative / non-integer version
    const invalidVersionLevel = { id: 'lvl_bad_v', version: -2 };
    const res3 = validateLevelVersion(invalidVersionLevel);
    assertEqual(res3.valid, false);
    assert(res3.error.includes('Must be a positive integer'), 'Reports negative version');

    // Breaking schema version
    const breakingSchemaLevel = { id: 'lvl_future', version: 1, schemaVersion: '2.0.0' };
    const res4 = validateLevelVersion(breakingSchemaLevel);
    assertEqual(res4.valid, false);
    assert(res4.error.includes('incompatible with engine level schema'), 'Reports incompatible schema version');
  });
});
