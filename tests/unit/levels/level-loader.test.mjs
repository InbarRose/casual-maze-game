/**
 * Unit Tests: LevelLoader Normalization & Defaults
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { LevelLoader } from '../../../js/levels/level-loader.js';
import { TUTORIAL_LEVELS } from '../../../js/levels/default-levels.js';

describe('Levels > LevelLoader', () => {
  it('normalizes raw level schemas with sensible defaults', () => {
    const raw = {
      title: 'Minimal Maze',
      dimensions: { width: 5, height: 5 },
      spawn: { x: 1, y: 1 },
      exit: { x: 3, y: 3 },
    };

    const norm = LevelLoader.normalizeLevel(raw);
    assertEqual(norm.title, 'Minimal Maze');
    assertEqual(norm.dimensions.width, 5);
    assertEqual(norm.dimensions.height, 5);
    assertEqual(norm.config.theme, 'dungeon', 'Default theme is dungeon');
    assertEqual(norm.layers.ground.length, 5, 'Ground grid padded to height');
    assertEqual(norm.layers.ground[0].length, 5, 'Ground grid padded to width');
    assertEqual(norm.layers.overhead.length, 5, 'Overhead grid padded to height');
    assert(Array.isArray(norm.entities), 'Entities is an array');
  });

  it('preserves tutorial metadata and config flags', () => {
    const tut1 = TUTORIAL_LEVELS[0];
    const norm = LevelLoader.normalizeLevel(tut1);

    assertEqual(norm.id, 'tutorial_1');
    assertEqual(norm.zone, 'tutorial');
    assertEqual(norm.config.mapRevealed, true);
    assertEqual(norm.help?.title, 'Navigation Basics');
  });

  it('normalizes custom testSpawn and testInventory', () => {
    const raw = {
      title: 'Playtest Level',
      dimensions: { width: 6, height: 6 },
      spawn: { x: 1, y: 1 },
      exit: { x: 4, y: 4 },
      testSpawn: { x: 3, y: 2, elevation: 1 },
      testInventory: ['key_gold', 'key_ruby'],
    };

    const norm = LevelLoader.normalizeLevel(raw);
    assertEqual(norm.testSpawn.x, 3);
    assertEqual(norm.testSpawn.y, 2);
    assertEqual(norm.testSpawn.elevation, 1);
    assertDeepEqual(norm.testInventory, ['key_gold', 'key_ruby']);
  });
});
