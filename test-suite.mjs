/**
 * Test Suite for Casual Maze Game Engine
 */

import { TILES, ELEVATION, FOG_STATE, ENTITY_TYPES, THEMES, ZONES, KEY_COLOR_PRESETS, LEVER_TILE_OPTIONS } from './js/core/constants.js';
import { PRNG } from './js/core/prng.js';
import { EventBus } from './js/core/events.js';
import { CollisionEngine } from './js/engine/collision.js';
import { FogOfWar } from './js/engine/fog.js';
import { Camera } from './js/engine/camera.js';
import { Key } from './js/entities/key.js';
import { Door } from './js/entities/door.js';
import { Lever } from './js/entities/lever.js';
import { Player } from './js/entities/player.js';
import { LevelLoader } from './js/levels/level-loader.js';
import { CAMPAIGN_LEVELS, TUTORIAL_LEVELS } from './js/levels/default-levels.js';
import { GameLoop } from './js/engine/game-loop.js';
import { GameRenderer } from './js/engine/renderer.js';
import { Minimap } from './js/engine/minimap.js';
import { JsonExporter } from './js/editor/json-exporter.js';
import { DebugLogger } from './js/engine/debug-logger.js';
import { StorageManager } from './js/core/storage.js';
import { LevelValidator } from './js/editor/level-validator.js';

// Polyfill localStorage & sessionStorage for Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}
if (typeof globalThis.sessionStorage === 'undefined') {
  const store = new Map();
  globalThis.sessionStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== RUNNING CASUAL MAZE GAME TESTS ===\n');

// 1. Test PRNG
console.log('[1] Testing PRNG...');
const prng1 = new PRNG(12345);
const prng2 = new PRNG(12345);
const v1 = prng1.next();
const v2 = prng2.next();
assert(v1 === v2, `PRNG deterministic float matching: ${v1}`);
assert(prng1.randInt(5, 10) >= 5 && prng1.randInt(5, 10) <= 10, 'PRNG randInt within range [5, 10]');
const arr = [1, 2, 3, 4, 5];
const shuffled = prng1.shuffle(arr);
assert(shuffled.length === 5 && shuffled.includes(3), 'PRNG shuffle preserves elements');

// 2. Test EventBus
console.log('\n[2] Testing EventBus...');
const bus = new EventBus();
let eventReceived = null;
bus.on('test:event', (data) => { eventReceived = data; });
bus.emit('test:event', { foo: 'bar' });
assert(eventReceived && eventReceived.foo === 'bar', 'EventBus delivered emitted data');

let onceCount = 0;
bus.once('test:once', () => { onceCount++; });
bus.emit('test:once');
bus.emit('test:once');
assert(onceCount === 1, 'EventBus once triggered exactly once');

import fs from 'fs';

for (let i = 1; i <= 10; i++) {
  const jsonPath = `./levels/level_${i}.json`;
  assert(fs.existsSync(jsonPath), `File ${jsonPath} exists on disk`);
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const norm = LevelLoader.normalizeLevel(raw);
  assert(norm.dimensions.width > 0 && norm.dimensions.height > 0, `JSON Level ${i} has valid dimensions`);
  assert(norm.layers.ground.length === norm.dimensions.height, `JSON Level ${i} ground layer matches height`);
  assert(norm.layers.ground[0].length === norm.dimensions.width, `JSON Level ${i} ground layer matches width`);
  assert(norm.spawn && norm.spawn.x !== undefined, `JSON Level ${i} has valid spawn point`);
  assert(norm.exit && norm.exit.x !== undefined, `JSON Level ${i} has valid exit point`);
}

for (let i = 1; i <= 6; i++) {
  const jsonPath = `./levels/tutorial_${i}.json`;
  assert(fs.existsSync(jsonPath), `File ${jsonPath} exists on disk`);
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const norm = LevelLoader.normalizeLevel(raw);
  assert(norm.dimensions.width > 0 && norm.dimensions.height > 0, `JSON Tutorial ${i} has valid dimensions`);
  assert(norm.layers.ground.length === norm.dimensions.height, `JSON Tutorial ${i} ground layer matches height`);
  assert(norm.layers.ground[0].length === norm.dimensions.width, `JSON Tutorial ${i} ground layer matches width`);
  assert(norm.spawn && norm.spawn.x !== undefined, `JSON Tutorial ${i} has valid spawn point`);
  assert(norm.exit && norm.exit.x !== undefined, `JSON Tutorial ${i} has valid exit point`);
}

const manifestPath = './levels/manifest.json';
assert(fs.existsSync(manifestPath), 'levels/manifest.json exists');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(Array.isArray(manifest) && manifest.length === 16, 'manifest.json lists 16 levels (6 tutorial + 10 campaign across zones)');
assert(manifest.every(m => m.zone !== undefined), 'manifest.json all entries have zone property');

// 4. Test Collision Engine & Elevation Mechanics
console.log('\n[4] Testing Collision Engine & Elevation Mechanics...');
const testLevel = {
  dimensions: { width: 10, height: 10 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 'B_EW', 0, 'R_E', 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    overhead: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 'B_EW', 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]
  },
  entities: [
    { id: 'key_1', type: 'key', x: 1, y: 1, color: '#fbbf24' },
    { id: 'door_1', type: 'door', x: 2, y: 1, requiresKey: 'key_1', isOpen: false }
  ]
};

