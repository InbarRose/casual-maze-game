/**
 * Casual Maze Game — Level Validator & Solvability Analyzer
 */

import { TILES, ELEVATION, ENTITY_TYPES, LAYERS, formatXYZ } from '../core/constants.js';
import { validateLevelVersion, LEVEL_SCHEMA_VERSION } from '../core/version.js';
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

    // 0. Version & Schema check
    if (level.version !== undefined) {
      const vNum = Number(level.version);
      if (Number.isNaN(vNum) || vNum < 1 || !Number.isInteger(vNum)) {
        errors.push({ message: `Invalid level version: ${JSON.stringify(level.version)}. Version must be a positive integer.` });
      }
    } else {
      info.push('Level has no explicit version property (defaulting to v1).');
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
      const { x: sx, y: sy, z: sz = level.spawn.elevation ?? 0 } = level.spawn;
      if (sx < 0 || sx >= width || sy < 0 || sy >= height) {
        errors.push({ message: `Spawn point ${formatXYZ(sx, sy, sz)} is outside maze bounds (${width}x${height}).`, x: sx, y: sy });
      } else {
        const spawnTile = sz === ELEVATION.OVERHEAD ? overhead[sy]?.[sx] : ground[sy]?.[sx];
        if (spawnTile === TILES.WALL) {
          errors.push({ message: `Spawn point ${formatXYZ(sx, sy, sz)} is placed inside a solid wall.`, x: sx, y: sy });
        }
      }
    }

    // 3. Exit validation
    if (!level.exit || typeof level.exit.x !== 'number' || typeof level.exit.y !== 'number') {
      errors.push({ message: 'Missing exit point.' });
    } else {
      const { x: ex, y: ey, z: ez = level.exit.elevation ?? 0 } = level.exit;
      if (ex < 0 || ex >= width || ey < 0 || ey >= height) {
        errors.push({ message: `Exit point ${formatXYZ(ex, ey, ez)} is outside maze bounds (${width}x${height}).`, x: ex, y: ey });
      } else {
        const exitGroundTile = ez === ELEVATION.OVERHEAD ? overhead[ey]?.[ex] : ground[ey]?.[ex];
        if (exitGroundTile === TILES.WALL) {
          errors.push({ message: `Exit point ${formatXYZ(ex, ey, ez)} is placed inside a solid wall.`, x: ex, y: ey });
        }
      }

      if (level.spawn && level.spawn.x === level.exit.x && level.spawn.y === level.exit.y && (level.spawn.z ?? level.spawn.elevation ?? 0) === (level.exit.z ?? level.exit.elevation ?? 0)) {
        warnings.push({ message: 'Spawn and Exit are on the exact same tile.', x: ex, y: ey });
      }
    }

    // 4. Entity Integrity Checks
    const entityIds = new Set();
    const keyEntities = new Map(); // keyId -> entity
    const doorEntities = [];
    const leverEntities = [];
    const teleporterEntities = [];
    const patrollerEntities = [];
    const pedestalEntities = [];
    const riddleItemEntities = new Map();

    for (const entity of entities) {
      const ez = entity.z ?? entity.elevation ?? 0;
      if (!entity.id) {
        errors.push({ message: `Entity of type "${entity.type}" is missing an ID.`, x: entity.x, y: entity.y });
      } else if (entityIds.has(entity.id)) {
        errors.push({ message: `Duplicate entity ID "${entity.id}".`, entityId: entity.id, x: entity.x, y: entity.y });
      } else {
        entityIds.add(entity.id);
      }

      if (entity.x < 0 || entity.x >= width || entity.y < 0 || entity.y >= height) {
        errors.push({ message: `Entity "${entity.id}" ${formatXYZ(entity.x, entity.y, ez)} is outside maze bounds.`, entityId: entity.id, x: entity.x, y: entity.y });
      }

      if (entity.type === ENTITY_TYPES.KEY) {
        keyEntities.set(entity.id, entity);
      } else if (entity.type === ENTITY_TYPES.DOOR) {
        doorEntities.push(entity);
      } else if (entity.type === ENTITY_TYPES.LEVER) {
        leverEntities.push(entity);
      } else if (entity.type === ENTITY_TYPES.TELEPORTER) {
        teleporterEntities.push(entity);
      } else if (entity.type === ENTITY_TYPES.PATROLLER) {
        patrollerEntities.push(entity);
      } else if (entity.type === ENTITY_TYPES.CHECKPOINT) {
        const tile = ez === ELEVATION.OVERHEAD ? overhead[entity.y]?.[entity.x] : ground[entity.y]?.[entity.x];
        if (tile === TILES.WALL) {
          errors.push({
            message: `Checkpoint "${entity.id}" at ${formatXYZ(entity.x, entity.y, ez)} is placed inside a solid wall.`,
            entityId: entity.id,
            x: entity.x,
            y: entity.y,
          });
        }
      } else if (entity.type === ENTITY_TYPES.COLLECTIBLE) {
        const tile = ez === ELEVATION.OVERHEAD ? overhead[entity.y]?.[entity.x] : ground[entity.y]?.[entity.x];
        if (tile === TILES.WALL) {
          errors.push({
            message: `Collectible "${entity.id}" at ${formatXYZ(entity.x, entity.y, ez)} is placed inside a solid wall.`,
            entityId: entity.id,
            x: entity.x,
            y: entity.y,
          });
        }
      } else if (entity.type === ENTITY_TYPES.PEDESTAL) {
        pedestalEntities.push(entity);
        const tile = ez === ELEVATION.OVERHEAD ? overhead[entity.y]?.[entity.x] : ground[entity.y]?.[entity.x];
        if (tile === TILES.WALL) {
          errors.push({
            message: `Pedestal "${entity.id}" at ${formatXYZ(entity.x, entity.y, ez)} is placed inside a solid wall.`,
            entityId: entity.id,
            x: entity.x,
            y: entity.y,
          });
        }
      } else if (entity.type === ENTITY_TYPES.RIDDLE_ITEM) {
        riddleItemEntities.set(entity.id, entity);
        const tile = ez === ELEVATION.OVERHEAD ? overhead[entity.y]?.[entity.x] : ground[entity.y]?.[entity.x];
        if (tile === TILES.WALL) {
          errors.push({
            message: `Riddle Item "${entity.id}" at ${formatXYZ(entity.x, entity.y, ez)} is placed inside a solid wall.`,
            entityId: entity.id,
            x: entity.x,
            y: entity.y,
          });
        }
      }
    }

    // Cross-room entity registration for multi-room levels
    if (level.rooms && typeof level.rooms === 'object') {
      for (const room of Object.values(level.rooms)) {
        if (Array.isArray(room.entities)) {
          for (const rent of room.entities) {
            if (rent.type === ENTITY_TYPES.KEY && !keyEntities.has(rent.id)) {
              keyEntities.set(rent.id, rent);
            }
            if (rent.type === ENTITY_TYPES.RIDDLE_ITEM && !riddleItemEntities.has(rent.id)) {
              riddleItemEntities.set(rent.id, rent);
            }
            if (rent.type === ENTITY_TYPES.DOOR && !doorEntities.some(d => d.id === rent.id)) {
              doorEntities.push(rent);
            }
          }
        }
      }
    }

    // Check Pedestals for accepted items and target doors
    for (const ped of pedestalEntities) {
      const pz = ped.z ?? ped.elevation ?? 0;
      if (ped.acceptedItemId && !riddleItemEntities.has(ped.acceptedItemId)) {
        warnings.push({
          message: `Pedestal "${ped.id}" at ${formatXYZ(ped.x, ped.y, pz)} requires riddle item "${ped.acceptedItemId}", but no matching riddle item exists in the level.`,
          entityId: ped.id,
          x: ped.x,
          y: ped.y,
        });
      }
      if (ped.targetDoorId) {
        const matchingDoor = doorEntities.find(d => d.id === ped.targetDoorId);
        if (!matchingDoor) {
          warnings.push({
            message: `Pedestal "${ped.id}" targets door "${ped.targetDoorId}", but no such door exists in the level.`,
            entityId: ped.id,
            x: ped.x,
            y: ped.y,
          });
        }
      }
    }

    // Check Doors for valid matching keys or pedestal triggers
    const pedestalTargets = new Set(
      entities.filter(e => e.type === 'pedestal' && e.targetDoorId).map(e => e.targetDoorId)
    );

    for (const door of doorEntities) {
      const dz = door.z ?? door.elevation ?? 0;
      if (door.requiresKey && !keyEntities.has(door.requiresKey)) {
        errors.push({
          message: `Door "${door.id}" at ${formatXYZ(door.x, door.y, dz)} requires key "${door.requiresKey}", but no such key exists in the level.`,
          entityId: door.id,
          x: door.x,
          y: door.y,
        });
      } else if (!door.requiresKey && !pedestalTargets.has(door.id)) {
        warnings.push({
          message: `Door "${door.id}" at ${formatXYZ(door.x, door.y, dz)} has no required key assigned and will always be locked.`,
          entityId: door.id,
          x: door.x,
          y: door.y,
        });
      }
    }


    // Check Levers for target bounds
    for (const lever of leverEntities) {
      const lz = lever.z ?? lever.elevation ?? 0;
      if (!lever.targets || lever.targets.length === 0) {
        warnings.push({
          message: `Lever "${lever.id}" at ${formatXYZ(lever.x, lever.y, lz)} has no linked target tiles.`,
          entityId: lever.id,
          x: lever.x,
          y: lever.y,
        });
      } else {
        for (const target of lever.targets) {
          const tz = target.layer === 'overhead' ? 1 : 0;
          if (target.x < 0 || target.x >= width || target.y < 0 || target.y >= height) {
            errors.push({
              message: `Lever "${lever.id}" targets out-of-bounds tile ${formatXYZ(target.x, target.y, tz)}.`,
              entityId: lever.id,
              x: lever.x,
              y: lever.y,
            });
          }
        }
      }
    }

    // Check Teleporters
    for (const tp of teleporterEntities) {
      const tz = tp.targetZ ?? tp.targetElevation ?? 0;
      if (tp.targetX === undefined || tp.targetY === undefined || tp.targetX < 0 || tp.targetX >= width || tp.targetY < 0 || tp.targetY >= height) {
        errors.push({
          message: `Teleporter "${tp.id}" targets out-of-bounds coordinate ${formatXYZ(tp.targetX, tp.targetY, tz)}.`,
          entityId: tp.id,
          x: tp.x,
          y: tp.y,
        });
      } else {
        const destTile = tz === ELEVATION.OVERHEAD ? overhead[tp.targetY]?.[tp.targetX] : ground[tp.targetY]?.[tp.targetX];
        if (destTile === TILES.WALL) {
          errors.push({
            message: `Teleporter "${tp.id}" targets a solid wall at ${formatXYZ(tp.targetX, tp.targetY, tz)}.`,
            entityId: tp.id,
            x: tp.x,
            y: tp.y,
          });
        }
      }
    }

    // Check Patrollers
    for (const pat of patrollerEntities) {
      if (Array.isArray(pat.waypoints)) {
        for (const wp of pat.waypoints) {
          if (wp.x < 0 || wp.x >= width || wp.y < 0 || wp.y >= height) {
            errors.push({
              message: `Patroller "${pat.id}" has an out-of-bounds waypoint at (${wp.x}, ${wp.y}).`,
              entityId: pat.id,
              x: pat.x,
              y: pat.y,
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

    if (level.rooms && typeof level.rooms === 'object') {
      // Validate individual room structure for multi-room dungeons
      for (const [roomId, room] of Object.entries(level.rooms)) {
        const rw = room.dimensions?.width ?? 0;
        const rh = room.dimensions?.height ?? 0;
        if (rw < 5 || rh < 5) {
          errors.push({ message: `Room "${roomId}" dimensions (${rw}x${rh}) are too small (minimum 5x5).` });
        }
        if (!room.spawn) {
          errors.push({ message: `Room "${roomId}" is missing a spawn point.` });
        }
        if (!Array.isArray(room.exits) || room.exits.length === 0) {
          warnings.push({ message: `Room "${roomId}" has no exits defined.` });
        } else {
          for (const exit of room.exits) {
            if (exit.x < 0 || exit.x >= rw || exit.y < 0 || exit.y >= rh) {
              errors.push({ message: `Room "${roomId}" exit "${exit.id || 'unnamed'}" at (${exit.x}, ${exit.y}) is outside room bounds.` });
            }
          }
        }
      }
    } else if (level.spawn && level.exit && errors.length === 0) {
      const sz = level.spawn.z ?? level.spawn.elevation ?? 0;
      const ez = level.exit.z ?? level.exit.elevation ?? 0;
      if (!reachability.exitReached) {
        errors.push({
          message: `Exit at ${formatXYZ(level.exit.x, level.exit.y, ez)} is UNREACHABLE from Spawn ${formatXYZ(level.spawn.x, level.spawn.y, sz)}.`,
          x: level.exit.x,
          y: level.exit.y,
        });
      }

      // Check Key-Before-Gate Dependencies & Unreachable Keys
      for (const door of doorEntities) {
        const dz = door.z ?? door.elevation ?? 0;
        if (door.requiresKey && keyEntities.has(door.requiresKey)) {
          if (!reachability.reachableKeys.has(door.requiresKey)) {
            errors.push({
              message: `Door "${door.id}" at ${formatXYZ(door.x, door.y, dz)} requires key "${door.requiresKey}", but the key is unreachable before unlocking this door (key is behind the door or blocked).`,
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
          const dz = door.z ?? door.elevation ?? 0;
          const isGated = (door.requiresKey && keyEntities.has(door.requiresKey)) || pedestalTargets.has(door.id);
          if (isGated) {
            const bypassCheck = this.analyzeReachability(level, keyEntities, doorEntities, new Set([door.id]));
            if (bypassCheck.exitReached) {
              warnings.push({
                message: `Door "${door.id}" (${door.color || 'gate'}) at ${formatXYZ(door.x, door.y, dz)} can be bypassed without unlocking it to beat the level.`,
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
        const kz = keyEntity.z ?? keyEntity.elevation ?? 0;
        if (!keysUsedByDoors.has(keyId)) {
          warnings.push({
            message: `Key "${keyEntity.name || keyId}" at ${formatXYZ(keyEntity.x, keyEntity.y, kz)} is not required by any door.`,
            entityId: keyId,
            x: keyEntity.x,
            y: keyEntity.y,
          });
        }
      }

      // Check for Unreachable Keys (that weren't already flagged in door error)
      for (const [keyId, keyEntity] of keyEntities.entries()) {
        const kz = keyEntity.z ?? keyEntity.elevation ?? 0;
        if (!reachability.reachableKeys.has(keyId) && !keysUsedByDoors.has(keyId)) {
          warnings.push({
            message: `Key "${keyEntity.name || keyId}" at ${formatXYZ(keyEntity.x, keyEntity.y, kz)} is unreachable.`,
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
    const toggledLevers = new Set();
    const currentGround = (level.layers?.ground || []).map(r => [...r]);

    let exitReached = false;
    const reachableTiles = new Set(); // "x,y"

    const pedestalTargets = new Set(
      (level.entities || []).filter(e => e.type === 'pedestal' && e.targetDoorId).map(e => e.targetDoorId)
    );

    // Construct entity list where lockedDoorIds are forced closed with a non-existent key,
    // and puzzle gates / pedestal doors are marked unlockable (solvable) by default
    const testEntities = (level.entities || []).map(e => {
      if (e.type === ENTITY_TYPES.DOOR) {
        if (lockedDoorIds.has(e.id)) {
          return { ...e, isOpen: false, requiresKey: '__NEVER_UNLOCKABLE__' };
        }
        if (pedestalTargets.has(e.id)) {
          return { ...e, isOpen: true };
        }
      }
      if (e.type === ENTITY_TYPES.PUZZLE_GATE) {
        return { ...e, isUnlocked: true };
      }
      return { ...e };
    });

    // Multi-pass BFS: whenever a new key is collected or lever flipped, previously blocked passages might open
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

        // Check for keys at this position and elevation
        for (const [keyId, keyEntity] of keyEntities.entries()) {
          const kz = keyEntity.z ?? keyEntity.elevation ?? 0;
          if (keyEntity.x === x && keyEntity.y === y && kz === elevation && !collectedKeys.has(keyId)) {
            collectedKeys.add(keyId);
            reachableKeys.add(keyId);
            keysChanged = true;
          }
        }

        // Check for levers at this position and elevation
        for (const entity of level.entities || []) {
          if (
            entity.type === ENTITY_TYPES.LEVER &&
            entity.x === x &&
            entity.y === y &&
            (entity.z ?? entity.elevation ?? 0) === elevation &&
            !toggledLevers.has(entity.id)
          ) {
            toggledLevers.add(entity.id);
            for (const t of entity.targets || []) {
              if (t.layer === 'ground' && t.x !== undefined && t.y !== undefined) {
                currentGround[t.y][t.x] = t.stateA ?? 0;
                keysChanged = true;
              }
            }
          }
        }

        // Check for teleporters at this position
        for (const entity of level.entities || []) {
          if (
            entity.type === ENTITY_TYPES.TELEPORTER &&
            entity.x === x &&
            entity.y === y &&
            (entity.z ?? entity.elevation ?? 0) === elevation
          ) {
            const tx = entity.targetX;
            const ty = entity.targetY;
            const tz = entity.targetZ ?? entity.targetElevation ?? 0;
            const tpStateKey = `${tx},${ty},${tz}`;
            if (!visitedThisPass.has(tpStateKey)) {
              queue.push({ x: tx, y: ty, elevation: tz });
            }
          }
        }

        // Explore 4 directions
        const dirs = [
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
        ];

        const curLevel = {
          ...level,
          layers: {
            ground: currentGround,
            overhead: level.layers?.overhead || [],
          },
        };

        for (const d of dirs) {
          const nx = x + d.dx;
          const ny = y + d.dy;

          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

          // Evaluate collision using CollisionEngine with active ground layer
          const moveResult = CollisionEngine.checkMove(
            x,
            y,
            nx,
            ny,
            elevation,
            curLevel,
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

  /**
   * Convenience helper to evaluate solvability and reachability for a level
   * @param {object} level
   * @returns {{ exitReached: boolean, reachableKeys: Set<string>, reachableTilesCount: number }}
   */
  static checkReachability(level) {
    const keyMap = new Map((level.entities || []).filter(e => e.type === 'key').map(e => [e.id, e]));
    const doorList = (level.entities || []).filter(e => e.type === 'door');
    return this.analyzeReachability(level, keyMap, doorList);
  }

  /**
   * Validate level version against engine compatibility
   * @param {object} level
   * @returns {{ valid: boolean, error?: string, version: number, schemaVersion: string }}
   */
  static validateVersion(level) {
    return validateLevelVersion(level);
  }

  /**
   * One-Click Diagnostic Auto-Fixer (BL-21)
   * Automatically resolves common level validation errors:
   * - Missing / out-of-bounds / wall-encased spawn and exit points
   * - Orphaned doors missing keys (generates matching keys on reachable ground)
   * - Missing approach ramps for multi-elevation bridges (B_EW and B_NS)
   * - Entities placed inside solid walls (clears wall or relocates entity)
   * - Out-of-bounds lever targets
   * - Exit reachability corridor carve
   *
   * @param {object} level The level data object
   * @returns {{ fixedLevel: object, changes: string[], fixedCount: number }}
   */
  static autoFix(level) {
    if (!level || typeof level !== 'object') {
      return { fixedLevel: level, changes: [], fixedCount: 0 };
    }

    const fixed = JSON.parse(JSON.stringify(level));
    const changes = [];

    // Ensure valid schema version
    if (!fixed.version || typeof fixed.version !== 'number') {
      fixed.version = LEVEL_SCHEMA_VERSION;
      changes.push(`Set level schema version to v${LEVEL_SCHEMA_VERSION}`);
    }

    // Ensure dimensions
    if (!fixed.dimensions || typeof fixed.dimensions.width !== 'number' || typeof fixed.dimensions.height !== 'number') {
      fixed.dimensions = { width: 15, height: 15 };
      changes.push('Normalized missing dimensions to default 15x15');
    }
    fixed.dimensions.width = Math.max(5, fixed.dimensions.width);
    fixed.dimensions.height = Math.max(5, fixed.dimensions.height);
    const { width, height } = fixed.dimensions;

    // Ensure layers structure
    if (!fixed.layers) fixed.layers = {};
    if (!Array.isArray(fixed.layers.ground)) fixed.layers.ground = [];
    if (!Array.isArray(fixed.layers.overhead)) fixed.layers.overhead = [];

    for (let y = 0; y < height; y++) {
      if (!Array.isArray(fixed.layers.ground[y])) {
        fixed.layers.ground[y] = new Array(width).fill(0);
      }
      if (!Array.isArray(fixed.layers.overhead[y])) {
        fixed.layers.overhead[y] = new Array(width).fill(0);
      }
      while (fixed.layers.ground[y].length < width) fixed.layers.ground[y].push(0);
      while (fixed.layers.overhead[y].length < width) fixed.layers.overhead[y].push(0);
    }

    if (!Array.isArray(fixed.entities)) {
      fixed.entities = [];
    }

    const ground = fixed.layers.ground;
    const overhead = fixed.layers.overhead;

    // Helper: Find open floor tile on ground
    const findOpenFloor = (excludeCoords = new Set()) => {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          if (!excludeCoords.has(`${x},${y}`) && ground[y][x] === 0) {
            return { x, y };
          }
        }
      }
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (!excludeCoords.has(`${x},${y}`) && ground[y][x] === 0) {
            return { x, y };
          }
        }
      }
      return null;
    };

    const usedCoords = new Set();

    // 1. Fix Entities in solid walls
    for (const ent of fixed.entities) {
      if (typeof ent.x === 'number' && typeof ent.y === 'number') {
        const ez = ent.z ?? ent.elevation ?? 0;
        const layerTiles = ez === ELEVATION.OVERHEAD ? overhead : ground;
        if (layerTiles[ent.y]?.[ent.x] === TILES.WALL) {
          const isInterior = ent.x > 0 && ent.x < width - 1 && ent.y > 0 && ent.y < height - 1;
          if (isInterior) {
            layerTiles[ent.y][ent.x] = 0;
            changes.push(`Cleared solid wall at (${ent.x}, ${ent.y}) around entity "${ent.name || ent.id}"`);
          } else {
            const open = findOpenFloor(usedCoords);
            if (open) {
              ent.x = open.x;
              ent.y = open.y;
              changes.push(`Relocated entity "${ent.name || ent.id}" from perimeter wall to open floor at (${ent.x}, ${ent.y})`);
            }
          }
        }
        usedCoords.add(`${ent.x},${ent.y}`);
      }
    }

    // 2. Fix Spawn Point
    if (!fixed.spawn || typeof fixed.spawn.x !== 'number' || typeof fixed.spawn.y !== 'number') {
      const open = findOpenFloor(usedCoords) || { x: 1, y: 1 };
      fixed.spawn = { x: open.x, y: open.y, elevation: 0 };
      ground[open.y][open.x] = 0;
      changes.push(`Created missing spawn point at (${open.x}, ${open.y}, 0)`);
    } else {
      const sx = fixed.spawn.x;
      const sy = fixed.spawn.y;
      if (sx < 0 || sx >= width || sy < 0 || sy >= height) {
        const open = findOpenFloor(usedCoords) || { x: 1, y: 1 };
        fixed.spawn = { x: open.x, y: open.y, elevation: 0 };
        ground[open.y][open.x] = 0;
        changes.push(`Relocated out-of-bounds spawn to (${open.x}, ${open.y}, 0)`);
      } else if (ground[sy][sx] === TILES.WALL) {
        const isInterior = sx > 0 && sx < width - 1 && sy > 0 && sy < height - 1;
        if (isInterior) {
          ground[sy][sx] = 0;
          changes.push(`Cleared wall blocking spawn point at (${sx}, ${sy}) to open floor`);
        } else {
          const open = findOpenFloor(usedCoords) || { x: 1, y: 1 };
          fixed.spawn = { x: open.x, y: open.y, elevation: 0 };
          ground[open.y][open.x] = 0;
          changes.push(`Relocated perimeter spawn point to (${open.x}, ${open.y}, 0)`);
        }
      }
    }
    usedCoords.add(`${fixed.spawn.x},${fixed.spawn.y}`);

    // 3. Fix Exit Point
    if (!fixed.exit || typeof fixed.exit.x !== 'number' || typeof fixed.exit.y !== 'number') {
      let ex = width - 2;
      let ey = height - 2;
      if (ex === fixed.spawn.x && ey === fixed.spawn.y) {
        ex = width - 2;
        ey = 1;
      }
      ground[ey][ex] = 0;
      fixed.exit = { x: ex, y: ey, elevation: 0 };
      changes.push(`Created missing exit point at (${ex}, ${ey}, 0)`);
    } else {
      const ex = fixed.exit.x;
      const ey = fixed.exit.y;
      if (ex < 0 || ex >= width || ey < 0 || ey >= height) {
        let nex = width - 2;
        let ney = height - 2;
        ground[ney][nex] = 0;
        fixed.exit = { x: nex, y: ney, elevation: 0 };
        changes.push(`Relocated out-of-bounds exit point to (${nex}, ${ney}, 0)`);
      } else if (ground[ey][ex] === TILES.WALL) {
        ground[ey][ex] = 0;
        changes.push(`Cleared wall blocking exit point at (${ex}, ${ey}) to open floor`);
      }
    }
    usedCoords.add(`${fixed.exit.x},${fixed.exit.y}`);

    // 4. Fix Orphaned / Missing Keys for Locked Doors
    const existingKeyIds = new Set(fixed.entities.filter(e => e.type === 'key').map(e => e.id));
    const pedestalTargets = new Set(fixed.entities.filter(e => e.type === 'pedestal' && e.targetDoorId).map(e => e.targetDoorId));

    for (const ent of fixed.entities) {
      if (ent.type === 'door') {
        if (ent.requiresKey && !existingKeyIds.has(ent.requiresKey)) {
          const open = findOpenFloor(usedCoords) || { x: Math.max(1, ent.x - 1), y: ent.y };
          ground[open.y][open.x] = 0;
          const newKey = {
            id: ent.requiresKey,
            type: 'key',
            name: `${ent.name || 'Door'} Key`,
            color: ent.color || '#fbbf24',
            x: open.x,
            y: open.y,
            elevation: 0,
            z: 0,
          };
          fixed.entities.push(newKey);
          existingKeyIds.add(newKey.id);
          usedCoords.add(`${open.x},${open.y}`);
          changes.push(`Generated missing key "${newKey.id}" at (${open.x}, ${open.y}) for door "${ent.id}"`);
        } else if (!ent.requiresKey && !pedestalTargets.has(ent.id)) {
          const keyId = `key_${ent.id}`;
          ent.requiresKey = keyId;
          const open = findOpenFloor(usedCoords) || { x: Math.max(1, ent.x - 1), y: ent.y };
          ground[open.y][open.x] = 0;
          const newKey = {
            id: keyId,
            type: 'key',
            name: `${ent.name || 'Door'} Key`,
            color: ent.color || '#fbbf24',
            x: open.x,
            y: open.y,
            elevation: 0,
            z: 0,
          };
          fixed.entities.push(newKey);
          existingKeyIds.add(keyId);
          usedCoords.add(`${open.x},${open.y}`);
          changes.push(`Assigned required key "${keyId}" at (${open.x}, ${open.y}) to unlocked door "${ent.id}"`);
        }
      }
    }

    // 5. Fix Missing Approach Ramps for Bridges
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const gTile = ground[y][x];
        const oTile = overhead[y][x];

        if (gTile === TILES.BRIDGE_EW || oTile === TILES.BRIDGE_EW) {
          if (overhead[y][x] !== TILES.BRIDGE_EW) overhead[y][x] = TILES.BRIDGE_EW;
          if (ground[y][x] !== TILES.BRIDGE_EW) ground[y][x] = TILES.BRIDGE_EW;

          const hasNorthRamp = y > 0 && ground[y - 1][x] === TILES.RAMP_S;
          const hasSouthRamp = y < height - 1 && ground[y + 1][x] === TILES.RAMP_N;

          if (!hasNorthRamp && !hasSouthRamp) {
            if (y > 0) {
              ground[y - 1][x] = TILES.RAMP_S;
              changes.push(`Added North approach ramp (R_S) at (${x}, ${y - 1}) for East-West bridge at (${x}, ${y})`);
            }
            if (y < height - 1) {
              ground[y + 1][x] = TILES.RAMP_N;
              changes.push(`Added South approach ramp (R_N) at (${x}, ${y + 1}) for East-West bridge at (${x}, ${y})`);
            }
          }
        } else if (gTile === TILES.BRIDGE_NS || oTile === TILES.BRIDGE_NS) {
          if (overhead[y][x] !== TILES.BRIDGE_NS) overhead[y][x] = TILES.BRIDGE_NS;
          if (ground[y][x] !== TILES.BRIDGE_NS) ground[y][x] = TILES.BRIDGE_NS;

          const hasWestRamp = x > 0 && ground[y][x - 1] === TILES.RAMP_E;
          const hasEastRamp = x < width - 1 && ground[y][x + 1] === TILES.RAMP_W;

          if (!hasWestRamp && !hasEastRamp) {
            if (x > 0) {
              ground[y][x - 1] = TILES.RAMP_E;
              changes.push(`Added West approach ramp (R_E) at (${x - 1}, ${y}) for North-South bridge at (${x}, ${y})`);
            }
            if (x < width - 1) {
              ground[y][x + 1] = TILES.RAMP_W;
              changes.push(`Added East approach ramp (R_W) at (${x + 1}, ${y}) for North-South bridge at (${x}, ${y})`);
            }
          }
        }
      }
    }

    // 6. Fix Out-of-Bounds Lever Targets
    for (const ent of fixed.entities) {
      if (ent.type === 'lever' && Array.isArray(ent.targets)) {
        const initialCount = ent.targets.length;
        ent.targets = ent.targets.filter(t => t && t.x >= 0 && t.x < width && t.y >= 0 && t.y < height);
        if (ent.targets.length < initialCount) {
          changes.push(`Removed ${initialCount - ent.targets.length} out-of-bounds target(s) from lever "${ent.id}"`);
        }
      }
    }

    // 7. Fix Unreachable Exit Corridor
    const reachCheck = LevelValidator.checkReachability(fixed);
    if (!reachCheck.exitReached) {
      let curX = fixed.spawn.x;
      let curY = fixed.spawn.y;
      const targetX = fixed.exit.x;
      const targetY = fixed.exit.y;

      const stepX = targetX >= curX ? 1 : -1;
      while (curX !== targetX) {
        curX += stepX;
        if (curX > 0 && curX < width - 1 && curY > 0 && curY < height - 1) {
          if (ground[curY][curX] === TILES.WALL) ground[curY][curX] = 0;
        }
      }

      const stepY = targetY >= curY ? 1 : -1;
      while (curY !== targetY) {
        curY += stepY;
        if (curX > 0 && curX < width - 1 && curY > 0 && curY < height - 1) {
          if (ground[curY][curX] === TILES.WALL) ground[curY][curX] = 0;
        }
      }

      changes.push(`Carved connecting corridor to ensure exit is reachable from spawn`);
    }

    return {
      fixedLevel: fixed,
      changes,
      fixedCount: changes.length,
    };
  }
}
