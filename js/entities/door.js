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
    this.orientation = config.orientation || 'auto'; // 'auto' | 'horizontal' | 'vertical'

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
   * Render door gate / bars with orientation awareness
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    if (this.openProgress >= 1) return; // Fully opened, don't draw obstruction

    const pad = tileSize * 0.06;
    const w = tileSize - pad * 2;
    const h = tileSize - pad * 2;
    const x = screenX + pad;
    const y = screenY + pad;

    ctx.save();
    ctx.globalAlpha = 1 - this.openProgress * 0.85;

    // Frame Body & Shadow
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = Math.max(2, tileSize * 0.07);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.isOpen ? 0 : 8;

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, tileSize * 0.14);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.fill();
    ctx.stroke();

    // Directional Gate Bars
    const isHorizontal = this.orientation === 'horizontal';
    const barCount = 3;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = Math.max(1.5, tileSize * 0.055);

    if (isHorizontal) {
      // Horizontal crossbars
      const spacing = h / (barCount + 1);
      for (let i = 1; i <= barCount; i++) {
        ctx.beginPath();
        ctx.moveTo(x + pad, y + i * spacing);
        ctx.lineTo(x + w - pad, y + i * spacing);
        ctx.stroke();
      }
    } else {
      // Vertical portcullis bars
      const spacing = w / (barCount + 1);
      for (let i = 1; i <= barCount; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * spacing, y + pad);
        ctx.lineTo(x + i * spacing, y + h - pad);
        ctx.stroke();
      }
    }

    // Glowing Keyhole Gemstone Emblem in center
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = tileSize * 0.13;

    // Circular lock head
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.35, r, 0, Math.PI * 2);
    ctx.fill();

    // Keyway slot
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.45, cy);
    ctx.lineTo(cx + r * 0.45, cy);
    ctx.lineTo(cx + r * 0.22, cy + r * 1.35);
    ctx.lineTo(cx - r * 0.22, cy + r * 1.35);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