// Test wall collision
const moveIntoWall = CollisionEngine.checkMove(1, 1, 1, 0, ELEVATION.GROUND, testLevel);
assert(!moveIntoWall.allowed, 'Movement into wall blocked');

// Test floor movement
const moveOnFloor = CollisionEngine.checkMove(1, 2, 2, 2, ELEVATION.GROUND, testLevel);
assert(moveOnFloor.allowed, 'Movement on open floor allowed');

// Test locked door without key
const moveIntoLockedDoor = CollisionEngine.checkMove(1, 1, 2, 1, ELEVATION.GROUND, testLevel, testLevel.entities, []);
assert(!moveIntoLockedDoor.allowed && moveIntoLockedDoor.reason === 'door_locked', 'Movement into locked door without key blocked');

// Test locked door with matching key
const moveIntoDoorWithKey = CollisionEngine.checkMove(1, 1, 2, 1, ELEVATION.GROUND, testLevel, testLevel.entities, ['key_1']);
assert(moveIntoDoorWithKey.allowed && moveIntoDoorWithKey.doorToUnlock !== null, 'Door unlocked when possessing key');

// Test multi-colored doors & keys (Red, Blue, Green)
const multiDoorLevel = {
  dimensions: { width: 5, height: 5 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ],
    overhead: Array.from({ length: 5 }, () => Array(5).fill(0)),
  },
  entities: []
};
const multiKeyEntities = [
  new Key({ id: 'key_red', x: 0, y: 0, color: '#f43f5e', name: 'Ruby Key' }),
  new Key({ id: 'key_blue', x: 0, y: 0, color: '#38bdf8', name: 'Sapphire Key' }),
  new Key({ id: 'key_green', x: 0, y: 0, color: '#34d399', name: 'Emerald Key' }),
  new Door({ id: 'door_red', x: 2, y: 1, requiresKey: 'key_red', color: '#f43f5e' }),
  new Door({ id: 'door_blue', x: 3, y: 1, requiresKey: 'key_blue', color: '#38bdf8' }),
];
const redDoorWithoutKey = CollisionEngine.checkMove(1, 1, 2, 1, ELEVATION.GROUND, multiDoorLevel, multiKeyEntities, ['key_blue']);
assert(!redDoorWithoutKey.allowed && redDoorWithoutKey.reason === 'door_locked', 'Red door is NOT unlocked by possessing only Sapphire (Blue) Key');

const redDoorWithCorrectKey = CollisionEngine.checkMove(1, 1, 2, 1, ELEVATION.GROUND, multiDoorLevel, multiKeyEntities, ['key_red']);
assert(redDoorWithCorrectKey.allowed && redDoorWithCorrectKey.doorToUnlock.id === 'door_red', 'Red door successfully unlocked by Ruby Key');

const blueDoorWithCorrectKey = CollisionEngine.checkMove(2, 1, 3, 1, ELEVATION.GROUND, multiDoorLevel, multiKeyEntities, ['key_red', 'key_blue']);
assert(blueDoorWithCorrectKey.allowed && blueDoorWithCorrectKey.doorToUnlock.id === 'door_blue', 'Blue door successfully unlocked with matching inventory');

