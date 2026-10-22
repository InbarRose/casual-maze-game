/**
 * Signpost Entity ("The Architect's Journal & Codex Folios")
 * 
 * Represents collectible letters, field notes, and philosophical treatises left behind
 * by The Architect. Rendered diegetically as carved stone pedestals/lecterns,
 * wooden reading desks, or glowing astral scrolls (BL-176, ADR-0050).
 */

import { ENTITY_TYPES, ELEVATION, formatXYZ, isApproachAllowed } from '../core/constants.js';

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
    this.text = config.text || config.message || 'The stones whisper of hidden pathways ahead.';
    this.message = this.text;
    this.author = config.author || 'The Architect';
    // Styles: 'lectern_stone' (default) | 'lectern_wood' | 'wall_niche' | 'floating_folio' | 'stone_tablet' | 'wooden_sign' | 'astral_scroll'
    this.style = config.style || 'lectern_stone';
    this.read = !!config.read;
    this.collected = !!config.collected || !!config.read;
    this.levelId = config.levelId || '';
    this.chapter = config.chapter || '';
    this.zone = config.zone || '';
    this.interactDirections = Array.isArray(config.interactDirections) ? [...config.interactDirections] : null;

    // Visual animation states
    this.glowTimer = Math.random() * Math.PI * 2;
    this.sparkleTimer = Math.random() * 10;
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
   * Check if player can interact with this signpost / folio
   * @param {number} playerX
   * @param {number} playerY
   * @param {number} [playerZ=0]
   * @returns {boolean}
   */
  canInteract(playerX, playerY, playerZ = ELEVATION.GROUND) {
    if (this.z !== playerZ) return false;
    const dist = Math.abs(this.x - playerX) + Math.abs(this.y - playerY);
    if (dist > 1) return false;
    return isApproachAllowed(this.x, this.y, playerX, playerY, this.interactDirections);
  }

  /**
   * Interacting with the signpost / collecting the folio
   * @returns {object} Folio payload with exact coordinates and metadata
   */
  readSign() {
    this.read = true;
    this.collected = true;
    return {
      id: this.id,
      title: this.title,
      text: this.text,
      author: this.author,
      style: this.style,
      x: this.x,
      y: this.y,
      z: this.z,
      elevation: this.z,
      coordString: this.getCoordString(),
      levelId: this.levelId,
      chapter: this.chapter,
      zone: this.zone,
      collected: true,
      discoveredAtDate: new Date().toISOString(),
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
   * Render the signpost / lectern / folio on canvas
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

    // 1. Soft Ambient Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.38, s * 0.42, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 2. Uncollected Golden Beacon & Radiant Motes
    if (!this.collected) {
      const pulse = Math.sin(this.glowTimer) * 0.2 + 0.8;
      // Ambient radial aura
      const grad = ctx.createRadialGradient(cx, cy, s * 0.1, cx, cy, s * 0.65 * pulse);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
      grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.12)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.65 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Delicate dashed orbit ring
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.5 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating dust motes
      for (let i = 0; i < 3; i++) {
        const angle = this.glowTimer * 0.8 + (i * Math.PI * 2 / 3);
        const dist = s * (0.35 + Math.sin(this.sparkleTimer + i) * 0.08);
        const mx = cx + Math.cos(angle) * dist;
        const my = cy + Math.sin(angle) * dist * 0.55 - s * 0.1;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Render Variant Visual Styles
    if (this.style === 'lectern_stone' || this.style === 'default' || !this.style) {
      // -------------------------------------------------------------
      // Carved Stone Lectern with Open Illuminated Manuscript
      // -------------------------------------------------------------
      const pw = s * 0.52; // Pedestal width
      const ph = s * 0.55; // Pedestal height
      const py = isAngled ? (cy - ph * 0.15) : cy;

      // Stone Pedestal Plinth Base
      const stoneGrad = ctx.createLinearGradient(cx - pw / 2, py, cx + pw / 2, py + ph);
      stoneGrad.addColorStop(0, '#64748b');
      stoneGrad.addColorStop(0.5, '#475569');
      stoneGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = stoneGrad;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;

      // Tiered Chamfered Base
      ctx.beginPath();
      ctx.roundRect(cx - pw * 0.6, py + ph * 0.65, pw * 1.2, ph * 0.35, 2);
      ctx.fill();
      ctx.stroke();

      // Central Fluted Shaft
      ctx.beginPath();
      ctx.fillRect(cx - pw * 0.35, py + ph * 0.15, pw * 0.7, ph * 0.55);
      ctx.strokeRect(cx - pw * 0.35, py + ph * 0.15, pw * 0.7, ph * 0.55);

      // Angled Bookrest Shelf
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(cx - pw * 0.7, py + ph * 0.18);
      ctx.lineTo(cx + pw * 0.7, py + ph * 0.18);
      ctx.lineTo(cx + pw * 0.6, py - ph * 0.12);
      ctx.lineTo(cx - pw * 0.6, py - ph * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Open Leather-bound Book with Illuminated Folio
      const bw = s * 0.75;
      const bh = s * 0.42;
      const by = py - ph * 0.08;

      // Book leather backing
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, by - bh / 2, bw, bh, 3);
      ctx.fill();

      // Left open page
      const pageGradL = ctx.createLinearGradient(cx - bw * 0.48, by, cx - 1, by);
      pageGradL.addColorStop(0, '#fef9c3');
      pageGradL.addColorStop(1, '#fef08a');
      ctx.fillStyle = pageGradL;
      ctx.beginPath();
      ctx.roundRect(cx - bw * 0.48, by - bh * 0.46, bw * 0.46, bh * 0.88, 2);
      ctx.fill();

      // Right open page
      const pageGradR = ctx.createLinearGradient(cx + 1, by, cx + bw * 0.48, by);
      pageGradR.addColorStop(0, '#fef08a');
      pageGradR.addColorStop(1, '#fef9c3');
      ctx.fillStyle = pageGradR;
      ctx.beginPath();
      ctx.roundRect(cx + 2, by - bh * 0.46, bw * 0.46, bh * 0.88, 2);
      ctx.fill();

      // Text lines on open pages
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 0.8;
      for (let r = 0; r < 3; r++) {
        const ly = by - bh * 0.25 + r * (bh * 0.22);
        // Left page lines
        ctx.beginPath();
        ctx.moveTo(cx - bw * 0.42, ly);
        ctx.lineTo(cx - bw * 0.08, ly);
        ctx.stroke();
        // Right page lines
        ctx.beginPath();
        ctx.moveTo(cx + bw * 0.08, ly);
        ctx.lineTo(cx + bw * 0.42, ly);
        ctx.stroke();
      }

      // Crimson Bookmark Ribbon
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, by - bh * 0.48);
      ctx.lineTo(cx, by + bh * 0.58);
      ctx.stroke();
    } else if (this.style === 'lectern_wood') {
      // -------------------------------------------------------------
      // Ornate Wooden Reading Desk with Illuminated Folio
      // -------------------------------------------------------------
      const pw = s * 0.5;
      const ph = s * 0.52;
      const py = isAngled ? (cy - ph * 0.15) : cy;

      // Wooden Turned Post
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx - pw * 0.5, py + ph * 0.65, pw, ph * 0.35);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - pw * 0.25, py + ph * 0.15, pw * 0.5, ph * 0.55);

      // Angled Mahogany Shelf
      ctx.fillStyle = '#9a3412';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - pw * 0.65, py + ph * 0.15);
      ctx.lineTo(cx + pw * 0.65, py + ph * 0.15);
      ctx.lineTo(cx + pw * 0.55, py - ph * 0.15);
      ctx.lineTo(cx - pw * 0.55, py - ph * 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Open Folio
      const bw = s * 0.72;
      const bh = s * 0.38;
      const by = py - ph * 0.08;
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, by - bh / 2, bw, bh, 2);
      ctx.fill();
      ctx.stroke();

      // Small Candle Holder on Left
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(cx - pw * 0.75, py - ph * 0.12, 4, 8);
      // Flickering Candle Flame
      const flameH = Math.sin(this.glowTimer * 2) * 2 + 5;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(cx - pw * 0.75 + 2, py - ph * 0.12 - flameH, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.style === 'floating_folio') {
      // -------------------------------------------------------------
      // Hovering Enchanted Celestial Folio
      // -------------------------------------------------------------
      const bob = Math.sin(this.glowTimer * 1.5) * (s * 0.08);
      const fy = cy + bob;
      const fw = s * 0.65;
      const fh = s * 0.55;

      // Radiant parchment
      const pGrad = ctx.createLinearGradient(cx - fw / 2, fy - fh / 2, cx + fw / 2, fy + fh / 2);
      pGrad.addColorStop(0, '#fef9c3');
      pGrad.addColorStop(0.5, '#fde047');
      pGrad.addColorStop(1, '#fef08a');
      ctx.fillStyle = pGrad;
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(cx - fw / 2, fy - fh / 2, fw, fh, 3);
      ctx.fill();
      ctx.stroke();

      // Golden seal
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(cx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.style === 'wooden_sign') {
      // Wooden signpost backward compatibility
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx - 3, cy, 6, s * 0.4);
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      const bw = s * 0.7;
      const bh = s * 0.45;
      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, cy - bh * 0.8, bw, bh, 3);
      ctx.fill();
      ctx.stroke();
    } else {
      // Stone tablet backward compatibility
      const tw = s * 0.65;
      const th = s * 0.7;
      const topY = isAngled ? cy - th * 0.55 : cy - th * 0.5;
      const grad = ctx.createLinearGradient(cx - tw / 2, topY, cx + tw / 2, topY + th);
      grad.addColorStop(0, '#475569');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - tw / 2, topY + th);
      ctx.lineTo(cx - tw / 2, topY + tw * 0.3);
      ctx.quadraticCurveTo(cx, topY - tw * 0.2, cx + tw / 2, topY + tw * 0.3);
      ctx.lineTo(cx + tw / 2, topY + th);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
