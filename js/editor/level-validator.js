/**
 * Casual Maze Game — Level Validator & Solvability Analyzer
 */

import { TILES, ELEVATION, ENTITY_TYPES, LAYERS } from '../core/constants.js';
import { CollisionEngine } from '../engine/collision.js';

export class LevelValidator {
  /**
   * Run full validation and reachability analysis on a level
   * @param {object} level
   * @returns {{ valid: boolean, errors: Array<{ message: string, x?: number, y?: number, entityId?: string }>, warnings: Array<{ message: string, x?: number, y?: number, entityId?: string }>, info: string[], stats: object }}
   */
  static validate(level) {
    const errors = [];
    const warnings = [];
    const info = [];

    if (!level || typeof level !== 'object') {
      return {
        valid: false,
        errors: [{ message: 'Level object is undefined or invalid.' }],
        warnings: [],
        info: [],
        stats: {},
      };
    }

    const { width, height } = level.dimensions || { width: 0, height: 0 };
    const ground = level.layers?.ground || [];
    const overhead = level.layers?.overhead || [];
    const entities = Array.isArray(level.entities) ? level.entities : [];

    // 1. Dimensions check
    if (width < 5 || height < 5) {
      errors.push({ message: `Dimensions (${width}x${height}) are too small. Minimum size is 5x5.` });
    }

    // 2. Spawn validation
    if (!level.spawn || typeof level.spawn.x !== 'number' || typeof level.spawn.y !== 'number') {
      errors.push({ message: 'Missing spawn point.' });
    } else {
      const { x: sx, y: sy, elevation: se = 0 } = level.spawn;
      if (sx < 0 || sx >= width || sy < 0 || sy >= height) {
        errors.push({ message: `Spawn point (${sx}, ${sy}) is outside maze bounds (${width}x${height}).`, x: sx, y: sy });
      } else {
        const spawnTile = se === ELEVATION.OVERHEAD ? overhead[sy]?.[sx] : ground[sy]?.[sx];
        if (spawnTile === TILES.WALL) {
          errors.push({ message: `Spawn point (${sx}, ${sy}) is placed inside a solid wall.`, x: sx, y: sy });
        }
      }
    }

    // 3. Exit validation
    if (!level.exit || typeof level.exit.x !== 'number' || typeof level.exit.y !== 'number') {
      errors.push({ message: 'Missing exit point.' });
    } else {
      const { x: ex, y: ey } = level.exit;
      if (ex < 0 || ex >= width || ey < 0 || ey >= height) {
        errors.push({ message: `Exit point (${ex}, ${ey}) is outside maze bounds (${width}x${height}).`, x: ex, y: ey });
      } else {
        const exitGroundTile = ground[ey]?.[ex];
        if (exitGroundTile === TILES.WALL) {
          errors.push({ message: `Exit point (${ex}, ${ey}) is placed inside a solid wall.`, x: ex, y: ey });
        }
      }

      if (level.spawn && level.spawn.x === level.exit.x && level.spawn.y === level.exit.y) {
        warnings.push({ message: 'Spawn and Exit are on the exact same tile.', x: ex, y: ey });
      }
    }

    // 4. Entity Integrity Checks
    const entityIds = new Set();
    const keyEntities = new Map(); // keyId -> entity
    const doorEntities = [];
    const leverEntities = [];

    for (const entity of entities) {
      if (!entity.id) {
        errors.push({ message: `Entity of type "${entity.type}" is missing an ID.`, x: entity.x, y: entity.y });
      } else if (entityIds.has(entity.id)) {
        errors.push({ message: `Duplicate entity ID "${entity.id}".`, entityId: entity.id, x: entity.x, y: entity.y });
      } else {
        entityIds.add(entity.id);
      }

      if (entity.x < 0 || entity.x >= width || entity.y < 0 || entity.y >= height) {
        errors.push({ message: `Entity "${entity.id}" (${entity.x}, ${entity.y}) is outside maze bounds.`, entityId: entity.id, x: entity.x, y: entity.y });
      }

      if (entity.type === ENTITY_TYPES.KEY) {
        keyEntities.set(entity.id, entity);
      } else if (entity.type === ENTITY_TYPES.DOOR) {
        doorEntities.push(entity);
      } else if (entity.type === ENTITY_TYPES.LEVER) {
        leverEntities.push(entity);
      }
    }

    // Check Doors for valid matching keys
    for (const door of doorEntities) {
      if (door.requiresKey && !keyEntities.has(door.requiresKey)) {
        errors.push({
          message: `Door "${door.id}" at (${door.x}, ${door.y}) requires key "${door.requiresKey}", but no such key exists in the level.`,
          entityId: door.id,
          x: door.x,
          y: door.y,
        });
      } else if (!door.requiresKey) {
        warnings.push({
          message: `Door "${door.id}" at (${door.x}, ${door.y}) has no required key assigned and will always be locked.`,
          entityId: door.id,
          x: door.x,
          y: door.y,
        });
      }
    }

    // Check Levers for target bounds
    for (const lever of leverEntities) {
      if (!lever.targets || lever.targets.length === 0) {
        warnings.push({
          message: `Lever "${lever.id}" at (${lever.x}, ${lever.y}) has no linked target tiles.`,
          entityId: lever.id,
          x: lever.x,
          y: lever.y,
        });
      } else {
        for (const target of lever.targets) {
          if (target.x < 0 || target.x >= width || target.y < 0 || target.y >= height) {
            errors.push({
              message: `Lever "${lever.id}" targets out-of-bounds tile (${target.x}, ${target.y}).`,
              entityId: lever.id,
              x: lever.x,
              y: lever.y,
            });
          }
        }
      }
    }

    // 5. Elevation & Bridge sanity
    let hasRamps = false;
    let hasOverheadBridges = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const g = ground[y]?.[x];
        const o = overhead[y]?.[x];
        if (g === TILES.RAMP_N || g === TILES.RAMP_S || g === TILES.RAMP_E || g === TILES.RAMP_W) {
          hasRamps = true;
        }
        if (o === TILES.BRIDGE_EW || o === TILES.BRIDGE_NS || g === TILES.BRIDGE_EW || g === TILES.BRIDGE_NS) {
          hasOverheadBridges = true;
        }
      }
    }

    if (hasOverheadBridges && !hasRamps) {
      warnings.push({ message: 'Level contains bridge walkways, but no ramps to climb to the overhead layer.' });
    }

    // 6. Solvability & Reachability Simulation (BFS)
    const reachability = this.analyzeReachability(level, keyEntities, doorEntities);

    if (level.spawn && level.exit && errors.length === 0) {
      if (!reachability.exitReached) {
        errors.push({
          message: `Exit at (${level.exit.x}, ${level.exit.y}) is UNREACHABLE from Spawn (${level.spawn.x}, ${level.spawn.y}).`,
          x: level.exit.x,
          y: level.exit.y,
        });
      }

      // Check Key-Before-Gate Dependencies & Unreachable Keys
      for (const door of doorEntities) {
        if (door.requiresKey && keyEntities.has(door.requiresKey)) {
          if (!reachability.reachableKeys.has(door.requiresKey)) {
            errors.push({
              message: `Door "${door.id}" at (${door.x}, ${door.y}) requires key "${door.requiresKey}", but the key is unreachable before unlocking this door (key is behind the door or blocked).`,
              entityId: door.id,
              x: door.x,
              y: door.y,
            });
          }
        }
      }

      // Check for Bypassed / Redundant Doors (doors that can be ignored to reach the exit)
      if (reachability.exitReached) {
        for (const door of doorEntities) {
          if (door.requiresKey && keyEntities.has(door.requiresKey)) {
            const bypassCheck = this.analyzeReachability(level, keyEntities, doorEntities, new Set([door.id]));
            if (bypassCheck.exitReached) {
              warnings.push({
                message: `Door "${door.id}" (${door.color || 'gate'}) at (${door.x}, ${door.y}) can be bypassed without unlocking it to beat the level.`,
                entityId: door.id,
                x: door.x,
                y: door.y,
              });
            }
          }
        }
      }

      // Check for Unused Keys
      const keysUsedByDoors = new Set(doorEntities.map(d => d.requiresKey).filter(Boolean));
      for (const [keyId, keyEntity] of keyEntities.entries()) {
        if (!keysUsedByDoors.has(keyId)) {
          warnings.push({
            message: `Key "${keyEntity.name || keyId}" at (${keyEntity.x}, ${keyEntity.y}) is not required by any door.`,
            entityId: keyId,
            x: keyEntity.x,
            y: keyEntity.y,
          });
        }
      }

      // Check for Unreachable Keys (that weren't already flagged in door error)
      for (const [keyId, keyEntity] of keyEntities.entries()) {
        if (!reachability.reachableKeys.has(keyId) && !keysUsedByDoors.has(keyId)) {
          warnings.push({
            message: `Key "${keyEntity.name || keyId}" at (${keyEntity.x}, ${keyEntity.y}) is unreachable.`,
            entityId: keyId,
            x: keyEntity.x,
            y: keyEntity.y,
          });
        }
      }
    }

    info.push(`Reachable floor tiles: ${reachability.reachableTilesCount}`);
    if (keyEntities.size > 0) {
      info.push(`Keys collectible: ${reachability.reachableKeys.size}/${keyEntities.size}`);
    }

    if (errors.length > 0) {
      console.warn(
        `[MazeGame:Validator] Level "${level.title || level.id || 'Untitled'}" has ${errors.length} validation error(s):`,
        errors.map(e => e.message)
      );
    } else if (warnings.length > 0) {
      console.info(
        `[MazeGame:Validator] Level "${level.title || level.id || 'Untitled'}" is valid with ${warnings.length} warning(s):`,
        warnings.map(w => w.message)
      );
    } else {
      console.info(`[MazeGame:Validator] Level "${level.title || level.id || 'Untitled'}" is 100% valid and solvable.`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
      stats: {
        reachableTiles: reachability.reachableTilesCount,
        keysReachable: reachability.reachableKeys.size,
        exitReached: reachability.exitReached,
      },
    };
  }

  /**
   * BFS Pathfinding simulating player movement, elevation changes, and key unlocks
   * @param {object} level
   * @param {Map<string, object>} keyEntities
   * @param {Array<object>} doorEntities
   * @param {Set<string>} [lockedDoorIds] Set of door IDs forbidden to unlock
   */
  static analyzeReachability(level, keyEntities, doorEntities, lockedDoorIds = new Set()) {
    const { width, height } = level.dimensions;
    const spawn = level.spawn;
    const exit = level.exit;

    if (!spawn || !exit) {
      return { exitReached: false, reachableKeys: new Set(), reachableTilesCount: 0 };
    }

    const startX = spawn.x;
    const startY = spawn.y;
    const startElevation = spawn.elevation || ELEVATION.GROUND;

    const collectedKeys = new Set();
    const reachableKeys = new Set();
    const visitedStates = new Set();

    let exitReached = false;
    const reachableTiles = new Set(); // "x,y"

    // Construct entity list where lockedDoorIds are forced closed with a non-existent key
    const testEntities = (level.entities || []).map(e => {
      if (e.type === ENTITY_TYPES.DOOR && lockedDoorIds.has(e.id)) {
        return { ...e, isOpen: false, requiresKey: '__NEVER_UNLOCKABLE__' };
      }
      return { ...e };
    });

    // Multi-pass BFS: whenever a new key is collected, previously blocked doors might now open
    let keysChanged = true;

    while (keysChanged) {
      keysChanged = false;
      const queue = [{ x: startX, y: startY, elevation: startElevation }];
      const visitedThisPass = new Set();

      while (queue.length > 0) {
        const { x, y, elevation } = queue.shift();
        const posKey = `${x},${y}`;
        const stateKey = `${x},${y},${elevation}`;

        reachableTiles.add(posKey);

        if (visitedThisPass.has(stateKey)) continue;
        visitedThisPass.add(stateKey);

        // Check if exit reached
        if (x === exit.x && y === exit.y) {
          exitReached = true;
        }

        // Check for keys at this position
        for (const [keyId, keyEntity] of keyEntities.entries()) {
          if (keyEntity.x === x && keyEntity.y === y && !collectedKeys.has(keyId)) {
            collectedKeys.add(keyId);
            reachableKeys.add(keyId);
            keysChanged = true;
          }
        }

        // Explore 4 directions
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

          // Evaluate collision using CollisionEngine
          const moveResult = CollisionEngine.checkMove(
            x,
            y,
            nx,
            ny,
            elevation,
            level,
            testEntities,
            Array.from(collectedKeys)
          );

          if (moveResult.allowed) {
            const nextElevation = moveResult.nextElevation ?? elevation;
            queue.push({ x: nx, y: ny, elevation: nextElevation });
          }
        }
      }
    }

    return {
      exitReached,
      reachableKeys,
      reachableTilesCount: reachableTiles.size,
    };
  }
}