// Test Bridge B_EW on Ground (E-W allowed, N-S blocked)
const bridgeEWGroundE = CollisionEngine.checkMove(4, 1, 5, 1, ELEVATION.GROUND, testLevel);
assert(bridgeEWGroundE.allowed, 'B_EW allows Eastward crossing under bridge on Ground');

const bridgeEWGroundN = CollisionEngine.checkMove(5, 2, 5, 1, ELEVATION.GROUND, testLevel);
assert(!bridgeEWGroundN.allowed, 'B_EW blocks Northward crossing on Ground');

// Test Ramp R_E (Moving East climbs 0 -> 1)
const rampClimb = CollisionEngine.checkMove(6, 1, 7, 1, ELEVATION.GROUND, testLevel);
assert(rampClimb.allowed && rampClimb.nextElevation === ELEVATION.OVERHEAD, 'R_E transitions player from Ground (0) to Overhead (1)');

// Test Ramp R_E side entry blocked
const rampSideEntry = CollisionEngine.checkMove(7, 2, 7, 1, ELEVATION.GROUND, testLevel);
assert(!rampSideEntry.allowed && rampSideEntry.reason === 'ramp_side_entry_blocked', 'R_E blocks Northward side entry');

// Test Ramp R_N (Moving North climbs 0 -> 1, moving South from 1 descends 1 -> 0)
const rampNLevel = {
  dimensions: { width: 5, height: 5 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1],
      [1, 0, 'B_EW', 0, 1],
      [1, 0, 'R_N', 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1]
    ],
    overhead: [
      [0, 0, 0, 0, 0],
      [0, 0, 'B_EW', 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  },
  entities: []
};

// Climb R_N North: from (2, 3) at Ground to (2, 2)
const climbRN = CollisionEngine.checkMove(2, 3, 2, 2, ELEVATION.GROUND, rampNLevel);
assert(climbRN.allowed && climbRN.nextElevation === ELEVATION.OVERHEAD, 'R_N climb North transitions 0 -> 1');

// Step from R_N North onto B_EW Overhead: from (2, 2) to (2, 1)
const stepOntoBridge = CollisionEngine.checkMove(2, 2, 2, 1, ELEVATION.OVERHEAD, rampNLevel);
assert(stepOntoBridge.allowed && stepOntoBridge.nextElevation === ELEVATION.OVERHEAD, 'Exit R_N North onto B_EW Overhead allowed');

// Descend from B_EW South onto R_N: from (2, 1) to (2, 2)
const descendOntoRN = CollisionEngine.checkMove(2, 1, 2, 2, ELEVATION.OVERHEAD, rampNLevel);
assert(descendOntoRN.allowed && descendOntoRN.nextElevation === ELEVATION.GROUND, 'Enter R_N South from Overhead descends to 0');

// Exit R_N South onto Ground floor: from (2, 2) to (2, 3)
const exitRNSouth = CollisionEngine.checkMove(2, 2, 2, 3, ELEVATION.GROUND, rampNLevel);
assert(exitRNSouth.allowed && exitRNSouth.nextElevation === ELEVATION.GROUND, 'Exit R_N South onto Ground floor allowed');

// Test Bridge B_EW on Overhead (N-S allowed, E-W blocked)
const bridgeEWOverheadNS = CollisionEngine.checkMove(5, 2, 5, 1, ELEVATION.OVERHEAD, testLevel);
assert(bridgeEWOverheadNS.allowed, 'B_EW allows North-South movement across bridge on Overhead');

const bridgeEWOverheadEW = CollisionEngine.checkMove(4, 1, 5, 1, ELEVATION.OVERHEAD, testLevel);
assert(!bridgeEWOverheadEW.allowed && bridgeEWOverheadEW.reason === 'bridge_overhead_cross_blocked', 'B_EW blocks East-West movement across railings on Overhead');

// Test Overhead Void Blocking (Prevent floating across empty overhead space)
const overheadVoidMove = CollisionEngine.checkMove(2, 2, 3, 2, ELEVATION.OVERHEAD, testLevel);
assert(!overheadVoidMove.allowed && overheadVoidMove.reason === 'no_overhead_path', 'Overhead movement into empty space (0) is blocked');

