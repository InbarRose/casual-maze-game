/**
 * Minimap HUD Canvas Renderer
 * Renders explored/visible maze layout, player location, exit portal, and provides click-to-pan.
 * Supports pinch-to-zoom (1.0x - 3.5x), drag-to-pan, and double-tap zoom toggle (BL-17).
 */

import { TILES, FOG_STATE, ENTITY_TYPES } from '../core/constants.js';
import { StorageManager } from '../core/storage.js';

export class Minimap {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {number} [size=180]
   */
  constructor(canvas, size = 180) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = size;
    this.canvas.width = size;
    this.canvas.height = size;
    this.pulseTimer = 0;

    // Zoom & Pan State (BL-17)
    this.zoom = 1.0;
    this.minZoom = 1.0;
    this.maxZoom = 3.5;
    this.panX = 0; // Grid offset
    this.panY = 0;
  }

  /**
   * Set minimap zoom level
   * @param {number} zoom
   * @param {number|null} [focusGridX=null]
   * @param {number|null} [focusGridY=null]
   */
  setZoom(zoom, focusGridX = null, focusGridY = null) {
    const clamped = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    this.zoom = Math.round(clamped * 100) / 100;
    if (this.zoom <= this.minZoom + 0.01) {
      this.zoom = this.minZoom;
      this.panX = 0;
      this.panY = 0;
    }
  }

  /**
   * Increment minimap zoom by delta
   * @param {number} delta
   * @param {number|null} [focusGridX=null]
   * @param {number|null} [focusGridY=null]
   */
  zoomBy(delta, focusGridX = null, focusGridY = null) {
    this.setZoom(this.zoom + delta, focusGridX, focusGridY);
  }

  /**
   * Pan minimap view by grid offset
   * @param {number} deltaGridX
   * @param {number} deltaGridY
   * @param {object|null} [level=null]
   */
  panBy(deltaGridX, deltaGridY, level = null) {
    if (this.zoom <= 1.0) return;
    this.panX += deltaGridX;
    this.panY += deltaGridY;

    if (level && level.dimensions) {
      const maxPanW = (level.dimensions.width / 2);
      const maxPanH = (level.dimensions.height / 2);
      this.panX = Math.max(-maxPanW, Math.min(maxPanW, this.panX));
      this.panY = Math.max(-maxPanH, Math.min(maxPanH, this.panY));
    }
  }

  /**
   * Reset zoom and pan back to default 1.0x overview
   */
  resetView() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  /**
   * Helper to check if high contrast accessibility mode is enabled
   * @returns {boolean}
   */
  isHighContrast() {
    try {
      if (typeof document !== 'undefined' && document.body?.classList?.contains('high-contrast-mode')) {
        return true;
      }
      return StorageManager.getSetting('high_contrast', false) === true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Render individual tile on the minimap with 3D elevation and bridge awareness (BL-65)
   */
  renderTileCell(ctx, tile, x, y, px, py, w, h, vis, isSecret, isRevealed, hasOverhead, isHc) {
    if (tile === TILES.WALL || (isSecret && !isRevealed)) {
      if (isHc) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(px, py, w, h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, w, h);
      } else {
        ctx.fillStyle = vis === FOG_STATE.VISIBLE ? '#475569' : '#1e293b';
        ctx.fillRect(px, py, w, h);
      }
      return;
    }

    if (isSecret && isRevealed) {
      ctx.fillStyle = isHc ? '#00ffff' : '#38bdf8';
      ctx.fillRect(px, py, w, h);
      return;
    }

    const isBridge = tile === TILES.BRIDGE_EW || tile === TILES.BRIDGE_NS;
    const isRamp = tile === TILES.RAMP_N || tile === TILES.RAMP_S || tile === TILES.RAMP_E || tile === TILES.RAMP_W;

    if (isBridge) {
      // 3D Bridge Deck Shading (BL-65)
      ctx.fillStyle = isHc ? '#003366' : (vis === FOG_STATE.VISIBLE ? '#0369a1' : '#075985');
      ctx.fillRect(px, py, w, h);

      // Render bridge deck walkway center stripe
      ctx.fillStyle = isHc ? '#ffffff' : '#38bdf8';
      if (tile === TILES.BRIDGE_EW) {
        ctx.fillRect(px, py + h * 0.3, w, Math.max(1, h * 0.4));
      } else {
        ctx.fillRect(px + w * 0.3, py, Math.max(1, w * 0.4), h);
      }
      return;
    }

    if (isRamp) {
      // 3D Approach Ramp Incline Shading (BL-65)
      ctx.fillStyle = isHc ? '#004080' : (vis === FOG_STATE.VISIBLE ? '#0ea5e9' : '#0284c7');
      ctx.fillRect(px, py, w, h);

      // Directional Ramp Notch
      ctx.fillStyle = isHc ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
      if (tile === TILES.RAMP_N) {
        ctx.fillRect(px + w * 0.25, py, w * 0.5, Math.max(1, h * 0.35));
      } else if (tile === TILES.RAMP_S) {
        ctx.fillRect(px + w * 0.25, py + h * 0.65, w * 0.5, Math.max(1, h * 0.35));
      } else if (tile === TILES.RAMP_E) {
        ctx.fillRect(px + w * 0.65, py + h * 0.25, Math.max(1, w * 0.35), h * 0.5);
      } else if (tile === TILES.RAMP_W) {
        ctx.fillRect(px, py + h * 0.25, Math.max(1, w * 0.35), h * 0.5);
      }
      return;
    }

    // Standard Corridor
    if (isHc) {
      ctx.fillStyle = vis === FOG_STATE.VISIBLE ? '#222222' : '#141414';
    } else {
      ctx.fillStyle = vis === FOG_STATE.VISIBLE ? '#334155' : '#0f172a';
    }
    ctx.fillRect(px, py, w, h);

    // If upper layer has overhead walkway crossing over
    if (hasOverhead) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(px, py, w, h);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, py, w, h);
    }
  }

  /**
   * Render tactical entity indicators (Keys, Doors, Levers, Teleporters) on minimap (BL-65)
   */
  renderEntitiesPass(ctx, level, fog, toScreenFn, isHc) {
    if (!Array.isArray(level.entities)) return;

    for (const ent of level.entities) {
      // Fog check: only render if explored or visible
      if (fog) {
        const vis = fog.getVisibility(ent.x, ent.y);
        if (vis < FOG_STATE.EXPLORED) continue;
      }

      const screen = toScreenFn(ent.x, ent.y);
      if (!screen || screen.x < -15 || screen.x > this.size + 15 || screen.y < -15 || screen.y > this.size + 15) {
        continue;
      }

      const { x: sx, y: sy, cellW, cellH } = screen;

      ctx.save();
      if (ent.type === ENTITY_TYPES.KEY) {
        if (!ent.collected) {
          const keyColor = isHc ? '#ffff00' : (ent.color || '#facc15');
          ctx.fillStyle = keyColor;
          ctx.shadowColor = keyColor;
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(2, cellW * 0.35), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (ent.type === ENTITY_TYPES.DOOR) {
        if (!ent.isOpen) {
          const doorColor = isHc ? '#ff3333' : (ent.color || '#ef4444');
          ctx.fillStyle = doorColor;
          const barW = Math.max(3, cellW * 0.7);
          const barH = Math.max(2, cellH * 0.28);
          ctx.fillRect(sx - barW / 2, sy - barH / 2, barW, barH);
        }
      } else if (ent.type === ENTITY_TYPES.LEVER) {
        const leverColor = ent.active ? '#10b981' : '#f59e0b';
        ctx.fillStyle = leverColor;
        const nodeSize = Math.max(2.5, cellW * 0.4);
        ctx.fillRect(sx - nodeSize / 2, sy - nodeSize / 2, nodeSize, nodeSize);
      } else if (ent.type === ENTITY_TYPES.TELEPORTER) {
        ctx.strokeStyle = isHc ? '#ff00ff' : '#a855f7';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(2.5, cellW * 0.4), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /**
   * Render atmospheric radar sweep wave emanating from player (BL-65)
   */
  renderRadarSweep(ctx, plX, plY) {
    if (typeof ctx.beginPath !== 'function' || typeof ctx.arc !== 'function') return;
    const sweepRadius = ((this.pulseTimer * 12) % Math.max(30, this.size * 0.6)) + 4;
    const sweepAlpha = Math.max(0, 0.4 - (sweepRadius / (this.size * 0.6)) * 0.4);
    ctx.save();
    ctx.strokeStyle = `rgba(56, 189, 248, ${sweepAlpha.toFixed(2)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(plX, plY, sweepRadius, 0, Math.PI * 2);
    if (typeof ctx.stroke === 'function') ctx.stroke();
    ctx.restore();
  }

  /**
   * Render player location beacon with elevation awareness (BL-65)
   */
  renderPlayerMarker(ctx, plX, plY, radius, player, isHc) {
    if (typeof ctx.beginPath !== 'function' || typeof ctx.arc !== 'function') return;
    const pulse = Math.sin(this.pulseTimer) * 0.3 + 0.7;
    const isOverhead = player?.elevation === 1;

    ctx.save();
    if (isHc) {
      ctx.fillStyle = '#facc15'; // High-contrast neon yellow
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(plX, plY, Math.max(3.5, radius * 1.1) * pulse, 0, Math.PI * 2);
      if (typeof ctx.fill === 'function') ctx.fill();
      if (typeof ctx.stroke === 'function') ctx.stroke();
    } else {
      ctx.fillStyle = isOverhead ? '#38bdf8' : '#34d399';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 6 * pulse;
      ctx.beginPath();
      ctx.arc(plX, plY, Math.max(3, radius) * pulse, 0, Math.PI * 2);
      if (typeof ctx.fill === 'function') ctx.fill();
    }

    // Overhead beacon indicator when on elevated bridges (BL-65)
    if (isOverhead) {
      ctx.strokeStyle = isHc ? '#ffffff' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(plX, plY, Math.max(5, radius * 1.8), 0, Math.PI * 2);
      if (typeof ctx.stroke === 'function') ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Render tactical HUD corner brackets (BL-65)
   */
  renderTacticalFrame(ctx, isHc) {
    if (typeof ctx.moveTo !== 'function' || typeof ctx.lineTo !== 'function' || typeof ctx.beginPath !== 'function') return;
    ctx.save();
    const corner = 7;
    ctx.strokeStyle = isHc ? 'rgba(255, 255, 255, 0.5)' : 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;

    // Top-Left corner bracket
    ctx.beginPath();
    ctx.moveTo(3, 3 + corner);
    ctx.lineTo(3, 3);
    ctx.lineTo(3 + corner, 3);
    if (typeof ctx.stroke === 'function') ctx.stroke();

    // Top-Right corner bracket
    ctx.beginPath();
    ctx.moveTo(this.size - 3 - corner, 3);
    ctx.lineTo(this.size - 3, 3);
    ctx.lineTo(this.size - 3, 3 + corner);
    if (typeof ctx.stroke === 'function') ctx.stroke();

    // Bottom-Left corner bracket
    ctx.beginPath();
    ctx.moveTo(3, this.size - 3 - corner);
    ctx.lineTo(3, this.size - 3);
    ctx.lineTo(3 + corner, this.size - 3);
    if (typeof ctx.stroke === 'function') ctx.stroke();

    // Bottom-Right corner bracket
    ctx.beginPath();
    ctx.moveTo(this.size - 3 - corner, this.size - 3);
    ctx.lineTo(this.size - 3, this.size - 3);
    ctx.lineTo(this.size - 3, this.size - 3 - corner);
    if (typeof ctx.stroke === 'function') ctx.stroke();
    ctx.restore();
  }

  /**
   * Render the minimap with zoom and pan support (BL-17, BL-65)
   * @param {object} level
   * @param {Player} player
   * @param {FogOfWar} fog
   * @param {number} dt
   * @param {Set<string>|Array<string>} [revealedSecrets=null]
   */
  render(level, player, fog, dt = 0, revealedSecrets = null) {
    const ctx = this.ctx;
    const { width: mazeW, height: mazeH } = level.dimensions;
    const isHc = this.isHighContrast();

    this.pulseTimer += dt * 4;

    // Clear background
    ctx.fillStyle = isHc ? '#000000' : '#05070a';
    ctx.fillRect(0, 0, this.size, this.size);

    const ground = level.layers.ground;
    const overhead = level.layers.overhead;

    if (this.zoom <= 1.01) {
      // 1. Overview Mode: full maze fits in canvas
      const cellW = this.size / mazeW;
      const cellH = this.size / mazeH;

      for (let y = 0; y < mazeH; y++) {
        for (let x = 0; x < mazeW; x++) {
          const vis = fog ? fog.getVisibility(x, y) : FOG_STATE.VISIBLE;
          if (vis === FOG_STATE.UNEXPLORED) continue;

          const tile = ground[y]?.[x];
          const px = x * cellW;
          const py = y * cellH;

          const isSecret = tile === TILES.SECRET_WALL;
          const isRevealed = revealedSecrets && (
            (typeof revealedSecrets.has === 'function' && revealedSecrets.has(`${x},${y}`)) ||
            (Array.isArray(revealedSecrets) && revealedSecrets.includes(`${x},${y}`))
          );
          const hasOverhead = overhead && overhead[y]?.[x] && overhead[y][x] !== 0 && overhead[y][x] !== TILES.WALL;

          this.renderTileCell(
            ctx, tile, x, y, px, py,
            Math.ceil(cellW), Math.ceil(cellH),
            vis, isSecret, isRevealed, hasOverhead, isHc
          );
        }
      }

      // Render Tactical Entities (Keys, Doors, Levers, Teleporters)
      this.renderEntitiesPass(ctx, level, fog, (ex, ey) => ({
        x: ex * cellW + cellW / 2,
        y: ey * cellH + cellH / 2,
        cellW,
        cellH,
      }), isHc);

      // Render Exit
      if (level.exit) {
        const exitVis = fog ? fog.getVisibility(level.exit.x, level.exit.y) : FOG_STATE.VISIBLE;
        if (exitVis >= FOG_STATE.EXPLORED) {
          const ex = level.exit.x * cellW + cellW / 2;
          const ey = level.exit.y * cellH + cellH / 2;
          ctx.save();
          ctx.fillStyle = isHc ? '#00ffff' : '#38bdf8';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(ex, ey, Math.max(2, cellW * 0.8), 0, Math.PI * 2);
          ctx.fill();
          if (isHc) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // Render Player
      const plX = (player?.gridX ?? 0) * cellW + cellW / 2;
      const plY = (player?.gridY ?? 0) * cellH + cellH / 2;

      this.renderRadarSweep(ctx, plX, plY);
      this.renderPlayerMarker(ctx, plX, plY, cellW * 1.0, player, isHc);
      this.renderTacticalFrame(ctx, isHc);

    } else {
      // 2. Zoomed & Panned Corridor View (BL-17)
      const playerX = player ? player.gridX : mazeW / 2;
      const playerY = player ? player.gridY : mazeH / 2;
      const focusX = Math.max(0, Math.min(mazeW - 1, playerX + this.panX));
      const focusY = Math.max(0, Math.min(mazeH - 1, playerY + this.panY));

      const spanW = mazeW / this.zoom;
      const spanH = mazeH / this.zoom;
      const minGridX = focusX - spanW / 2;
      const minGridY = focusY - spanH / 2;
      const startCol = Math.max(0, Math.floor(minGridX));
      const endCol = Math.min(mazeW - 1, Math.ceil(minGridX + spanW));
      const startRow = Math.max(0, Math.floor(minGridY));
      const endRow = Math.min(mazeH - 1, Math.ceil(minGridY + spanH));

      const cellW = this.size / spanW;
      const cellH = this.size / spanH;

      for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
          const vis = fog ? fog.getVisibility(x, y) : FOG_STATE.VISIBLE;
          if (vis === FOG_STATE.UNEXPLORED) continue;

          const tile = ground[y]?.[x];
          const px = (x - minGridX) * cellW;
          const py = (y - minGridY) * cellH;

          const isSecret = tile === TILES.SECRET_WALL;
          const isRevealed = revealedSecrets && (
            (typeof revealedSecrets.has === 'function' && revealedSecrets.has(`${x},${y}`)) ||
            (Array.isArray(revealedSecrets) && revealedSecrets.includes(`${x},${y}`))
          );
          const hasOverhead = overhead && overhead[y]?.[x] && overhead[y][x] !== 0 && overhead[y][x] !== TILES.WALL;

          this.renderTileCell(
            ctx, tile, x, y, px, py,
            Math.ceil(cellW) + 0.5, Math.ceil(cellH) + 0.5,
            vis, isSecret, isRevealed, hasOverhead, isHc
          );
        }
      }

      // Render Tactical Entities in Zoomed Bounds
      this.renderEntitiesPass(ctx, level, fog, (ex, ey) => ({
        x: (ex - minGridX) * cellW + cellW / 2,
        y: (ey - minGridY) * cellH + cellH / 2,
        cellW,
        cellH,
      }), isHc);

      // Render Exit (if in zoomed bounds)
      if (level.exit) {
        const exitVis = fog ? fog.getVisibility(level.exit.x, level.exit.y) : FOG_STATE.VISIBLE;
        if (exitVis >= FOG_STATE.EXPLORED) {
          const ex = (level.exit.x - minGridX) * cellW + cellW / 2;
          const ey = (level.exit.y - minGridY) * cellH + cellH / 2;
          if (ex >= -10 && ex <= this.size + 10 && ey >= -10 && ey <= this.size + 10) {
            ctx.save();
            ctx.fillStyle = isHc ? '#00ffff' : '#38bdf8';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(ex, ey, Math.max(3, cellW * 0.4), 0, Math.PI * 2);
            ctx.fill();
            if (isHc) {
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      }

      // Render Player (if in zoomed bounds)
      const plX = ((player?.gridX ?? 0) - minGridX) * cellW + cellW / 2;
      const plY = ((player?.gridY ?? 0) - minGridY) * cellH + cellH / 2;

      if (plX >= -10 && plX <= this.size + 10 && plY >= -10 && plY <= this.size + 10) {
        this.renderRadarSweep(ctx, plX, plY);
        this.renderPlayerMarker(ctx, plX, plY, cellW * 0.5, player, isHc);
      }

      this.renderTacticalFrame(ctx, isHc);

      // HUD Zoom Badge Overlay
      ctx.save();
      ctx.fillStyle = isHc ? '#000000' : 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = isHc ? '#ffffff' : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(6, 6, 36, 16, 4);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(6, 6, 36, 16);
        ctx.strokeRect(6, 6, 36, 16);
      }
      ctx.fillStyle = isHc ? '#ffff00' : '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${this.zoom.toFixed(1)}×`, 24, 14);
      ctx.restore();
    }
  }

  /**
   * Convert minimap click coordinates to maze grid coordinates with zoom awareness
   * @param {number} clientX
   * @param {number} clientY
   * @param {object} level
   * @param {Player|null} [player=null]
   * @returns {{ gridX: number, gridY: number }}
   */
  mapClickToGrid(clientX, clientY, level, player = null) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.size / (rect.width || 1);
    const scaleY = this.size / (rect.height || 1);

    const mapX = (clientX - rect.left) * scaleX;
    const mapY = (clientY - rect.top) * scaleY;
    const { width: mazeW, height: mazeH } = level.dimensions;

    if (this.zoom <= 1.01) {
      const gridX = Math.max(0, Math.min(mazeW - 1, Math.floor((mapX / this.size) * mazeW)));
      const gridY = Math.max(0, Math.min(mazeH - 1, Math.floor((mapY / this.size) * mazeH)));
      return { gridX, gridY };
    }

    const playerX = player ? player.gridX : mazeW / 2;
    const playerY = player ? player.gridY : mazeH / 2;
    const focusX = Math.max(0, Math.min(mazeW - 1, playerX + this.panX));
    const focusY = Math.max(0, Math.min(mazeH - 1, playerY + this.panY));

    const spanW = mazeW / this.zoom;
    const spanH = mazeH / this.zoom;
    const minGridX = focusX - spanW / 2;
    const minGridY = focusY - spanH / 2;

    const gridX = Math.max(0, Math.min(mazeW - 1, Math.floor(minGridX + (mapX / this.size) * spanW)));
    const gridY = Math.max(0, Math.min(mazeH - 1, Math.floor(minGridY + (mapY / this.size) * spanH)));

    return { gridX, gridY };
  }
}
