/**
 * Level Editor Interactive Canvas Component
 */

import { TILES, LAYERS, THEMES, ENTITY_TYPES } from '../core/constants.js';

export class EditorCanvas {
  /**
   * @param {object} options
   * @param {HTMLCanvasElement} options.canvas
   * @param {object} options.level
   * @param {Function} options.onTilePaint
   * @param {Function} options.onEntityClick
   * @param {Function} options.onTargetTilePicked
   * @param {Function} options.onHoverCoord
   */
  constructor({
    canvas,
    level,
    onTilePaint,
    onEntityClick,
    onTargetTilePicked,
    onHoverCoord,
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;

    this.onTilePaint = onTilePaint;
    this.onEntityClick = onEntityClick;
    this.onTargetTilePicked = onTargetTilePicked;
    this.onHoverCoord = onHoverCoord;

    // View state
    this.activeLayer = LAYERS.GROUND;
    this.currentTool = 'pencil'; // 'pencil' | 'fill' | 'eraser' | 'select' | 'pick_target'
    this.selectedTile = TILES.WALL;
    this.selectedEntity = null; // 'key' | 'door' | 'lever' | 'spawn' | 'exit'
    this.wiringLever = null; // When picking target

    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.baseTileSize = 32;

    this.isMouseDown = false;
    this.isPanning = false;
    this.lastMousePos = { x: 0, y: 0 };
    this.hoverGridPos = { x: -1, y: -1 };

    this.initEvents();
    this.centerInViewport();
  }

  /**
   * Center the level grid inside the canvas viewport
   */
  centerInViewport() {
    const totalW = this.level.dimensions.width * this.baseTileSize * this.zoom;
    const totalH = this.level.dimensions.height * this.baseTileSize * this.zoom;
    this.panX = (this.canvas.width - totalW) / 2;
    this.panY = (this.canvas.height - totalH) / 2;
  }

  /**
   * Update active level reference
   * @param {object} level
   */
  setLevel(level) {
    this.level = level;
    this.render();
  }

  /**
   * Set active layer ('ground' or 'overhead')
   * @param {'ground'|'overhead'} layer
   */
  setActiveLayer(layer) {
    this.activeLayer = layer;
    this.render();
  }

  /**
   * Set active drawing tool
   * @param {string} tool
   */
  setTool(tool) {
    this.currentTool = tool;
  }

  /**
   * Set selected palette tile
   * @param {*} tile
   */
  setSelectedTile(tile) {
    this.selectedTile = tile;
    this.selectedEntity = null;
    this.currentTool = 'pencil';
  }

  /**
   * Set selected entity/special to place
   * @param {string} entityType
   */
  setSelectedEntity(entityType) {
    this.selectedEntity = entityType;
    this.currentTool = 'pencil';
  }

  /**
   * Enter Target Pick Mode for a lever
   * @param {object} lever
   */
  startTargetPickMode(lever) {
    this.wiringLever = lever;
    this.currentTool = 'pick_target';
    this.render();
  }

  cancelTargetPickMode() {
    this.wiringLever = null;
    this.currentTool = 'pencil';
    this.render();
  }

  /**
   * Initialize mouse and touch interaction handlers
   */
  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  getEffectiveTileSize() {
    return this.baseTileSize * this.zoom;
  }

  clientToGrid(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    const effTile = this.getEffectiveTileSize();
    const gridX = Math.floor((canvasX - this.panX) / effTile);
    const gridY = Math.floor((canvasY - this.panY) / effTile);

    return { gridX, gridY };
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.lastMousePos = { x: e.clientX, y: e.clientY };

    // Middle click or Right click or Space+Click initiates Pan
    if (e.button === 1 || e.button === 2 || e.shiftKey || e.spaceKey) {
      this.isPanning = true;
      return;
    }

    if (e.button === 0) {
      this.isMouseDown = true;
      this.hasModifiedStroke = false;
      const { gridX, gridY } = this.clientToGrid(e.clientX, e.clientY);
      this.applyToolAt(gridX, gridY);
    }
  }

  handleMouseMove(e) {
    const dx = e.clientX - this.lastMousePos.x;
    const dy = e.clientY - this.lastMousePos.y;
    this.lastMousePos = { x: e.clientX, y: e.clientY };

    if (this.isPanning) {
      this.panX += dx;
      this.panY += dy;
      this.render();
      return;
    }

    const { gridX, gridY } = this.clientToGrid(e.clientX, e.clientY);
    this.hoverGridPos = { x: gridX, y: gridY };

    if (this.onHoverCoord) {
      this.onHoverCoord(gridX, gridY);
    }

    if (this.isMouseDown && (this.currentTool === 'pencil' || this.currentTool === 'eraser')) {
      this.applyToolAt(gridX, gridY);
    } else {
      this.render();
    }
  }

  handleMouseUp() {
    if (this.isMouseDown && this.hasModifiedStroke) {
      if (this.onTilePaint) {
        this.onTilePaint();
      }
    }
    this.isMouseDown = false;
    this.isPanning = false;
    this.hasModifiedStroke = false;
  }

  handleWheel(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.max(0.3, Math.min(3.5, this.zoom * zoomFactor));

    // Zoom centered on cursor
    this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
    this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
    this.zoom = newZoom;

    this.render();
  }

  /**
   * Apply selected tool action to coordinate
   */
  applyToolAt(gridX, gridY) {
    const { width, height } = this.level.dimensions;
    if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height) return;

    // Pick Target Mode for Lever Wiring
    if (this.currentTool === 'pick_target') {
      if (this.onTargetTilePicked && this.wiringLever) {
        this.onTargetTilePicked(this.wiringLever, gridX, gridY, this.activeLayer);
      }
      this.cancelTargetPickMode();
      return;
    }

    // Select Tool: open inspector for clicked entity
    if (this.currentTool === 'select') {
      const entity = (this.level.entities || []).find(e => e.x === gridX && e.y === gridY);
      if (entity && this.onEntityClick) {
        this.onEntityClick(entity);
      }
      return;
    }

    // Special Entity Placement
    if (this.selectedEntity) {
      if (this.selectedEntity === 'spawn') {
        this.level.spawn = { x: gridX, y: gridY, elevation: this.activeLayer === LAYERS.OVERHEAD ? 1 : 0 };
      } else if (this.selectedEntity === 'exit') {
        this.level.exit = { x: gridX, y: gridY };
      } else if (['key', 'door', 'lever'].includes(this.selectedEntity)) {
        // Remove existing entity at tile if any
        this.level.entities = (this.level.entities || []).filter(e => !(e.x === gridX && e.y === gridY));

        const newId = `${this.selectedEntity}_${gridX}_${gridY}`;
        const newEntity = {
          id: newId,
          type: this.selectedEntity,
          x: gridX,
          y: gridY,
          elevation: this.activeLayer === LAYERS.OVERHEAD ? 1 : 0,
        };

        if (this.selectedEntity === 'key') {
          newEntity.color = '#fbbf24';
          newEntity.name = 'Key';
        } else if (this.selectedEntity === 'door') {
          newEntity.color = '#fbbf24';
          newEntity.requiresKey = '';
        } else if (this.selectedEntity === 'lever') {
          newEntity.state = false;
          newEntity.targets = [];
        }

        this.level.entities.push(newEntity);
      }

      if (this.onTilePaint) this.onTilePaint();
      this.render();
      return;
    }

    // Fill Bucket Tool
    if (this.currentTool === 'fill') {
      const initialVal = this.level.layers[this.activeLayer][gridY][gridX];
      if (initialVal !== this.selectedTile) {
        this.floodFill(gridX, gridY, this.selectedTile);
        if (this.onTilePaint) this.onTilePaint();
        this.render();
      }
      return;
    }

    // Eraser Tool
    if (this.currentTool === 'eraser') {
      const curr = this.level.layers[this.activeLayer][gridY][gridX];
      const hasEnt = (this.level.entities || []).some(e => e.x === gridX && e.y === gridY);
      if (curr !== 0 || hasEnt) {
        this.level.layers[this.activeLayer][gridY][gridX] = 0;
        this.level.entities = (this.level.entities || []).filter(e => !(e.x === gridX && e.y === gridY));
        this.hasModifiedStroke = true;
        this.render();
      }
      return;
    }

    // Pencil Tile Paint
    const currentVal = this.level.layers[this.activeLayer][gridY][gridX];
    if (currentVal !== this.selectedTile) {
      this.level.layers[this.activeLayer][gridY][gridX] = this.selectedTile;
      this.hasModifiedStroke = true;
      this.render();
    }
  }