// 5. Test Lever Mechanism & Tile Mutation
console.log('\n[5] Testing Lever Mutation...');
const leverLevel = {
  dimensions: { width: 5, height: 5 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1]
    ],
    overhead: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  }
};
const lever = new Lever({
  id: 'test_lever',
  x: 1,
  y: 1,
  state: false,
  targets: [{ action: 'toggle_tile', layer: 'ground', x: 2, y: 1, stateA: 0, stateB: 1 }]
});

assert(leverLevel.layers.ground[1][2] === 1, 'Target tile initially Wall (1)');
lever.toggle(leverLevel);
assert(lever.state === true, 'Lever toggled to state true');
assert(leverLevel.layers.ground[1][2] === 0, 'Target tile mutated to Floor (0)');
lever.toggle(leverLevel);
assert(lever.state === false, 'Lever toggled back to state false');
assert(leverLevel.layers.ground[1][2] === 1, 'Target tile reverted to Wall (1)');

// 6. Test Fog of War Raycasting & Level Design Toggles
console.log('\n[6] Testing Fog of War & Level Design Toggles...');
const fog = new FogOfWar(10, 10);
assert(fog.getVisibility(5, 5) === FOG_STATE.UNEXPLORED, 'Initial fog tile is UNEXPLORED');
fog.update(5, 5, 0, testLevel.layers.ground, testLevel.layers.overhead, 3);
assert(fog.getVisibility(5, 5) === FOG_STATE.VISIBLE, 'Player position is VISIBLE');
assert(fog.isExplored(5, 5), 'Player position is marked explored');

// Test mapRevealed mode
const fogRevealed = new FogOfWar(10, 10);
fogRevealed.reset(true); // mapStartsRevealed = true
assert(fogRevealed.getVisibility(0, 0) === FOG_STATE.EXPLORED, 'mapRevealed mode initializes tiles to EXPLORED (1)');
assert(fogRevealed.getVisibility(9, 9) === FOG_STATE.EXPLORED, 'mapRevealed mode marks entire maze explored');
fogRevealed.update(2, 2, 0, testLevel.layers.ground, testLevel.layers.overhead, 2);
assert(fogRevealed.getVisibility(2, 2) === FOG_STATE.VISIBLE, 'Active LoS tile is VISIBLE (2) in mapRevealed mode');

// Test viewRadius field-of-view distance
const fogFovSmall = new FogOfWar(15, 15);
const openGround = Array.from({ length: 15 }, () => Array(15).fill(0));
const emptyOver = Array.from({ length: 15 }, () => Array(15).fill(0));
fogFovSmall.update(7, 7, 0, openGround, emptyOver, 2);
assert(fogFovSmall.getVisibility(7, 9) === FOG_STATE.VISIBLE, 'Tile at distance 2 is VISIBLE with viewRadius 2');
assert(fogFovSmall.getVisibility(7, 11) === FOG_STATE.UNEXPLORED, 'Tile at distance 4 is UNEXPLORED with viewRadius 2');

const fogFovLarge = new FogOfWar(15, 15);
fogFovLarge.update(7, 7, 0, openGround, emptyOver, 5);
assert(fogFovLarge.getVisibility(7, 11) === FOG_STATE.VISIBLE, 'Tile at distance 4 is VISIBLE with viewRadius 5');

// 7. Test Camera Viewport Math
console.log('\n[7] Testing Camera Viewport Culling...');
const cam = new Camera(800, 600, 32);
cam.snapTo(160, 160, 20, 20);
const bounds = cam.getViewportBounds(20, 20);
assert(bounds.startCol >= 0 && bounds.endCol < 20, 'Viewport culling start/end columns bounded');
assert(bounds.startRow >= 0 && bounds.endRow < 20, 'Viewport culling start/end rows bounded');

// 8. Test DebugLogger Subsystem
console.log('\n[8] Testing DebugLogger Subsystem...');
const logger = new DebugLogger(testLevel);
logger.log('game:start', { spawn: { x: 1, y: 1, elevation: 0 } }, 0);
logger.logMoveAttempt({
  fromX: 1,
  fromY: 1,
  fromElevation: 0,
  toX: 2,
  toY: 1,
  allowed: false,
  nextElevation: 0,
  reason: 'door_locked',
  elapsedMs: 250,
});
logger.logKeyCollected({
  keyId: 'key_1',
  keyName: 'Gold Key',
  color: '#fbbf24',
  atX: 1,
  atY: 1,
  inventory: ['key_1'],
  elapsedMs: 500,
});
logger.logDoorUnlocked({
  doorId: 'door_1',
  keyUsed: 'key_1',
  atX: 2,
  atY: 1,
  elapsedMs: 750,
});
logger.logElevationChange({
  fromElevation: 0,
  toElevation: 1,
  atX: 7,
  atY: 1,
  triggerTile: 'R_E',
  elapsedMs: 1200,
});
logger.logVictory({ time: 1500, steps: 10 }, 1500);

