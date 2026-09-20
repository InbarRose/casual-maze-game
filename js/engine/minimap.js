/**
 * Minimap HUD Canvas Renderer
 * Renders explored/visible maze layout, player location, exit portal, and provides click-to-pan.
 * Supports pinch-to-zoom (1.0x - 3.5x), drag-to-pan, and double-tap zoom toggle (BL-17).
 */

import { TILES, FOG_STATE } from '../core/constants.js';

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
   * Render the minimap with zoom and pan support (BL-17)
   * @param {object} level
   * @param {Player} player
   * @param {FogOfWar} fog
   * @param {number} dt
   */
  render(level, player, fog, dt = 0) {
    const ctx = this.ctx;
    const { width: mazeW, height: mazeH } = level.dimensions;

    this.pulseTimer += dt * 4;

    // Clear
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, this.size, this.size);

    const ground = level.layers.ground;

    if (this.zoom <= 1.01) {
      // 1. Overview Mode: full maze fits in canvas
      const cellW = this.size / mazeW;
      const cellH = this.size / mazeH;

      for (let y = 0; y < mazeH; y++) {
        for (let x = 0; x < mazeW; x++) {
          const vis = fog ? fog.getVisibility(x, y) : FOG_STATE.VISIBLE;
          if (vis === FOG_STATE.UNEXPLORED) continue;

          const tile = ground[y][x];
          const px = x * cellW;
          const py = y * cellH;

          if (tile === TILES.WALL) {
            ctx.fillStyle = vis === FOG_STATE.VISIBLE ? '#475569' : '#1e293b';
          } else {
            ctx.fillStyle = vis === FOG_STATE.VISIBLE ? '#334155' : '#0f172a';
          }

          ctx.fillRect(px, py, Math.ceil(cellW), Math.ceil(cellH));
        }
      }

      // Render Exit
      if (level.exit) {
        const exitVis = fog ? fog.getVisibility(level.exit.x, level.exit.y) : FOG_STATE.VISIBLE;
        if (exitVis >= FOG_STATE.EXPLORED) {
          const ex = level.exit.x * cellW + cellW / 2;
          const ey = level.exit.y * cellH + cellH / 2;
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(ex, ey, Math.max(2, cellW * 0.8), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Render Player
      const plX = (player?.gridX ?? 0) * cellW + cellW / 2;
      const plY = (player?.gridY ?? 0) * cellH + cellH / 2;
      const pulse = Math.sin(this.pulseTimer) * 0.3 + 0.7;

      ctx.save();
      ctx.fillStyle = player?.elevation === 1 ? '#38bdf8' : '#34d399';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 6 * pulse;
      ctx.beginPath();
      ctx.arc(plX, plY, Math.max(3, cellW * 1.0) * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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

          const tile = ground[y][x];
          const px = (x - minGridX) * cellW;
          const py = (y - minGridY) * cellH;

          if (tile === TILES.WALL) {
            ctx.fillStyle = vis === FOG_STATE.VISIBLE ? '#475569' : '#1e293b';
          } else {
            ctx.fillStyle = vis === FOG_STATE.VISIBLE ? '#334155' : '#0f172a';
          }

          ctx.fillRect(px, py, Math.ceil(cellW) + 0.5, Math.ceil(cellH) + 0.5);
        }
      }

      // Render Exit (if in zoomed bounds)
      if (level.exit) {
        const exitVis = fog ? fog.getVisibility(level.exit.x, level.exit.y) : FOG_STATE.VISIBLE;
        if (exitVis >= FOG_STATE.EXPLORED) {
          const ex = (level.exit.x - minGridX) * cellW + cellW / 2;
          const ey = (level.exit.y - minGridY) * cellH + cellH / 2;
          if (ex >= -10 && ex <= this.size + 10 && ey >= -10 && ey <= this.size + 10) {
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(ex, ey, Math.max(3, cellW * 0.4), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Render Player (if in zoomed bounds)
      const plX = ((player?.gridX ?? 0) - minGridX) * cellW + cellW / 2;
      const plY = ((player?.gridY ?? 0) - minGridY) * cellH + cellH / 2;
      const pulse = Math.sin(this.pulseTimer) * 0.3 + 0.7;

      if (plX >= -10 && plX <= this.size + 10 && plY >= -10 && plY <= this.size + 10) {
        ctx.save();
        ctx.fillStyle = player?.elevation === 1 ? '#38bdf8' : '#34d399';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6 * pulse;
        ctx.beginPath();
        ctx.arc(plX, plY, Math.max(4, cellW * 0.5) * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // HUD Zoom Badge Overlay
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
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
      ctx.fillStyle = '#38bdf8';
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