  /**
   * 4-Way Flood Fill Algorithm
   */
  floodFill(startX, startY, targetVal) {
    const layer = this.level.layers[this.activeLayer];
    const { width, height } = this.level.dimensions;
    const initialVal = layer[startY][startX];

    if (initialVal === targetVal) return;

    const queue = [{ x: startX, y: startY }];
    const visited = new Set();

    while (queue.length > 0) {
      const { x, y } = queue.pop();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (layer[y][x] !== initialVal) continue;

      layer[y][x] = targetVal;

      queue.push({ x: x + 1, y });
      queue.push({ x: x - 1, y });
      queue.push({ x, y: y + 1 });
      queue.push({ x, y: y - 1 });
    }
  }

  /**
   * Render the editor grid and overlay
   */
  render() {
    const ctx = this.ctx;
    const { width: mazeW, height: mazeH } = this.level.dimensions;
    const effTile = this.getEffectiveTileSize();
    const theme = THEMES[this.level.config.theme] || THEMES.dungeon;

    // 1. Clear Canvas with Theme Background
    ctx.fillStyle = theme.bg || '#090d13';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(this.panX, this.panY);

    // 2. Render Ground Layer
    const ground = this.level.layers.ground;
    const overhead = this.level.layers.overhead;

    for (let y = 0; y < mazeH; y++) {
      for (let x = 0; x < mazeW; x++) {
        const px = x * effTile;
        const py = y * effTile;
        const gTile = ground[y]?.[x];

        // Draw ground tile
        if (gTile === TILES.WALL) {
          ctx.fillStyle = theme.wall;
          ctx.fillRect(px, py, effTile, effTile);
          ctx.fillStyle = theme.wallTop;
          ctx.fillRect(px, py, effTile, effTile * 0.22);
          ctx.fillStyle = theme.wallDetail || 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(px + effTile * 0.1, py + effTile * 0.58, effTile * 0.8, 1.5);
          ctx.fillRect(px + effTile * 0.5, py + effTile * 0.22, 1.5, effTile * 0.36);
        } else {
          ctx.fillStyle = (x + y) % 2 === 0 ? theme.floorAlt : theme.floor;
          ctx.fillRect(px, py, effTile, effTile);

          // Underpass corridor on ground layer
          if (gTile === TILES.BRIDGE_EW) {
            ctx.fillStyle = theme.bridgeGround;
            ctx.fillRect(px, py + effTile * 0.12, effTile, effTile * 0.76);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(px + effTile * 0.15, py + effTile * 0.48, effTile * 0.7, 2);
          } else if (gTile === TILES.BRIDGE_NS) {
            ctx.fillStyle = theme.bridgeGround;
            ctx.fillRect(px + effTile * 0.12, py, effTile * 0.76, effTile);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(px + effTile * 0.48, py + effTile * 0.15, 2, effTile * 0.7);
          } else if (this.isRamp(gTile)) {
            ctx.fillStyle = theme.ramp;
            ctx.fillRect(px, py, effTile, effTile);

            // Directional chevron arrow
            const arrowCol = theme.rampArrow || theme.accent || '#38bdf8';
            ctx.strokeStyle = arrowCol;
            ctx.lineWidth = Math.max(1.5, effTile * 0.08);
            const cx = px + effTile / 2;
            const cy = py + effTile / 2;
            const aSize = effTile * 0.28;

            ctx.beginPath();
            if (gTile === TILES.RAMP_N) {
              ctx.moveTo(cx - aSize, cy + aSize * 0.4); ctx.lineTo(cx, cy - aSize * 0.5); ctx.lineTo(cx + aSize, cy + aSize * 0.4);
            } else if (gTile === TILES.RAMP_S) {
              ctx.moveTo(cx - aSize, cy - aSize * 0.4); ctx.lineTo(cx, cy + aSize * 0.5); ctx.lineTo(cx + aSize, cy - aSize * 0.4);
            } else if (gTile === TILES.RAMP_E) {
              ctx.moveTo(cx - aSize * 0.4, cy - aSize); ctx.lineTo(cx + aSize * 0.5, cy); ctx.lineTo(cx - aSize * 0.4, cy + aSize);
            } else if (gTile === TILES.RAMP_W) {
              ctx.moveTo(cx + aSize * 0.4, cy - aSize); ctx.lineTo(cx - aSize * 0.5, cy); ctx.lineTo(cx + aSize * 0.4, cy + aSize);
            }
            ctx.stroke();
          }
        }

        // Draw Overhead Layer
        const oTile = overhead?.[y]?.[x];
        if (oTile || gTile === TILES.BRIDGE_EW || gTile === TILES.BRIDGE_NS) {
          ctx.save();
          if (this.activeLayer === LAYERS.GROUND) {
            ctx.globalAlpha = 0.55; // Dim overhead when editing ground
          }
          if (oTile === TILES.BRIDGE_EW || gTile === TILES.BRIDGE_EW) {
            // B_EW Overhead spans North-South
            ctx.fillStyle = theme.bridgeOverhead;
            ctx.fillRect(px + effTile * 0.12, py, effTile * 0.76, effTile);
            ctx.fillStyle = theme.bridgeRailing;
            ctx.fillRect(px + effTile * 0.10, py, effTile * 0.08, effTile);
            ctx.fillRect(px + effTile * 0.82, py, effTile * 0.08, effTile);
          } else if (oTile === TILES.BRIDGE_NS || gTile === TILES.BRIDGE_NS) {
            // B_NS Overhead spans East-West
            ctx.fillStyle = theme.bridgeOverhead;
            ctx.fillRect(px, py + effTile * 0.12, effTile, effTile * 0.76);
            ctx.fillStyle = theme.bridgeRailing;
            ctx.fillRect(px, py + effTile * 0.10, effTile, effTile * 0.08);
            ctx.fillRect(px, py + effTile * 0.82, effTile, effTile * 0.08);
          }
          ctx.restore();
        }

        // Grid lines
        ctx.strokeStyle = theme.floorGrid || 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, effTile, effTile);
      }
    }

