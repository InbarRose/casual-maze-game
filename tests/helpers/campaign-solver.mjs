/**
 * Reusable Campaign Level Solver and Playthrough Simulator
 * Powers the modular chapter playthrough tests.
 */

import { assert, assertEqual } from '../harness/index.mjs';
import { GameLoop } from '../../js/engine/game-loop.js';
import { CollisionEngine } from '../../js/engine/collision.js';
import { ELEVATION, ENTITY_TYPES } from '../../js/core/constants.js';
import { globalEvents } from '../../js/core/events.js';

/**
 * BFS State-Space Pathfinder to compute the winning path for any level
 * @param {object} level
 * @param {object} [options]
 * @returns {Array<{ x: number, y: number, elevation: number, isWarp?: boolean }>|null}
 */
export function solveLevel(level, options = {}) {
  const {
    allowDoors = true,
    allowLevers = true,
    allowPuzzles = true,
    allowTeleporters = true,
  } = options;

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
    if (allowDoors) {
      for (const key of keyEntities) {
        const kz = key.z ?? key.elevation ?? 0;
        if (key.x === x && key.y === y && kz === elevation && !newKeys.includes(key.id)) {
          newKeys.push(key.id);
        }
      }
    }

    // 2. Lever trigger
    let newLeverStates = { ...leverStates };
    let newGround = ground;
    if (allowLevers) {
      for (const lever of leverEntities) {
        const lz = lever.z ?? lever.elevation ?? 0;
        if (lever.x === x && lever.y === y && lz === elevation && !newLeverStates[lever.id]) {
          newLeverStates[lever.id] = true;
          newGround = ground.map(row => [...row]);
          for (const t of lever.targets || []) {
            if (t.layer === 'ground') {
              newGround[t.y][t.x] = t.stateA ?? 0;
            }
          }
        }
      }
    }

    // 3. Teleporters
    if (allowTeleporters) {
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
    }

    const curLevel = {
      ...level,
      layers: { ground: newGround, overhead: level.layers.overhead },
    };

    const runtimeEntities = (level.entities || []).map(e => {
      if (e.type === ENTITY_TYPES.PUZZLE_GATE) {
        return { ...e, isUnlocked: allowPuzzles };
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
        allowDoors ? newKeys : []
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

export function createMockCanvas() {
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

/**
 * Simulates a full game loop traversal of a campaign level along its optimal path,
 * verifying all obstacles, keys, levers, gates, and victory assertions.
 * @param {object} level
 */
export function simulateCampaignLevelPlaythrough(level) {
  // 1. Assert mandatory chokepoints: level cannot be solved if obstacles are bypassed
  const hasDoors = (level.entities || []).some(e => e.type === ENTITY_TYPES.DOOR);
  const hasLevers = (level.entities || []).some(e => e.type === ENTITY_TYPES.LEVER);
  const hasPuzzles = (level.entities || []).some(e => e.type === ENTITY_TYPES.PUZZLE_GATE);
  const hasTeleporters = (level.entities || []).some(e => e.type === ENTITY_TYPES.TELEPORTER);

  if (hasDoors) {
    const bypass = solveLevel(level, { allowDoors: false });
    assertEqual(bypass, null, `Level ${level.id} doors cannot be bypassed without keys`);
  }
  if (hasLevers) {
    const bypass = solveLevel(level, { allowLevers: false });
    assertEqual(bypass, null, `Level ${level.id} levers cannot be bypassed without toggling`);
  }
  if (hasPuzzles) {
    const bypass = solveLevel(level, { allowPuzzles: false });
    assertEqual(bypass, null, `Level ${level.id} puzzle gates cannot be bypassed without solving`);
  }
  if (hasTeleporters) {
    const bypass = solveLevel(level, { allowTeleporters: false });
    assertEqual(bypass, null, `Level ${level.id} teleporters cannot be bypassed without warping`);
  }

  // 2. Solve path with all obstacles enabled
  const path = solveLevel(level);
  assert(path !== null, `Level ${level.id} (${level.title}) has a computable solution path`);
  assert(path.length >= 2, `Solution path contains at least start and exit steps (${path.length} steps)`);

  // 3. Setup Event Monitor
  const recordedEvents = [];
  const unsubs = [
    globalEvents.on('key:collected', data => recordedEvents.push({ type: 'key:collected', data })),
    globalEvents.on('door:unlocked', data => recordedEvents.push({ type: 'door:unlocked', data })),
    globalEvents.on('door:locked', data => recordedEvents.push({ type: 'door:locked', data })),
    globalEvents.on('lever:toggled', data => recordedEvents.push({ type: 'lever:toggled', data })),
    globalEvents.on('tile:toggled', data => recordedEvents.push({ type: 'tile:toggled', data })),
  ];

  // 4. Setup GameLoop
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

  // 5. Step player along path
  for (let i = 1; i < path.length; i++) {
    const step = path[i];

    if (step.isWarp) {
      gameLoop.player.gridX = step.x;
      gameLoop.player.gridY = step.y;
      gameLoop.player.elevation = step.elevation;
      gameLoop.player.worldX = step.x * 32 + 16;
      gameLoop.player.worldY = step.y * 32 + 16;
      gameLoop.handleCellArrival();
      gameLoop.update(0.016);
      continue;
    }

    // Test Puzzle Gates interaction before unlocking
    const puzzleGate = gameLoop.entities.find(
      e => e.type === ENTITY_TYPES.PUZZLE_GATE && e.x === step.x && e.y === step.y
    );
    if (puzzleGate && !puzzleGate.isUnlocked) {
      const blockedCheck = CollisionEngine.checkMove(
        gameLoop.player.gridX,
        gameLoop.player.gridY,
        step.x,
        step.y,
        gameLoop.player.elevation,
        gameLoop.level,
        gameLoop.entities,
        gameLoop.player.inventory
      );
      assertEqual(blockedCheck.allowed, false, `Puzzle gate at (${step.x}, ${step.y}) blocks while locked`);
      assertEqual(blockedCheck.reason, 'puzzle_gate_locked');

      assertEqual(puzzleGate.verifySolution([999999]), false, 'Invalid puzzle solution rejected');
      assertEqual(puzzleGate.verifySolution(puzzleGate.solution), true, 'Valid puzzle solution accepted');
      puzzleGate.unlock();
      assertEqual(puzzleGate.isUnlocked, true, 'Puzzle gate is unlocked');
    }

    // Test Locked Door interaction
    const targetDoor = gameLoop.entities.find(
      e => e.type === ENTITY_TYPES.DOOR && e.x === step.x && e.y === step.y && (e.elevation || 0) === step.elevation
    );
    if (targetDoor && !targetDoor.isOpen) {
      assert(
        gameLoop.player.hasKey(targetDoor.requiresKey),
        `Player possesses required key "${targetDoor.requiresKey}" before unlocking door at (${step.x}, ${step.y})`
      );

      const blockedCheck = CollisionEngine.checkMove(
        gameLoop.player.gridX,
        gameLoop.player.gridY,
        step.x,
        step.y,
        gameLoop.player.elevation,
        gameLoop.level,
        gameLoop.entities,
        []
      );
      assertEqual(blockedCheck.allowed, false, `Door at (${step.x}, ${step.y}) blocks when player has no key`);
      assertEqual(blockedCheck.reason, 'door_locked');
    }

    // Try movement via game engine
    const allowed = gameLoop.tryMove(step.x, step.y);
    assert(allowed, `Step ${i} to (${step.x}, ${step.y}, ${step.elevation}) permitted by CollisionEngine`);

    if (targetDoor) {
      assertEqual(targetDoor.isOpen, true, `Door at (${step.x}, ${step.y}) is marked open`);
      assertEqual(
        gameLoop.player.hasKey(targetDoor.requiresKey),
        false,
        `Key "${targetDoor.requiresKey}" consumed from inventory`
      );
    }

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

    // Verify key pickup upon arrival
    const targetKey = gameLoop.entities.find(
      e => e.type === ENTITY_TYPES.KEY && e.x === step.x && e.y === step.y && (e.elevation || 0) === step.elevation
    );
    if (targetKey) {
      assertEqual(targetKey.isCollected, true, `Key at (${step.x}, ${step.y}) marked isCollected`);
    }

    // Verify lever toggle upon arrival
    const targetLever = gameLoop.entities.find(
      e => e.type === ENTITY_TYPES.LEVER && e.x === step.x && e.y === step.y && (e.elevation || 0) === step.elevation
    );
    if (targetLever) {
      assertEqual(targetLever.state, true, `Lever at (${step.x}, ${step.y}) toggled to active state`);
      for (const t of targetLever.targets || []) {
        if (t.layer === 'ground') {
          assertEqual(
            gameLoop.level.layers.ground[t.y][t.x],
            t.stateA ?? 0,
            `Lever target tile at (${t.x}, ${t.y}) mutated to stateA`
          );
        }
      }
    }
  }

  // 6. Victory Assertions
  assert(victoryAchieved, `Level ${level.id} (${level.title}) triggers onVictory callback upon arrival at exit`);
  assertEqual(gameLoop.isWon, true, `Level ${level.id} (${level.title}) marks gameLoop.isWon as true`);
  assert(gameLoop.player.stepsTaken > 0, `Steps taken (${gameLoop.player.stepsTaken}) is recorded`);

  // 7. Complete Obstacle Clearance Audit
  const doorsInLevel = gameLoop.entities.filter(e => e.type === ENTITY_TYPES.DOOR);
  for (const d of doorsInLevel) {
    assertEqual(d.isOpen, true, `Door "${d.id}" at (${d.x}, ${d.y}) was successfully opened`);
  }

  const keysInLevel = gameLoop.entities.filter(e => e.type === ENTITY_TYPES.KEY);
  for (const k of keysInLevel) {
    assertEqual(k.isCollected, true, `Key "${k.id}" at (${k.x}, ${k.y}) was successfully collected`);
  }

  const leversInLevel = gameLoop.entities.filter(e => e.type === ENTITY_TYPES.LEVER);
  for (const l of leversInLevel) {
    assertEqual(l.state, true, `Lever "${l.id}" at (${l.x}, ${l.y}) was successfully engaged`);
  }

  const puzzlesInLevel = gameLoop.entities.filter(e => e.type === ENTITY_TYPES.PUZZLE_GATE);
  for (const p of puzzlesInLevel) {
    assertEqual(p.isUnlocked, true, `Puzzle gate "${p.id}" at (${p.x}, ${p.y}) was successfully solved`);
  }

  // Cleanup
  for (const unsub of unsubs) unsub();
  gameLoop.destroy();
}
