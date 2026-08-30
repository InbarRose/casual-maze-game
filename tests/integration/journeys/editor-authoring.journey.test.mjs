/**
 * User Journey 3: Dungeon Architect Level Creation, Debugging & Export
 * Simulates a creator authoring a level in the editor, catching errors via LevelValidator,
 * fixing deadlocks, testing drafts, and exporting canonical JSON.
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { StorageManager } from '../../../js/core/storage.js';
import { JsonExporter } from '../../../js/editor/json-exporter.js';
import { resetStorageMocks } from '../../harness/mocks.mjs';

describe('User Journey > Dungeon Architect Authoring & Validation', () => {
  it('guides a creator from empty canvas through error detection, fixing, and clean export', () => {
    resetStorageMocks();

    // 1. Creator creates an initial 10x10 maze layout
    const authoringLevel = {
      id: 'custom_labyrinth_01',
      title: 'Architect Chamber',
      author: 'Master Builder',
      dimensions: { width: 10, height: 10 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 8, y: 8 },
      theme: 'cave',
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 0, 1, 0, 1, 1, 1, 1, 0, 1], // Open path at (3, 2)
          [1, 0, 1, 0, 0, 0, 0, 1, 0, 1], // Open path at (3..6, 3)
          [1, 0, 1, 0, 1, 1, 0, 1, 0, 1], // Barrier with wall at (4, 4)
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Full dividing wall
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
      },
      entities: [],
    };

    // Step A: Validator catches blocked exit
    let report = LevelValidator.validate(authoringLevel);
    assertEqual(report.valid, false, 'Initial blocked level is invalid');
    assert(report.errors.some(e => e.message.includes('UNREACHABLE')), 'Catches unreachable exit');

    // Step B: Creator cuts a doorway at (4, 5) and opens corridor at (4, 4), and places a locked Ruby Gate without a key
    authoringLevel.layers.ground[4][4] = 0;
    authoringLevel.layers.ground[5][4] = 0;
    authoringLevel.entities.push({
      id: 'door_ruby_main',
      type: 'door',
      x: 4,
      y: 5,
      requiresKey: 'key_ruby_main',
      color: '#f43f5e',
    });

    report = LevelValidator.validate(authoringLevel);
    assertEqual(report.valid, false);
    assert(report.errors.some(e => e.message.includes('no such key exists')), 'Catches missing key');

    // Step C: Creator places the key on the wrong side (behind the door at (4, 7)) -> DEADLOCK
    authoringLevel.entities.push({
      id: 'key_ruby_main',
      type: 'key',
      x: 4,
      y: 7,
      color: '#f43f5e',
      name: 'Ruby Key',
    });

    report = LevelValidator.validate(authoringLevel);
    assertEqual(report.valid, false);
    assert(report.errors.some(e => e.message.includes('unreachable before unlocking this door')), 'Catches key-behind-door deadlock');

    // Step D: Creator moves the key to the accessible starting chamber at (3, 3)
    const keyEntity = authoringLevel.entities.find(e => e.id === 'key_ruby_main');
    keyEntity.x = 3;
    keyEntity.y = 3;

    report = LevelValidator.validate(authoringLevel);
    assertEqual(report.valid, true, 'Level is now fully valid and solvable');
    assertEqual(report.errors.length, 0);
    assertEqual(report.stats.exitReached, true);

    // Step E: Creator adds an optional secret lever
    authoringLevel.entities.push({
      id: 'lever_shortcut',
      type: 'lever',
      x: 1,
      y: 3,
      state: false,
      targets: [
        { action: 'toggle_tile', layer: 'ground', x: 1, y: 5, stateA: 0, stateB: 1 },
      ],
    });

    report = LevelValidator.validate(authoringLevel);
    assertEqual(report.valid, true, 'Level with lever remains valid');

    // Step F: Creator saves editor draft and reloads
    StorageManager.saveEditorDraft(authoringLevel);
    const draft = StorageManager.loadEditorDraft();
    assertEqual(draft.title, 'Architect Chamber');
    assertEqual(draft.entities.length, 3);

    // Step G: Export and re-import via LevelLoader
    const rawExport = JSON.stringify(draft);
    const reloaded = JsonExporter.importFromText(rawExport);
    assertEqual(reloaded.id, 'custom_labyrinth_01');
    assertEqual(reloaded.entities.length, 3);
  });
});
