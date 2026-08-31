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
    this.style = config.style || 'classic'; // 'classic' | 'portcullis' | 'laser_barrier' | 'magic_seal' | 'crystal_spikes' | 'vault_hatch'
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
   * Render door gate / barrier with style awareness
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
    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.save();
    ctx.globalAlpha = 1 - this.openProgress * 0.85;

    if (this.style === 'laser_barrier') {
      // Energy Forcefield Barrier
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(x, y, w, h);

      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(2, tileSize * 0.08);

      // Pylons on sides
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, tileSize * 0.15, h);
      ctx.fillRect(x + w - tileSize * 0.15, y, tileSize * 0.15, h);

      // Laser energy beams
      ctx.beginPath();
      for (let i = 1; i <= 3; i++) {
        const by = y + (h / 4) * i;
        ctx.moveTo(x + tileSize * 0.15, by);
        ctx.lineTo(x + w - tileSize * 0.15, by);
      }
      ctx.stroke();
    } else if (this.style === 'magic_seal') {
      // Arcane Runic Seal
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(x, y, w, h);

      ctx.shadowColor = this.color;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(1.5, tileSize * 0.06);

      // Outer mystic circle
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.42, 0, Math.PI * 2);
      ctx.stroke();

      // Inscribed star / rune hexagram
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = this.color;
      ctx.font = `${Math.floor(tileSize * 0.3)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔯', cx, cy);
    } else if (this.style === 'crystal_spikes') {
      // Crystal Spikes Barrier
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.fillRect(x, y, w, h);

      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = this.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;

      // Cluster of 3 crystal spikes
      for (let i = -1; i <= 1; i++) {
        const sx = cx + i * (w * 0.28);
        const sy = y + h - pad;
        const sh = h * (i === 0 ? 0.85 : 0.65);
        ctx.beginPath();
        ctx.moveTo(sx - w * 0.12, sy);
        ctx.lineTo(sx, sy - sh);
        ctx.lineTo(sx + w * 0.12, sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (this.style === 'vault_hatch') {
      // Heavy Vault Bulkhead
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(2, tileSize * 0.07);
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.44, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Vault Rotary Wheel
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(cx, cy, w * 0.08, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Classic Gate or Spiked Portcullis
      const isPortcullis = this.style === 'portcullis';
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

      // Gate Bars
      const isHorizontal = this.orientation === 'horizontal';
      const barCount = 3;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = Math.max(1.5, tileSize * 0.055);

      if (isHorizontal) {
        const spacing = h / (barCount + 1);
        for (let i = 1; i <= barCount; i++) {
          ctx.beginPath();
          ctx.moveTo(x + pad, y + i * spacing);
          ctx.lineTo(x + w - pad, y + i * spacing);
          ctx.stroke();
        }
      } else {
        const spacing = w / (barCount + 1);
        for (let i = 1; i <= barCount; i++) {
          ctx.beginPath();
          ctx.moveTo(x + i * spacing, y + pad);
          ctx.lineTo(x + i * spacing, y + h - pad);
          ctx.stroke();
        }
      }

      // Keyhole Gemstone Emblem
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      const r = tileSize * 0.13;

      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.35, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - r * 0.45, cy);
      ctx.lineTo(cx + r * 0.45, cy);
      ctx.lineTo(cx + r * 0.22, cy + r * 1.35);
      ctx.lineTo(cx - r * 0.22, cy + r * 1.35);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
