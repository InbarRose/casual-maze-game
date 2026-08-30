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

    // Movement direction (orthogonal only)
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
    const isOntoRamp = this.isRamp(groundTile);
    const isFromRamp = this.isRamp(currentGroundTile);

    if (isOntoRamp) {
      const rampCheck = this.evaluateRampEntry(groundTile, dx, dy, currentElevation);
      if (!rampCheck.allowed) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: rampCheck.reason || 'invalid_ramp_entry' };
      }
      targetElevation = rampCheck.nextElevation;
    } else if (isFromRamp) {
      const rampExitCheck = this.evaluateRampExit(currentGroundTile, dx, dy, currentElevation);
      if (!rampExitCheck.allowed) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: rampExitCheck.reason || 'invalid_ramp_exit' };
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
      // On overhead, the target tile must be a bridge or a ramp. Empty space (0) is open air / void.
      const isOverheadBridge =
        overheadTile === TILES.BRIDGE_EW ||
        groundTile === TILES.BRIDGE_EW ||
        overheadTile === TILES.BRIDGE_NS ||
        groundTile === TILES.BRIDGE_NS;

      if (!isOverheadBridge && !isOntoRamp) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'no_overhead_path' };
      }

      // Check Bridge Constraints on Overhead:
      // B_EW on overhead spans North-South across the East-West tunnel below. E-W is blocked by railings.
      if ((overheadTile === TILES.BRIDGE_EW || groundTile === TILES.BRIDGE_EW) && !isVertical && !isOntoRamp) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'bridge_overhead_cross_blocked' };
      }
      // B_NS on overhead spans East-West across the North-South tunnel below. N-S is blocked by railings.
      if ((overheadTile === TILES.BRIDGE_NS || groundTile === TILES.BRIDGE_NS) && !isHorizontal && !isOntoRamp) {
        return { allowed: false, nextElevation: currentElevation, doorToUnlock: null, reason: 'bridge_overhead_cross_blocked' };
      }
    }

    // 4. ENTITY COLLISION (Doors, Locks)
    const door = entities.find(e => e.type === ENTITY_TYPES.DOOR && e.x === toX && e.y === toY && (e.elevation || ELEVATION.GROUND) === targetElevation);
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
      reason: 'ok',
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
   * @returns {{ allowed: boolean, nextElevation: number, reason?: string }}
   */
  static evaluateRampEntry(rampTile, dx, dy, currentElev) {
    switch (rampTile) {
      case TILES.RAMP_N:
        // Slopes UP towards North (Low side at South, High side at North)
        if (dx !== 0) return { allowed: false, nextElevation: currentElev, reason: 'ramp_side_entry_blocked' };
        if (dy === -1 && currentElev === ELEVATION.GROUND) {
          // Moving North from Ground climbs UP to Overhead
          return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        }
        if (dy === 1 && currentElev === ELEVATION.OVERHEAD) {
          // Moving South from Overhead enters ramp descending towards Ground
          return { allowed: true, nextElevation: ELEVATION.GROUND };
        }
        return { allowed: false, nextElevation: currentElev, reason: 'ramp_wrong_elevation' };

      case TILES.RAMP_S:
        // Slopes UP towards South (Low side at North, High side at South)
        if (dx !== 0) return { allowed: false, nextElevation: currentElev, reason: 'ramp_side_entry_blocked' };
        if (dy === 1 && currentElev === ELEVATION.GROUND) {
          // Moving South from Ground climbs UP to Overhead
          return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        }
        if (dy === -1 && currentElev === ELEVATION.OVERHEAD) {
          // Moving North from Overhead enters ramp descending towards Ground
          return { allowed: true, nextElevation: ELEVATION.GROUND };
        }
        return { allowed: false, nextElevation: currentElev, reason: 'ramp_wrong_elevation' };

      case TILES.RAMP_E:
        // Slopes UP towards East (Low side at West, High side at East)
        if (dy !== 0) return { allowed: false, nextElevation: currentElev, reason: 'ramp_side_entry_blocked' };
        if (dx === 1 && currentElev === ELEVATION.GROUND) {
          // Moving East from Ground climbs UP to Overhead
          return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        }
        if (dx === -1 && currentElev === ELEVATION.OVERHEAD) {
          // Moving West from Overhead enters ramp descending towards Ground
          return { allowed: true, nextElevation: ELEVATION.GROUND };
        }
        return { allowed: false, nextElevation: currentElev, reason: 'ramp_wrong_elevation' };

      case TILES.RAMP_W:
        // Slopes UP towards West (Low side at East, High side at West)
        if (dy !== 0) return { allowed: false, nextElevation: currentElev, reason: 'ramp_side_entry_blocked' };
        if (dx === -1 && currentElev === ELEVATION.GROUND) {
          // Moving West from Ground climbs UP to Overhead
          return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        }
        if (dx === 1 && currentElev === ELEVATION.OVERHEAD) {
          // Moving East from Overhead enters ramp descending towards Ground
          return { allowed: true, nextElevation: ELEVATION.GROUND };
        }
        return { allowed: false, nextElevation: currentElev, reason: 'ramp_wrong_elevation' };

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
   * @returns {{ allowed: boolean, nextElevation: number, reason?: string }}
   */
  static evaluateRampExit(rampTile, dx, dy, currentElev) {
    switch (rampTile) {
      case TILES.RAMP_N:
        if (dx !== 0) return { allowed: false, nextElevation: currentElev, reason: 'ramp_side_exit_blocked' };
        if (dy === -1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        if (dy === 1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev, reason: 'invalid_ramp_exit' };

      case TILES.RAMP_S:
        if (dx !== 0) return { allowed: false, nextElevation: currentElev, reason: 'ramp_side_exit_blocked' };
        if (dy === 1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        if (dy === -1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev, reason: 'invalid_ramp_exit' };

      case TILES.RAMP_E:
        if (dy !== 0) return { allowed: false, nextElevation: currentElev, reason: 'ramp_side_exit_blocked' };
        if (dx === 1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        if (dx === -1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev, reason: 'invalid_ramp_exit' };

      case TILES.RAMP_W:
        if (dy !== 0) return { allowed: false, nextElevation: currentElev, reason: 'ramp_side_exit_blocked' };
        if (dx === -1) return { allowed: true, nextElevation: ELEVATION.OVERHEAD };
        if (dx === 1) return { allowed: true, nextElevation: ELEVATION.GROUND };
        return { allowed: false, nextElevation: currentElev, reason: 'invalid_ramp_exit' };

      default:
        return { allowed: true, nextElevation: currentElev };
    }
  }
}
