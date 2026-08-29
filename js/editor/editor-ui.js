/**
 * Level Editor Main Controller & UI Bindings
 */

import { TILES, LAYERS, DEFAULTS } from '../core/constants.js';
import { StorageManager } from '../core/storage.js';
import { LevelLoader } from '../levels/level-loader.js';
import { JsonExporter } from './json-exporter.js';
import { EntityInspector } from './entity-inspector.js';
import { EditorCanvas } from './editor-canvas.js';

export class EditorUI {
  constructor() {
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 30;

    // Load initial draft or default template
    this.level = StorageManager.loadEditorDraft() || LevelLoader.normalizeLevel({
      id: 'custom_labyrinth',
      title: 'My Custom Labyrinth',
      author: 'Architect',
      dimensions: { width: 21, height: 21 },
    });

    this.initCanvas();
    this.initInspector();
    this.initUI();
    this.pushHistory();
  }

  initCanvas() {
    const canvasEl = document.getElementById('editor-canvas');

    const resize = () => {
      const parent = canvasEl.parentElement;
      canvasEl.width = parent.clientWidth;
      canvasEl.height = parent.clientHeight;
      if (this.editorCanvas) {
        this.editorCanvas.render();
      }
    };

    window.addEventListener('resize', resize);
    resize();

    this.editorCanvas = new EditorCanvas({
      canvas: canvasEl,
      level: this.level,
      onTilePaint: () => {
        this.pushHistory();
        this.autoSave();
      },
      onEntityClick: (entity) => {
        this.inspector.open(entity, this.level);
      },
      onTargetTilePicked: (lever, targetX, targetY, layer) => {
        lever.targets = lever.targets || [];
        lever.targets.push({
          action: 'toggle_tile',
          layer: layer || 'ground',
          x: targetX,
          y: targetY,
          stateA: 0,
          stateB: 1,
        });
        this.pushHistory();
        this.autoSave();
        this.inspector.open(lever, this.level);
        this.showToast(`Linked lever to (${targetX}, ${targetY}) on ${layer}!`, 'success');
      },
      onHoverCoord: (gx, gy) => {
        const coordEl = document.getElementById('status-coord');
        if (coordEl) {
          const { width, height } = this.level.dimensions;
          if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
            const tile = this.level.layers[this.editorCanvas.activeLayer][gy]?.[gx];
            coordEl.textContent = `X: ${gx}, Y: ${gy} | Tile: ${tile ?? 'Empty'}`;
          } else {
            coordEl.textContent = `X: --, Y: --`;
          }
        }
      },
    });
  }

  initInspector() {
    const modalEl = document.getElementById('entity-inspector-modal');
    this.inspector = new EntityInspector({
      modalContainer: modalEl,
      onUpdate: (entity) => {
        this.pushHistory();
        this.autoSave();
        this.editorCanvas.render();
      },
      onDelete: (entity) => {
        this.level.entities = (this.level.entities || []).filter(e => e.id !== entity.id);
        this.pushHistory();
        this.autoSave();
        this.editorCanvas.render();
        this.showToast(`Deleted ${entity.type} "${entity.id}"`, 'info');
      },
      onStartPickTarget: (lever) => {
        this.editorCanvas.startTargetPickMode(lever);
        this.showToast('Click any tile on canvas to link to this lever!', 'info');
      },
    });
  }

  initUI() {
    // 1. Level Title Input
    const titleInput = document.getElementById('level-title-input');
    if (titleInput) {
      titleInput.value = this.level.title;
      titleInput.addEventListener('input', () => {
        this.level.title = titleInput.value.trim() || 'Untitled Labyrinth';
        this.autoSave();
      });
    }

    // 2. Layer Switcher Tabs
    const tabGround = document.getElementById('tab-layer-ground');
    const tabOverhead = document.getElementById('tab-layer-overhead');
    const statusLayer = document.getElementById('status-layer');

    const setLayer = (layer) => {
      tabGround.classList.toggle('active', layer === LAYERS.GROUND);
      tabOverhead.classList.toggle('active', layer === LAYERS.OVERHEAD);
      this.editorCanvas.setActiveLayer(layer);
      if (statusLayer) {
        statusLayer.textContent = `Layer: ${layer.toUpperCase()}`;
      }
    };

    tabGround.addEventListener('click', () => setLayer(LAYERS.GROUND));
    tabOverhead.addEventListener('click', () => setLayer(LAYERS.OVERHEAD));

    // 3. Palette Buttons Binding
    const paletteButtons = document.querySelectorAll('.palette-btn[data-tool], .palette-btn[data-tile], .palette-btn[data-entity]');
    paletteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        paletteButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tool = btn.dataset.tool;
        const tile = btn.dataset.tile;
        const entity = btn.dataset.entity;

        if (tool) {
          this.editorCanvas.setTool(tool);
          this.editorCanvas.selectedEntity = null;
        } else if (tile !== undefined) {
          const parsedTile = !isNaN(Number(tile)) ? Number(tile) : tile;
          this.editorCanvas.setSelectedTile(parsedTile);
        } else if (entity) {
          this.editorCanvas.setSelectedEntity(entity);
        }
      });
    });

    // 4. Header Actions
    document.getElementById('btn-playtest').addEventListener('click', () => this.playTest());
    document.getElementById('btn-export-json').addEventListener('click', () => JsonExporter.exportToFile(this.level));
    document.getElementById('btn-copy-json').addEventListener('click', async () => {
      const ok = await JsonExporter.copyToClipboard(this.level);
      this.showToast(ok ? 'JSON copied to clipboard!' : 'Failed to copy', ok ? 'success' : 'error');
    });

    // Import file
    const fileInput = document.getElementById('editor-file-input');
    document.getElementById('btn-import-json').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const imported = await JsonExporter.importFromFile(file);
        this.loadLevel(imported);
        this.showToast('Labyrinth loaded successfully!', 'success');
      } catch (err) {
        alert(err.message);
      }
      fileInput.value = '';
    });

    // Undo / Redo
    document.getElementById('btn-undo').addEventListener('click', () => this.undo());
    document.getElementById('btn-redo').addEventListener('click', () => this.redo());

    // Clear / Reset
    document.getElementById('btn-clear').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the maze to empty floor?')) {
        const { width, height } = this.level.dimensions;
        this.level.layers.ground = LevelLoader.normalizeGrid([], width, height, TILES.FLOOR);
        this.level.layers.overhead = LevelLoader.normalizeGrid([], width, height, 0);
        this.level.entities = [];
        this.pushHistory();
        this.autoSave();
        this.editorCanvas.render();
      }
    });

    // Settings Modal
    this.initSettingsModal();

    // Zoom buttons in viewport overlay
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.editorCanvas.zoom = Math.min(3.5, this.editorCanvas.zoom * 1.2);
      this.editorCanvas.render();
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.editorCanvas.zoom = Math.max(0.3, this.editorCanvas.zoom / 1.2);
      this.editorCanvas.render();
    });
    document.getElementById('btn-zoom-fit')?.addEventListener('click', () => {
      this.editorCanvas.zoom = 1.0;
      this.editorCanvas.centerInViewport();
      this.editorCanvas.render();
    });
  }

  initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const btnOpen = document.getElementById('btn-settings');
    const btnSave = document.getElementById('settings-btn-save');
    const btnClose = document.getElementById('settings-btn-close');

    btnOpen.addEventListener('click', () => {
      document.getElementById('set-id').value = this.level.id || 'custom';
      document.getElementById('set-title').value = this.level.title || '';
      document.getElementById('set-author').value = this.level.author || '';
      document.getElementById('set-width').value = this.level.dimensions.width;
      document.getElementById('set-height').value = this.level.dimensions.height;
      document.getElementById('set-fog').checked = !!this.level.config.fogOfWar;
      document.getElementById('set-radius').value = this.level.config.viewRadius || 6;
      document.getElementById('set-theme').value = this.level.config.theme || 'dungeon';
      modal.classList.add('active');
    });

    btnClose.addEventListener('click', () => modal.classList.remove('active'));

    btnSave.addEventListener('click', () => {
      const newW = parseInt(document.getElementById('set-width').value, 10) || 21;
      const newH = parseInt(document.getElementById('set-height').value, 10) || 21;

      this.level.id = document.getElementById('set-id').value.trim() || 'custom';
      this.level.title = document.getElementById('set-title').value.trim() || 'Custom Maze';
      this.level.author = document.getElementById('set-author').value.trim() || 'Architect';
      this.level.config.fogOfWar = document.getElementById('set-fog').checked;
      this.level.config.viewRadius = parseInt(document.getElementById('set-radius').value, 10) || 6;
      this.level.config.theme = document.getElementById('set-theme').value;

      // Resize dimensions if changed
      if (newW !== this.level.dimensions.width || newH !== this.level.dimensions.height) {
        this.level.dimensions = { width: newW, height: newH };
        this.level.layers.ground = LevelLoader.normalizeGrid(this.level.layers.ground, newW, newH, TILES.FLOOR);
        this.level.layers.overhead = LevelLoader.normalizeGrid(this.level.layers.overhead, newW, newH, 0);
        this.editorCanvas.centerInViewport();
      }

      document.getElementById('level-title-input').value = this.level.title;
      this.pushHistory();
      this.autoSave();
      this.editorCanvas.render();
      modal.classList.remove('active');
      this.showToast('Level properties saved!', 'success');
    });
  }

  loadLevel(levelData) {
    this.level = LevelLoader.normalizeLevel(levelData);
    this.editorCanvas.setLevel(this.level);
    this.editorCanvas.centerInViewport();
    document.getElementById('level-title-input').value = this.level.title;
    this.pushHistory();
    this.autoSave();
  }

  playTest() {
    StorageManager.saveCustomMaze(this.level);
    window.location.href = 'maze.html?mode=custom';
  }

  autoSave() {
    StorageManager.saveEditorDraft(this.level);
  }

  pushHistory() {
    const snapshot = JSON.stringify(this.level);

    if (this.historyIndex >= 0 && this.history[this.historyIndex] === snapshot) {
      return;
    }

    // Cut future if branched
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.level = JSON.parse(this.history[this.historyIndex]);
      this.editorCanvas.setLevel(this.level);
      document.getElementById('level-title-input').value = this.level.title;
      this.autoSave();
      this.showToast('Undo', 'info');
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.level = JSON.parse(this.history[this.historyIndex]);
      this.editorCanvas.setLevel(this.level);
      document.getElementById('level-title-input').value = this.level.title;
      this.autoSave();
      this.showToast('Redo', 'info');
    }
  }

  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
}
