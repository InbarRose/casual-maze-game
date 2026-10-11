/**
 * Unit Test Suite: Custom Prefab Persistence, Capturing & Stamping (BL-39)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import {
  PREFABS,
  stampPrefab,
  getCustomPrefabs,
  getCustomPrefab,
  saveCustomPrefab,
  deleteCustomPrefab,
  clearCustomPrefabs,
  captureLevelRegionAsPrefab,
  CUSTOM_PREFABS_STORAGE_KEY,
} from '../../../js/editor/prefabs.js';

describe('Editor > Custom Prefab Persistence & Stamping (BL-39)', () => {
  // Ensure mock localStorage exists in headless test runner
  if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => store.get(k) || null,
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    };
  }

  it('saves and retrieves custom prefabs from storage', () => {
    clearCustomPrefabs();
    assertEqual(getCustomPrefabs().length, 0);

    const prefabDef = {
      name: 'Hidden Alcove',
      description: 'Secret alcove with chest or relic',
      width: 3,
      height: 3,
      layers: {
        ground: [
          [1, 0, 1],
          [1, 0, 1],
          [1, 0, 1],
        ],
      },
      entities: [
        { type: 'bonus_item', relX: 1, relY: 1, name: 'Gem' }
      ],
    };

    const saved = saveCustomPrefab(prefabDef);
    assert(saved.id.startsWith('custom_'), 'Custom prefab id should start with custom_');
    assert(saved.isCustom, 'isCustom flag should be true');
    assertEqual(saved.width, 3);
    assertEqual(saved.height, 3);

    const all = getCustomPrefabs();
    assertEqual(all.length, 1);
    assertEqual(all[0].name, 'Hidden Alcove');

    const retrieved = getCustomPrefab(saved.id);
    assertEqual(retrieved.name, 'Hidden Alcove');
    assertEqual(retrieved.entities.length, 1);
    assertEqual(retrieved.entities[0].name, 'Gem');
  });

  it('validates required fields on saveCustomPrefab', () => {
    let threw = false;
    try {
      saveCustomPrefab({ name: 'Incomplete' });
    } catch (err) {
      threw = true;
    }
    assert(threw, 'Should throw error when layers missing');
  });

  it('updates existing custom prefab when same ID is provided', () => {
    clearCustomPrefabs();
    const initial = saveCustomPrefab({
      id: 'custom_fixed_1',
      name: 'Version 1',
      layers: { ground: [[0]] },
    });
    assertEqual(initial.name, 'Version 1');
    assertEqual(getCustomPrefabs().length, 1);

    const updated = saveCustomPrefab({
      id: 'custom_fixed_1',
      name: 'Version 2',
      layers: { ground: [[1]] },
    });
    assertEqual(updated.name, 'Version 2');
    assertEqual(getCustomPrefabs().length, 1);
    assertEqual(getCustomPrefab('custom_fixed_1').name, 'Version 2');
  });

  it('deletes custom prefabs cleanly', () => {
    clearCustomPrefabs();
    const p1 = saveCustomPrefab({ id: 'p1', name: 'Module A', layers: { ground: [[0]] } });
    const p2 = saveCustomPrefab({ id: 'p2', name: 'Module B', layers: { ground: [[0]] } });
    assertEqual(getCustomPrefabs().length, 2);

    deleteCustomPrefab('p1');
    assertEqual(getCustomPrefabs().length, 1);
    assertEqual(getCustomPrefab('p1'), null);
    assertEqual(getCustomPrefab('p2').name, 'Module B');
  });

  it('captures arbitrary level regions into reusable custom prefabs', () => {
    clearCustomPrefabs();
    const level = {
      dimensions: { width: 10, height: 10 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
      },
      entities: [
        { type: 'lever', x: 2, y: 1, z: 0, name: 'Lever In Region' },
        { type: 'lever', x: 8, y: 8, z: 0, name: 'Lever Outside' },
      ],
    };

    const captured = captureLevelRegionAsPrefab(level, 'Captured Room', 1, 1, 3, 2);
    assertEqual(captured.name, 'Captured Room');
    assertEqual(captured.width, 3);
    assertEqual(captured.height, 2);
    assertEqual(captured.layers.ground.length, 2);
    assertEqual(captured.layers.ground[0].length, 3);
    assertEqual(captured.layers.ground[0][0], 0); // gx=1, gy=1
    assertEqual(captured.layers.overhead[0][0], 2); // gx=1, gy=1

    // Entity coordinates must be converted to relative offsets
    assertEqual(captured.entities.length, 1);
    assertEqual(captured.entities[0].name, 'Lever In Region');
    assertEqual(captured.entities[0].relX, 1); // 2 - 1 = 1
    assertEqual(captured.entities[0].relY, 0); // 1 - 1 = 0
  });

  it('stamps custom prefabs onto level with resolution of relative entities', () => {
    clearCustomPrefabs();
    const customPrefab = saveCustomPrefab({
      name: 'Guard Post',
      width: 3,
      height: 3,
      layers: {
        ground: [
          [0, 0, 0],
          [0, 1, 0],
          [0, 0, 0],
        ],
      },
      entities: [
        { type: 'lever', relX: 0, relY: 1, z: 0, name: 'Guard Switch' },
      ],
    });

    const targetLevel = {
      dimensions: { width: 10, height: 10 },
      layers: {
        ground: Array.from({ length: 10 }, () => Array(10).fill(1)),
        overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
      },
      entities: [],
    };

    const result = stampPrefab(targetLevel, customPrefab.id, 4, 4);
    assert(result.success, 'Stamping custom prefab should succeed');
    assertEqual(result.stampedCount, 9);
    assertEqual(result.entitiesCreated, 1);

    // Verify ground stamped
    assertEqual(targetLevel.layers.ground[4][4], 0);
    assertEqual(targetLevel.layers.ground[5][5], 1); // center is 1

    // Verify entity placed at absolute coordinates
    assertEqual(targetLevel.entities.length, 1);
    const placed = targetLevel.entities[0];
    assertEqual(placed.name, 'Guard Switch');
    assertEqual(placed.x, 4); // 4 + 0
    assertEqual(placed.y, 5); // 4 + 1
  });
});
