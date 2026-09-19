/**
 * WallDecor Entity
 * Decorative and inspectable wall-mounted art, parchment notes, stone reliefs, and royal tapestries
 * providing atmospheric observations, player reactions, and level-specific lore.
 */

import { ENTITY_TYPES, ELEVATION, formatXYZ } from '../core/constants.js';

export class WallDecor {
  /**
   * @param {object} config
   */
  constructor(config = {}) {
    this.id = config.id || `decor_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.WALL_DECOR;
    this.x = Number(config.x) || 0;
    this.y = Number(config.y) || 0;
    this.z = config.z !== undefined ? Number(config.z) : (config.elevation !== undefined ? Number(config.elevation) : ELEVATION.GROUND);
    this.elevation = this.z;

    this.facing = config.facing || 'south'; // 'south' | 'north' | 'east' | 'west'
    this.decorType = config.decorType || config.style || 'painting'; // 'note' | 'painting' | 'fresco' | 'carving' | 'tapestry'
    this.style = this.decorType;
    this.title = config.title || 'Wall Decoration';
    this.text = config.text || 'An artistic ornament rests upon the wall.';
    this.response = config.response || 'This adds quite a nice atmosphere.';
    this.author = config.author || 'Unknown Artisan';
    this.inspected = !!config.inspected;

    // Animation timer for subtle torchlight shimmer
    this.shimmerTimer = Math.random() * Math.PI * 2;
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
   * Inspect the wall decor
   * @returns {{ id: string, title: string, text: string, response: string, author: string, decorType: string, facing: string }}
   */
  inspect() {
    this.inspected = true;
    return {
      id: this.id,
      title: this.title,
      text: this.text,
      response: this.response,
      author: this.author,
      decorType: this.decorType,
      facing: this.facing,
    };
  }

  /**
   * Update animation timer
   * @param {number} dt
   */
  update(dt) {
    this.shimmerTimer += dt * 2.5;
  }

  /**
   * Render the wall decor on canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   * @param {string} [perspective='angled']
   */
  render(ctx, screenX, screenY, tileSize, perspective = 'angled') {
    const isAngled = perspective === 'angled';
    const wallH = Math.round(tileSize * 0.38);
    const pulse = Math.sin(this.shimmerTimer) * 0.15 + 0.85;

    ctx.save();

    // In angled mode with south facing, place directly on the south drop face
    // Otherwise place on top cap or wall center
    let cx, cy;
    if (isAngled && this.facing === 'south') {
      cx = screenX + tileSize / 2;
      cy = screenY + wallH / 2 + 1;
    } else {
      cx = screenX + tileSize / 2;
      cy = isAngled ? (screenY - wallH / 2) : (screenY + tileSize / 2);
    }

    // Uninspected subtle shimmer beacon
    if (!this.inspected) {
      ctx.beginPath();
      ctx.arc(cx, cy, (tileSize * 0.28) * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (this.decorType === 'note') {
      // Pinned parchment note
      const nw = tileSize * 0.52;
      const nh = tileSize * 0.48;

      // Note shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(cx - nw / 2 + 1, cy - nh / 2 + 1, nw, nh);

      // Aged parchment paper
      ctx.fillStyle = this.inspected ? '#fef08a' : '#fef9c3';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.fillRect(cx - nw / 2, cy - nh / 2, nw, nh);
      ctx.strokeRect(cx - nw / 2, cy - nh / 2, nw, nh);

      // Ink scrawl lines
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - nw * 0.35, cy - nh * 0.2);
      ctx.lineTo(cx + nw * 0.35, cy - nh * 0.2);
      ctx.moveTo(cx - nw * 0.35, cy);
      ctx.lineTo(cx + nw * 0.25, cy);
      ctx.moveTo(cx - nw * 0.35, cy + nh * 0.2);
      ctx.lineTo(cx + nw * 0.3, cy + nh * 0.2);
      ctx.stroke();

      // Brass pin at top center
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy - nh / 2 + 2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.decorType === 'painting') {
      // Gilded framed landscape painting
      const pw = tileSize * 0.62;
      const ph = tileSize * 0.52;

      // Frame Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(cx - pw / 2 + 1, cy - ph / 2 + 1, pw, ph);

      // Gilded Frame
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.fillRect(cx - pw / 2, cy - ph / 2, pw, ph);
      ctx.strokeRect(cx - pw / 2, cy - ph / 2, pw, ph);

      // Canvas background (sky & landscape)
      const grad = ctx.createLinearGradient(cx, cy - ph / 2 + 3, cx, cy + ph / 2 - 3);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.6, '#0284c7');
      grad.addColorStop(1, '#065f46');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - pw / 2 + 2.5, cy - ph / 2 + 2.5, pw - 5, ph - 5);

      // Distant mountain peak silhouette
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.moveTo(cx - pw * 0.35, cy + ph * 0.3);
      ctx.lineTo(cx - pw * 0.05, cy - ph * 0.1);
      ctx.lineTo(cx + pw * 0.3, cy + ph * 0.3);
      ctx.closePath();
      ctx.fill();

      // Golden sun dot
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx + pw * 0.2, cy - ph * 0.15, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.decorType === 'fresco') {
      // Ancient Painted Wall Fresco
      const fw = tileSize * 0.65;
      const fh = tileSize * 0.52;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(cx - fw / 2, cy - fh / 2, fw, fh);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - fw / 2, cy - fh / 2, fw, fh);

      // Fresco celestial emblem
      ctx.fillStyle = '#e879f9';
      ctx.font = `${Math.round(tileSize * 0.22)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏛️', cx, cy);
    } else if (this.decorType === 'tapestry') {
      // Royal Woven Banner / Tapestry
      const tw = tileSize * 0.48;
      const th = tileSize * 0.6;

      // Hanging rod
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx - tw * 0.6, cy - th / 2, tw * 1.2, 2.5);

      // Crimson fabric banner with triangular point at bottom
      ctx.fillStyle = '#991b1b';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - tw / 2, cy - th / 2 + 2);
      ctx.lineTo(cx + tw / 2, cy - th / 2 + 2);
      ctx.lineTo(cx + tw / 2, cy + th * 0.25);
      ctx.lineTo(cx, cy + th / 2);
      ctx.lineTo(cx - tw / 2, cy + th * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden crest emblem
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy - th * 0.05, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Stone Bas-Relief Carving
      const cw = tileSize * 0.58;
      const ch = tileSize * 0.52;

      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(cx - cw / 2, cy - ch / 2, cw, ch);
      ctx.strokeRect(cx - cw / 2, cy - ch / 2, cw, ch);

      // Chiseled glyphs
      ctx.fillStyle = this.inspected ? '#94a3b8' : '#38bdf8';
      ctx.font = `bold ${Math.round(tileSize * 0.24)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ᚱᛟ', cx, cy);
    }

    ctx.restore();
  }
}