const payload = logger.buildPayload();
assert(payload.schemaVersion === '1.0.0', 'DebugLogger payload has schemaVersion 1.0.0');
assert(payload.summary.completed === true, 'DebugLogger records victory completion');
assert(payload.events.length === 6, 'DebugLogger recorded 6 events in session');
const jsonExport = logger.exportJSON();
const parsed = JSON.parse(jsonExport);
assert(parsed.sessionId && parsed.events.length === 6, 'DebugLogger exportJSON produces valid parseable JSON');

// 9. Test LevelValidator Subsystem
console.log('\n[9] Testing LevelValidator Subsystem...');
// 9a. Test valid campaign levels
for (let i = 1; i <= 10; i++) {
  const lvl = CAMPAIGN_LEVELS[i - 1];
  const report = LevelValidator.validate(lvl);
  assert(report.valid === true, `Campaign Level ${i} (${lvl.title}) passes validation (valid=true, errors=0)`);
  assert(report.stats.exitReached === true, `Campaign Level ${i} (${lvl.title}) exit is reachable via BFS`);
}

// 9b. Test valid tutorial levels
for (let i = 1; i <= 6; i++) {
  const lvl = TUTORIAL_LEVELS[i - 1];
  const report = LevelValidator.validate(lvl);
  assert(report.valid === true, `Tutorial Level ${i} (${lvl.title}) passes validation (valid=true, errors=0)`);
  assert(report.stats.exitReached === true, `Tutorial Level ${i} (${lvl.title}) exit is reachable via BFS`);
}

// 9b. Test invalid spawn inside wall
const badSpawnLevel = {
  dimensions: { width: 7, height: 7 },
  spawn: { x: 0, y: 0, elevation: 0 },
  exit: { x: 5, y: 5 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    overhead: Array.from({ length: 7 }, () => Array(7).fill(0)),
  },
  entities: [],
};
const badSpawnReport = LevelValidator.validate(badSpawnLevel);
assert(badSpawnReport.valid === false && badSpawnReport.errors.some(e => e.message.includes('wall')), 'LevelValidator catches spawn placed inside solid wall');

// 9c. Test blocked / unreachable exit
const blockedExitLevel = {
  dimensions: { width: 7, height: 7 },
  spawn: { x: 1, y: 1, elevation: 0 },
  exit: { x: 5, y: 5 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1], // Full dividing wall
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    overhead: Array.from({ length: 7 }, () => Array(7).fill(0)),
  },
  entities: [],
};
const blockedReport = LevelValidator.validate(blockedExitLevel);
assert(blockedReport.valid === false && blockedReport.errors.some(e => e.message.includes('UNREACHABLE')), 'LevelValidator flags walled-off exit as UNREACHABLE');

// 9d. Test door missing matching key
const missingKeyDoorLevel = {
  dimensions: { width: 7, height: 7 },
  spawn: { x: 1, y: 1, elevation: 0 },
  exit: { x: 5, y: 1 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    overhead: Array.from({ length: 7 }, () => Array(7).fill(0)),
  },
  entities: [
    { id: 'door_ghost', type: 'door', x: 3, y: 1, requiresKey: 'key_nonexistent' }
  ],
};
const missingKeyReport = LevelValidator.validate(missingKeyDoorLevel);
assert(missingKeyReport.valid === false && missingKeyReport.errors.some(e => e.message.includes('no such key exists')), 'LevelValidator catches door requiring non-existent key');

