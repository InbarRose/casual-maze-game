/**
 * Test Suite for Casual Maze Game Engine
 */

import { TILES, ELEVATION, FOG_STATE, ENTITY_TYPES } from './js/core/constants.js';
import { PRNG } from './js/core/prng.js';
import { EventBus } from './js/core/events.js';
import { CollisionEngine } from './js/engine/collision.js';
import { FogOfWar } from './js/engine/fog.js';
import { Camera } from './js/engine/camera.js';
import { Key } from './js/entities/key.js';
import { Door } from './js/entities/door.js';
import { Lever } from './js/entities/lever.js';
import { LevelLoader } from './js/levels/level-loader.js';
import { CAMPAIGN_LEVELS } from './js/levels/default-levels.js';
import { GameLoop } from './js/engine/game-loop.js';
import { GameRenderer } from './js/engine/renderer.js';
import { Minimap } from './js/engine/minimap.js';
import { JsonExporter } from './js/editor/json-exporter.js';

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

for (let i = 1; i <= 5; i++) {
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

const manifestPath = './levels/manifest.json';
assert(fs.existsSync(manifestPath), 'levels/manifest.json exists');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(Array.isArray(manifest) && manifest.length === 5, 'manifest.json lists 5 levels');

// 4. Test Procedural Level Generator
console.log('\n[4] Testing Procedural Maze Generator...');
const procLevel = LevelLoader.generateProceduralLevel('seed_99', 21, 21);
assert(procLevel.dimensions.width === 21 && procLevel.dimensions.height === 21, 'Procedural level generated with correct dimensions');
assert(procLevel.layers.ground[procLevel.spawn.y][procLevel.spawn.x] === TILES.FLOOR, 'Procedural spawn is on open floor');
assert(procLevel.layers.ground[procLevel.exit.y][procLevel.exit.x] === TILES.FLOOR, 'Procedural exit is on open floor');

// 5. Test Collision Engine & Elevation
console.log('\n[5] Testing Collision Engine & Elevation Mechanics...');
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

// Test Bridge B_EW on Ground (E-W allowed, N-S blocked)
const bridgeEWGroundE = CollisionEngine.checkMove(4, 1, 5, 1, ELEVATION.GROUND, testLevel);
assert(bridgeEWGroundE.allowed, 'B_EW allows Eastward crossing under bridge on Ground');

const bridgeEWGroundN = CollisionEngine.checkMove(5, 2, 5, 1, ELEVATION.GROUND, testLevel);
assert(!bridgeEWGroundN.allowed, 'B_EW blocks Northward crossing on Ground');

// Test Ramp R_E (Moving East climbs 0 -> 1)
const rampClimb = CollisionEngine.checkMove(6, 1, 7, 1, ELEVATION.GROUND, testLevel);
assert(rampClimb.allowed && rampClimb.nextElevation === ELEVATION.OVERHEAD, 'R_E transitions player from Ground (0) to Overhead (1)');

// 6. Test Lever Mechanism & Tile Mutation
console.log('\n[6] Testing Lever Mutation...');
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

// 7. Test Fog of War Raycasting
console.log('\n[7] Testing Fog of War...');
const fog = new FogOfWar(10, 10);
assert(fog.getVisibility(5, 5) === FOG_STATE.UNEXPLORED, 'Initial fog tile is UNEXPLORED');
fog.update(5, 5, 0, testLevel.layers.ground, testLevel.layers.overhead, 3);
assert(fog.getVisibility(5, 5) === FOG_STATE.VISIBLE, 'Player position is VISIBLE');
assert(fog.isExplored(5, 5), 'Player position is marked explored');

// 8. Test Camera Viewport Math
console.log('\n[8] Testing Camera Viewport Culling...');
const cam = new Camera(800, 600, 32);
cam.snapTo(160, 160, 20, 20);
const bounds = cam.getViewportBounds(20, 20);
assert(bounds.startCol >= 0 && bounds.endCol < 20, 'Viewport culling start/end columns bounded');
assert(bounds.startRow >= 0 && bounds.endRow < 20, 'Viewport culling start/end rows bounded');

console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) {
  process.exit(1);
}
