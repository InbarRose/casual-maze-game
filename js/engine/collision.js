/**
 * Multi-Elevation Collision & Traversal Engine
 */

import { TILES, ELEVATION, ENTITY_TYPES } from '../core/constants.js';

export class CollisionEngine {
  /**
   * Evaluates if a move from (fromX, fromY) to (toX, toY) is allowed given current elevation.
   * Also computes the resulting elevation upon completing the move.
   *
   * @param {number} fromX
   * @param {number} fromY
   * @param {number} toX
   * @param {number} toY
   * @param {number} currentElevation 0 (Ground) or 1 (Overhead)
   * @param {object} level Canonical level object
   * @param {Array<object>} entities Runtime entities
   * @param {Array<string>} inventory Player inventory key IDs
   * @returns {{ allowed: boolean, nextElevation: number, doorToUnlock: object|null, reason?: string }}
   */
  static checkMove(fromX, fromY, toX, toY, currentElevation, level, entities = [], inventory = []) {
    const { width, height } = level.dimensions;

    // 1. Boundary check
    if (toX < 0 || toX >= width || toY < 0 || toY >= height) {
      return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'out_of_bounds' };
    }

    const dx = toX - fromX;
    const dy = toY - fromY;

    // Movement direction
    const isHorizontal = dx !== 0 && dy === 0;
    const isVertical = dy !== 0 && dx === 0;

    if (!isHorizontal && !isVertical) {
      return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'diagonal_disallowed' };
    }

    const groundTile = level.layers.ground[toY]?.[toX];
    const overheadTile = level.layers.overhead?.[toY]?.[toX];
    const currentGroundTile = level.layers.ground[fromY]?.[fromX];

    let targetElevation = currentElevation;

    // 2. RAMP TRAVERSAL LOGIC
    // Check if moving onto a ramp or off a ramp
    const isOntoRamp = this.isRamp(groundTile);
    const isFromRamp = this.isRamp(currentGroundTile);

    if (isOntoRamp) {
      const rampCheck = this.evaluateRampEntry(groundTile, dx, dy, currentElevation);
      if (!rampCheck.allowed) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'invalid_ramp_angle' };
      }
      targetElevation = rampCheck.nextElevation;
    } else if (isFromRamp) {
      const rampExitCheck = this.evaluateRampExit(currentGroundTile, dx, dy, currentElevation);
      if (!rampExitCheck.allowed) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'invalid_ramp_exit' };
      }
      targetElevation = rampExitCheck.nextElevation;
    }

    // 3. ELEVATION-SPECIFIC CHECKS
    if (targetElevation === ELEVATION.GROUND) {
      // Ground Level checks:
      if (groundTile === TILES.WALL) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'wall_hit' };
      }

      // Check Bridge Constraints on Ground:
      // B_EW allows E-W only on ground. N-S is blocked on ground.
      if (groundTile === TILES.BRIDGE_EW && !isHorizontal) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'bridge_ground_cross_blocked' };
      }
      // B_NS allows N-S only on ground. E-W is blocked on ground.
      if (groundTile === TILES.BRIDGE_NS && !isVertical) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'bridge_ground_cross_blocked' };
      }
    } else {
      // Overhead Level checks (Elevation 1):
      // On overhead, the target tile must be an overhead bridge, ramp, or traversable overhead floor.
      const isOverheadPassable =
        overheadTile === TILES.BRIDGE_EW ||
        overheadTile === TILES.BRIDGE_NS ||
        overheadTile === TILES.FLOOR ||
        this.isRamp(groundTile);

      if (!isOverheadPassable) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'no_overhead_path' };
      }

      // Check Bridge Constraints on Overhead:
      // B_EW on overhead allows N-S movement only. E-W is blocked on overhead.
      if ((overheadTile === TILES.BRIDGE_EW || groundTile === TILES.BRIDGE_EW) && !isVertical && !this.isRamp(groundTile)) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'bridge_overhead_cross_blocked' };
      }
      // B_NS on overhead allows E-W movement only. N-S is blocked on overhead.
      if ((overheadTile === TILES.BRIDGE_NS || groundTile === TILES.BRIDGE_NS) && !isHorizontal && !this.isRamp(groundTile)) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'bridge_overhead_cross_blocked' };
      }
    }

    // 4. ENTITY COLLISION (Doors, Locks)
    const door = entities.find(e => e.type === ENTITY_TYPES.DOOR && e.x === toX && e.y === toY);
    if (door && !door.isOpen) {
      // Check if player has matching key
      const hasKey = inventory.includes(door.requiresKey);
      if (hasKey) {
        return {
          allowed: true,
          nextElevation: targetElevation,
          doorToUnlock: door,
          reason: 'door_unlocked',
        };
      } else {
        return {
          allowed: false,
          nextElevation: currentElevation,
          doorToUnlock: door,
          reason: 'door_locked',
        };
      }
    }

    return {
      allowed: true,
      nextElevation: targetElevation,
      doorToUnlock: null,
    };
  }

  /**
   * Helper to check if tile code is any ramp
   * @param {*} tile
   * @returns {boolean}
   */
  static isRamp(tile) {
    return (
      tile === TILES.RAMP_N ||
      tile === TILES.RAMP_S ||
      tile === TILES.RAMP_E ||
      tile === TILES.RAMP_W
    );
  }

  /**
   * Evaluates moving onto a ramp tile
   * @param {*} rampTile
   * @param {number} dx
   * @param {number} dy
   * @param {number} currentElev
   * @returns {{ allowed: boolean, nextElevation: number }}
   */
  static evaluateRampEntry(rampTile, dx, dy, currentElev) {
    switch (rampTile) {
      case TILES.RAMP_N:
        // Moving North (dy === -1) climbs UP from 0 to 1
        if (dy === -1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        // Moving South (dy === 1) comes from overhead down towards 0
        if (dy === 1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev };

      case TILES.RAMP_S:
        // Moving South (dy === 1) climbs UP from 0 to 1
        if (dy === 1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        // Moving North (dy === -1) descends down towards 0
        if (dy === -1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev };

      case TILES.RAMP_E:
        // Moving East (dx === 1) climbs UP from 0 to 1
        if (dx === 1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        // Moving West (dx === -1) descends down towards 0
        if (dx === -1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev };

      case TILES.RAMP_W:
        // Moving West (dx === -1) climbs UP from 0 to 1
        if (dx === -1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        // Moving East (dx === 1) descends down towards 0
        if (dx === 1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev };

      default:
        return { allowed: true, nextElevation: currentElev };
    }
  }

  /**
   * Evaluates exiting off a ramp tile
   * @param {*} rampTile
   * @param {number} dx
   * @param {number} dy
   * @param {number} currentElev
   * @returns {{ allowed: boolean, nextElevation: number }}
   */
  static evaluateRampExit(rampTile, dx, dy, currentElev) {
    switch (rampTile) {
      case TILES.RAMP_N:
        if (dy === -1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        if (dy === 1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev };

      case TILES.RAMP_S:
        if (dy === 1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        if (dy === -1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev };

      case TILES.RAMP_E:
        if (dx === 1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        if (dx === -1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev };

      case TILES.RAMP_W:
        if (dx === -1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        if (dx === 1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev };

      default:
        return { allowed: true, nextElevation: currentElev };
    }
  }
}