// 9e. Test lever with out-of-bounds target
const badLeverLevel = {
  dimensions: { width: 7, height: 7 },
  spawn: { x: 1, y: 1, elevation: 0 },
  exit: { x: 5, y: 1 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    overhead: Array.from({ length: 7 }, () => Array(7).fill(0)),
  },
  entities: [
    { id: 'lever_1', type: 'lever', x: 2, y: 1, targets: [{ x: 99, y: 99 }] }
  ],
};
const badLeverReport = LevelValidator.validate(badLeverLevel);
assert(badLeverReport.valid === false && badLeverReport.errors.some(e => e.message.includes('out-of-bounds')), 'LevelValidator catches out-of-bounds lever target');

// 9f. Test Bypassed Gate Warning (gate that can be ignored to reach the exit)
const bypassedDoorLevel = {
  dimensions: { width: 9, height: 9 },
  spawn: { x: 1, y: 1, elevation: 0 },
  exit: { x: 7, y: 7 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    overhead: Array.from({ length: 9 }, () => Array(9).fill(0))
  },
  entities: [
    { id: 'key_side', type: 'key', x: 1, y: 3, color: '#fbbf24', name: 'Side Key' },
    { id: 'door_side', type: 'door', x: 3, y: 3, requiresKey: 'key_side', color: '#fbbf24' }
  ]
};
const bypassedReport = LevelValidator.validate(bypassedDoorLevel);
assert(bypassedReport.valid === true, 'Bypassed door level is solvable');
assert(bypassedReport.warnings.some(w => w.message.includes('bypassed')), 'LevelValidator warns when a locked gate can be bypassed without unlocking');

// 9g. Test Key-Behind-Door Deadlock (key required to open door is placed behind that very door)
const deadlockDoorLevel = {
  dimensions: { width: 7, height: 7 },
  spawn: { x: 1, y: 1, elevation: 0 },
  exit: { x: 5, y: 1 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ],
    overhead: Array.from({ length: 7 }, () => Array(7).fill(0))
  },
  entities: [
    { id: 'door_blocker', type: 'door', x: 2, y: 1, requiresKey: 'key_trapped', color: '#f43f5e' },
    { id: 'key_trapped', type: 'key', x: 4, y: 1, color: '#f43f5e', name: 'Trapped Key' }
  ]
};
const deadlockReport = LevelValidator.validate(deadlockDoorLevel);
assert(deadlockReport.valid === false, 'Key-behind-door deadlock is flagged as invalid');
assert(deadlockReport.errors.some(e => e.message.includes('unreachable before unlocking this door')), 'LevelValidator catches key placed behind the locked door');

// 9h. Test Tutorial 2 Strict Solvability & Key Dependencies
const tut2 = TUTORIAL_LEVELS[1];
const tut2Report = LevelValidator.validate(tut2);
assert(tut2Report.valid === true, 'Redesigned Tutorial 2 passes validation');
assert(tut2Report.warnings.length === 0, 'Redesigned Tutorial 2 has 0 bypass warnings');
// Verify red door cannot be bypassed
const tut2NoRed = LevelValidator.analyzeReachability(tut2, new Map(tut2.entities.filter(e => e.type === 'key').map(k => [k.id, k])), tut2.entities.filter(e => e.type === 'door'), new Set(['door_red_t2']));
assert(tut2NoRed.exitReached === false, 'Tutorial 2 exit is unreachable if red gate is kept locked');
// Verify blue door cannot be bypassed
const tut2NoBlue = LevelValidator.analyzeReachability(tut2, new Map(tut2.entities.filter(e => e.type === 'key').map(k => [k.id, k])), tut2.entities.filter(e => e.type === 'door'), new Set(['door_blue_t2']));
assert(tut2NoBlue.exitReached === false, 'Tutorial 2 exit is unreachable if blue gate is kept locked');

// 10. Test StorageManager Multi-Project & Draft Persistence
console.log('\n[10] Testing StorageManager Multi-Project & Draft Persistence...');
const projectData = {
  id: 'test_project_alpha',
  title: 'Test Project Alpha',
  author: 'Architect Tester',
  dimensions: { width: 15, height: 15 },
  layers: { ground: [], overhead: [] },
  entities: [],
};

const savedId = StorageManager.saveProject(projectData);
assert(savedId === 'test_project_alpha', 'StorageManager.saveProject returns project ID');

const projectList = StorageManager.listProjects();
assert(Array.isArray(projectList) && projectList.some(p => p.id === 'test_project_alpha'), 'StorageManager.listProjects contains saved project');

