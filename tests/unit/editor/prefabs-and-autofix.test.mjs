/**
 * Unit Tests: Map Editor Prefabs, One-Click Auto-Fixer & Layer Switcher HUD (BL-20, BL-21, BL-22)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { PREFABS, stampPrefab } from '../../../js/editor/prefabs.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { EditorCanvas } from '../../../js/editor/editor-canvas.js';
import { TILES, LAYERS } from '../../../js/core/constants.js';

describe('Editor > Prefabs & Architectural Stamp Palette (BL-20)', () => {
  const createEmptyLevel = (w = 15, h = 15) => ({
    id: 'test_prefab_level',
    title: 'Prefab Test Maze',
    dimensions: { width: w, height: h },
    spawn: { x: 1, y: 1, elevation: 0 },
    exit: { x: w - 2, y: h - 2, elevation: 0 },
    config: { theme: 'dungeon' },
    layers: {
      ground: Array.from({ length: h }, () => Array(w).fill(0)),
      overhead: Array.from({ length: h }, () => Array(w).fill(0)),
    },
    entities: [],
  });

  it('contains all 6 canonical architectural prefabs in catalog', () => {
    const expectedPrefabs = [
      'bridge_crossing',
      'vault_gate',
      'chamber_room',
      'cross_intersection',
      'puzzle_sanctum',
      'switch_hub',
    ];

    for (const id of expectedPrefabs) {
      assert(PREFABS[id] !== undefined, `Prefab "${id}" exists in PREFABS catalog`);
      assert(PREFABS[id].width > 0, `Prefab "${id}" has valid width`);
      assert(PREFABS[id].height > 0, `Prefab "${id}" has valid height`);
      assert(Array.isArray(PREFABS[id].layers.ground), `Prefab "${id}" defines ground layer`);
    }
  });

  it('stamps bridge_crossing (5x5) with bridge deck, ramps, and clear ground corridor', () => {
    const level = createEmptyLevel(15, 15);
    const result = stampPrefab(level, 'bridge_crossing', 3, 3);

    assertEqual(result.success, true);
    assert(result.stampedCount > 0, 'Stamped ground tiles');

    // Origin (3,3):
    // (5, 3) should have RAMP_S (y = 3, x = 3+2 = 5)
    assertEqual(level.layers.ground[3][5], TILES.RAMP_S, 'North approach ramp placed');
    // (5, 5) should have BRIDGE_EW on ground and overhead
    assertEqual(level.layers.ground[5][5], TILES.BRIDGE_EW, 'East-West bridge placed on ground');
    assertEqual(level.layers.overhead[5][5], TILES.BRIDGE_EW, 'East-West bridge placed on overhead');
    // (5, 7) should have RAMP_N
    assertEqual(level.layers.ground[7][5], TILES.RAMP_N, 'South approach ramp placed');
    // E-W ground corridor (3, 5) and (7, 5) are open floor (0)
    assertEqual(level.layers.ground[5][3], 0, 'East-West ground corridor floor open');
    assertEqual(level.layers.ground[5][7], 0, 'East-West ground corridor floor open');
  });

  it('stamps vault_gate (5x3) and pairs door with matching key UUID', () => {
    const level = createEmptyLevel(15, 15);
    const result = stampPrefab(level, 'vault_gate', 2, 2);

    assertEqual(result.success, true);
    assertEqual(result.entitiesCreated, 2);

    const door = level.entities.find(e => e.type === 'door');
    const key = level.entities.find(e => e.type === 'key');

    assert(door !== undefined, 'Vault door instantiated');
    assert(key !== undefined, 'Vault key instantiated');
    assertEqual(door.requiresKey, key.id, 'Door requiresKey matches the generated key id');
    assertEqual(door.x, 4); // 2 + 2
    assertEqual(door.y, 3); // 2 + 1
    assertEqual(key.x, 2);  // 2 + 0
    assertEqual(key.y, 2);  // 2 + 0
  });

  it('stamps puzzle_sanctum and links pedestal, relic, and gate', () => {
    const level = createEmptyLevel(15, 15);
    const result = stampPrefab(level, 'puzzle_sanctum', 4, 4);

    assertEqual(result.success, true);
    assertEqual(result.entitiesCreated, 3);

    const pedestal = level.entities.find(e => e.type === 'pedestal');
    const relic = level.entities.find(e => e.type === 'riddle_item');
    const gate = level.entities.find(e => e.type === 'door');

    assert(pedestal !== undefined, 'Pedestal instantiated');
    assert(relic !== undefined, 'Relic instantiated');
    assert(gate !== undefined, 'Sanctum gate instantiated');

    assertEqual(pedestal.acceptedItemId, relic.id, 'Pedestal accepts generated relic id');
    assertEqual(pedestal.targetDoorId, gate.id, 'Pedestal unlocks generated gate id');
  });

  it('stamps switch_hub and resolves relative lever target coordinates', () => {
    const level = createEmptyLevel(15, 15);
    const result = stampPrefab(level, 'switch_hub', 2, 2);

    assertEqual(result.success, true);
    assertEqual(result.entitiesCreated, 1);

    const lever = level.entities.find(e => e.type === 'lever');
    assert(lever !== undefined, 'Clockwork lever instantiated');
    assertEqual(lever.x, 3); // 2 + 1
    assertEqual(lever.y, 3); // 2 + 1
    assert(Array.isArray(lever.targets), 'Lever targets array created');
    assertEqual(lever.targets.length, 1);
    assertEqual(lever.targets[0].x, 4); // 2 + 2
    assertEqual(lever.targets[0].y, 3); // 2 + 1
  });

  it('safely handles stamping near boundaries without crashing', () => {
    const level = createEmptyLevel(10, 10);
    // Stamp partly off-grid at (8, 8) with a 5x5 prefab
    const result = stampPrefab(level, 'bridge_crossing', 8, 8);
    assertEqual(result.success, true);
    assert(result.stampedCount > 0, 'Partially stamped in-bounds tiles');
  });
});

describe('Editor > One-Click Diagnostic Auto-Fixer (BL-21)', () => {
  it('repairs missing spawn and exit points on open floor', () => {
    const brokenLevel = {
      title: 'Broken Level',
      dimensions: { width: 11, height: 11 },
      layers: {
        ground: Array.from({ length: 11 }, () => Array(11).fill(0)),
        overhead: Array.from({ length: 11 }, () => Array(11).fill(0)),
      },
      entities: [],
    };

    const { fixedLevel, changes, fixedCount } = LevelValidator.autoFix(brokenLevel);

    assert(fixedCount >= 2, 'Applied at least 2 fixes (spawn and exit)');
    assert(fixedLevel.spawn !== undefined, 'Created missing spawn');
    assert(fixedLevel.exit !== undefined, 'Created missing exit');
    assert(changes.some(c => c.includes('spawn point')), 'Changelog reports spawn creation');
    assert(changes.some(c => c.includes('exit point')), 'Changelog reports exit creation');
  });

  it('relocates out-of-bounds spawn and exit points', () => {
    const brokenLevel = {
      dimensions: { width: 10, height: 10 },
      spawn: { x: -5, y: 99 },
      exit: { x: 50, y: -2 },
      layers: {
        ground: Array.from({ length: 10 }, () => Array(10).fill(0)),
        overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
      },
      entities: [],
    };

    const { fixedLevel, changes } = LevelValidator.autoFix(brokenLevel);

    assert(fixedLevel.spawn.x >= 0 && fixedLevel.spawn.x < 10, 'Spawn X is in bounds');
    assert(fixedLevel.spawn.y >= 0 && fixedLevel.spawn.y < 10, 'Spawn Y is in bounds');
    assert(fixedLevel.exit.x >= 0 && fixedLevel.exit.x < 10, 'Exit X is in bounds');
    assert(fixedLevel.exit.y >= 0 && fixedLevel.exit.y < 10, 'Exit Y is in bounds');
    assert(changes.some(c => c.includes('out-of-bounds spawn')), 'Changelog records spawn relocation');
    assert(changes.some(c => c.includes('out-of-bounds exit')), 'Changelog records exit relocation');
  });

  it('clears solid walls encasing entities and spawn points', () => {
    const brokenLevel = {
      dimensions: { width: 10, height: 10 },
      spawn: { x: 2, y: 2 },
      exit: { x: 8, y: 8 },
      layers: {
        ground: Array.from({ length: 10 }, () => Array(10).fill(0)),
        overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
      },
      entities: [
        { id: 'key_1', type: 'key', name: 'Walled Key', x: 4, y: 4, elevation: 0 },
      ],
    };

    // Encasing wall at spawn and key
    brokenLevel.layers.ground[2][2] = TILES.WALL;
    brokenLevel.layers.ground[4][4] = TILES.WALL;

    const { fixedLevel, changes } = LevelValidator.autoFix(brokenLevel);

    assertEqual(fixedLevel.layers.ground[2][2], 0, 'Wall at spawn cleared to floor');
    assertEqual(fixedLevel.layers.ground[4][4], 0, 'Wall at key cleared to floor');
    assert(changes.some(c => c.includes('Cleared wall blocking spawn point')), 'Changelog records spawn wall clearing');
    assert(changes.some(c => c.includes('Cleared solid wall')), 'Changelog records entity wall clearing');
  });

  it('generates missing keys for orphaned locked doors', () => {
    const brokenLevel = {
      dimensions: { width: 10, height: 10 },
      spawn: { x: 1, y: 1 },
      exit: { x: 8, y: 8 },
      layers: {
        ground: Array.from({ length: 10 }, () => Array(10).fill(0)),
        overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
      },
      entities: [
        { id: 'vault_door_1', type: 'door', name: 'Orphaned Door', requiresKey: 'missing_key_id', x: 5, y: 5 },
      ],
    };

    const { fixedLevel, changes } = LevelValidator.autoFix(brokenLevel);

    const generatedKey = fixedLevel.entities.find(e => e.id === 'missing_key_id');
    assert(generatedKey !== undefined, 'Generated matching key entity');
    assertEqual(generatedKey.type, 'key');
    assert(changes.some(c => c.includes('Generated missing key')), 'Changelog logs key creation');
  });

  it('installs approach ramps for multi-elevation bridges missing ramps', () => {
    const brokenLevel = {
      dimensions: { width: 10, height: 10 },
      spawn: { x: 1, y: 1 },
      exit: { x: 8, y: 8 },
      layers: {
        ground: Array.from({ length: 10 }, () => Array(10).fill(0)),
        overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
      },
      entities: [],
    };

    // Install an East-West bridge at (5, 5) with no ramps
    brokenLevel.layers.ground[5][5] = TILES.BRIDGE_EW;
    brokenLevel.layers.overhead[5][5] = TILES.BRIDGE_EW;

    const { fixedLevel, changes } = LevelValidator.autoFix(brokenLevel);

    assertEqual(fixedLevel.layers.ground[4][5], TILES.RAMP_S, 'Installed North approach ramp (R_S)');
    assertEqual(fixedLevel.layers.ground[6][5], TILES.RAMP_N, 'Installed South approach ramp (R_N)');
    assert(changes.some(c => c.includes('Added North approach ramp')), 'Changelog records ramp addition');
  });

  it('filters out-of-bounds lever targets', () => {
    const brokenLevel = {
      dimensions: { width: 10, height: 10 },
      spawn: { x: 1, y: 1 },
      exit: { x: 8, y: 8 },
      layers: {
        ground: Array.from({ length: 10 }, () => Array(10).fill(0)),
        overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
      },
      entities: [
        {
          id: 'lever_test',
          type: 'lever',
          x: 3,
          y: 3,
          targets: [
            { x: 5, y: 5 },     // In bounds
            { x: 99, y: 50 },   // Out of bounds
            { x: -1, y: 2 },    // Out of bounds
          ],
        },
      ],
    };

    const { fixedLevel, changes } = LevelValidator.autoFix(brokenLevel);

    const lever = fixedLevel.entities.find(e => e.id === 'lever_test');
    assertEqual(lever.targets.length, 1, 'Only in-bounds target remains');
    assertEqual(lever.targets[0].x, 5);
    assert(changes.some(c => c.includes('out-of-bounds target(s)')), 'Changelog records target cleanup');
  });

  it('carves connecting corridor when exit is blocked by solid wall', () => {
    const blockedLevel = {
      dimensions: { width: 9, height: 9 },
      spawn: { x: 1, y: 1 },
      exit: { x: 7, y: 7 },
      layers: {
        // Enclose exit in a solid wall barrier
        ground: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 9 }, () => Array(9).fill(0)),
      },
      entities: [],
    };

    const initialReach = LevelValidator.checkReachability(blockedLevel);
    assertEqual(initialReach.exitReached, false, 'Exit starts unreachable');

    const { fixedLevel, changes } = LevelValidator.autoFix(blockedLevel);

    const fixedReach = LevelValidator.checkReachability(fixedLevel);
    assertEqual(fixedReach.exitReached, true, 'Exit is now reachable after auto-fix');
    assert(changes.some(c => c.includes('Carved connecting corridor')), 'Changelog records corridor carve');
  });
});

describe('Editor > Layer Switcher HUD & View Modes (BL-22)', () => {
  const createMockCanvas = () => ({
    width: 600,
    height: 400,
    getContext: () => ({
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      fillText: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      clearRect: () => {},
      setLineDash: () => {},
      measureText: () => ({ width: 60 }),
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 400 }),
    style: {},
  });

  const createLevel = () => ({
    dimensions: { width: 10, height: 10 },
    spawn: { x: 1, y: 1 },
    exit: { x: 8, y: 8 },
    config: { theme: 'dungeon' },
    layers: {
      ground: Array.from({ length: 10 }, () => Array(10).fill(0)),
      overhead: Array.from({ length: 10 }, () => Array(10).fill(0)),
    },
    entities: [],
  });

  it('updates layerViewMode to focus, all, and solo', () => {
    const editorCanvas = new EditorCanvas({ canvas: createMockCanvas(), level: createLevel() });

    assertEqual(editorCanvas.layerViewMode, 'focus');

    editorCanvas.setLayerViewMode('all');
    assertEqual(editorCanvas.layerViewMode, 'all');

    editorCanvas.setLayerViewMode('solo');
    assertEqual(editorCanvas.layerViewMode, 'solo');

    editorCanvas.setLayerViewMode('focus');
    assertEqual(editorCanvas.layerViewMode, 'focus');
  });

  it('switches between Ground and Overhead layers', () => {
    const editorCanvas = new EditorCanvas({ canvas: createMockCanvas(), level: createLevel() });

    assertEqual(editorCanvas.activeLayer, LAYERS.GROUND);

    editorCanvas.setActiveLayer(LAYERS.OVERHEAD);
    assertEqual(editorCanvas.activeLayer, LAYERS.OVERHEAD);

    editorCanvas.setActiveLayer(LAYERS.GROUND);
    assertEqual(editorCanvas.activeLayer, LAYERS.GROUND);
  });

  it('manages prefab tool state and clears on tile/entity change', () => {
    const mockCanvas = createMockCanvas();
    const editorCanvas = new EditorCanvas({ canvas: mockCanvas, level: createLevel() });

    editorCanvas.setPrefab('bridge_crossing');
    assertEqual(editorCanvas.currentTool, 'prefab');
    assertEqual(editorCanvas.selectedPrefab, 'bridge_crossing');
    assertEqual(mockCanvas.style.cursor, 'crosshair');

    // Selecting a tile resets selectedPrefab
    editorCanvas.setSelectedTile(TILES.WALL);
    assertEqual(editorCanvas.selectedPrefab, null);
    assertEqual(editorCanvas.currentTool, 'pencil');

    // Selecting prefab again
    editorCanvas.setPrefab('vault_gate');
    assertEqual(editorCanvas.selectedPrefab, 'vault_gate');

    // Selecting an entity resets selectedPrefab
    editorCanvas.setSelectedEntity('key', { color: '#fbbf24' });
    assertEqual(editorCanvas.selectedPrefab, null);
    assertEqual(editorCanvas.currentTool, 'pencil');
  });
});
