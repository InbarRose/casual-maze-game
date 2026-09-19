/**
 * Teleporter Entity
 * Warps player across the labyrinth to target (X, Y, Z) coordinates with cooldown protection.
 */

import { ENTITY_TYPES, ELEVATION, formatXYZ } from '../core/constants.js';

export class Teleporter {
  /**
   * @param {object} config
   */
  constructor(config) {
    this.id = config.id || `teleporter_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.TELEPORTER;
    this.x = Number(config.x) || 0;
    this.y = Number(config.y) || 0;
    this.z = config.z !== undefined ? Number(config.z) : (config.elevation !== undefined ? Number(config.elevation) : ELEVATION.GROUND);
    this.elevation = this.z;

    this.targetX = config.targetX !== undefined ? Number(config.targetX) : this.x;
    this.targetY = config.targetY !== undefined ? Number(config.targetY) : this.y;
    this.targetZ = config.targetZ !== undefined ? Number(config.targetZ) : (config.targetElevation !== undefined ? Number(config.targetElevation) : this.z);
    this.targetElevation = this.targetZ;

    this.style = config.style || 'vortex'; // 'vortex' | 'runic_circle' | 'techno_pad' | 'crystal_well'
    this.color = config.color || '#38bdf8';
    this.name = config.name || 'Teleport Pad';
    this.cooldown = Number(config.cooldown) || 0.8; // seconds
    this.currentCooldown = 0;
    this.active = config.active !== undefined ? !!config.active : true;

    // Animation state
    this.pulseTimer = 0;
    this.warpSpin = 0;
  }

  /**
   * Canonical (X, Y, Z) coordinate string
   * @returns {string}
   */
  getCoordString() {
    return formatXYZ(this.x, this.y, this.z);
  }

  /**
   * Canonical target (X, Y, Z) coordinate string
   * @returns {string}
   */
  getTargetCoordString() {
    return formatXYZ(this.targetX, this.targetY, this.targetZ);
  }

  /**
   * Check if teleporter is ready to warp
   * @returns {boolean}
   */
  canWarp() {
    return this.active && this.currentCooldown <= 0;
  }

  /**
   * Trigger warp action and start cooldown
   * @returns {{ x: number, y: number, z: number, elevation: number }}
   */
  triggerWarp() {
    this.currentCooldown = this.cooldown;
    return {
      x: this.targetX,
      y: this.targetY,
      z: this.targetZ,
      elevation: this.targetZ,
    };
  }

  /**
   * Update animation and cooldown
   * @param {number} dt
   */
  update(dt) {
    this.pulseTimer += dt * 3.5;
    this.warpSpin += dt * 2.8;

    if (this.currentCooldown > 0) {
      this.currentCooldown = Math.max(0, this.currentCooldown - dt);
    }
  }

  /**
   * Render teleporter pad
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const isReady = this.canWarp();
    const pulse = Math.sin(this.pulseTimer) * 0.18 + 0.88;
    const radius = tileSize * 0.42;

    ctx.save();

    // 1. Base floor plate
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = isReady ? this.color : '#64748b';
    ctx.lineWidth = Math.max(1.5, tileSize * 0.06);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Swirling dimensional rings
    if (isReady) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12 * pulse;

      // Rotating dashed ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.warpSpin);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(2, tileSize * 0.07);
      ctx.setLineDash([tileSize * 0.16, tileSize * 0.12]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.78 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Inner glowing core
      const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius * 0.55);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, this.color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.52 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Center warp glyph
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.floor(tileSize * 0.32)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦', cx, cy);
    } else {
      // Cooldown recharge indicator
      ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.floor(tileSize * 0.22)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⏳', cx, cy);
    }

    ctx.restore();
  }
}