const loadedProject = StorageManager.loadProject('test_project_alpha');
assert(loadedProject && loadedProject.title === 'Test Project Alpha', 'StorageManager.loadProject retrieves matching project');

StorageManager.saveEditorDraft(projectData);
const loadedDraft = StorageManager.loadEditorDraft();
assert(loadedDraft && loadedDraft.id === 'test_project_alpha' && loadedDraft._lastSaved > 0, 'StorageManager.saveEditorDraft & loadEditorDraft persist draft with timestamp');

const deleted = StorageManager.deleteProject('test_project_alpha');
assert(deleted === true, 'StorageManager.deleteProject returns true');
const afterDeleteList = StorageManager.listProjects();
assert(!afterDeleteList.some(p => p.id === 'test_project_alpha'), 'Deleted project no longer in listProjects');

// Test Tutorial Progress Storage
StorageManager.saveTutorialProgress('tutorial_1', { time: 4200, steps: 12 });
const loadedTutProg = StorageManager.loadTutorialProgress();
assert(loadedTutProg.tutorial_1 && loadedTutProg.tutorial_1.completed === true, 'StorageManager.saveTutorialProgress & loadTutorialProgress persist completion');
assert(loadedTutProg.tutorial_1.bestTime === 4200, 'StorageManager persists tutorial bestTime');

// Test saveLevelCompletion routing for tutorial levels
StorageManager.saveLevelCompletion('tutorial_2', 3800, 10);
const updatedTutProg = StorageManager.loadTutorialProgress();
assert(updatedTutProg.tutorial_2 && updatedTutProg.tutorial_2.completed === true, 'StorageManager.saveLevelCompletion automatically routes tutorial_X to tutorial storage');

// 11. Test LevelLoader Fallback & Query Parser
console.log('\n[11] Testing LevelLoader Parameter Parsing & Normalization...');
const normalizedTut1 = LevelLoader.normalizeLevel(TUTORIAL_LEVELS[0]);
assert(normalizedTut1.id === 'tutorial_1', 'normalizeLevel preserves tutorial ID');
assert(normalizedTut1.zone === 'tutorial', 'normalizeLevel preserves tutorial zone');
assert(normalizedTut1.config.mapRevealed === true, 'normalizeLevel preserves config.mapRevealed');
assert(normalizedTut1.help && normalizedTut1.help.title === 'Navigation Basics', 'normalizeLevel preserves help metadata');

// 12. Test Thematic Visual Tilesets & Zone Registry
console.log('\n[12] Testing Thematic Visual Tilesets & Zone Registry...');
const themeKeys = ['dungeon', 'jungle', 'lava', 'snow', 'cave', 'sunset'];
for (const tk of themeKeys) {
  const t = THEMES[tk];
  assert(t !== undefined, `Theme ${tk} exists in THEMES`);
  assert(t.bg && t.wall && t.wallTop && t.floor && t.bridgeOverhead && t.bridgeRailing, `Theme ${tk} has all required visual style tokens`);
}

const zoneKeys = ['tutorial', 'zone_1', 'zone_2', 'zone_3', 'zone_4', 'zone_5'];
for (const zk of zoneKeys) {
  const z = ZONES[zk];
  assert(z !== undefined, `Zone ${zk} exists in ZONES registry`);
  assert(z.id && z.title && z.badge && z.theme && z.desc, `Zone ${zk} has valid metadata schema`);
}

// 13. Test Editor Enhancements, Color Presets, Lever Target State Transitions & Playtest Suite
console.log('\n[13] Testing Editor Enhancements, Color Presets, Lever Target State Transitions & Playtest Suite...');

// 13a. Key color presets & lever tile options
assert(KEY_COLOR_PRESETS.length === 5, 'KEY_COLOR_PRESETS contains 5 standard palette colors');
assert(KEY_COLOR_PRESETS.some(p => p.id === 'red'), 'KEY_COLOR_PRESETS contains Ruby Red');
assert(KEY_COLOR_PRESETS.some(p => p.id === 'blue'), 'KEY_COLOR_PRESETS contains Sapphire Blue');
assert(KEY_COLOR_PRESETS.some(p => p.id === 'green'), 'KEY_COLOR_PRESETS contains Emerald Green');
assert(KEY_COLOR_PRESETS.some(p => p.id === 'purple'), 'KEY_COLOR_PRESETS contains Amethyst Purple');
assert(KEY_COLOR_PRESETS.some(p => p.id === 'gold'), 'KEY_COLOR_PRESETS contains Gold');

