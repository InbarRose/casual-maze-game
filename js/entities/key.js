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
    this.style = config.style || 'classic'; // 'classic' | 'ornate' | 'crystal' | 'orb' | 'relic' | 'skull'
    this.glowEffect = config.glowEffect || 'vibrant';
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
   * Render the key with customizable gemstone/relic style
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
    const blurMult = this.glowEffect === 'subtle' ? 6 : (this.glowEffect === 'pulse' ? 18 * pulse : 14);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = blurMult;

    if (this.style === 'crystal') {
      // Elemental Crystal Shard
      ctx.fillStyle = this.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.7);
      ctx.lineTo(size * 0.45, -size * 0.2);
      ctx.lineTo(size * 0.35, size * 0.65);
      ctx.lineTo(0, size * 0.85);
      ctx.lineTo(-size * 0.35, size * 0.65);
      ctx.lineTo(-size * 0.45, -size * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Facet lines
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.7);
      ctx.lineTo(0, size * 0.85);
      ctx.moveTo(-size * 0.45, -size * 0.2);
      ctx.lineTo(size * 0.45, -size * 0.2);
      ctx.stroke();
    } else if (this.style === 'orb') {
      // Mystic Arcane Sphere
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Orbital energy ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.save();
      ctx.rotate(this.bobTimer);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.75, size * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (this.style === 'relic') {
      // Royal Crown Relic
      ctx.fillStyle = this.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, -size * 0.4);
      ctx.lineTo(-size * 0.25, -size * 0.1);
      ctx.lineTo(0, -size * 0.6);
      ctx.lineTo(size * 0.25, -size * 0.1);
      ctx.lineTo(size * 0.5, -size * 0.4);
      ctx.lineTo(size * 0.4, size * 0.45);
      ctx.lineTo(-size * 0.4, size * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.style === 'skull') {
      // Crypt Bone Token
      ctx.fillStyle = this.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -size * 0.15, size * 0.45, Math.PI * 0.15, Math.PI * 0.85, true);
      ctx.lineTo(size * 0.25, size * 0.45);
      ctx.lineTo(-size * 0.25, size * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Eye sockets
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-size * 0.16, -size * 0.15, size * 0.1, 0, Math.PI * 2);
      ctx.arc(size * 0.16, -size * 0.15, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Classic or Ornate Skeleton Key
      const isOrnate = this.style === 'ornate';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(2, tileSize * 0.08);
      ctx.beginPath();
      ctx.arc(0, -size * 0.45, isOrnate ? size * 0.42 : size * 0.36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, -size * 0.45, size * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // Central Sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-size * 0.1, -size * 0.55, size * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Key Shaft
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.rect(-ctx.lineWidth / 2, -size * 0.1, ctx.lineWidth, size * 0.82);
      ctx.fill();

      // Teeth / Bit
      ctx.beginPath();
      ctx.rect(ctx.lineWidth / 2, size * 0.32, size * 0.32, ctx.lineWidth);
      if (isOrnate) {
        ctx.rect(-size * 0.32 - ctx.lineWidth / 2, size * 0.32, size * 0.32, ctx.lineWidth);
      }
      ctx.rect(ctx.lineWidth / 2, size * 0.56, size * 0.26, ctx.lineWidth);
      ctx.fill();
    }

    ctx.restore();
  }
}
