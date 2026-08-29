/**
 * Door Entity
 * Locked barrier opened by possessing the matching key ID.
 */

import { ENTITY_TYPES } from '../core/constants.js';

export class Door {
  /**
   * @param {object} config
   */
  constructor(config) {
    this.id = config.id || `door_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.DOOR;
    this.x = config.x ?? 0;
    this.y = config.y ?? 0;
    this.requiresKey = config.requiresKey || '';
    this.color = config.color || '#fbbf24';
    this.isOpen = !!config.isOpen;
    this.elevation = config.elevation ?? 0;

    // Animation progress: 0 = fully closed, 1 = fully open
    this.openProgress = this.isOpen ? 1 : 0;
  }

  /**
   * Unlock and open the door
   */
  open() {
    this.isOpen = true;
  }

  /**
   * Update animation interpolation
   * @param {number} dt
   */
  update(dt) {
    if (this.isOpen && this.openProgress < 1) {
      this.openProgress = Math.min(1, this.openProgress + dt * 2.5);
    } else if (!this.isOpen && this.openProgress > 0) {
      this.openProgress = Math.max(0, this.openProgress - dt * 2.5);
    }
  }

  /**
   * Render door gate / bars
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    if (this.openProgress >= 1) return; // Fully opened, don't draw obstruction

    const pad = tileSize * 0.08;
    const w = tileSize - pad * 2;
    const h = tileSize - pad * 2;
    const x = screenX + pad;
    const y = screenY + pad;

    ctx.save();
    ctx.globalAlpha = 1 - this.openProgress * 0.8;

    // Frame
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = Math.max(2, tileSize * 0.06);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.isOpen ? 0 : 6;

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, tileSize * 0.12);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.fill();
    ctx.stroke();

    // Bars
    const barCount = 3;
    const barSpacing = w / (barCount + 1);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = Math.max(1.5, tileSize * 0.05);

    for (let i = 1; i <= barCount; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * barSpacing, y + pad);
      ctx.lineTo(x + i * barSpacing, y + h - pad);
      ctx.stroke();
    }

    // Keyhole emblem in center
    ctx.fillStyle = this.color;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = tileSize * 0.12;

    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.3, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - r * 0.5, cy);
    ctx.lineTo(cx + r * 0.5, cy);
    ctx.lineTo(cx + r * 0.2, cy + r * 1.3);
    ctx.lineTo(cx - r * 0.2, cy + r * 1.3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