assert(LEVER_TILE_OPTIONS.length >= 8, 'LEVER_TILE_OPTIONS defines Floor, Wall, Bridges and Ramps');

// 13b. Test normalizeLevel with testSpawn & testInventory
const rawLevelWithTestParams = {
  id: 'custom_test_level',
  dimensions: { width: 11, height: 11 },
  spawn: { x: 1, y: 1, elevation: 0 },
  testSpawn: { x: 5, y: 5, elevation: 1 },
  testInventory: ['key_red', 'key_blue'],
  layers: { ground: [], overhead: [] },
  entities: [
    { id: 'key_red', type: 'key', x: 2, y: 2, color: '#f43f5e', name: 'Ruby Key' },
    { id: 'key_blue', type: 'key', x: 3, y: 3, color: '#38bdf8', name: 'Sapphire Key' },
  ],
};
const normTestLvl = LevelLoader.normalizeLevel(rawLevelWithTestParams);
assert(normTestLvl.testSpawn && normTestLvl.testSpawn.x === 5 && normTestLvl.testSpawn.y === 5 && normTestLvl.testSpawn.elevation === 1, 'normalizeLevel preserves testSpawn coordinates and elevation');
assert(Array.isArray(normTestLvl.testInventory) && normTestLvl.testInventory.length === 2 && normTestLvl.testInventory.includes('key_red'), 'normalizeLevel preserves testInventory array');

// 13c. Test Player initialization with custom inventory and test spawn
const testPlayer = new Player(normTestLvl.testSpawn.x, normTestLvl.testSpawn.y, normTestLvl.testSpawn.elevation, 32, normTestLvl.testInventory);
assert(testPlayer.gridX === 5 && testPlayer.gridY === 5, 'Player initialized at testSpawn coordinates (5, 5)');
assert(testPlayer.elevation === 1, 'Player initialized at testSpawn elevation 1 (Overhead)');
assert(testPlayer.inventory.length === 2 && testPlayer.inventory.includes('key_red') && testPlayer.inventory.includes('key_blue'), 'Player initialized with testInventory keys');

testPlayer.reset(normTestLvl.testSpawn.x, normTestLvl.testSpawn.y, normTestLvl.testSpawn.elevation, normTestLvl.testInventory);
assert(testPlayer.inventory.includes('key_blue') && testPlayer.gridX === 5, 'Player reset preserves test starting inventory and spawn position');

// 13d. Test Multi-Target Lever Mechanism with State A & State B Transitions
const multiTargetLevel = {
  dimensions: { width: 7, height: 7 },
  layers: {
    ground: [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1]
    ],
    overhead: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]
    ]
  }
};

const multiTargetLever = new Lever({
  id: 'multi_lever',
  x: 1,
  y: 1,
  state: false,
  targets: [
    { action: 'toggle_tile', layer: 'ground', x: 2, y: 1, stateA: 0, stateB: 1 },
    { action: 'toggle_tile', layer: 'overhead', x: 4, y: 1, stateA: 'B_EW', stateB: 0 }
  ]
});

assert(multiTargetLevel.layers.ground[1][2] === 1, 'Target 1 initially Wall (1)');
assert(multiTargetLevel.layers.overhead[1][4] === 0, 'Target 2 initially Empty (0)');

multiTargetLever.toggle(multiTargetLevel);
assert(multiTargetLever.state === true, 'Lever toggled to active');
assert(multiTargetLevel.layers.ground[1][2] === 0, 'Target 1 transitioned to Floor (0) in State A');
assert(multiTargetLevel.layers.overhead[1][4] === 'B_EW', 'Target 2 transitioned to Bridge B_EW in State A');

multiTargetLever.toggle(multiTargetLevel);
assert(multiTargetLever.state === false, 'Lever toggled back to inactive');
assert(multiTargetLevel.layers.ground[1][2] === 1, 'Target 1 reverted to Wall (1) in State B');
assert(multiTargetLevel.layers.overhead[1][4] === 0, 'Target 2 reverted to Empty (0) in State B');

console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) {
  process.exit(1);
}