    // 3. Render Spawn (S) and Exit (E)
    if (this.level.spawn) {
      const spX = this.level.spawn.x * effTile;
      const spY = this.level.spawn.y * effTile;
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(spX + effTile / 2, spY + effTile / 2, effTile * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#022014';
      ctx.font = `bold ${Math.max(10, effTile * 0.42)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', spX + effTile / 2, spY + effTile / 2);
    }

    if (this.level.exit) {
      const exX = this.level.exit.x * effTile;
      const exY = this.level.exit.y * effTile;
      const pOuter = theme.portalOuter || '#0284c7';
      const pInner = theme.portalInner || '#38bdf8';

      ctx.fillStyle = pOuter;
      ctx.beginPath();
      ctx.arc(exX + effTile / 2, exY + effTile / 2, effTile * 0.38, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pInner;
      ctx.beginPath();
      ctx.arc(exX + effTile / 2, exY + effTile / 2, effTile * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(10, effTile * 0.38)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', exX + effTile / 2, exY + effTile / 2);
    }

    // 4. Render Entities (Keys, Doors, Levers)
    for (const entity of (this.level.entities || [])) {
      const enX = entity.x * effTile;
      const enY = entity.y * effTile;

      ctx.save();
      if (entity.type === ENTITY_TYPES.KEY) {
        ctx.fillStyle = entity.color || '#fbbf24';
        ctx.beginPath();
        ctx.arc(enX + effTile / 2, enY + effTile / 2, effTile * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = `${Math.max(9, effTile * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔑', enX + effTile / 2, enY + effTile / 2);
      } else if (entity.type === ENTITY_TYPES.DOOR) {
        ctx.strokeStyle = entity.color || '#fbbf24';
        ctx.lineWidth = 3;
        ctx.strokeRect(enX + 4, enY + 4, effTile - 8, effTile - 8);
        ctx.fillStyle = entity.color || '#fbbf24';
        ctx.font = `${Math.max(9, effTile * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚪', enX + effTile / 2, enY + effTile / 2);
      } else if (entity.type === ENTITY_TYPES.LEVER) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(enX + effTile * 0.2, enY + effTile * 0.3, effTile * 0.6, effTile * 0.4);
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(9, effTile * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🕹️', enX + effTile / 2, enY + effTile / 2);

        // Draw Lever Wiring Target Lines
        for (const t of (entity.targets || [])) {
          const tX = t.x * effTile + effTile / 2;
          const tY = t.y * effTile + effTile / 2;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(enX + effTile / 2, enY + effTile / 2);
          ctx.lineTo(tX, tY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      ctx.restore();
    }

    // 5. Render Hover / Cursor Box
    const hx = this.hoverGridPos.x;
    const hy = this.hoverGridPos.y;
    if (hx >= 0 && hx < mazeW && hy >= 0 && hy < mazeH) {
      ctx.strokeStyle = this.currentTool === 'pick_target' ? '#34d399' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx * effTile, hy * effTile, effTile, effTile);
    }

    ctx.restore();
  }

  isRamp(tile) {
    return tile === TILES.RAMP_N || tile === TILES.RAMP_S || tile === TILES.RAMP_E || tile === TILES.RAMP_W;
  }
}
