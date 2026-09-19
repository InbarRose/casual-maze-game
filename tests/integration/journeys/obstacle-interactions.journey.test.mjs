/**
 * Comprehensive Integration Journey: Gate & Obstacle Interactions
 * Validates all gate, obstacle, and puzzle interaction mechanics:
 * 1. Key & Door color isolation (keys only open matching doors, non-matching keys strictly reject)
 * 2. Elevation isolation (Z=0 cannot interact with Z=1 entities; overhead bridges prevent ground interaction)
 * 3. Multi-target lever mutations and two-way toggle / one-way lock cycles
 * 4. Timed hazard cycle (dormant safety vs active lethality)
 * 5. Patroller dynamic collisions & evasion
 * 6. Puzzle gates: rune memory and cipher dial validation & state persistence
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { CollisionEngine } from '../../../js/engine/collision.js';
import { ELEVATION, ENTITY_TYPES, TILES } from '../../../js/core/constants.js';
import { globalEvents } from '../../../js/core/events.js';
import { Key } from '../../../js/entities/key.js';
import { Door } from '../../../js/entities/door.js';
import { Lever } from '../../../js/entities/lever.js';
import { PuzzleGate } from '../../../js/entities/puzzle-gate.js';
import { TimedHazard, Patroller } from '../../../js/entities/hazard.js';

function createMockCanvas() {
  return {
    width: 800,
    height: 600,
    getContext: () => ({
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 10 }),
      setLineDash: () => {},
      roundRect: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      drawImage: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

describe('User Journey > Gate & Obstacle Interaction Suite', () => {
  it('strictly enforces key color isolation (wrong color keys never unlock doors)', () => {
    const testLevel = {
      id: 'test_key_isolation',
      title: 'Key Isolation Testing Vault',
      dimensions: { width: 7, height: 7 },
      config: { tileSize: 32, theme: 'dungeon' },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 5, y: 5, elevation: 0 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 1, 1, 1, 0, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array(7).fill(null).map(() => Array(7).fill(0)),
      },
      entities: [
        { id: 'key_ruby', type: 'key', x: 2, y: 1, color: '#f43f5e', name: 'Ruby Key' },
        { id: 'key_sapphire', type: 'key', x: 3, y: 1, color: '#38bdf8', name: 'Sapphire Key' },
        { id: 'door_gold', type: 'door', x: 4, y: 1, color: '#fbbf24', requiresKey: 'key_gold', name: 'Gold Door' },
        { id: 'door_ruby', type: 'door', x: 5, y: 2, color: '#f43f5e', requiresKey: 'key_ruby', name: 'Ruby Door' },
      ],
    };

    const game = new GameLoop({
      mainCanvas: createMockCanvas(),
      minimapCanvas: createMockCanvas(),
      level: testLevel,
    });

    // 1. Pick up Ruby Key at (2, 1)
    game.player.gridX = 2;
    game.player.gridY = 1;
    game.handleCellArrival();
    assertEqual(game.player.hasKey('key_ruby'), true, 'Player has Ruby Key');
    assertEqual(game.player.hasKey('key_gold'), false, 'Player does not have Gold Key');

    // 2. Attempt to unlock Gold Door at (4, 1) using Ruby Key
    const checkGoldDoor = CollisionEngine.checkMove(
      3, 1, 4, 1, 0, game.level, game.entities, game.player.inventory
    );
    assertEqual(checkGoldDoor.allowed, false, 'Ruby Key rejected by Gold Door');
    assertEqual(checkGoldDoor.reason, 'door_locked');

    // 3. Move to Ruby Door at (5, 2)
    game.player.gridX = 5;
    game.player.gridY = 1;
    const allowedMove = game.tryMove(5, 2);
    assertEqual(allowedMove, true, 'Ruby Key successfully unlocks Ruby Door');

    const rubyDoor = game.entities.find(e => e.id === 'door_ruby');
    assertEqual(rubyDoor.isOpen, true, 'Ruby Door marked open');
    assertEqual(game.player.hasKey('key_ruby'), false, 'Ruby Key consumed upon opening');

    game.destroy();
  });

  it('enforces multi-elevation entity isolation (Z=0 cannot interact with Z=1 entities)', () => {
    const level = {
      dimensions: { width: 5, height: 5 },
      config: { tileSize: 32, theme: 'jungle' },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 3, y: 3, elevation: 0 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1],
          [1, 0, 'B_NS', 0, 1],
          [1, 0, 'B_NS', 0, 1],
          [1, 0, 'B_NS', 0, 1],
          [1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0],
          [0, 0, 'B_NS', 0, 0],
          [0, 0, 'B_NS', 0, 0],
          [0, 0, 'B_NS', 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      entities: [
        new Key({ id: 'key_overhead', x: 2, y: 2, z: 1, elevation: 1, name: 'High Key' }),
        new Door({ id: 'door_overhead', x: 2, y: 3, z: 1, elevation: 1, requiresKey: 'key_overhead' }),
      ],
    };

    const game = new GameLoop({
      mainCanvas: createMockCanvas(),
      minimapCanvas: createMockCanvas(),
      level,
    });

    // Player walks under bridge at (2, 2) on Z=0 (ground)
    game.player.gridX = 2;
    game.player.gridY = 2;
    game.player.elevation = ELEVATION.GROUND;
    game.handleCellArrival();

    const highKey = game.entities.find(e => e.id === 'key_overhead');
    assertEqual(highKey.isCollected, false, 'Overhead Key at Z=1 NOT collected while walking on ground Z=0 beneath bridge');
    assertEqual(game.player.hasKey('key_overhead'), false);

    // Player on overhead deck at Z=1 arrives at (2, 2)
    game.player.elevation = ELEVATION.OVERHEAD;
    game.handleCellArrival();
    assertEqual(highKey.isCollected, true, 'Overhead Key collected when player elevation matches Z=1');
    assertEqual(game.player.hasKey('key_overhead'), true);

    game.destroy();
  });

  it('validates multi-target levers with toggle and revert mechanics', () => {
    const level = {
      dimensions: { width: 5, height: 5 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1],
          [1, 0, 1, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 0, 1, 0, 1],
          [1, 1, 1, 1, 1],
        ],
        overhead: Array(5).fill(null).map(() => Array(5).fill(0)),
      },
      entities: [],
    };

    const multiLever = new Lever({
      id: 'lever_multi',
      x: 1,
      y: 2,
      state: false,
      targets: [
        { action: 'toggle_tile', layer: 'ground', x: 2, y: 1, stateA: 0, stateB: 1 }, // lowers wall to floor
        { action: 'toggle_tile', layer: 'ground', x: 2, y: 3, stateA: 1, stateB: 0 }, // raises floor to wall
      ],
    });

    assertEqual(level.layers.ground[1][2], 1, 'Target 1 starts as Wall (1)');
    assertEqual(level.layers.ground[3][2], 1, 'Target 2 starts as Wall (1)');

    // Pull lever ON
    multiLever.toggle(level);
    assertEqual(multiLever.state, true, 'Lever is now ON');
    assertEqual(level.layers.ground[1][2], 0, 'Target 1 lowered to Floor (0)');
    assertEqual(level.layers.ground[3][2], 1, 'Target 2 set to Wall (stateA=1)');

    // Pull lever OFF (revert)
    multiLever.toggle(level);
    assertEqual(multiLever.state, false, 'Lever reverted to OFF');
    assertEqual(level.layers.ground[1][2], 1, 'Target 1 reverted to Wall (stateB=1)');
    assertEqual(level.layers.ground[3][2], 0, 'Target 2 reverted to Floor (stateB=0)');

    // One-Way Lever test
    const oneWayLever = new Lever({
      id: 'lever_oneway',
      x: 3,
      y: 2,
      oneWay: true,
      state: false,
      targets: [{ action: 'toggle_tile', layer: 'ground', x: 1, y: 1, stateA: 0, stateB: 1 }],
    });

    oneWayLever.toggle(level);
    assertEqual(oneWayLever.state, true, 'One-way lever pulled ON');
    oneWayLever.toggle(level);
    assertEqual(oneWayLever.state, true, 'One-way lever remains locked ON on second toggle attempt');
  });

  it('validates TimedHazard active lethality and dormant safety', () => {
    const hazard = new TimedHazard({
      id: 'fire_vent_1',
      x: 3,
      y: 3,
      z: 0,
      interval: 2.0, // 2 second cycle
      activeDuration: 0.8, // active for first 0.8s of cycle
      initialOffset: 0.2, // starts within active window
    });

    hazard.update(0);
    assertEqual(hazard.isActive, true, 'Hazard is active');
    assertEqual(hazard.isLethalAt(3, 3, 0), true, 'Hazard is lethal at (3, 3, 0) during active window');
    assertEqual(hazard.isLethalAt(3, 3, 1), false, 'Hazard on Z=0 is harmless to player on Z=1');

    // Advance by 1.0s -> timer = 1.2s (dormant phase)
    hazard.update(1.0);
    assertEqual(hazard.isActive, false, 'Hazard is now inactive');
    assertEqual(hazard.isLethalAt(3, 3, 0), false, 'Hazard is safe at (3, 3, 0) during dormant window');
  });

  it('validates Patroller dynamic waypoint navigation and player collision', () => {
    const patroller = new Patroller({
      id: 'sentry_bot',
      waypoints: [
        { x: 2, y: 2, z: 0 },
        { x: 4, y: 2, z: 0 },
      ],
      speed: 2.0, // 2 tiles/sec
    });

    assertEqual(patroller.x, 2);
    assertEqual(patroller.y, 2);

    // Check collision when player is on same tile
    const playerWx = 2 * 32 + 16;
    const playerWy = 2 * 32 + 16;
    assertEqual(patroller.checkCollision(playerWx, playerWy, 0, 32), true, 'Collision detected when player occupies same cell');
    assertEqual(patroller.checkCollision(playerWx, playerWy, 1, 32), false, 'No collision when player is at different elevation');

    // Update patroller to advance towards waypoint 2
    patroller.update(0.5); // 1 full tile movement
    assert(patroller.worldX > 2 * 32 + 16, 'Patroller advanced towards (4, 2)');
  });

  it('validates PuzzleGate minigame types: rune_memory and cipher_dial', () => {
    // 1. Rune Memory Gate
    const runeGate = new PuzzleGate({
      id: 'gate_rune',
      x: 3,
      y: 3,
      puzzleType: 'rune_memory',
      solution: [0, 2, 1, 3],
    });

    assertEqual(runeGate.isUnlocked, false, 'Rune gate starts locked');
    assertEqual(runeGate.verifySolution([0, 1, 2, 3]), false, 'Incorrect rune order rejected');
    assertEqual(runeGate.verifySolution([0, 2, 1]), false, 'Incomplete sequence rejected');
    assertEqual(runeGate.verifySolution([0, 2, 1, 3]), true, 'Correct sequence accepted');
    runeGate.unlock();
    assertEqual(runeGate.isUnlocked, true, 'Gate unlocked');

    // 2. Cipher Dial Gate
    const cipherGate = new PuzzleGate({
      id: 'gate_cipher',
      x: 4,
      y: 4,
      puzzleType: 'cipher_dial',
      solution: [7, 3, 9],
    });

    assertEqual(cipherGate.verifySolution([7, 3, 8]), false, 'Wrong dial value rejected');
    assertEqual(cipherGate.verifySolution([7, 3, 9]), true, 'Matching dials accepted');
    cipherGate.unlock();
    assertEqual(cipherGate.isUnlocked, true, 'Cipher gate unlocked');
  });
});
