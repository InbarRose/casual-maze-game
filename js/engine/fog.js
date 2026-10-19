/**
 * Fog-of-War Engine
 * 3-State visibility grid with 2D raycasting line-of-sight and memory persistence.
 */

import { FOG_STATE, TILES } from '../core/constants.js';

export class FogOfWar {
  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    // 0: Unexplored, 1: Explored/Memory, 2: Visible
    this.grid = Array.from({ length: height }, () => new Uint8Array(width));
  }

  /**
   * Resize the fog grid
   * @param {number} width
   * @param {number} height
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    this.grid = Array.from({ length: height }, () => new Uint8Array(width));
  }

  /**
   * Reset all tiles to unexplored, or explored if mapRevealed is true
   * @param {boolean} [mapRevealed=false]
   */
  reset(mapRevealed = false) {
    const initialState = mapRevealed ? FOG_STATE.EXPLORED : FOG_STATE.UNEXPLORED;
    for (let y = 0; y < this.height; y++) {
      this.grid[y].fill(initialState);
    }
  }

  /**
   * Reveal all tiles (e.g. if fogOfWar is disabled)
   */
  revealAll() {
    for (let y = 0; y < this.height; y++) {
      this.grid[y].fill(FOG_STATE.VISIBLE);
    }
  }

  /**
   * Get visibility of a single cell
   * @param {number} x
   * @param {number} y
   * @returns {number} 0, 1, or 2
   */
  getVisibility(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return FOG_STATE.UNEXPLORED;
    }
    return this.grid[y][x];
  }

  /**
   * Check if a cell is at least explored (1 or 2)
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isExplored(x, y) {
    return this.getVisibility(x, y) >= FOG_STATE.EXPLORED;
  }

  /**
   * Check if a cell is currently in active line-of-sight (2)
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isVisible(x, y) {
    return this.getVisibility(x, y) === FOG_STATE.VISIBLE;
  }

  /**
   * Update active line-of-sight using raycasting
   * @param {number} playerX Grid X
   * @param {number} playerY Grid Y
   * @param {number} playerElevation
   * @param {Array<Array<*>>} groundLayer
   * @param {Array<Array<*>>} overheadLayer
   * @param {number} viewRadius
   * @param {Set<string>|Array<string>} [revealedSecrets=null] Set of 'x,y' secret walls already discovered
   */
  update(playerX, playerY, playerElevation, groundLayer, overheadLayer, viewRadius = 6, revealedSecrets = null) {
    // 1. Demote all previously VISIBLE (2) tiles to EXPLORED (1)
    for (let y = 0; y < this.height; y++) {
      const row = this.grid[y];
      for (let x = 0; x < this.width; x++) {
        if (row[x] === FOG_STATE.VISIBLE) {
          row[x] = FOG_STATE.EXPLORED;
        }
      }
    }

    // 2. Mark current player position as visible
    if (playerX >= 0 && playerX < this.width && playerY >= 0 && playerY < this.height) {
      this.grid[playerY][playerX] = FOG_STATE.VISIBLE;
    }

    // 3. Cast 360-degree rays
    const originX = playerX + 0.5;
    const originY = playerY + 0.5;
    const rayCount = 180; // Dense enough for seamless circular coverage
    const stepSize = 0.2; // Sub-tile precision

    // Check if player is elevated (elevation >= 1 or standing on an elevated surface)
    const isPlayerElevated = (Number(playerElevation) >= 1) || this.isElevatedSurface(
      overheadLayer?.[playerY]?.[playerX],
      groundLayer?.[playerY]?.[playerX]
    );

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * (Math.PI * 2);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      let currentDist = 0;
      let rayElevation = isPlayerElevated ? 1 : 0;

      while (currentDist <= viewRadius) {
        currentDist += stepSize;
        const testX = Math.floor(originX + cos * currentDist);
        const testY = Math.floor(originY + sin * currentDist);

        if (testX < 0 || testX >= this.width || testY < 0 || testY >= this.height) {
          break;
        }

        this.grid[testY][testX] = FOG_STATE.VISIBLE;

        const cellTile = groundLayer[testY]?.[testX];
        const overTile = overheadLayer?.[testY]?.[testX];
        const isSecretWall = cellTile === TILES.SECRET_WALL;
        const isRevealed = revealedSecrets && (
          (typeof revealedSecrets.has === 'function' && revealedSecrets.has(`${testX},${testY}`)) ||
          (Array.isArray(revealedSecrets) && revealedSecrets.includes(`${testX},${testY}`))
        );
        const isWall = cellTile === TILES.WALL || (isSecretWall && !isRevealed);

        if (rayElevation === 1) {
          const hasElevatedWalkway = this.isElevatedSurface(overTile, cellTile);

          if (hasElevatedWalkway) {
            // Ray continues along upper walkway
            continue;
          }

          if (isWall) {
            // Ground wall without walkway stops the ray
            break;
          }

          // Ray descends into lower open corridor/room (elevation 0)
          rayElevation = 0;
        } else {
          // At ground elevation: walls block line of sight
          if (isWall) {
            break;
          }
        }
      }
    }
  }

  /**
   * Helper to check if a tile code represents an elevated overhead walkable surface (BL-146, BL-147)
   * @param {*} overTile
   * @param {*} groundTile
   * @returns {boolean}
   */
  isElevatedSurface(overTile, groundTile) {
    return (
      overTile === TILES.PLATFORM || overTile === 'PL' ||
      overTile === TILES.WALL_WALK || overTile === 'WW' ||
      overTile === TILES.BRIDGE_EW || overTile === TILES.BRIDGE_NS ||
      this.isRamp(overTile) ||
      groundTile === TILES.BRIDGE_EW || groundTile === TILES.BRIDGE_NS ||
      this.isRamp(groundTile)
    );
  }

  /**
   * Helper to check if tile is a ramp
   * @param {*} tile
   * @returns {boolean}
   */
  isRamp(tile) {
    return (
      tile === TILES.RAMP_N ||
      tile === TILES.RAMP_S ||
      tile === TILES.RAMP_E ||
      tile === TILES.RAMP_W
    );
  }
}
