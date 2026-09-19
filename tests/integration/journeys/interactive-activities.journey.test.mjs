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

    // 3. Test Patroller collision and hazard hit handling
    const sentinel = game.entities.find(e => e.id === 'sentinel_1');
    assert(sentinel, 'Sentinel patroller exists');
    // Player at (5, 5, 1) and sentinel positioned at (5, 5, 1)
    const playerWx = 5 * 32 + 16;
    const playerWy = 5 * 32 + 16;
    sentinel.worldX = playerWx;
    sentinel.worldY = playerWy;
    assert(
      sentinel.checkCollision(playerWx, playerWy, 1, 32),
      'Patroller collision detected on identical elevation'
    );
    // Move sentinel away to (0, 0, 0) to clear bridge path
    sentinel.worldX = 0;
    sentinel.worldY = 0;
    sentinel.elevation = 0;

    // 4. Approach Puzzle Gate at (8, 5)
    const puzzleGate = game.entities.find(e => e.id === 'puzzle_barrier');
    assert(puzzleGate, 'Puzzle gate exists');
    assertEqual(puzzleGate.isUnlocked, false, 'Puzzle gate starts locked');

    // Attempting to step onto locked puzzle gate is blocked by CollisionEngine & tryMove
    game.player.gridX = 7;
    game.player.gridY = 5;
    game.player.elevation = 1;
    const blockedMove = game.tryMove(8, 5);
    assertEqual(blockedMove, false, 'Moving onto locked puzzle gate rejected');

    // Validate incorrect solution is rejected
    assertEqual(puzzleGate.verifySolution([3, 1, 2, 0]), false, 'Incorrect rune sequence rejected');

    // Validate correct solution and unlock
    assertEqual(puzzleGate.verifySolution([0, 2, 1, 3]), true, 'Solution matches expected rune sequence');
    puzzleGate.unlock();
    game.isPuzzleOpen = false;
    assertEqual(puzzleGate.isUnlocked, true, 'Gate unlocked successfully');

    // Moving onto unlocked puzzle gate is now permitted
    const permittedMove = game.tryMove(8, 5);
    assertEqual(permittedMove, true, 'Moving onto unlocked puzzle gate allowed');
    game.player.gridX = 8;
    game.player.gridY = 5;
    game.player.elevation = 1;
    game.player.worldX = 8 * 32 + 16;
    game.player.worldY = 5 * 32 + 16;
    game.player.isMoving = false;

    // 5. Reach Exit at (9, 5, 1)
    const exitMove = game.tryMove(9, 5);
    assertEqual(exitMove, true, 'Moving onto exit tile allowed');
    game.player.gridX = 9;
    game.player.gridY = 5;
    game.player.elevation = 1;
    game.player.worldX = 9 * 32 + 16;
    game.player.worldY = 5 * 32 + 16;
    game.player.isMoving = false;
    game.update(0.016);

    assert(game.isWon, 'Level successfully completed after solving puzzle gate and reaching exit!');
    game.destroy();
  });
});
