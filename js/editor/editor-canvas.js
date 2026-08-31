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
    onObjectMoved,
    onTargetTilePicked,
    onHoverCoord,
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;

    this.onTilePaint = onTilePaint;
    this.onEntityClick = onEntityClick;
    this.onObjectMoved = onObjectMoved;
    this.onTargetTilePicked = onTargetTilePicked;
    this.onHoverCoord = onHoverCoord;

    // View state
    this.activeLayer = LAYERS.GROUND;
    this.currentTool = 'pencil'; // 'pencil' | 'line' | 'fill' | 'eraser' | 'select' | 'move' | 'pick_target'
    this.brushSize = 1; // 1, 2, 3, 4, 5
    this.selectedTile = TILES.WALL;
    this.selectedEntity = null; // 'key' | 'door' | 'lever' | 'spawn' | 'exit'
    this.wiringLever = null; // When picking target

    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.baseTileSize = 32;

    this.isMouseDown = false;
    this.isPanning = false;
    this.isDraggingObject = false;
    this.draggedObject = null; // { type, ref, origX, origY, currentX, currentY, name, color, icon }
    this.isDrawingLine = false;
    this.lineStartPos = null; // { x, y }
    this.lastMousePos = { x: 0, y: 0 };
    this.hoverGridPos = { x: -1, y: -1 };

    this.initEvents();
    this.centerInViewport();
  }

  /**
   * Set active brush size (1x1 to 5x5)
   * @param {number} size
   */
  setBrushSize(size) {
    this.brushSize = Math.max(1, Math.min(5, parseInt(size, 10) || 1));
    this.render();
  }

  /**
   * Calculate all grid cells stamped by active brush around (centerX, centerY)
   * @param {number} centerX
   * @param {number} centerY
   * @param {number} [size=this.brushSize]
   * @returns {Array<{x: number, y: number}>}
   */
  getBrushCoordinates(centerX, centerY, size = this.brushSize) {
    const coords = [];
    const radius = Math.floor(size / 2);
    const { width, height } = this.level.dimensions;

    const xStart = size % 2 === 1 ? centerX - radius : centerX - radius;
    const xEnd = size % 2 === 1 ? centerX + radius : centerX + radius - 1;
    const yStart = size % 2 === 1 ? centerY - radius : centerY - radius;
    const yEnd = size % 2 === 1 ? centerY + radius : centerY + radius - 1;

    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          coords.push({ x, y });
        }
      }
    }
    return coords;
  }

  /**
   * Bresenham Line Rasterization algorithm for straight and diagonal lines
   * @param {number} x0
   * @param {number} y0
   * @param {number} x1
   * @param {number} y1
   * @returns {Array<{x: number, y: number}>}
   */
  getLineCoordinates(x0, y0, x1, y1) {
    const points = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let currX = x0;
    let currY = y0;

    while (true) {
      points.push({ x: currX, y: currY });
      if (currX === x1 && currY === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currY += sy;
      }
    }

    return points;
  }

  /**
   * Set explicit zoom level
   * @param {number} newZoom
   */
  setZoom(newZoom) {
    const clamped = Math.max(0.15, Math.min(5.0, newZoom));
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.panX = centerX - (centerX - this.panX) * (clamped / this.zoom);
    this.panY = centerY - (centerY - this.panY) * (clamped / this.zoom);
    this.zoom = clamped;
    this.render();
  }

  /**
   * Fit entire maze grid inside canvas viewport
   */
  zoomToFit() {
    const totalW = this.level.dimensions.width * this.baseTileSize;
    const totalH = this.level.dimensions.height * this.baseTileSize;
    const pad = 48;
    const availableW = Math.max(100, this.canvas.width - pad * 2);
    const availableH = Math.max(100, this.canvas.height - pad * 2);

    const fitZoom = Math.max(0.15, Math.min(3.0, Math.min(availableW / totalW, availableH / totalH)));
    this.zoom = fitZoom;
    this.centerInViewport();
    this.render();
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
    this.canvas.style.cursor = tool === 'move' ? 'grab' : (tool === 'line' ? 'crosshair' : 'default');
  }

  /**
   * Find any interactive/movable object at coordinates
   * @param {number} gridX
   * @param {number} gridY
   * @returns {object|null}
   */
  findObjectAt(gridX, gridY) {
    // 1. Check runtime entities (key, door, lever)
    const entity = (this.level.entities || []).find(e => e.x === gridX && e.y === gridY);
    if (entity) {
      return {
        type: 'entity',
        ref: entity,
        name: entity.name || (entity.type.charAt(0).toUpperCase() + entity.type.slice(1)),
        color: entity.color || (entity.type === 'lever' ? '#34d399' : '#fbbf24'),
        icon: entity.type === 'key' ? '🔑' : (entity.type === 'door' ? '🚪' : '🕹️'),
        x: entity.x,
        y: entity.y,
        elevation: entity.elevation || 0,
      };
    }

    // 2. Check Player Spawn
    if (this.level.spawn && this.level.spawn.x === gridX && this.level.spawn.y === gridY) {
      return {
        type: 'spawn',
        ref: this.level.spawn,
        name: 'Spawn Point',
        color: '#34d399',
        icon: '🟢',
        x: this.level.spawn.x,
        y: this.level.spawn.y,
        elevation: this.level.spawn.elevation || 0,
      };
    }

    // 3. Check Test Spawn
    if (this.level.testSpawn && this.level.testSpawn.x === gridX && this.level.testSpawn.y === gridY) {
      return {
        type: 'test_spawn',
        ref: this.level.testSpawn,
        name: 'Test Spawn',
        color: '#f43f5e',
        icon: '🧪',
        x: this.level.testSpawn.x,
        y: this.level.testSpawn.y,
        elevation: this.level.testSpawn.elevation || 0,
      };
    }

    // 4. Check Exit Portal
    if (this.level.exit && this.level.exit.x === gridX && this.level.exit.y === gridY) {
      return {
        type: 'exit',
        ref: this.level.exit,
        name: 'Exit Portal',
        color: '#0284c7',
        icon: '🌀',
        x: this.level.exit.x,
        y: this.level.exit.y,
        elevation: this.level.exit.elevation || 0,
      };
    }

    return null;
  }

  /**
   * Set selected palette tile
   * @param {*} tile
   */
  setSelectedTile(tile) {
    this.selectedTile = tile;
    this.selectedEntity = null;
    this.selectedEntityData = null;
    this.currentTool = 'pencil';
    this.canvas.style.cursor = 'default';
  }

  /**
   * Set selected entity/special to place
   * @param {string} entityType
   * @param {object} [entityData]
   */
  setSelectedEntity(entityType, entityData = null) {
    this.selectedEntity = entityType;
    this.selectedEntityData = entityData;
    this.currentTool = 'pencil';
    this.canvas.style.cursor = 'default';
  }

  /**
   * Enter Target Pick Mode for a lever
   * @param {object} lever
   */
  startTargetPickMode(lever) {
    this.wiringLever = lever;
    this.currentTool = 'pick_target';
    this.canvas.style.cursor = 'crosshair';
    this.render();
  }

  cancelTargetPickMode() {
    this.wiringLever = null;
    this.currentTool = 'pencil';
    this.canvas.style.cursor = 'default';
    this.render();
  }

  /**
   * Initialize mouse and touch interaction handlers
   */
  initEvents() {
    if (this.canvas && typeof this.canvas.addEventListener === 'function') {
      this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
      this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
      this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      window.addEventListener('mouseup', () => this.handleMouseUp());
    }
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

      // Line / Wall Drawing Tool start
      if (this.currentTool === 'line') {
        const { width, height } = this.level.dimensions;
        if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
          this.isDrawingLine = true;
          this.lineStartPos = { x: gridX, y: gridY };
          this.render();
        }
        return;
      }

      // Check Grab & Move tool OR Inspect tool on an object
      if (this.currentTool === 'move' || this.currentTool === 'select') {
        const obj = this.findObjectAt(gridX, gridY);
        if (obj) {
          this.isDraggingObject = true;
          this.draggedObject = {
            ...obj,
            origX: gridX,
            origY: gridY,
            currentX: gridX,
            currentY: gridY,
          };
          this.canvas.style.cursor = 'grabbing';
          this.render();
          return;
        }
      }

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

    if (this.isDrawingLine && this.lineStartPos) {
      this.render();
      return;
    }

    if (this.isDraggingObject && this.draggedObject) {
      const { width, height } = this.level.dimensions;
      if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
        if (gridX !== this.draggedObject.currentX || gridY !== this.draggedObject.currentY) {
          this.draggedObject.currentX = gridX;
          this.draggedObject.currentY = gridY;
          this.hasModifiedStroke = true;
        }
      }
      this.render();
      return;
    }

    if (this.currentTool === 'move') {
      const obj = this.findObjectAt(gridX, gridY);
      this.canvas.style.cursor = obj ? 'grab' : 'default';
    }

    if (this.isMouseDown && (this.currentTool === 'pencil' || this.currentTool === 'eraser')) {
      this.applyToolAt(gridX, gridY);
    } else {
      this.render();
    }
  }

  handleMouseUp() {
    // Finish Line Drawing Tool
    if (this.isDrawingLine && this.lineStartPos) {
      const x0 = this.lineStartPos.x;
      const y0 = this.lineStartPos.y;
      const x1 = this.hoverGridPos.x;
      const y1 = this.hoverGridPos.y;
      const { width, height } = this.level.dimensions;

      if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
        const linePoints = this.getLineCoordinates(x0, y0, x1, y1);
        const layer = this.level.layers[this.activeLayer];
        let anyChanged = false;

        for (const pt of linePoints) {
          const stamp = this.getBrushCoordinates(pt.x, pt.y, this.brushSize);
          for (const cell of stamp) {
            if (layer[cell.y] && layer[cell.y][cell.x] !== undefined) {
              layer[cell.y][cell.x] = this.selectedTile;
              if (this.selectedTile === TILES.WALL) {
                this.level.entities = (this.level.entities || []).filter(e => !(e.x === cell.x && e.y === cell.y));
              }
              anyChanged = true;
            }
          }
        }

        console.info(`[MazeGame:Editor] Stamped line (${x0}, ${y0}) ➔ (${x1}, ${y1}) with tile "${this.selectedTile}" [Brush: ${this.brushSize}x${this.brushSize}]`);
        if (anyChanged && this.onTilePaint) {
          this.onTilePaint();
        }
      }

      this.isDrawingLine = false;
      this.lineStartPos = null;
      this.render();
      return;
    }

    if (this.isDraggingObject && this.draggedObject) {
      const { type, ref, origX, origY, currentX, currentY, name } = this.draggedObject;
      const didMove = currentX !== origX || currentY !== origY;

      if (didMove) {
        // Apply relocation to the target object
        if (type === 'entity') {
          ref.x = currentX;
          ref.y = currentY;
          ref.elevation = (this.activeLayer === LAYERS.OVERHEAD ? 1 : 0);
        } else if (type === 'spawn') {
          this.level.spawn.x = currentX;
          this.level.spawn.y = currentY;
          this.level.spawn.elevation = (this.activeLayer === LAYERS.OVERHEAD ? 1 : 0);
        } else if (type === 'test_spawn') {
          this.level.testSpawn.x = currentX;
          this.level.testSpawn.y = currentY;
          this.level.testSpawn.elevation = (this.activeLayer === LAYERS.OVERHEAD ? 1 : 0);
        } else if (type === 'exit') {
          this.level.exit.x = currentX;
          this.level.exit.y = currentY;
        }

        console.info(`[MazeGame:Editor] Relocated ${name} from (${origX}, ${origY}) to (${currentX}, ${currentY})`);

        if (this.onObjectMoved) {
          this.onObjectMoved(type, ref, origX, origY, currentX, currentY);
        } else if (this.onTilePaint) {
          this.onTilePaint();
        }
      } else if (this.currentTool === 'select' && this.onEntityClick) {
        // If clicked in Inspect tool without moving, open inspector for entity/spawn/exit
        this.onEntityClick(type === 'entity' ? ref : { type, ...ref, x: origX, y: origY });
      }

      this.isDraggingObject = false;
      this.draggedObject = null;
      this.canvas.style.cursor = this.currentTool === 'move' ? 'grab' : (this.currentTool === 'line' ? 'crosshair' : 'default');
      this.render();
      return;
    }

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
    const newZoom = Math.max(0.15, Math.min(5.0, this.zoom * zoomFactor));

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

    // Select Tool: open inspector for clicked entity, spawn, or exit
    if (this.currentTool === 'select') {
      const obj = this.findObjectAt(gridX, gridY);
      if (obj && this.onEntityClick) {
        this.onEntityClick(obj.type === 'entity' ? obj.ref : { type: obj.type, ...obj.ref, x: gridX, y: gridY });
      }
      return;
    }

    // Special Entity Placement
    if (this.selectedEntity) {
      if (this.selectedEntity === 'spawn') {
        this.level.spawn = { x: gridX, y: gridY, elevation: this.activeLayer === LAYERS.OVERHEAD ? 1 : 0 };
      } else if (this.selectedEntity === 'test_spawn') {
        this.level.testSpawn = { x: gridX, y: gridY, elevation: this.activeLayer === LAYERS.OVERHEAD ? 1 : 0 };
      } else if (this.selectedEntity === 'exit') {
        this.level.exit = { x: gridX, y: gridY };
      } else if (this.selectedEntity.startsWith('key') || this.selectedEntity.startsWith('door') || this.selectedEntity === 'lever') {
        // Remove existing entity at tile if any
        this.level.entities = (this.level.entities || []).filter(e => !(e.x === gridX && e.y === gridY));

        const baseType = this.selectedEntity.startsWith('key') ? 'key' : (this.selectedEntity.startsWith('door') ? 'door' : 'lever');
        const newId = `${baseType}_${gridX}_${gridY}`;
        const newEntity = {
          id: newId,
          type: baseType,
          x: gridX,
          y: gridY,
          elevation: this.activeLayer === LAYERS.OVERHEAD ? 1 : 0,
        };

        const presetColor = this.selectedEntityData?.color;
        const presetName = this.selectedEntityData?.name;

        if (baseType === 'key') {
          newEntity.color = presetColor || '#fbbf24';
          newEntity.name = presetName || 'Key';
        } else if (baseType === 'door') {
          newEntity.color = presetColor || '#fbbf24';
          newEntity.requiresKey = this.selectedEntityData?.requiresKey || '';
        } else if (baseType === 'lever') {
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

    // Eraser Tool (Supports Brush Sizes 1x1 to 5x5)
    if (this.currentTool === 'eraser') {
      const stamp = this.getBrushCoordinates(gridX, gridY, this.brushSize);
      let changed = false;
      for (const pt of stamp) {
        const curr = this.level.layers[this.activeLayer][pt.y]?.[pt.x];
        const hasEnt = (this.level.entities || []).some(e => e.x === pt.x && e.y === pt.y);
        if (curr !== 0 || hasEnt) {
          if (this.level.layers[this.activeLayer][pt.y]) {
            this.level.layers[this.activeLayer][pt.y][pt.x] = 0;
          }
          this.level.entities = (this.level.entities || []).filter(e => !(e.x === pt.x && e.y === pt.y));
          changed = true;
        }
      }
      if (changed) {
        this.hasModifiedStroke = true;
        this.render();
      }
      return;
    }

    // Pencil Tool (Supports Brush Sizes 1x1 to 5x5)
    const stamp = this.getBrushCoordinates(gridX, gridY, this.brushSize);
    let changed = false;
    for (const pt of stamp) {
      const currentVal = this.level.layers[this.activeLayer][pt.y]?.[pt.x];
      if (currentVal !== this.selectedTile) {
        if (this.level.layers[this.activeLayer][pt.y]) {
          this.level.layers[this.activeLayer][pt.y][pt.x] = this.selectedTile;
          if (this.selectedTile === TILES.WALL) {
            this.level.entities = (this.level.entities || []).filter(e => !(e.x === pt.x && e.y === pt.y));
          }
          changed = true;
        }
      }
    }
    if (changed) {
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

    // 3. Render Spawn (S), Test Spawn (T), and Exit (E)
    if (this.level.spawn) {
      const spX = this.level.spawn.x * effTile;
      const spY = this.level.spawn.y * effTile;
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(spX + effTile / 2, spY + effTile / 2, effTile * 0.36, 0, Math.PI * 2);
      ctx.fill();

      const spStyle = this.level.spawn.style || 'stairs_down';
      let spIcon = '🪜';
      if (spStyle === 'portal') spIcon = '🌀';
      else if (spStyle === 'archway') spIcon = '🏛️';
      else if (spStyle === 'pentagram') spIcon = '🔯';
      else if (spStyle === 'camp') spIcon = '⛺';

      ctx.fillStyle = '#022014';
      ctx.font = `bold ${Math.max(9, effTile * 0.38)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(spIcon, spX + effTile / 2, spY + effTile / 2);
    }

    if (this.level.testSpawn) {
      const tspX = this.level.testSpawn.x * effTile;
      const tspY = this.level.testSpawn.y * effTile;
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tspX + effTile / 2, tspY + effTile / 2, effTile * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(9, effTile * 0.38)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧪', tspX + effTile / 2, tspY + effTile / 2);
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

      const exStyle = this.level.exit.style || 'portal';
      let exIcon = '🌀';
      if (exStyle === 'stairs_up' || exStyle === 'stairs') exIcon = '🪜';
      else if (exStyle === 'archway') exIcon = '🏛️';
      else if (exStyle === 'chest') exIcon = '🎁';
      else if (exStyle === 'shrine') exIcon = '⛩️';

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(9, effTile * 0.38)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(exIcon, exX + effTile / 2, exY + effTile / 2);
    }

    // 4. Render Entities (Keys, Doors, Levers)
    for (const entity of (this.level.entities || [])) {
      const enX = entity.x * effTile;
      const enY = entity.y * effTile;

      ctx.save();
      if (entity.type === ENTITY_TYPES.KEY) {
        ctx.fillStyle = entity.color || '#fbbf24';
        ctx.shadowColor = entity.color || '#fbbf24';
        ctx.shadowBlur = entity.glowEffect === 'subtle' ? 4 : (entity.glowEffect === 'pulse' ? 12 : 8);
        ctx.beginPath();
        ctx.arc(enX + effTile / 2, enY + effTile / 2, effTile * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        let kIcon = '🔑';
        if (entity.style === 'ornate') kIcon = '🗝️';
        else if (entity.style === 'crystal') kIcon = '💎';
        else if (entity.style === 'orb') kIcon = '🔮';
        else if (entity.style === 'relic') kIcon = '👑';
        else if (entity.style === 'skull') kIcon = '💀';

        ctx.fillStyle = '#000000';
        ctx.font = `${Math.max(9, effTile * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(kIcon, enX + effTile / 2, enY + effTile / 2);
      } else if (entity.type === ENTITY_TYPES.DOOR) {
        ctx.strokeStyle = entity.color || '#fbbf24';
        ctx.shadowColor = entity.color || '#fbbf24';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 3;
        ctx.strokeRect(enX + 4, enY + 4, effTile - 8, effTile - 8);
        ctx.shadowBlur = 0;
        ctx.fillStyle = entity.color || '#fbbf24';

        let dIcon = '🚪';
        if (entity.style === 'portcullis') dIcon = '🏰';
        else if (entity.style === 'laser_barrier') dIcon = '⚡';
        else if (entity.style === 'magic_seal') dIcon = '🔯';
        else if (entity.style === 'crystal_spikes') dIcon = '💠';
        else if (entity.style === 'vault_hatch') dIcon = '🔒';

        ctx.font = `${Math.max(9, effTile * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dIcon, enX + effTile / 2, enY + effTile / 2);
      } else if (entity.type === ENTITY_TYPES.LEVER) {
        ctx.fillStyle = entity.state ? '#34d399' : '#94a3b8';
        ctx.fillRect(enX + effTile * 0.2, enY + effTile * 0.3, effTile * 0.6, effTile * 0.4);
        ctx.fillStyle = '#ffffff';

        let lIcon = '🕹️';
        if (entity.style === 'pressure_pedestal') lIcon = '🔘';
        else if (entity.style === 'crystal_switch') lIcon = '🔮';
        else if (entity.style === 'runic_plate') lIcon = '📜';
        else if (entity.style === 'cog_wheel') lIcon = '⚙️';

        ctx.font = `${Math.max(9, effTile * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lIcon, enX + effTile / 2, enY + effTile / 2);

        // Draw Lever Wiring Target Lines
        for (const t of (entity.targets || [])) {
          const tX = t.x * effTile + effTile / 2;
          const tY = t.y * effTile + effTile / 2;
          ctx.strokeStyle = entity.state ? 'rgba(52, 211, 153, 0.8)' : 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(enX + effTile / 2, enY + effTile / 2);
          ctx.lineTo(tX, tY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Target node marker
          ctx.fillStyle = entity.state ? '#34d399' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(tX, tY, effTile * 0.16, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Active Lever Wiring Target Picker Line
    if (this.currentTool === 'pick_target' && this.wiringLever && this.hoverGridPos.x >= 0) {
      const lx = this.wiringLever.x * effTile + effTile / 2;
      const ly = this.wiringLever.y * effTile + effTile / 2;
      const hx = this.hoverGridPos.x * effTile + effTile / 2;
      const hy = this.hoverGridPos.y * effTile + effTile / 2;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Render Hover / Cursor Box (Reflects Active Brush Size)
    const hx = this.hoverGridPos.x;
    const hy = this.hoverGridPos.y;
    if (hx >= 0 && hx < mazeW && hy >= 0 && hy < mazeH) {
      if ((this.currentTool === 'pencil' || this.currentTool === 'eraser' || this.currentTool === 'line') && this.brushSize > 1) {
        const brushCells = this.getBrushCoordinates(hx, hy, this.brushSize);
        ctx.save();
        ctx.strokeStyle = this.currentTool === 'eraser' ? '#f43f5e' : (this.currentTool === 'line' ? '#a855f7' : '#38bdf8');
        ctx.fillStyle = this.currentTool === 'eraser' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 2;
        for (const c of brushCells) {
          ctx.fillRect(c.x * effTile, c.y * effTile, effTile, effTile);
          ctx.strokeRect(c.x * effTile, c.y * effTile, effTile, effTile);
        }
        ctx.restore();
      } else {
        ctx.strokeStyle = this.currentTool === 'pick_target' ? '#34d399' : (this.currentTool === 'move' ? '#f59e0b' : (this.currentTool === 'line' ? '#a855f7' : (this.currentTool === 'eraser' ? '#f43f5e' : '#38bdf8')));
        ctx.lineWidth = 2;
        ctx.strokeRect(hx * effTile, hy * effTile, effTile, effTile);
      }
    }

    // 6. Render Dragging Object Preview Overlay
    if (this.isDraggingObject && this.draggedObject) {
      const { origX, origY, currentX, currentY, name, icon, color } = this.draggedObject;
      const ox = origX * effTile + effTile / 2;
      const oy = origY * effTile + effTile / 2;
      const cx = currentX * effTile + effTile / 2;
      const cy = currentY * effTile + effTile / 2;

      ctx.save();

      // Origin Ghost Marker
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(origX * effTile + 2, origY * effTile + 2, effTile - 4, effTile - 4);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
      ctx.fillRect(origX * effTile + 2, origY * effTile + 2, effTile - 4, effTile - 4);

      // Connecting Path Vector
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Destination Glowing Target Box
      ctx.strokeStyle = '#34d399';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.strokeRect(currentX * effTile, currentY * effTile, effTile, effTile);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.22)';
      ctx.fillRect(currentX * effTile, currentY * effTile, effTile, effTile);
      ctx.shadowBlur = 0;

      // Floating Entity Icon
      ctx.fillStyle = color || '#38bdf8';
      ctx.font = `${Math.max(12, effTile * 0.55)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon || '📍', cx, cy);

      // Coordinates Floating Badge above destination cell
      const badgeText = `${name} ➔ (${currentX}, ${currentY})`;
      ctx.font = 'bold 11px monospace';
      const textMetrics = ctx.measureText(badgeText);
      const textW = textMetrics.width + 12;
      const textH = 20;
      const badgeX = cx - textW / 2;
      const badgeY = currentY * effTile - 24;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, textW, textH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, cx, badgeY + textH / 2);

      ctx.restore();
    }

    // 7. Render Line / Wall Drawing Real-time Preview Overlay
    if (this.isDrawingLine && this.lineStartPos && this.hoverGridPos.x >= 0) {
      const x0 = this.lineStartPos.x;
      const y0 = this.lineStartPos.y;
      const x1 = this.hoverGridPos.x;
      const y1 = this.hoverGridPos.y;

      const sx = x0 * effTile + effTile / 2;
      const sy = y0 * effTile + effTile / 2;
      const ex = x1 * effTile + effTile / 2;
      const ey = y1 * effTile + effTile / 2;

      ctx.save();

      // Start Anchor Node Marker
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(sx, sy, effTile * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Guide Vector Line
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rasterized Line Stamped Cells Preview
      const linePts = this.getLineCoordinates(x0, y0, x1, y1);
      ctx.fillStyle = this.selectedTile === TILES.WALL ? 'rgba(168, 85, 247, 0.35)' : 'rgba(56, 189, 248, 0.35)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;

      const renderedSet = new Set();
      for (const pt of linePts) {
        const stamp = this.getBrushCoordinates(pt.x, pt.y, this.brushSize);
        for (const cell of stamp) {
          const key = `${cell.x},${cell.y}`;
          if (!renderedSet.has(key)) {
            renderedSet.add(key);
            ctx.fillRect(cell.x * effTile, cell.y * effTile, effTile, effTile);
            ctx.strokeRect(cell.x * effTile, cell.y * effTile, effTile, effTile);
          }
        }
      }

      // Floating Line Metric Badge
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const length = Math.max(dx, dy) + 1;
      const lineBadge = `Line (${x0},${y0}) ➔ (${x1},${y1}) | ${length} tiles [${this.brushSize}x${this.brushSize}]`;
      ctx.font = 'bold 11px monospace';
      const m = ctx.measureText(lineBadge);
      const bW = m.width + 14;
      const bH = 22;
      const bX = ex - bW / 2;
      const bY = y1 * effTile - 26;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f3e8ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lineBadge, ex, bY + bH / 2);

      ctx.restore();
    }

    ctx.restore();
  }

  isRamp(tile) {
    return tile === TILES.RAMP_N || tile === TILES.RAMP_S || tile === TILES.RAMP_E || tile === TILES.RAMP_W;
  }
}
