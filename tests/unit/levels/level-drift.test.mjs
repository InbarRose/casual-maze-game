/**
 * Unit Tests: Level Manifest Drift & Cryptographic Integrity
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { LevelLoader } from '../../../js/levels/level-loader.js';
import { LEVEL_SCHEMA_VERSION } from '../../../js/core/version.js';

describe('Levels > Cryptographic Integrity & Versioning', () => {
  const rootDir = process.cwd();
  const manifestPath = path.resolve(rootDir, 'levels/manifest.json');

  it('validates levels/manifest.json registry entries and schema fields', () => {
    assert(fs.existsSync(manifestPath), 'levels/manifest.json exists');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert(Array.isArray(manifest), 'manifest is an array');
    assertEqual(manifest.length, 42, 'Manifest contains exactly 42 levels');

    for (const entry of manifest) {
      assert(entry.id, `Level ${entry.id} has id`);
      assert(entry.title, `Level ${entry.id} has title`);
      assert(entry.file, `Level ${entry.id} has file path`);
      assertEqual(entry.version, 1, `Level ${entry.id} has version 1`);
      assert(typeof entry.hash === 'string' && entry.hash.length === 64, `Level ${entry.id} has 64-char SHA-256 hash`);
      assert(typeof entry.size === 'number' && entry.size > 0, `Level ${entry.id} has valid size in bytes`);
      assert(entry.dimensions && entry.dimensions.width >= 5 && entry.dimensions.height >= 5, `Level ${entry.id} has valid dimensions`);
    }
  });

  it('verifies zero unmanifested level JSON files exist on disk', () => {
    function scanLevels(dir) {
      let list = [];
      if (!fs.existsSync(dir)) return list;
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
          list.push(...scanLevels(full));
        } else if (item.name.endsWith('.json') && item.name !== 'manifest.json') {
          list.push(path.relative(rootDir, full).replace(/\\/g, '/'));
        }
      }
      return list;
    }

    const diskLevels = [
      ...scanLevels(path.resolve(rootDir, 'levels/tutorial')),
      ...scanLevels(path.resolve(rootDir, 'levels/stories')),
    ];
    for (let ch = 1; ch <= 8; ch++) {
      diskLevels.push(...scanLevels(path.resolve(rootDir, `levels/chapter_${ch}`)));
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const manifestFiles = new Set(manifest.map(m => m.file.replace(/\\/g, '/')));

    const unmanifested = diskLevels.filter(p => !manifestFiles.has(p));
    assertEqual(unmanifested.length, 0, `All level JSON files on disk are registered. Found: ${unmanifested.join(', ')}`);
  });

  it('verifies 100% of levels match SHA-256 hashes, sizes, and dimensions', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    for (const entry of manifest) {
      const fullPath = path.resolve(rootDir, entry.file);
      assert(fs.existsSync(fullPath), `Level file exists on disk: ${entry.file}`);

      const content = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');

      assertEqual(hash, entry.hash, `SHA-256 hash matches for Level "${entry.id}" (${entry.file})`);
      assertEqual(content.length, entry.size, `File size matches for Level "${entry.id}" (${entry.file})`);

      const data = JSON.parse(content.toString('utf8'));
      assertEqual(data.version, entry.version, `Level "${entry.id}" version matches manifest`);
      assertEqual(data.dimensions.width, entry.dimensions.width, `Level "${entry.id}" width matches manifest`);
      assertEqual(data.dimensions.height, entry.dimensions.height, `Level "${entry.id}" height matches manifest`);
    }
  });

  it('verifies LevelValidator validates level version and schema compatibility', () => {
    const validLevel = {
      id: 'valid_lvl',
      version: 1,
      dimensions: { width: 7, height: 7 },
      spawn: { x: 1, y: 1 },
      exit: { x: 5, y: 5 },
      layers: {
        ground: Array.from({ length: 7 }, () => Array(7).fill(0)),
        overhead: Array.from({ length: 7 }, () => Array(7).fill(0)),
      },
    };

    const validRes = LevelValidator.validateVersion(validLevel);
    assertEqual(validRes.valid, true);

    const invalidLevel = {
      id: 'invalid_lvl',
      version: 0,
    };
    const invalidRes = LevelValidator.validateVersion(invalidLevel);
    assertEqual(invalidRes.valid, false);
    assert(invalidRes.error.includes('positive integer'), 'Catches version < 1');
  });

  it('verifies LevelLoader normalizes and populates version and schemaVersion', () => {
    const raw = {
      id: 'test_norm',
      dimensions: { width: 7, height: 7 },
      spawn: { x: 1, y: 1 },
      exit: { x: 5, y: 5 },
      layers: {
        ground: Array.from({ length: 7 }, () => Array(7).fill(0)),
      },
    };

    const norm = LevelLoader.normalizeLevel(raw);
    assertEqual(norm.version, 1, 'Defaults missing version to 1');
    assertEqual(norm.schemaVersion, LEVEL_SCHEMA_VERSION, 'Sets default schemaVersion');
  });
});
