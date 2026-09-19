/**
 * Checkpoint Entity
 * Waypoint shrines, crystal beacons, and runic hearths placed across perilous mazes.
 * When activated, saves player state and allows respawning upon hazard or patroller hit.
 */

import { ENTITY_TYPES, ELEVATION, formatXYZ } from '../core/constants.js';

export class Checkpoint {
  /**
   * @param {object} config
   */
  constructor(config = {}) {
    this.id = config.id || `checkpoint_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.CHECKPOINT;
    this.x = Number(config.x) || 0;
    this.y = Number(config.y) || 0;
    this.z = config.z !== undefined ? Number(config.z) : (config.elevation !== undefined ? Number(config.elevation) : ELEVATION.GROUND);
    this.elevation = this.z;

    this.style = config.style || 'shrine'; // 'shrine' | 'crystal_beacon' | 'runic_hearth' | 'brazier'
    this.name = config.name || 'Waypoint Shrine';
    this.color = config.color || '#38bdf8';
    this.activated = !!config.activated;
    this.activationCount = 0;

    // Visual animation timers
    this.flameTimer = Math.random() * Math.PI * 2;
    this.pulseRing = 0;
  }

  get elevation() {
    return this.z;
  }

  set elevation(value) {
    this.z = value;
  }

  /**
   * Canonical (X, Y, Z) coordinate string
   * @returns {string}
   */
  getCoordString() {
    return formatXYZ(this.x, this.y, this.z);
  }

  /**
   * Activate this checkpoint
   * @returns {{ id: string, name: string, x: number, y: number, z: number, elevation: number, style: string }}
   */
  activate() {
    this.activated = true;
    this.activationCount++;
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      z: this.z,
      elevation: this.elevation,
      style: this.style,
    };
  }

  /**
   * Update animation timers
   * @param {number} dt
   */
  update(dt) {
    this.flameTimer += dt * 4;
    if (this.activated) {
      this.pulseRing = (this.pulseRing + dt * 1.5) % 1;
    }
  }

  /**
   * Render the checkpoint
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   * @param {string} [perspective='topdown']
   */
  render(ctx, screenX, screenY, tileSize, perspective = 'topdown') {
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const s = tileSize * 0.75;
    const isAngled = perspective === 'angled';
    const flameBob = Math.sin(this.flameTimer) * (tileSize * 0.05);

    ctx.save();

    // 1. Floor Base Pedestal
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.28, s * 0.42, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.activated ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 2. Concentric activation pulse ring
    if (this.activated) {
      const ringRadius = s * 0.3 + this.pulseRing * (s * 0.4);
      const ringAlpha = Math.max(0, 1 - this.pulseRing);
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${ringAlpha * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Dormant unactivated invite ring
      const invitePulse = Math.sin(this.flameTimer * 0.5) * 0.2 + 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.42 * invitePulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (this.style === 'crystal_beacon') {
      // Levitation crystal beacon
      const cw = s * 0.35;
      const ch = s * 0.6;
      const crystalY = cy - ch * 0.4 + flameBob;

      // Crystal Diamond
      ctx.beginPath();
      ctx.moveTo(cx, crystalY - ch / 2);
      ctx.lineTo(cx + cw / 2, crystalY);
      ctx.lineTo(cx, crystalY + ch / 2);
      ctx.lineTo(cx - cw / 2, crystalY);
      ctx.closePath();

      if (this.activated) {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = '#64748b';
      }
      ctx.fill();
      ctx.strokeStyle = this.activated ? '#e0f2fe' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (this.style === 'runic_hearth') {
      // Stone hearth with embers / active blaze
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Flame core
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1 + flameBob, s * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = this.activated ? '#f97316' : '#7c2d12';
      if (this.activated) {
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 14;
      }
      ctx.fill();
    } else {
      // Default: Waypoint Shrine / Shrine Pillar
      const pw = s * 0.45;
      const ph = s * 0.65;
      const topY = isAngled ? cy - ph * 0.6 : cy - ph * 0.5;

      // Shrine Pillar
      const grad = ctx.createLinearGradient(cx - pw / 2, topY, cx + pw / 2, topY + ph);
      grad.addColorStop(0, this.activated ? '#0369a1' : '#334155');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.strokeStyle = this.activated ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(cx - pw / 2, topY, pw, ph, 4);
      ctx.fill();
      ctx.stroke();

      // Shrine Center Beacon Emblem / Flame
      ctx.fillStyle = this.activated ? '#38bdf8' : '#64748b';
      ctx.font = `${Math.round(tileSize * 0.24)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.activated ? '🚩' : '⛩️', cx, topY + ph * 0.5 + flameBob);

      // Light glow
      if (this.activated) {
        ctx.beginPath();
        ctx.arc(cx, topY + ph * 0.5, s * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
