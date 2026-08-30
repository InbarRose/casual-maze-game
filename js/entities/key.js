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
   * Render the key with glowing gemstone bow & faceted shaft
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    if (this.isCollected) return;

    const bobOffset = Math.sin(this.bobTimer) * (tileSize * 0.08);
    const pulse = Math.sin(this.bobTimer * 1.5) * 0.15 + 0.85;
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2 + bobOffset;
    const size = tileSize * 0.4;

    ctx.save();
    ctx.translate(cx, cy);

    // Glowing Aura
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 14 * pulse;

    // Outer Gemstone Bow Ring
    ctx.strokeStyle = this.color;
    ctx.lineWidth = Math.max(2, tileSize * 0.08);
    ctx.beginPath();
    ctx.arc(0, -size * 0.45, size * 0.36, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Gemstone Core
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, -size * 0.45, size * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // Central Highlight Sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.1, -size * 0.55, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Key Shaft
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.rect(-ctx.lineWidth / 2, -size * 0.1, ctx.lineWidth, size * 0.82);
    ctx.fill();

    // Dual Ornate Teeth / Bit
    ctx.beginPath();
    ctx.rect(ctx.lineWidth / 2, size * 0.32, size * 0.32, ctx.lineWidth);
    ctx.rect(ctx.lineWidth / 2, size * 0.56, size * 0.26, ctx.lineWidth);
    ctx.fill();

    ctx.restore();
  }
}
