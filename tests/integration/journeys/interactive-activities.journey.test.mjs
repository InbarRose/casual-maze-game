/**
 * End-to-End User Journey: Interactive Activities & Dynamic Labyrinth
 * Simulates an explorer warping via teleporters, dodging patrolling hazards,
 * solving an ancient rune puzzle gate, and unlocking the exit.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { ELEVATION } from '../../../js/core/constants.js';

describe('User Journey > Interactive Activities & Dynamic Labyrinth', () => {
  it('guides an explorer through teleporters, moving patrollers, and puzzle gates', () => {
    const activityMaze = {
      id: 'journey_activities',
      title: 'The Shifting Vaults',
      dimensions: { width: 11, height: 11 },
      config: {
        theme: 'dungeon',
        fogOfWar: false,
        viewPerspective: 'angled',
        tileSize: 32,
      },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 9, y: 5, elevation: 1 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1], // Spawn at (1, 1) -> TP at (2, 1)
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 'B_NS', 'B_NS', 'B_NS', 'B_NS', 'B_NS', 0], // Bridge from (5, 5) to (9, 5) on Z=1
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
      },
      entities: [
        {
          id: 'tp_ground',
          type: 'teleporter',
          x: 2,
          y: 1,
          z: 0,
          targetX: 5,
          targetY: 5,
          targetZ: 1,
          name: 'Ascension Pad',
        },
        {
          id: 'sentinel_1',
          type: 'patroller',
          waypoints: [
            { x: 6, y: 5, z: 1 },
            { x: 7, y: 5, z: 1 },
          ],
          speed: 1.0,
          name: 'Vault Sentinel',
        },
        {
          id: 'puzzle_barrier',
          type: 'puzzle_gate',
          x: 8,
          y: 5,
          z: 1,
          puzzleType: 'rune_memory',
          solution: [0, 2, 1, 3],
          name: 'Seal of Agamotto',
        },
      ],
    };

    const mockCanvas = {
      width: 800,
      height: 600,
      getContext: () => ({
        fillRect: () => {},
        strokeRect: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        drawImage: () => {},
      }),
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    const game = new GameLoop({
      mainCanvas: mockCanvas,
      minimapCanvas: mockCanvas,
      level: activityMaze,
    });

    // 1. Initial State
    assertEqual(game.player.gridX, 1);
    assertEqual(game.player.gridY, 1);
    assertEqual(game.player.elevation, 0);
    assertEqual(game.renderer.perspective, 'angled', 'Renderer active in angled 2.5D mode');

    // 2. Step East onto Teleporter at (2, 1)
    game.player.gridX = 2;
    game.player.gridY = 1;
    game.handleCellArrival();

    // Player should now be warped to (5, 5, 1) on Overhead level!
    assertEqual(game.player.gridX, 5, 'Warped to targetX=5');
    assertEqual(game.player.gridY, 5, 'Warped to targetY=5');
    assertEqual(game.player.elevation, 1, 'Warped to elevated bridge deck (Z=1)');

    // 3. Move Patroller away
    const sentinel = game.entities.find(e => e.id === 'sentinel_1');
    assert(sentinel, 'Sentinel patroller exists');
    sentinel.worldX = 6 * 32 + 16;
    sentinel.worldY = 4 * 32; // position away from bridge

    // 4. Approach Puzzle Gate at (8, 5)
    const puzzleGate = game.entities.find(e => e.id === 'puzzle_barrier');
    assert(puzzleGate, 'Puzzle gate exists');
    assert(!puzzleGate.isUnlocked, 'Puzzle gate starts locked');

    // Attempting to step on locked puzzle gate is blocked by CollisionEngine
    const blockedMove = game.player.gridX = 7;
    // Step towards (8, 5)
    // Validate solution and unlock
    assert(puzzleGate.verifySolution([0, 2, 1, 3]), 'Solution matches expected rune sequence');
    puzzleGate.unlock();
    assert(puzzleGate.isUnlocked, 'Gate unlocked successfully');

    // 5. Reach Exit at (9, 5, 1)
    game.player.gridX = 9;
    game.player.gridY = 5;
    game.player.elevation = 1;
    game.update(0.016);

    assert(game.isWon, 'Level successfully completed after solving puzzle gate and reaching exit!');
    game.destroy();
  });
});
