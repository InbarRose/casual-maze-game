/**
 * Key Entity
 * Collectible key item for unlocking doors.
 */

import { ENTITY_TYPES } from '../core/constants.js';

export class Key {
  /**
   * @param {object} config
   */
  constructor(config) {
    this.id = config.id || `key_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.KEY;
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.color = config.color || '#fbbf24';
    this.name = config.name || 'Key';
    this.isCollected = !!config.isCollected;
    this.elevation = config.elevation ?? 0;

    // Visual animation states
    this.bobTimer = Math.random() * Math.PI * 2;
  }

  /**
   * Update animation bobbing
   * @param {number} dt
   */
  update(dt) {
    if (!this.isCollected) {
      this.bobTimer += dt * 3;
    }
  }

  /**
   * Render the key
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    if (this.isCollected) return;

    const bobOffset = Math.sin(this.bobTimer) * (tileSize * 0.08);
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2 + bobOffset;
    const size = tileSize * 0.38;

    ctx.save();
    ctx.translate(cx, cy);

    // Glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;

    // Key ring (bow)
    ctx.strokeStyle = this.color;
    ctx.lineWidth = Math.max(2, tileSize * 0.07);
    ctx.beginPath();
    ctx.arc(0, -size * 0.45, size * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    // Key shaft
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.rect(-ctx.lineWidth / 2, -size * 0.15, ctx.lineWidth, size * 0.85);
    ctx.fill();

    // Key teeth / bit
    ctx.beginPath();
    ctx.rect(ctx.lineWidth / 2, size * 0.3, size * 0.3, ctx.lineWidth);
    ctx.rect(ctx.lineWidth / 2, size * 0.55, size * 0.25, ctx.lineWidth);
    ctx.fill();

    ctx.restore();
  }
}
