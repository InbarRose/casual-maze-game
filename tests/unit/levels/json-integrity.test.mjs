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
    const manifestPath = path.resolve('./levels/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const campaignEntries = manifest.filter(m => m.category === 'campaign' || !m.category);

    assertEqual(campaignEntries.length, 10, 'Manifest contains 10 campaign levels');

    for (const entry of campaignEntries) {
      const jsonPath = path.resolve(entry.file);
      assert(fs.existsSync(jsonPath), `File ${entry.file} exists on disk`);

      const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const norm = LevelLoader.normalizeLevel(raw);

      assert(norm.dimensions.width >= 5, `Level ${entry.id} width >= 5`);
      assert(norm.dimensions.height >= 5, `Level ${entry.id} height >= 5`);
      assertEqual(norm.layers.ground.length, norm.dimensions.height, `Level ${entry.id} ground height matches`);
      assertEqual(norm.layers.ground[0].length, norm.dimensions.width, `Level ${entry.id} ground width matches`);
      assert(norm.spawn && typeof norm.spawn.x === 'number', `Level ${entry.id} has valid spawn`);
      assert(norm.exit && typeof norm.exit.x === 'number', `Level ${entry.id} has valid exit`);
    }
  });

  it('validates existence and schema of all 6 tutorial level files', () => {
    const manifestPath = path.resolve('./levels/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const tutorialEntries = manifest.filter(m => m.category === 'tutorial');

    assertEqual(tutorialEntries.length, 6, 'Manifest contains 6 tutorial levels');

    for (const entry of tutorialEntries) {
      const jsonPath = path.resolve(entry.file);
      assert(fs.existsSync(jsonPath), `File ${entry.file} exists on disk`);

      const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const norm = LevelLoader.normalizeLevel(raw);

      assert(norm.dimensions.width >= 5, `Tutorial ${entry.id} width >= 5`);
      assert(norm.dimensions.height >= 5, `Tutorial ${entry.id} height >= 5`);
      assertEqual(norm.layers.ground.length, norm.dimensions.height, `Tutorial ${entry.id} ground height matches`);
      assertEqual(norm.layers.ground[0].length, norm.dimensions.width, `Tutorial ${entry.id} ground width matches`);
      assert(norm.spawn && typeof norm.spawn.x === 'number', `Tutorial ${entry.id} has valid spawn`);
      assert(norm.exit && typeof norm.exit.x === 'number', `Tutorial ${entry.id} has valid exit`);
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
