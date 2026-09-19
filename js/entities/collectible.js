/**
 * Collectible Entity
 * Bonus score items (Gems, Coins, Relics) and carriable utility items (Torch)
 * rewarding exploration and granting player perks.
 */

import { ENTITY_TYPES, ELEVATION, formatXYZ } from '../core/constants.js';

export class Collectible {
  /**
   * @param {object} config
   */
  constructor(config = {}) {
    this.id = config.id || `collectible_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.COLLECTIBLE;
    this.x = Number(config.x) || 0;
    this.y = Number(config.y) || 0;
    this.z = config.z !== undefined ? Number(config.z) : (config.elevation !== undefined ? Number(config.elevation) : ELEVATION.GROUND);
    this.elevation = this.z;

    this.itemType = config.itemType || 'gem'; // 'gem' | 'coin' | 'relic' | 'torch'
    this.scoreValue = Number(config.scoreValue) || (this.itemType === 'relic' ? 300 : (this.itemType === 'gem' ? 100 : (this.itemType === 'torch' ? 25 : 50)));
    this.name = config.name || (this.itemType === 'relic' ? 'Golden Relic' : (this.itemType === 'gem' ? 'Ruby Gem' : (this.itemType === 'torch' ? 'Adventurer Torch' : 'Ancient Coin')));
    this.color = config.color || (this.itemType === 'gem' ? '#f43f5e' : (this.itemType === 'torch' ? '#f97316' : (this.itemType === 'relic' ? '#a855f7' : '#fbbf24')));
    this.isCarriable = config.isCarriable !== undefined ? !!config.isCarriable : (this.itemType === 'torch');
    this.isCollected = !!config.isCollected;

    // Animation bobbing and sparkle timers
    this.bobTimer = Math.random() * Math.PI * 2;
    this.sparkleTimer = 0;
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
   * Collect the item by a player
   * @param {Player} [player]
   * @returns {{ id: string, name: string, itemType: string, scoreValue: number, isCarriable: boolean, color: string }}
   */
  collect(player) {
    this.isCollected = true;
    if (player && typeof player.addScore === 'function') {
      player.addScore(this.scoreValue);
    }
    if (this.isCarriable && player && typeof player.addCarriedItem === 'function') {
      player.addCarriedItem({
        id: this.id,
        name: this.name,
        itemType: this.itemType,
        color: this.color,
      });
    }
    return {
      id: this.id,
      name: this.name,
      itemType: this.itemType,
      scoreValue: this.scoreValue,
      isCarriable: this.isCarriable,
      color: this.color,
    };
  }

  /**
   * Update animation bobbing
   * @param {number} dt
   */
  update(dt) {
    if (!this.isCollected) {
      this.bobTimer += dt * 3.5;
      this.sparkleTimer += dt;
    }
  }

  /**
   * Render the collectible item
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   * @param {string} [perspective='topdown']
   */
  render(ctx, screenX, screenY, tileSize, perspective = 'topdown') {
    if (this.isCollected) return;

    const bob = Math.sin(this.bobTimer) * (tileSize * 0.08);
    const pulse = Math.sin(this.bobTimer * 1.5) * 0.15 + 0.85;
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2 + bob;
    const s = tileSize * 0.45;

    ctx.save();

    // Subtle drop shadow on floor
    ctx.beginPath();
    ctx.ellipse(cx, screenY + tileSize * 0.8, s * 0.5, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();

    // Aura glow
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.6 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = this.color ? `${this.color}33` : 'rgba(251, 191, 36, 0.2)';
    ctx.fill();

    if (this.itemType === 'torch') {
      // Adventurer Torch
      ctx.translate(cx, cy);

      // Wooden torch handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -s * 0.1, 4, s * 0.6);

      // Metal sconce band
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-3, -s * 0.2, 6, s * 0.12);

      // Burning Flame
      ctx.beginPath();
      ctx.arc(0, -s * 0.3, s * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.fill();

      // Flame inner yellow core
      ctx.beginPath();
      ctx.arc(0, -s * 0.3, s * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    } else if (this.itemType === 'coin') {
      // Golden Coin
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner stamp rim
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.24, 0, Math.PI * 2);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.itemType === 'relic') {
      // Golden Crown / Chalice Relic
      ctx.fillStyle = '#a855f7';
      ctx.font = `${Math.round(tileSize * 0.32)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.fillText('👑', cx, cy);
    } else {
      // Default: Cut Faceted Diamond Gemstone
      ctx.translate(cx, cy);

      const gw = s * 0.6;
      const gh = s * 0.6;

      ctx.beginPath();
      ctx.moveTo(0, -gh / 2);
      ctx.lineTo(gw / 2, 0);
      ctx.lineTo(0, gh / 2);
      ctx.lineTo(-gw / 2, 0);
      ctx.closePath();

      ctx.fillStyle = this.color || '#f43f5e';
      ctx.shadowColor = this.color || '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Internal facet reflection
      ctx.beginPath();
      ctx.moveTo(0, -gh / 2);
      ctx.lineTo(0, gh / 2);
      ctx.moveTo(-gw / 2, 0);
      ctx.lineTo(gw / 2, 0);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }
}
