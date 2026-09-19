/**
 * Signpost Entity ("The Architect's Journal")
 * Readable stone tablets, wooden signposts, and ancient scrolls scattered across labyrinths
 * providing hints, lore, and whimsical observations (inspired by World of Goo's Sign Painter).
 */

import { ENTITY_TYPES, ELEVATION, formatXYZ } from '../core/constants.js';

export class Signpost {
  /**
   * @param {object} config
   */
  constructor(config = {}) {
    this.id = config.id || `signpost_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.SIGNPOST;
    this.x = Number(config.x) || 0;
    this.y = Number(config.y) || 0;
    this.z = config.z !== undefined ? Number(config.z) : (config.elevation !== undefined ? Number(config.elevation) : ELEVATION.GROUND);
    this.elevation = this.z;

    this.title = config.title || "Architect's Journal";
    this.text = config.text || 'The stones whisper of hidden pathways ahead.';
    this.author = config.author || 'The Architect';
    this.style = config.style || 'stone_tablet'; // 'stone_tablet' | 'wooden_sign' | 'astral_scroll'
    this.read = !!config.read;

    // Visual animation states
    this.glowTimer = Math.random() * Math.PI * 2;
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
   * Interacting with the signpost
   * @returns {{ id: string, title: string, text: string, author: string, style: string }}
   */
  readSign() {
    this.read = true;
    return {
      id: this.id,
      title: this.title,
      text: this.text,
      author: this.author,
      style: this.style,
    };
  }

  /**
   * Update animation timers
   * @param {number} dt
   */
  update(dt) {
    this.glowTimer += dt * 2.5;
    this.sparkleTimer += dt;
  }

  /**
   * Render the signpost on canvas
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

    ctx.save();

    // Drop shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.35, s * 0.38, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Subtle unread beacon ring
    if (!this.read) {
      const pulse = Math.sin(this.glowTimer) * 0.2 + 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.45 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (this.style === 'wooden_sign') {
      // Wooden post
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 3, cy, 6, s * 0.4);

      // Wooden sign board
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      const bw = s * 0.7;
      const bh = s * 0.45;
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, cy - bh * 0.8, bw, bh, 3);
      ctx.fill();
      ctx.stroke();

      // Wood grain lines
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - bw * 0.4, cy - bh * 0.5);
      ctx.lineTo(cx + bw * 0.4, cy - bh * 0.5);
      ctx.moveTo(cx - bw * 0.35, cy - bh * 0.2);
      ctx.lineTo(cx + bw * 0.35, cy - bh * 0.2);
      ctx.stroke();

      // Small exclamation mark or parchment mark
      ctx.fillStyle = this.read ? '#fed7aa' : '#fbbf24';
      ctx.font = `bold ${Math.round(tileSize * 0.22)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💬', cx, cy - bh * 0.4);
    } else if (this.style === 'astral_scroll') {
      // Glowing parchment scroll
      const sw = s * 0.65;
      const sh = s * 0.55;

      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, 4);
      ctx.fill();
      ctx.stroke();

      // Arcane ribbon seal
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Icon
      ctx.fillStyle = '#6b21a8';
      ctx.font = `${Math.round(tileSize * 0.2)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📜', cx, cy - 2);
    } else {
      // Default: Carved Stone Tablet
      const tw = s * 0.65;
      const th = s * 0.7;
      const topY = isAngled ? cy - th * 0.55 : cy - th * 0.5;

      // Tablet base stone
      const grad = ctx.createLinearGradient(cx - tw / 2, topY, cx + tw / 2, topY + th);
      grad.addColorStop(0, '#475569');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      // Arched top tablet
      ctx.moveTo(cx - tw / 2, topY + th);
      ctx.lineTo(cx - tw / 2, topY + tw * 0.3);
      ctx.quadraticCurveTo(cx, topY - tw * 0.2, cx + tw / 2, topY + tw * 0.3);
      ctx.lineTo(cx + tw / 2, topY + th);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Carved rune lines
      ctx.strokeStyle = this.read ? '#64748b' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - tw * 0.3, topY + th * 0.45);
      ctx.lineTo(cx + tw * 0.3, topY + th * 0.45);
      ctx.moveTo(cx - tw * 0.25, topY + th * 0.62);
      ctx.lineTo(cx + tw * 0.25, topY + th * 0.62);
      ctx.moveTo(cx - tw * 0.2, topY + th * 0.78);
      ctx.lineTo(cx + tw * 0.2, topY + th * 0.78);
      ctx.stroke();

      // Glowing emblem at top
      ctx.fillStyle = this.read ? '#94a3b8' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, topY + th * 0.25, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
