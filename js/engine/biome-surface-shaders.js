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
    const hash = this.getDecorHash(x, y, seed + 101);

    if (themeKey === 'dungeon') {
      if (hash < 0.35) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.fillRect(sx + 2, sy + 2, tileSize * 0.42, tileSize * 0.42);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.45, tileSize * 0.45);
      } else if (hash >= 0.75 && hash < 0.88) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.14, 0, Math.PI * 2);
        ctx.stroke();
      } else if (hash >= 0.88 && hash < 0.95) {
        const shimmer = Math.sin(exitPulseTimer * 2 + hash * 10) * 0.05 + 0.12;
        ctx.fillStyle = `rgba(56, 189, 248, ${shimmer})`;
        ctx.beginPath();
        ctx.ellipse(sx + tileSize * 0.45, sy + tileSize * 0.52, tileSize * 0.22, tileSize * 0.14, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${shimmer * 0.8})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(sx + tileSize * 0.45, sy + tileSize * 0.52, tileSize * 0.12, tileSize * 0.07, 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (themeKey === 'jungle') {
      if (hash < 0.30) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
        ctx.beginPath();
        ctx.ellipse(sx + tileSize * 0.35, sy + tileSize * 0.4, tileSize * 0.15, tileSize * 0.08, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (hash >= 0.70 && hash < 0.85) {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.65, sy + tileSize * 0.6, 2, 0, Math.PI * 2);
        ctx.arc(sx + tileSize * 0.72, sy + tileSize * 0.68, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (hash >= 0.85 && hash < 0.93) {
        const ripple = Math.sin(exitPulseTimer * 2.5 + hash * 12) * 0.04 + 0.14;
        ctx.fillStyle = `rgba(34, 197, 94, ${ripple})`;
        ctx.beginPath();
        ctx.ellipse(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.24, tileSize * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (themeKey === 'lava') {
      if (hash < 0.28) {
        const glowPulse = Math.sin(exitPulseTimer * 3 + hash * 8) * 0.15 + 0.35;
        ctx.strokeStyle = `rgba(249, 115, 22, ${glowPulse})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(sx + tileSize * 0.2, sy + tileSize * 0.3);
        ctx.lineTo(sx + tileSize * 0.5, sy + tileSize * 0.55);
        ctx.lineTo(sx + tileSize * 0.8, sy + tileSize * 0.7);
        ctx.stroke();
      } else if (hash >= 0.78 && hash < 0.88) {
        const bubble = Math.sin(exitPulseTimer * 4 + hash * 15) * 0.2 + 0.3;
        ctx.fillStyle = `rgba(239, 68, 68, ${bubble})`;
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(251, 191, 36, ${bubble + 0.2})`;
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (themeKey === 'snow') {
      if (hash < 0.35) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.4, sy + tileSize * 0.35, tileSize * 0.12, 0, Math.PI * 2);
        ctx.fill();
      } else if (hash >= 0.80 && hash < 0.90) {
        const glint = Math.max(0, Math.sin(exitPulseTimer * 3.5 + hash * 20)) * 0.4;
        if (glint > 0.05) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${glint})`;
          ctx.lineWidth = 1;
          const cx = sx + tileSize * 0.6;
          const cy = sy + tileSize * 0.4;
          ctx.beginPath();
          ctx.moveTo(cx - 3, cy); ctx.lineTo(cx + 3, cy);
          ctx.moveTo(cx, cy - 3); ctx.lineTo(cx, cy + 3);
          ctx.stroke();
        }
      }
    } else if (themeKey === 'cave') {
      if (hash < 0.22) {
        const pulse = Math.sin(exitPulseTimer * 2.2 + hash * 14) * 0.15 + 0.35;
        ctx.fillStyle = `rgba(192, 132, 252, ${pulse})`;
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.5, sy + tileSize * 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (hash >= 0.78 && hash < 0.89) {
        const damp = Math.sin(exitPulseTimer * 1.8 + hash * 9) * 0.06 + 0.15;
        ctx.fillStyle = `rgba(168, 85, 247, ${damp})`;
        ctx.beginPath();
        ctx.ellipse(sx + tileSize * 0.48, sy + tileSize * 0.54, tileSize * 0.2, tileSize * 0.12, 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (themeKey === 'sunset' || themeKey === 'temple') {
      if (hash < 0.32) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + tileSize * 0.2, sy + tileSize * 0.2, tileSize * 0.6, tileSize * 0.6);
      } else if (hash >= 0.82 && hash < 0.92) {
        const goldShine = Math.sin(exitPulseTimer * 2.8 + hash * 16) * 0.15 + 0.25;
        ctx.fillStyle = `rgba(251, 191, 36, ${goldShine})`;
        ctx.fillRect(sx + tileSize * 0.45, sy + tileSize * 0.45, tileSize * 0.1, tileSize * 0.1);
      }
    } else if (themeKey === 'aqueduct') {
      // Animated water channel caustics and stepping ripples (BL-127)
      if (hash < 0.32) {
        const caustic = Math.sin(exitPulseTimer * 2.4 + hash * 10) * 0.08 + 0.18;
        ctx.fillStyle = `rgba(14, 165, 233, ${caustic})`;
        ctx.beginPath();
        ctx.ellipse(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * 0.3, tileSize * 0.18, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(125, 211, 252, ${caustic * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (hash >= 0.72 && hash < 0.85) {
        // Paver drain grate with flow lines
        ctx.strokeStyle = 'rgba(8, 47, 73, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(sx + tileSize * 0.3, sy + tileSize * 0.3, tileSize * 0.4, tileSize * 0.4);
        ctx.beginPath();
        ctx.moveTo(sx + tileSize * 0.4, sy + tileSize * 0.3); ctx.lineTo(sx + tileSize * 0.4, sy + tileSize * 0.7);
        ctx.moveTo(sx + tileSize * 0.6, sy + tileSize * 0.3); ctx.lineTo(sx + tileSize * 0.6, sy + tileSize * 0.7);
        ctx.stroke();
      } else if (hash >= 0.85 && hash < 0.94) {
        // Concentric water drop ripple
        const rip = (exitPulseTimer * 1.5 + hash * 5) % 1;
        const ripAlpha = Math.max(0, 1 - rip) * 0.3;
        ctx.strokeStyle = `rgba(56, 189, 248, ${ripAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(sx + tileSize * 0.5, sy + tileSize * 0.5, tileSize * (0.05 + rip * 0.35), 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (themeKey === 'prismatic') {
      // Iridescent crystal facets and spectral shimmering glints (BL-127)
      if (hash < 0.30) {
        const pulse = Math.sin(exitPulseTimer * 3 + hash * 14) * 0.15 + 0.35;
        ctx.fillStyle = `rgba(232, 121, 249, ${pulse * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(sx + tileSize * 0.5, sy + tileSize * 0.25);
        ctx.lineTo(sx + tileSize * 0.7, sy + tileSize * 0.5);
        ctx.lineTo(sx + tileSize * 0.5, sy + tileSize * 0.75);
        ctx.lineTo(sx + tileSize * 0.3, sy + tileSize * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (hash >= 0.80 && hash < 0.92) {
        // Spectral rainbow glint
        const glint = Math.max(0, Math.sin(exitPulseTimer * 3.8 + hash * 22)) * 0.45;
        if (glint > 0.05) {
          ctx.strokeStyle = `rgba(240, 171, 252, ${glint})`;
          ctx.lineWidth = 1.2;
          const cx = sx + tileSize * 0.55;
          const cy = sy + tileSize * 0.45;
          ctx.beginPath();
          ctx.moveTo(cx - 4, cy); ctx.lineTo(cx + 4, cy);
          ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 4);
          ctx.stroke();
        }
      }
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
}
