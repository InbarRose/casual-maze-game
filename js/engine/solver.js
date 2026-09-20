/**
 * Casual Maze Game — Level Solver & Walkthrough Replay Generator
 * 
 * Provides a pure, zero-dependency BFS state-space pathfinder and deterministic
 * replay generator that can be executed both in the browser (Replay Theater)
 * and in Node.js automated test suites.
 */

import { ELEVATION, ENTITY_TYPES } from '../core/constants.js';
import { CollisionEngine } from './collision.js';

/**
 * BFS State-Space Pathfinder to compute the winning path for any level
 * @param {object} level Canonical level definition
 * @param {object} [options]
 * @param {boolean} [options.allowDoors=true]
 * @param {boolean} [options.allowLevers=true]
 * @param {boolean} [options.allowPuzzles=true]
 * @param {boolean} [options.allowTeleporters=true]
 * @returns {Array<{ x: number, y: number, elevation: number, isWarp?: boolean }>|null}
 */
export function solveLevel(level, options = {}) {
  const {
    allowDoors = true,
    allowLevers = true,
    allowPuzzles = true,
    allowTeleporters = true,
  } = options;

  if (!level || !level.dimensions || !level.spawn || !level.exit) {
    return null;
  }

  const { width, height } = level.dimensions;
  const spawn = level.spawn;
  const exit = level.exit;
  const sx = spawn.x, sy = spawn.y, sz = spawn.elevation || 0;
  const ex = exit.x, ey = exit.y, ez = exit.elevation || 0;

  const keyEntities = (level.entities || []).filter(e => e.type === ENTITY_TYPES.KEY);
  const leverEntities = (level.entities || []).filter(e => e.type === ENTITY_TYPES.LEVER);
  const tpEntities = (level.entities || []).filter(e => e.type === ENTITY_TYPES.TELEPORTER);

  const baseGround = (level.layers?.ground || []).map(row => [...row]);

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
            if (t.layer === 'ground' && newGround[t.y]) {
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
      layers: { ground: newGround, overhead: level.layers?.overhead || [] },
    };

    const pedestalTargets = new Set(
      (level.entities || []).filter(e => e.type === ENTITY_TYPES.PEDESTAL && e.targetDoorId).map(e => e.targetDoorId)
    );

    const runtimeEntities = (level.entities || []).map(e => {
      if (e.type === ENTITY_TYPES.PUZZLE_GATE) {
        return { ...e, isUnlocked: allowPuzzles };
      }
      if (e.type === ENTITY_TYPES.DOOR && pedestalTargets.has(e.id)) {
        return { ...e, isOpen: allowPuzzles };
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

/**
 * Determine cardinal direction string between two points
 * @param {number} fromX
 * @param {number} fromY
 * @param {number} toX
 * @param {number} toY
 * @returns {'up'|'down'|'left'|'right'|'warp'|'none'}
 */
export function getDirection(fromX, fromY, toX, toY) {
  if (toX > fromX) return 'right';
  if (toX < fromX) return 'left';
  if (toY > fromY) return 'down';
  if (toY < fromY) return 'up';
  return 'none';
}

/**
 * Generate a canonical replay JSON object for a level's solution path
 * @param {object} level Canonical level object
 * @param {object} [options]
 * @returns {object|null}
 */
export function generateWalkthroughReplay(level, options = {}) {
  const path = solveLevel(level, options);
  if (!path || path.length < 2) return null;

  const stepDurationMs = 280;
  const actions = [];

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const isWarp = Boolean(curr.isWarp);
    const dir = isWarp ? 'warp' : getDirection(prev.x, prev.y, curr.x, curr.y);

    actions.push({
      stepIndex: i,
      action: isWarp ? 'teleport' : 'move',
      direction: dir,
      from: { x: prev.x, y: prev.y, elevation: prev.elevation },
      to: { x: curr.x, y: curr.y, elevation: curr.elevation },
      isWarp,
      elapsedMs: i * stepDurationMs,
    });
  }

  return {
    schemaVersion: '1.0.0',
    type: 'casual-maze-replay',
    generator: 'solver:bfs',
    createdAt: new Date().toISOString(),
    levelId: String(level.id),
    levelTitle: level.title || 'Untitled Labyrinth',
    spawn: {
      x: level.spawn?.x ?? 0,
      y: level.spawn?.y ?? 0,
      elevation: level.spawn?.elevation ?? 0,
    },
    exit: {
      x: level.exit?.x ?? 0,
      y: level.exit?.y ?? 0,
      elevation: level.exit?.elevation ?? 0,
    },
    summary: {
      totalSteps: actions.length,
      estimatedDurationMs: actions.length * stepDurationMs,
      completed: true,
    },
    actions,
  };
}
