/**
 * Minimap HUD Canvas Renderer
 * Renders explored/visible maze layout, player location, exit portal, and provides click-to-pan.
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
  }

  /**
   * Render the minimap
   * @param {object} level
   * @param {Player} player
   * @param {FogOfWar} fog
   * @param {number} dt
   */
  render(level, player, fog, dt) {
    const ctx = this.ctx;
    const { width: mazeW, height: mazeH } = level.dimensions;

    this.pulseTimer += dt * 4;

    // Clear
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, this.size, this.size);

    // Compute cell dimensions to fit within size
    const cellW = this.size / mazeW;
    const cellH = this.size / mazeH;

    const ground = level.layers.ground;

    // Render discovered tiles
    for (let y = 0; y < mazeH; y++) {
      for (let x = 0; x < mazeW; x++) {
        const vis = fog ? fog.getVisibility(x, y) : FOG_STATE.VISIBLE;

        if (vis === FOG_STATE.UNEXPLORED) {
          continue; // Leave black
        }

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

    // Render Exit (if discovered)
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
    const plX = player.gridX * cellW + cellW / 2;
    const plY = player.gridY * cellH + cellH / 2;
    const pulse = Math.sin(this.pulseTimer) * 0.3 + 0.7;

    ctx.save();
    ctx.fillStyle = player.elevation === 1 ? '#38bdf8' : '#34d399';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 6 * pulse;

    ctx.beginPath();
    ctx.arc(plX, plY, Math.max(3, cellW * 1.0) * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Convert minimap click coordinates to maze grid coordinates
   * @param {number} clientX
   * @param {number} clientY
   * @param {object} level
   * @returns {{ gridX: number, gridY: number }}
   */
  mapClickToGrid(clientX, clientY, level) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.size / rect.width;
    const scaleY = this.size / rect.height;

    const mapX = (clientX - rect.left) * scaleX;
    const mapY = (clientY - rect.top) * scaleY;

    const gridX = Math.floor((mapX / this.size) * level.dimensions.width);
    const gridY = Math.floor((mapY / this.size) * level.dimensions.height);

    return { gridX, gridY };
  }
}
