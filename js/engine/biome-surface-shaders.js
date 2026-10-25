/**
 * Casual Maze Game — Dynamic Biome Surface Shaders & Environmental Props (BL-127, ADR-0035)
 *
 * Implements deterministic procedural surface shaders, animated water caustics,
 * molten lava hotspots, prismatic refractions, and thematic wall props (urns,
 * banners, sconces, conduits) across all supported biomes.
 */

import { TILES } from '../core/constants.js';

export class BiomeSurfaceShaders {
  /**
   * Deterministic 2D spatial hash based on integer coordinates and level seed.
   * @param {number} x Grid X
   * @param {number} y Grid Y
   * @param {number} seed Level deterministic seed
   * @returns {number} Value in [0, 1)
   */
  static getDecorHash(x, y, seed = 42) {
    let h = (x * 374761393 + y * 668265263 + seed * 1013904223) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  /**
   * Render rich procedural floor tile details based on deterministic hash and animated timers.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x Grid X
   * @param {number} y Grid Y
   * @param {number} sx Screen X
   * @param {number} sy Screen Y
   * @param {number} tileSize Size of tile in pixels
   * @param {string} themeKey Active biome theme ID
   * @param {number} seed Level seed
   * @param {number} exitPulseTimer Animated elapsed timer
   */
  static renderFloorDetails(ctx, x, y, sx, sy, tileSize, themeKey, seed, exitPulseTimer = 0) {
    // BL-189: Master decor gate. Keep floor surface procedural embellishments sparse (~8% of tiles)
    // to eliminate visual noise and ensure corridors feel clean, serene, and uncluttered.
    const decorGate = this.getDecorHash(x, y, seed + 997);
    if (decorGate > 0.08) {
      return;
    }

    const hash = this.getDecorHash(x, y, seed + 101);
    const key = (themeKey === 'emerald' ? 'jungle' : (themeKey === 'magma' ? 'lava' : (themeKey === 'glacial' ? 'snow' : themeKey)));

    if (key === 'dungeon') {
      if (hash < 0.40) {
        // Ashlar flagstone sub-pavers with fine mortar seam
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(sx + 2, sy + 2, tileSize * 0.45, tileSize * 0.45);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(sx + tileSize * 0.52, sy + tileSize * 0.52, tileSize * 0.44, tileSize * 0.44);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(sx + tileSize * 0.5, sy + 2); ctx.lineTo(sx + tileSize * 0.5, sy + tileSize - 2);
        ctx.stroke();
      } else if (hash < 0.75) {
        // Lichen & moss growth in crevices
        ctx.fillStyle = 'rgba(74, 222, 128, 0.08)';
        ctx.beginPath();
        ctx.ellipse(sx + tileSize * 0.28, sy + tileSize * 0.72, tileSize * 0.18, tileSize * 0.10, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(34, 197, 94, 0.06)';
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.32, sy + tileSize * 0.76, tileSize * 0.08, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Subtle debossed masonry rosette ring (low contrast, non-interactive)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (key === 'jungle') {
      if (hash < 0.40) {
        // Creeping verdant moss
        ctx.fillStyle = 'rgba(34, 197, 94, 0.09)';
        ctx.beginPath();
        ctx.ellipse(sx + tileSize * 0.35, sy + tileSize * 0.4, tileSize * 0.18, tileSize * 0.10, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(22, 101, 52, 0.07)';
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.4, sy + tileSize * 0.38, tileSize * 0.06, 0, Math.PI * 2);
        ctx.fill();
      } else if (hash < 0.75) {
        // River pebbles & gravel insets
        ctx.fillStyle = 'rgba(202, 138, 4, 0.14)';
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.65, sy + tileSize * 0.6, 2.5, 0, Math.PI * 2);
        ctx.arc(sx + tileSize * 0.74, sy + tileSize * 0.68, 1.8, 0, Math.PI * 2);
        ctx.arc(sx + tileSize * 0.58, sy + tileSize * 0.74, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Surface root crossing
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(sx + tileSize * 0.15, sy + tileSize * 0.8);
        ctx.lineTo(sx + tileSize * 0.5, sy + tileSize * 0.45);
        ctx.lineTo(sx + tileSize * 0.85, sy + tileSize * 0.3);
        ctx.stroke();
      }
    } else if (key === 'lava') {
      if (hash < 0.40) {
        // Faint cooling basalt fissure line (low contrast, no harsh glare)
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.18)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(sx + tileSize * 0.18, sy + tileSize * 0.28);
        ctx.lineTo(sx + tileSize * 0.48, sy + tileSize * 0.52);
        ctx.lineTo(sx + tileSize * 0.82, sy + tileSize * 0.72);
        ctx.stroke();
      } else if (hash < 0.75) {
        // Hexagonal basalt contraction border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(sx + tileSize * 0.2, sy + tileSize * 0.5);
        ctx.lineTo(sx + tileSize * 0.5, sy + tileSize * 0.2);
        ctx.lineTo(sx + tileSize * 0.8, sy + tileSize * 0.5);
        ctx.stroke();
      } else {
        // Cooling magma node
        ctx.fillStyle = 'rgba(180, 83, 9, 0.16)';
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (key === 'snow') {
      if (hash < 0.40) {
        // Frost rime borders and powder drift
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.38, sy + tileSize * 0.35, tileSize * 0.14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(186, 230, 253, 0.10)';
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.44, sy + tileSize * 0.40, tileSize * 0.08, 0, Math.PI * 2);
        ctx.fill();
      } else if (hash < 0.75) {
        // Permafrost fracture line
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.20)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(sx + tileSize * 0.2, sy + tileSize * 0.7);
        ctx.lineTo(sx + tileSize * 0.6, sy + tileSize * 0.3);
        ctx.stroke();
      } else {
        // Cerulean deep-ice translucent patch
        ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
        ctx.beginPath();
        ctx.ellipse(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.22, tileSize * 0.14, 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (key === 'cave') {
      if (hash < 0.40) {
        // Bedrock stratification lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(sx + 2, sy + tileSize * 0.38); ctx.lineTo(sx + tileSize - 2, sy + tileSize * 0.38);
        ctx.moveTo(sx + 2, sy + tileSize * 0.68); ctx.lineTo(sx + tileSize - 2, sy + tileSize * 0.68);
        ctx.stroke();
      } else if (hash < 0.75) {
        // Subterranean mineral deposit (muted slate-mineral, no pulsing glare)
        ctx.fillStyle = 'rgba(147, 51, 234, 0.12)';
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.5, sy + tileSize * 0.5, 2.5, 0, Math.PI * 2);
        ctx.arc(sx + tileSize * 0.58, sy + tileSize * 0.46, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Mineral seam ring
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.45, sy + tileSize * 0.55, tileSize * 0.12, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (key === 'sunset' || key === 'temple') {
      if (hash < 0.40) {
        // Subtle terracotta border seam
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.15)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(sx + tileSize * 0.18, sy + tileSize * 0.18, tileSize * 0.64, tileSize * 0.64);
      } else if (hash < 0.75) {
        // Debossed sunburst relief (low contrast, non-interactive)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx + tileSize * 0.5, sy + tileSize * 0.3); ctx.lineTo(sx + tileSize * 0.5, sy + tileSize * 0.7);
        ctx.moveTo(sx + tileSize * 0.3, sy + tileSize * 0.5); ctx.lineTo(sx + tileSize * 0.7, sy + tileSize * 0.5);
        ctx.stroke();
      } else {
        // Inlaid terracotta lozenge (muted, debossed)
        ctx.fillStyle = 'rgba(180, 83, 9, 0.12)';
        ctx.beginPath();
        ctx.moveTo(sx + tileSize * 0.5, sy + tileSize * 0.38);
        ctx.lineTo(sx + tileSize * 0.62, sy + tileSize * 0.5);
        ctx.lineTo(sx + tileSize * 0.5, sy + tileSize * 0.62);
        ctx.lineTo(sx + tileSize * 0.38, sy + tileSize * 0.5);
        ctx.closePath();
        ctx.fill();
      }
    } else if (key === 'aqueduct') {
      if (hash < 0.50) {
        ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
        ctx.beginPath();
        ctx.ellipse(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.3, tileSize * 0.18, 0.15, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Paver drain incision
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(sx + tileSize * 0.3, sy + tileSize * 0.3, tileSize * 0.4, tileSize * 0.4);
      }
    } else if (themeKey === 'prismatic') {
      ctx.fillStyle = 'rgba(232, 121, 249, 0.08)';
      ctx.beginPath();
      ctx.moveTo(sx + tileSize * 0.5, sy + tileSize * 0.25);
      ctx.lineTo(sx + tileSize * 0.7, sy + tileSize * 0.5);
      ctx.lineTo(sx + tileSize * 0.5, sy + tileSize * 0.75);
      ctx.lineTo(sx + tileSize * 0.3, sy + tileSize * 0.5);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Render theme-specific decorative art in non-playable areas & deep wall blocks.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x Grid X
   * @param {number} y Grid Y
   * @param {number} screenX Screen X
   * @param {number} sy Screen Y
   * @param {number} tileSize Size of tile in pixels
   * @param {string} themeKey Active biome theme ID
   * @param {number} seed Level seed
   * @param {Array<Array<number>>} ground Ground grid matrix
   * @param {number} exitPulseTimer Animated timer
   * @param {object} [level] Level instance
   */
  static renderPerimeterDecorTile(ctx, x, y, screenX, sy, tileSize, themeKey, seed, ground, exitPulseTimer = 0, level = null) {
    if (level) {
      if (level.spawn && level.spawn.x === x && level.spawn.y === y + 1) return;
      const exits = Array.isArray(level.exits) && level.exits.length > 0 ? level.exits : (level.exit ? [level.exit] : []);
      if (exits.some(e => e.x === x && e.y === y + 1)) return;
    }
    const hasSouthCorridor = ground[y + 1]?.[x] !== TILES.WALL && ground[y + 1]?.[x] !== undefined;
    const hash = this.getDecorHash(x, y, seed);

    if (themeKey === 'aqueduct') {
      if (hasSouthCorridor && hash < 0.15) {
        this.renderAqueductSpout(ctx, screenX, sy, tileSize, hash, exitPulseTimer);
      } else if (hasSouthCorridor && hash >= 0.15 && hash < 0.32) {
        this.renderAqueductUrn(ctx, screenX, sy, tileSize, hash);
      } else if (hash >= 0.32 && hash < 0.48) {
        this.renderAlgaePatch(ctx, screenX, sy, tileSize, hash);
      }
    } else if (themeKey === 'prismatic') {
      if (hasSouthCorridor && hash < 0.16) {
        this.renderPrismaticSconce(ctx, screenX, sy, tileSize, hash, exitPulseTimer);
      } else if (hash >= 0.16 && hash < 0.36) {
        this.renderPrismaticCluster(ctx, screenX, sy, tileSize, hash, exitPulseTimer);
      }
    } else if (themeKey === 'dungeon') {
      if (hasSouthCorridor && hash >= 0.48 && hash < 0.60) {
        this.renderRoyalBanner(ctx, screenX, sy, tileSize, hash);
      } else if (hasSouthCorridor && hash >= 0.60 && hash < 0.72) {
        this.renderClayUrn(ctx, screenX, sy, tileSize, hash);
      }
    } else if (themeKey === 'temple') {
      if (hasSouthCorridor && hash >= 0.50 && hash < 0.64) {
        this.renderRoyalBanner(ctx, screenX, sy, tileSize, hash, '#d97706', '#fbbf24');
      } else if (hasSouthCorridor && hash >= 0.64 && hash < 0.78) {
        this.renderClayUrn(ctx, screenX, sy, tileSize, hash, '#b45309');
      }
    }
  }

  static renderAqueductSpout(ctx, screenX, screenY, tileSize, hash, exitPulseTimer) {
    ctx.save();
    const cx = screenX + tileSize * 0.5;
    const wallH = Math.round(tileSize * 0.38);
    const spoutY = screenY + tileSize - Math.round(wallH * 0.4);

    // Bronze wall bracket / conduit
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(cx - 3, spoutY - 3, 6, 6);
    ctx.fillStyle = '#14b8a6';
    ctx.beginPath();
    ctx.arc(cx, spoutY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Dripping water droplet
    const dropPhase = (exitPulseTimer * 2 + hash * 5) % 1;
    const dropY = spoutY + dropPhase * (tileSize * 0.35);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.beginPath();
    ctx.ellipse(cx, dropY, 1.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  static renderAqueductUrn(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    const cx = screenX + tileSize * 0.5;
    const urnY = screenY + tileSize * 0.75;
    ctx.fillStyle = '#0e7490';
    ctx.beginPath();
    ctx.ellipse(cx, urnY, tileSize * 0.12, tileSize * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(cx - tileSize * 0.08, urnY - tileSize * 0.18, tileSize * 0.16, tileSize * 0.05);
    ctx.restore();
  }

  static renderAlgaePatch(ctx, screenX, screenY, tileSize, hash) {
    ctx.save();
    const ax = screenX + tileSize * 0.35;
    const ay = screenY + tileSize * 0.2;
    ctx.fillStyle = 'rgba(13, 148, 136, 0.45)';
    ctx.beginPath();
    ctx.ellipse(ax, ay, tileSize * 0.15, tileSize * 0.08, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  static renderPrismaticSconce(ctx, screenX, screenY, tileSize, hash, exitPulseTimer) {
    ctx.save();
    const cx = screenX + tileSize * 0.5;
    const wallH = Math.round(tileSize * 0.38);
    const sy = screenY + tileSize - Math.round(wallH * 0.45);
    const pulse = Math.sin(exitPulseTimer * 3 + hash * 10) * 0.15 + 0.85;

    // Spectral ambient cone
    if (typeof ctx.createRadialGradient === 'function') {
      const grad = ctx.createRadialGradient(cx, sy, 2, cx, sy, tileSize * 0.8 * pulse);
      grad.addColorStop(0, 'rgba(232, 121, 249, 0.35)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, sy, tileSize * 0.8 * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating crystal core
    ctx.fillStyle = '#f0abfc';
    ctx.beginPath();
    ctx.moveTo(cx, sy - 6 * pulse);
    ctx.lineTo(cx + 4, sy);
    ctx.lineTo(cx, sy + 6 * pulse);
    ctx.lineTo(cx - 4, sy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  static renderPrismaticCluster(ctx, screenX, screenY, tileSize, hash, exitPulseTimer) {
    ctx.save();
    const cx = screenX + tileSize * 0.45;
    const cy = screenY + tileSize * 0.35;
    const pulse = Math.sin(exitPulseTimer * 2.5 + hash * 12) * 0.2 + 0.8;
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7 * pulse);
    ctx.lineTo(cx + 3, cy);
    ctx.lineTo(cx, cy + 7 * pulse);
    ctx.lineTo(cx - 3, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 5 * pulse);
    ctx.lineTo(cx + 7, cy);
    ctx.lineTo(cx + 4, cy + 5 * pulse);
    ctx.lineTo(cx + 1, cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  static renderRoyalBanner(ctx, screenX, screenY, tileSize, hash, mainColor = '#991b1b', trimColor = '#fbbf24') {
    ctx.save();
    const bx = screenX + tileSize * 0.35;
    const by = screenY + tileSize * 0.15;
    const bw = tileSize * 0.3;
    const bh = tileSize * 0.55;

    // Rod
    ctx.fillStyle = '#451a03';
    ctx.fillRect(bx - 2, by - 2, bw + 4, 3);

    // Fabric
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw * 0.5, by + bh - tileSize * 0.1);
    ctx.lineTo(bx, by + bh);
    ctx.closePath();
    ctx.fill();

    // Emblem trim
    ctx.strokeStyle = trimColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  static renderClayUrn(ctx, screenX, screenY, tileSize, hash, color = '#78350f') {
    ctx.save();
    const ux = screenX + tileSize * (0.3 + (hash % 0.4));
    const uy = screenY + tileSize * 0.78;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(ux, uy, tileSize * 0.11, tileSize * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#92400e';
    ctx.fillRect(ux - tileSize * 0.06, uy - tileSize * 0.15, tileSize * 0.12, tileSize * 0.04);
    ctx.restore();
  }

  /**
   * Render architectural wall face details (relief carvings, ivy drapes, heat vents, icicles)
   * on the vertical front face of corridor walls (BL-178, ADR-0052).
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY Top of base tile (front face starts at screenY - wallH + tileSize)
   * @param {number} tileSize
   * @param {number} wallH Height of wall face in pixels
   * @param {string} themeKey Active biome theme ID
   * @param {number} seed Level seed
   * @param {number} x Grid X
   * @param {number} y Grid Y
   * @param {number} exitPulseTimer
   */
  static renderWallFaceDetails(ctx, screenX, screenY, tileSize, wallH, themeKey, seed, x, y, exitPulseTimer = 0) {
    const faceY = screenY - wallH + tileSize;
    const wHash = this.getDecorHash(x, y, seed + 409);
    const key = (themeKey === 'emerald' ? 'jungle' : (themeKey === 'magma' ? 'lava' : (themeKey === 'glacial' ? 'snow' : themeKey)));

    if (key === 'dungeon') {
      if (wHash < 0.20) {
        // Carved stone relief panel / recessed tablet niche
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fillRect(screenX + tileSize * 0.2, faceY + wallH * 0.15, tileSize * 0.6, wallH * 0.7);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(screenX + tileSize * 0.2, faceY + wallH * 0.15, tileSize * 0.6, wallH * 0.7);
      } else if (wHash >= 0.76 && wHash < 0.88) {
        // Hanging iron wall ring / shackle
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(screenX + tileSize * 0.46, faceY + wallH * 0.2, tileSize * 0.08, wallH * 0.2);
        ctx.beginPath();
        ctx.arc(screenX + tileSize * 0.5, faceY + wallH * 0.55, tileSize * 0.07, 0, Math.PI * 2);
        ctx.stroke();
      } else if (wHash >= 0.88 && wHash < 0.96) {
        // Creeping wall moss stain
        ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
        ctx.beginPath();
        ctx.ellipse(screenX + tileSize * 0.5, faceY + wallH * 0.6, tileSize * 0.25, wallH * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (key === 'jungle') {
      if (wHash < 0.25) {
        // Creeping ivy vine tendril hanging from wall top
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(screenX + tileSize * 0.3, faceY);
        if (typeof ctx.bezierCurveTo === 'function') {
          ctx.bezierCurveTo(screenX + tileSize * 0.45, faceY + wallH * 0.4, screenX + tileSize * 0.25, faceY + wallH * 0.7, screenX + tileSize * 0.4, faceY + wallH * 0.95);
        } else {
          ctx.lineTo(screenX + tileSize * 0.4, faceY + wallH * 0.95);
        }
        ctx.stroke();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(screenX + tileSize * 0.4, faceY + wallH * 0.95, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (wHash >= 0.75 && wHash < 0.90) {
        // Verdant moss wash across lower masonry course
        ctx.fillStyle = 'rgba(22, 101, 52, 0.25)';
        ctx.fillRect(screenX, faceY + wallH * 0.5, tileSize, wallH * 0.5);
      }
    } else if (key === 'lava') {
      if (wHash < 0.22) {
        // Glowing heat fissure in mortar
        const glow = Math.sin(exitPulseTimer * 3.5 + wHash * 10) * 0.15 + 0.35;
        ctx.strokeStyle = `rgba(249, 115, 22, ${glow})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(screenX + tileSize * 0.2, faceY + wallH * 0.2);
        ctx.lineTo(screenX + tileSize * 0.5, faceY + wallH * 0.5);
        ctx.lineTo(screenX + tileSize * 0.8, faceY + wallH * 0.8);
        ctx.stroke();
      } else if (wHash >= 0.78 && wHash < 0.90) {
        // Soot scorch mark
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(screenX + tileSize * 0.5, faceY + wallH * 0.6, tileSize * 0.18, wallH * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (key === 'snow') {
      if (wHash < 0.24) {
        // Icicle fringe along bottom seam
        ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
        ctx.beginPath();
        ctx.moveTo(screenX + tileSize * 0.2, faceY + wallH);
        ctx.lineTo(screenX + tileSize * 0.25, faceY + wallH - 4);
        ctx.lineTo(screenX + tileSize * 0.3, faceY + wallH);
        ctx.lineTo(screenX + tileSize * 0.5, faceY + wallH - 5);
        ctx.lineTo(screenX + tileSize * 0.7, faceY + wallH);
        ctx.closePath();
        ctx.fill();
      } else if (wHash >= 0.76 && wHash < 0.90) {
        // Pale glacial glaze
        ctx.fillStyle = 'rgba(186, 230, 253, 0.16)';
        ctx.fillRect(screenX, faceY, tileSize, wallH);
      }
    } else if (key === 'sunset' || key === 'temple') {
      if (wHash < 0.22) {
        // Gilded bas-relief trim
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX, faceY + wallH * 0.3); ctx.lineTo(screenX + tileSize, faceY + wallH * 0.3);
        ctx.moveTo(screenX, faceY + wallH * 0.7); ctx.lineTo(screenX + tileSize, faceY + wallH * 0.7);
        ctx.stroke();
      } else if (wHash >= 0.78 && wHash < 0.90) {
        // Sun disc carving in wall
        ctx.fillStyle = 'rgba(217, 119, 6, 0.3)';
        ctx.beginPath();
        ctx.arc(screenX + tileSize * 0.5, faceY + wallH * 0.5, wallH * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (key === 'aqueduct') {
      if (wHash < 0.24) {
        // Wet algae seepage stain
        ctx.fillStyle = 'rgba(15, 118, 110, 0.3)';
        ctx.fillRect(screenX + tileSize * 0.3, faceY + wallH * 0.3, tileSize * 0.4, wallH * 0.7);
      }
    } else if (key === 'prismatic') {
      if (wHash < 0.22) {
        // Embedded glowing crystal shard
        const pGlow = Math.sin(exitPulseTimer * 3 + wHash * 15) * 0.2 + 0.4;
        ctx.fillStyle = `rgba(232, 121, 249, ${pGlow})`;
        ctx.beginPath();
        ctx.moveTo(screenX + tileSize * 0.5, faceY + wallH * 0.2);
        ctx.lineTo(screenX + tileSize * 0.56, faceY + wallH * 0.5);
        ctx.lineTo(screenX + tileSize * 0.5, faceY + wallH * 0.8);
        ctx.lineTo(screenX + tileSize * 0.44, faceY + wallH * 0.5);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  /**
   * Render architectural wall top cap details (stone joints, bevel border) (BL-178, ADR-0052).
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   * @param {number} wallH
   * @param {string} themeKey
   * @param {number} seed
   * @param {number} x
   * @param {number} y
   */
  static renderWallTopDetails(ctx, screenX, screenY, tileSize, wallH, themeKey, seed, x, y) {
    const topY = screenY - wallH;
    const capHash = this.getDecorHash(x, y, seed + 823);

    // Subtle stone slab mortar divide
    if (capHash < 0.60) {
      const split = capHash < 0.30 ? 0.38 : 0.68;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(screenX + tileSize * split, topY, 1, tileSize);
    }

    // Top rim highlight line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(screenX, topY, tileSize, 1);
  }

  /**
   * Render dynamic radial lighting falloff, torch glows, and surface reflections
   * directly onto ground floor pavers (BL-164, ADR-0047).
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} level
   * @param {object} bounds
   * @param {object} camera
   * @param {object} theme
   * @param {Array<object>} entities
   * @param {object|null} player
   * @param {number} tileSize
   * @param {number} exitPulseTimer
   */
  static renderDynamicFloorLightingPass(ctx, level, bounds, camera, theme, entities = [], player = null, tileSize = 32, exitPulseTimer = 0) {
    if (!ctx || !level || !camera) return;
    if (typeof ctx.createRadialGradient !== 'function') return;

    ctx.save();

    // 1. Placed Wall Torches, Lanterns & Fire Hazards
    if (entities && entities.length > 0) {
      for (const ent of entities) {
        const isTorch = (ent.type === 'wall_decor' && (ent.decorType === 'torch' || ent.decorType === 'lantern')) ||
                        (ent.type === 'collectible' && ent.itemId === 'torch') ||
                        (ent.type === 'fire' || ent.type === 'flame_vent' || ent.type === 'timed_hazard');
        if (!isTorch) continue;

        const ex = Math.round(ent.x);
        const ey = Math.round(ent.y);
        if (bounds && (ex < bounds.startCol - 2 || ex > bounds.endCol + 2 || ey < bounds.startRow - 2 || ey > bounds.endRow + 2)) continue;

        const screen = camera.worldToScreen(ent.x * tileSize + tileSize / 2, ent.y * tileSize + tileSize / 2, true);
        const seed = (ex * 19 + ey * 37);
        const flicker = 0.92 + Math.sin(exitPulseTimer * 3.5 + seed) * 0.08;
        const radius = tileSize * 2.6 * flicker;

        const grad = ctx.createRadialGradient(screen.x, screen.y, tileSize * 0.15, screen.x, screen.y, radius);
        if (ent.type === 'flame_vent' || ent.type === 'fire') {
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.40)');
          grad.addColorStop(0.4, 'rgba(249, 115, 22, 0.18)');
          grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        } else {
          grad.addColorStop(0, 'rgba(254, 215, 170, 0.38)');
          grad.addColorStop(0.35, 'rgba(251, 146, 60, 0.20)');
          grad.addColorStop(0.75, 'rgba(249, 115, 22, 0.06)');
          grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Wall Sconces on Ground Wall Faces
    if (level.layers && level.layers.ground && bounds) {
      const ground = level.layers.ground;
      for (let y = bounds.startRow; y <= bounds.endRow; y++) {
        for (let x = bounds.startCol; x <= bounds.endCol; x++) {
          if (ground[y]?.[x] !== TILES.WALL) continue;
          const isSconce = ((x * 19 + y * 29) % 23 === 0);
          if (!isSconce) continue;

          // Check if there is walkable floor adjacent to receive light
          const hasFloorNearby = ground[y + 1]?.[x] !== TILES.WALL || ground[y - 1]?.[x] !== TILES.WALL;
          if (!hasFloorNearby) continue;

          const screen = camera.worldToScreen(x * tileSize + tileSize / 2, (y + 0.6) * tileSize, true);
          const flicker = 0.91 + Math.sin(exitPulseTimer * 2.8 + x + y) * 0.09;
          const radius = tileSize * 2.1 * flicker;

          const grad = ctx.createRadialGradient(screen.x, screen.y, tileSize * 0.1, screen.x, screen.y, radius);
          grad.addColorStop(0, 'rgba(254, 215, 170, 0.30)');
          grad.addColorStop(0.4, 'rgba(251, 146, 60, 0.14)');
          grad.addColorStop(1, 'rgba(249, 115, 22, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Explorer Footprint Ambient Illumination
    if (player && typeof player.worldX === 'number' && typeof player.worldY === 'number') {
      const playerScreen = camera.worldToScreen(player.worldX, player.worldY, true);
      const hasTorch = typeof player.hasTorch === 'function' && player.hasTorch();
      const radius = hasTorch ? tileSize * 3.4 : tileSize * 2.2;
      const flicker = 0.95 + Math.sin(exitPulseTimer * 2.6) * 0.05;

      const pGrad = ctx.createRadialGradient(playerScreen.x, playerScreen.y, tileSize * 0.15, playerScreen.x, playerScreen.y, radius * flicker);
      if (hasTorch) {
        pGrad.addColorStop(0, 'rgba(254, 215, 170, 0.42)');
        pGrad.addColorStop(0.4, 'rgba(251, 146, 60, 0.20)');
        pGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      } else {
        pGrad.addColorStop(0, 'rgba(254, 240, 138, 0.24)');
        pGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.08)');
        pGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      }

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(playerScreen.x, playerScreen.y, radius * flicker, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Sanctum Exit Daylight Glow
    if (level.exit && bounds) {
      const ex = level.exit.x;
      const ey = level.exit.y;
      if (ex >= bounds.startCol - 2 && ex <= bounds.endCol + 2 && ey >= bounds.startRow - 2 && ey <= bounds.endRow + 2) {
        const exitScreen = camera.worldToScreen(ex * tileSize + tileSize / 2, ey * tileSize + tileSize / 2, true);
        const pulse = 0.92 + Math.sin(exitPulseTimer * 2.0) * 0.08;
        const eRadius = tileSize * 2.8 * pulse;

        const exitGrad = ctx.createRadialGradient(exitScreen.x, exitScreen.y, tileSize * 0.2, exitScreen.x, exitScreen.y, eRadius);
        exitGrad.addColorStop(0, 'rgba(254, 240, 138, 0.38)');
        exitGrad.addColorStop(0.45, 'rgba(251, 191, 36, 0.18)');
        exitGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');

        ctx.fillStyle = exitGrad;
        ctx.beginPath();
        ctx.arc(exitScreen.x, exitScreen.y, eRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
