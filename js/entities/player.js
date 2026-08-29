/**
 * Player Entity
 * Handles position, elevation state, inventory, movement smoothing, and rendering.
 */

import { ELEVATION, DEFAULTS } from '../core/constants.js';

export class Player {
  /**
   * @param {number} startX Grid X
   * @param {number} startY Grid Y
   * @param {number} [startElevation=0]
   * @param {number} [tileSize=32]
   */
  constructor(startX = 1, startY = 1, startElevation = 0, tileSize = 32) {
    this.gridX = startX;
    this.gridY = startY;
    this.fromGridX = startX;
    this.fromGridY = startY;
    this.targetGridX = startX;
    this.targetGridY = startY;

    this.elevation = startElevation;
    this.targetElevation = startElevation;

    this.tileSize = tileSize;
    this.worldX = startX * tileSize + tileSize / 2;
    this.worldY = startY * tileSize + tileSize / 2;

    this.inventory = []; // Array of key IDs e.g. ["key_gold_1"]
    this.facing = 'south'; // 'north' | 'south' | 'east' | 'west'

    this.isMoving = false;
    this.moveProgress = 0; // 0 to 1
    this.speed = DEFAULTS.PLAYER_SPEED; // tiles per second
    this.stepsTaken = 0;

    // Visual bobbing and glow pulse
    this.pulseTimer = 0;
  }

  /**
   * Reset player to initial spawn coordinates
   * @param {number} spawnX
   * @param {number} spawnY
   * @param {number} elevation
   */
  reset(spawnX, spawnY, elevation = 0) {
    this.gridX = spawnX;
    this.gridY = spawnY;
    this.fromGridX = spawnX;
    this.fromGridY = spawnY;
    this.targetGridX = spawnX;
    this.targetGridY = spawnY;
    this.elevation = elevation;
    this.targetElevation = elevation;

    this.worldX = spawnX * this.tileSize + this.tileSize / 2;
    this.worldY = spawnY * this.tileSize + this.tileSize / 2;

    this.inventory = [];
    this.facing = 'south';
    this.isMoving = false;
    this.moveProgress = 0;
    this.stepsTaken = 0;
  }

  /**
   * Initiate a step move to an adjacent grid cell
   * @param {number} targetX
   * @param {number} targetY
   * @param {number} nextElevation
   */
  startMove(targetX, targetY, nextElevation = this.elevation) {
    if (this.isMoving) return;

    this.fromGridX = this.gridX;
    this.fromGridY = this.gridY;
    this.targetGridX = targetX;
    this.targetGridY = targetY;
    this.targetElevation = nextElevation;

    const dx = targetX - this.gridX;
    const dy = targetY - this.gridY;

    if (dx > 0) this.facing = 'east';
    else if (dx < 0) this.facing = 'west';
    else if (dy > 0) this.facing = 'south';
    else if (dy < 0) this.facing = 'north';

    this.isMoving = true;
    this.moveProgress = 0;
    this.stepsTaken++;
  }

  /**
   * Update movement interpolation
   * @param {number} dt
   */
  update(dt) {
    this.pulseTimer += dt * 4;

    if (this.isMoving) {
      this.moveProgress += dt * this.speed;

      if (this.moveProgress >= 1) {
        this.moveProgress = 1;
        this.gridX = this.targetGridX;
        this.gridY = this.targetGridY;
        this.elevation = this.targetElevation;
        this.isMoving = false;
      }

      // Smooth step easing
      const t = this.moveProgress;
      const smoothT = t * t * (3 - 2 * t);

      const fromWorldX = this.fromGridX * this.tileSize + this.tileSize / 2;
      const fromWorldY = this.fromGridY * this.tileSize + this.tileSize / 2;
      const toWorldX = this.targetGridX * this.tileSize + this.tileSize / 2;
      const toWorldY = this.targetGridY * this.tileSize + this.tileSize / 2;

      this.worldX = fromWorldX + (toWorldX - fromWorldX) * smoothT;
      this.worldY = fromWorldY + (toWorldY - fromWorldY) * smoothT;
    } else {
      this.worldX = this.gridX * this.tileSize + this.tileSize / 2;
      this.worldY = this.gridY * this.tileSize + this.tileSize / 2;
    }
  }

  /**
   * Add key to player inventory
   * @param {string} keyId
   */
  addKey(keyId) {
    if (!this.inventory.includes(keyId)) {
      this.inventory.push(keyId);
    }
  }

  /**
   * Remove key from player inventory upon using
   * @param {string} keyId
   */
  removeKey(keyId) {
    this.inventory = this.inventory.filter(id => id !== keyId);
  }

  /**
   * Render player avatar
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX Center screen pixel X
   * @param {number} screenY Center screen pixel Y
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    const isOverhead = this.elevation === ELEVATION.OVERHEAD;
    const radius = tileSize * 0.35;
    const shadowOffset = isOverhead ? tileSize * 0.28 : tileSize * 0.1;
    const pulse = Math.sin(this.pulseTimer) * 0.15 + 0.85;

    ctx.save();

    // 1. Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(
      screenX,
      screenY + shadowOffset,
      radius * (isOverhead ? 0.9 : 0.8),
      radius * 0.4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 2. Elevation Ring / Aura
    if (isOverhead) {
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 * pulse})`;
      ctx.lineWidth = Math.max(2, tileSize * 0.06);
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius * 1.3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Player Body (Glow + Sphere)
    ctx.shadowColor = isOverhead ? '#38bdf8' : '#34d399';
    ctx.shadowBlur = 12 * pulse;

    const grad = ctx.createRadialGradient(
      screenX - radius * 0.3,
      screenY - radius * 0.3,
      radius * 0.1,
      screenX,
      screenY,
      radius
    );

    if (isOverhead) {
      grad.addColorStop(0, '#bae6fd');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, '#0369a1');
    } else {
      grad.addColorStop(0, '#a7f3d0');
      grad.addColorStop(0.7, '#10b981');
      grad.addColorStop(1, '#047857');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.5, tileSize * 0.05);
    ctx.stroke();

    // 4. Directional Visor / Pointer
    let dirX = 0;
    let dirY = 0;
    if (this.facing === 'north') dirY = -radius * 0.65;
    else if (this.facing === 'south') dirY = radius * 0.65;
    else if (this.facing === 'east') dirX = radius * 0.65;
    else if (this.facing === 'west') dirX = -radius * 0.65;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(screenX + dirX, screenY + dirY, radius * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
