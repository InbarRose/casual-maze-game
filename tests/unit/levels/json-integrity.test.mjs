/**
 * Unit Tests: JSON Level Files Disk Integrity
 * Validates existence, dimensions, structure, and manifest.json configuration.
 */

import fs from 'fs';
import path from 'path';
import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelLoader } from '../../../js/levels/level-loader.js';

describe('Levels > JSON File Integrity', () => {
  it('validates existence and schema of all 10 campaign level files', () => {
    for (let i = 1; i <= 10; i++) {
      const jsonPath = path.resolve(`./levels/level_${i}.json`);
      assert(fs.existsSync(jsonPath), `File level_${i}.json exists on disk`);

      const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const norm = LevelLoader.normalizeLevel(raw);

      assert(norm.dimensions.width >= 5, `Level ${i} width >= 5`);
      assert(norm.dimensions.height >= 5, `Level ${i} height >= 5`);
      assertEqual(norm.layers.ground.length, norm.dimensions.height, `Level ${i} ground height matches`);
      assertEqual(norm.layers.ground[0].length, norm.dimensions.width, `Level ${i} ground width matches`);
      assert(norm.spawn && typeof norm.spawn.x === 'number', `Level ${i} has valid spawn`);
      assert(norm.exit && typeof norm.exit.x === 'number', `Level ${i} has valid exit`);
    }
  });

  it('validates existence and schema of all 6 tutorial level files', () => {
    for (let i = 1; i <= 6; i++) {
      const jsonPath = path.resolve(`./levels/tutorial_${i}.json`);
      assert(fs.existsSync(jsonPath), `File tutorial_${i}.json exists on disk`);

      const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const norm = LevelLoader.normalizeLevel(raw);

      assert(norm.dimensions.width >= 5, `Tutorial ${i} width >= 5`);
      assert(norm.dimensions.height >= 5, `Tutorial ${i} height >= 5`);
      assertEqual(norm.layers.ground.length, norm.dimensions.height, `Tutorial ${i} ground height matches`);
      assertEqual(norm.layers.ground[0].length, norm.dimensions.width, `Tutorial ${i} ground width matches`);
      assert(norm.spawn && typeof norm.spawn.x === 'number', `Tutorial ${i} has valid spawn`);
      assert(norm.exit && typeof norm.exit.x === 'number', `Tutorial ${i} has valid exit`);
    }
  });

  it('validates levels/manifest.json registry entries', () => {
    const manifestPath = path.resolve('./levels/manifest.json');
    assert(fs.existsSync(manifestPath), 'manifest.json exists on disk');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert(Array.isArray(manifest), 'manifest.json is an array');
    assertEqual(manifest.length, 16, 'Lists 16 total levels (6 tutorial + 10 campaign)');

    for (const entry of manifest) {
      assert(entry.id, `Manifest entry ${entry.id} has ID`);
      assert(entry.title, `Manifest entry ${entry.id} has title`);
      assert(entry.zone, `Manifest entry ${entry.id} has zone`);
      assert(entry.file, `Manifest entry ${entry.id} has file path`);
    }
  });
});
