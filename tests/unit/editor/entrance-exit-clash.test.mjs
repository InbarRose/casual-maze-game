/**
 * Unit Tests: Architectural Entrance & Exit Clash Detection & Editor Assistant (BL-84)
 *
 * Validates:
 * 1. LevelValidator detects clashes between entrance wall doorways and entities (wall_decor, signposts).
 * 2. LevelValidator detects clashes between exit wall archways and entities.
 * 3. LevelValidator warns when a doorway is configured on a non-wall tile.
 * 4. EntityInspector architecture assistant suggests clean wall doorways when available.
 * 5. EntityInspector falls back to freestanding spiral stairs/portals when walls have clashes or open air.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { EntityInspector } from '../../../js/editor/entity-inspector.js';

describe('Editor > Entrance & Exit Architecture Clash Detection (BL-84)', () => {
  // 5x5 base level
  const baseLevel = {
    version: 1,
    dimensions: { width: 5, height: 5 },
    config: { theme: 'dungeon' },
    layers: {
      ground: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
      ],
      overhead: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    },
    spawn: { x: 2, y: 1, style: 'wall_doorway', wallDirection: 'north' },
    exit: { x: 2, y: 3, style: 'portal', wallDirection: 'none' },
    entities: [],
  };

  it('validates clean entrance wall doorway with zero warnings or clashes', () => {
    const report = LevelValidator.validate(baseLevel);
    assert(report.valid, 'Level must be valid');
    assertEqual(report.errors.length, 0, 'Zero errors');
    const clashWarnings = report.warnings.filter(w => w.message.includes('clashes with'));
    assertEqual(clashWarnings.length, 0, 'Zero clash warnings for clean doorway');
  });

  it('emits warning when entrance wall doorway clashes with wall_decor at (spawn.x, spawn.y - 1)', () => {
    const clashingLevel = {
      ...baseLevel,
      entities: [
        {
          id: 'decor_mural_1',
          type: 'wall_decor',
          x: 2,
          y: 0, // Occupies the exact wall face where entrance door would render!
        },
      ],
    };

    const report = LevelValidator.validate(clashingLevel);
    const clashWarning = report.warnings.find(w => w.message.includes('clashes with entity "decor_mural_1"'));
    assert(clashWarning !== undefined, 'Must detect clash with decor_mural_1');
    assertEqual(clashWarning.x, 2, 'Clash X matches');
    assertEqual(clashWarning.y, 0, 'Clash Y matches');
  });

  it('emits warning when exit wall archway clashes with signpost or item at (exit.x, exit.y - 1)', () => {
    const clashingLevel = {
      ...baseLevel,
      exit: { x: 2, y: 1, style: 'wall_archway', wallDirection: 'north' },
      entities: [
        {
          id: 'sign_exit_lore',
          type: 'signpost',
          x: 2,
          y: 0,
        },
      ],
    };

    const report = LevelValidator.validate(clashingLevel);
    const clashWarning = report.warnings.find(w => w.message.includes('Exit wall archway at (2, 1) clashes with entity "sign_exit_lore"'));
    assert(clashWarning !== undefined, 'Must detect exit archway clash');
  });

  it('emits warning when wall_doorway has no adjacent North wall to anchor to', () => {
    const noWallLevel = {
      ...baseLevel,
      spawn: { x: 2, y: 2, style: 'wall_doorway', wallDirection: 'north' }, // (2, 1) is floor 0!
    };

    const report = LevelValidator.validate(noWallLevel);
    const noWallWarning = report.warnings.find(w => w.message.includes('is not a wall'));
    assert(noWallWarning !== undefined, 'Must warn that anchor tile is not a wall');
  });

  it('EntityInspector suggests wall_doorway when clean North wall is available', () => {
    const modalEl = {
      querySelector: () => null,
      querySelectorAll: () => [],
      appendChild: () => {},
    };
    const inspector = new EntityInspector({
      modalContainer: modalEl,
      onUpdate: () => {},
      onDelete: () => {},
      onStartPickTarget: () => {},
    });

    inspector.levelRef = JSON.parse(JSON.stringify(baseLevel));
    const spawnEntity = { type: 'spawn', x: 2, y: 1, style: 'stairs_down', wallDirection: 'none' };
    const mockContainer = {
      querySelector: () => ({ value: 'none' }),
    };

    inspector.applySmartArchitectureSuggestion(spawnEntity, 'spawn', mockContainer);
    assertEqual(spawnEntity.style, 'wall_doorway', 'Suggests wall_doorway when North wall is clean');
    assertEqual(spawnEntity.wallDirection, 'north', 'Suggests north wall direction');
  });

  it('EntityInspector falls back to freestanding stairs when North wall has an entity clash', () => {
    const modalEl = {
      querySelector: () => null,
      querySelectorAll: () => [],
      appendChild: () => {},
    };
    const inspector = new EntityInspector({
      modalContainer: modalEl,
      onUpdate: () => {},
      onDelete: () => {},
      onStartPickTarget: () => {},
    });

    const levelWithClash = JSON.parse(JSON.stringify(baseLevel));
    levelWithClash.entities = [
      { id: 'clashing_decor', type: 'wall_decor', x: 2, y: 0 },
    ];
    inspector.levelRef = levelWithClash;

    const spawnEntity = { type: 'spawn', x: 2, y: 1, style: 'wall_doorway', wallDirection: 'north' };
    const mockContainer = {
      querySelector: () => ({ value: 'north' }),
    };

    inspector.applySmartArchitectureSuggestion(spawnEntity, 'spawn', mockContainer);
    assertEqual(spawnEntity.style, 'stairs_down', 'Falls back to stairs_down due to wall clash');
    assertEqual(spawnEntity.wallDirection, 'none', 'Direction falls back to none');
  });
});
