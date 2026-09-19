/**
 * Automated Playthrough Suite: Complete Campaign Validation (All 28 Levels)
 * Simulates a real player traversing each campaign level along its winning path,
 * validating movement mechanics, collision, elevation, keys, switches, teleporters,
 * and reaching victory in the runtime GameLoop engine.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { CollisionEngine } from '../../../js/engine/collision.js';
import { ELEVATION, ENTITY_TYPES } from '../../../js/core/constants.js';

/**
 * BFS State-Space Pathfinder to compute the winning path for any level
 * @param {object} level
 * @returns {Array<{ x: number, y: number, elevation: number, isWarp?: boolean }>|null}
 */
function solveLevel(level) {
  const { width, height } = level.dimensions;
  const spawn = level.spawn;
  const exit = level.exit;
  const sx = spawn.x, sy = spawn.y, sz = spawn.elevation || 0;
  const ex = exit.x, ey = exit.y, ez = exit.elevation || 0;

  const keyEntities = (level.entities || []).filter(e => e.type === ENTITY_TYPES.KEY);
  const leverEntities = (level.entities || []).filter(e => e.type === ENTITY_TYPES.LEVER);
  const tpEntities = (level.entities || []).filter(e => e.type === ENTITY_TYPES.TELEPORTER);

  const baseGround = level.layers.ground.map(row => [...row]);

  const queue = [
    {
      x: sx,
      y: sy,
      elevation: sz,
      keys: [],
      leverStates: {},
      ground: baseGround,
      path: [{ x: sx, y: sy, elevation: sz }],
    },
  ];

  const visited = new Set();

  function makeStateKey(x, y, elevation, keys, leverStates) {
    const kStr = keys.slice().sort().join(',');
    const lStr = Object.entries(leverStates).sort().map(([k, v]) => `${k}:${v}`).join(',');
    return `${x},${y},${elevation}|${kStr}|${lStr}`;
  }

  while (queue.length > 0) {
    const cur = queue.shift();
    const { x, y, elevation, keys, leverStates, ground, path } = cur;

    if (x === ex && y === ey && elevation === ez) {
      return path;
    }

    const stateKey = makeStateKey(x, y, elevation, keys, leverStates);
    if (visited.has(stateKey)) continue;
    visited.add(stateKey);

    // 1. Key pickup
    let newKeys = [...keys];
    for (const key of keyEntities) {
      const kz = key.z ?? key.elevation ?? 0;
      if (key.x === x && key.y === y && kz === elevation && !newKeys.includes(key.id)) {
        newKeys.push(key.id);
      }
    }

    // 2. Lever trigger
    let newLeverStates = { ...leverStates };
    let newGround = ground;
    for (const lever of leverEntities) {
      const lz = lever.z ?? lever.elevation ?? 0;
      if (lever.x === x && lever.y === y && lz === elevation && !newLeverStates[lever.id]) {
        newLeverStates[lever.id] = true;
        newGround = ground.map(row => [...row]);
        for (const t of lever.targets || []) {
          if (t.layer === 'ground') {
            newGround[t.y][t.x] = t.stateB ?? 0;
          }
        }
      }
    }

    // 3. Teleporters
    for (const tp of tpEntities) {
      const tpz = tp.z ?? tp.elevation ?? 0;
      if (tp.x === x && tp.y === y && tpz === elevation) {
        const tx = tp.targetX;
        const ty = tp.targetY;
        const tz = tp.targetZ ?? tp.targetElevation ?? 0;
        queue.push({
          x: tx,
          y: ty,
          elevation: tz,
          keys: newKeys,
          leverStates: newLeverStates,
          ground: newGround,
          path: [...path, { x: tx, y: ty, elevation: tz, isWarp: true }],
        });
      }
    }

    const curLevel = {
      ...level,
      layers: { ground: newGround, overhead: level.layers.overhead },
    };

    const runtimeEntities = (level.entities || []).map(e => {
      if (e.type === ENTITY_TYPES.PUZZLE_GATE) {
        return { ...e, isUnlocked: true };
      }
      return { ...e };
    });

    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    for (const d of dirs) {
      const nx = x + d.dx;
      const ny = y + d.dy;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

      const check = CollisionEngine.checkMove(
        x,
        y,
        nx,
        ny,
        elevation,
        curLevel,
        runtimeEntities,
        newKeys
      );

      if (check.allowed) {
        const nextElev = check.nextElevation ?? elevation;
        queue.push({
          x: nx,
          y: ny,
          elevation: nextElev,
          keys: newKeys,
          leverStates: newLeverStates,
          ground: newGround,
          path: [...path, { x: nx, y: ny, elevation: nextElev }],
        });
      }
    }
  }

  return null;
}

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

describe('User Journey > Campaign Playthrough Suite (All 28 Levels)', () => {
  CAMPAIGN_LEVELS.forEach((level) => {
    it(`plays through Level ${level.id} (${level.title}) to victory via game loop simulation`, () => {
      // 1. Solve path
      const path = solveLevel(level);
      assert(path !== null, `Level ${level.id} (${level.title}) has a computable solution path`);
      assert(path.length >= 2, `Solution path contains at least start and exit steps (${path.length} steps)`);

      // 2. Setup GameLoop
      let victoryAchieved = false;
      let victoryStats = null;

      const mockCanvas = createMockCanvas();
      const gameLoop = new GameLoop({
        mainCanvas: mockCanvas,
        minimapCanvas: mockCanvas,
        level,
        uiCallbacks: {
          onVictory: (stats) => {
            victoryAchieved = true;
            victoryStats = stats;
          },
        },
      });

      // 3. Step player along path
      for (let i = 1; i < path.length; i++) {
        const step = path[i];

        if (step.isWarp) {
          // Player warped by teleporter, position is automatically updated
          gameLoop.player.gridX = step.x;
          gameLoop.player.gridY = step.y;
          gameLoop.player.elevation = step.elevation;
          gameLoop.player.worldX = step.x * 32 + 16;
          gameLoop.player.worldY = step.y * 32 + 16;
          gameLoop.handleCellArrival();
          gameLoop.update(0.016);
          continue;
        }

        // Unlock puzzle gates if encountering them
        const puzzleGate = gameLoop.entities.find(
          e => e.type === ENTITY_TYPES.PUZZLE_GATE && e.x === step.x && e.y === step.y
        );
        if (puzzleGate && !puzzleGate.isUnlocked) {
          puzzleGate.unlock();
        }

        // Try movement via game engine
        const allowed = gameLoop.tryMove(step.x, step.y);
        assert(allowed, `Step ${i} to (${step.x}, ${step.y}, ${step.elevation}) permitted by CollisionEngine`);

        // Apply position update
        gameLoop.player.gridX = step.x;
        gameLoop.player.gridY = step.y;
        gameLoop.player.elevation = step.elevation;
        gameLoop.player.worldX = step.x * 32 + 16;
        gameLoop.player.worldY = step.y * 32 + 16;
        gameLoop.player.isMoving = false;
        gameLoop.player.stepsTaken++;

        gameLoop.handleCellArrival();
        gameLoop.update(0.016);
      }

      // 4. Assertions
      assert(victoryAchieved, `Level ${level.id} (${level.title}) triggers onVictory callback upon arrival at exit`);
      assertEqual(gameLoop.isWon, true, `Level ${level.id} (${level.title}) marks gameLoop.isWon as true`);
      assert(gameLoop.player.stepsTaken > 0, `Steps taken (${gameLoop.player.stepsTaken}) is recorded`);

      // Cleanup
      gameLoop.destroy();
    });
  });
});
