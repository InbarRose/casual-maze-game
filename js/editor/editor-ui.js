/**
 * Level Editor Main Controller & UI Bindings
 */

import { TILES, LAYERS, DEFAULTS } from '../core/constants.js';
import { StorageManager } from '../core/storage.js';
import { LevelLoader } from '../levels/level-loader.js';
import { CAMPAIGN_LEVELS, TUTORIAL_LEVELS } from '../levels/default-levels.js';
import { JsonExporter } from './json-exporter.js';
import { EntityInspector } from './entity-inspector.js';
import { EditorCanvas } from './editor-canvas.js';
import { LevelValidator } from './level-validator.js';

export class EditorUI {
  constructor() {
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 40;

    // Load initial draft or default template
    this.level = StorageManager.loadEditorDraft() || LevelLoader.normalizeLevel({
      id: 'custom_labyrinth',
      title: 'My Custom Labyrinth',
      author: 'Architect',
      dimensions: { width: 21, height: 21 },
    });

    this.currentProjectId = this.level.id || 'custom_labyrinth';
    console.info(
      `[MazeGame:Editor] Initialized Maze Architect with project "${this.level.title}" (${this.level.id}) | Size: ${this.level.dimensions.width}x${this.level.dimensions.height}`
    );

    this.initCanvas();
    this.initInspector();
    this.initUI();
    this.initKeyboardShortcuts();
    this.initProjectsModal();
    this.initValidationModal();
    this.initPlaytestModal();
    this.initGuideModal();
    this.pushHistory();
    this.updateValidationState();

    // Check URL parameters for preset levels (?level=X, ?tutorial=X, ?preset=X, ?id=X)
    if (typeof window !== 'undefined' && window.location?.search) {
      const urlParams = new URLSearchParams(window.location.search);
      const presetParam = urlParams.get('preset') || urlParams.get('level') || urlParams.get('tutorial') || urlParams.get('tut') || urlParams.get('id');
      if (presetParam) {
        console.info(`[MazeGame:Editor] Detected URL preset request for "${presetParam}"`);
        this.loadPresetLevel(presetParam, false);
      }
    }
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
        this.updateValidationState();
      },
      onEntityClick: (entity) => {
        this.inspector.open(entity, this.level);
      },
      onObjectMoved: (type, ref, fromX, fromY, toX, toY) => {
        this.pushHistory();
        this.autoSave();
        this.updateValidationState();
        const objName = ref?.name || (type === 'spawn' ? 'Spawn Point' : (type === 'test_spawn' ? 'Test Spawn' : (type === 'exit' ? 'Exit Portal' : 'Object')));
        this.showToast(`Relocated ${objName} to (${toX}, ${toY})!`, 'success');
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
        this.updateValidationState();
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
        this.updateValidationState();
        this.editorCanvas.render();
      },
      onDelete: (entity) => {
        this.level.entities = (this.level.entities || []).filter(e => e.id !== entity.id);
        this.pushHistory();
        this.autoSave();
        this.updateValidationState();
        this.editorCanvas.render();
        this.showToast(`Deleted ${entity.type} "${entity.id}"`, 'info');
      },
      onStartPickTarget: (lever) => {
        this.editorCanvas.startTargetPickMode(lever);
        this.showToast('Click any tile on canvas to link to this lever!', 'info');
      },
      onTestToggle: (lever) => {
        lever.state = !lever.state;
        for (const target of (lever.targets || [])) {
          if (target.action === 'toggle_tile' || !target.action) {
            const layerName = target.layer === 'overhead' ? 'overhead' : 'ground';
            const layer = this.level.layers[layerName];
            if (layer && layer[target.y] && layer[target.y][target.x] !== undefined) {
              layer[target.y][target.x] = lever.state ? (target.stateA ?? 0) : (target.stateB ?? 1);
            }
          }
        }
        this.pushHistory();
        this.autoSave();
        this.updateValidationState();
        this.editorCanvas.render();
        this.showToast(`Mechanism "${lever.name || lever.id}" toggled to ${lever.state ? 'ACTIVE' : 'INACTIVE'}!`, 'info');
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
        console.info(`[MazeGame:Editor] Labyrinth renamed to "${this.level.title}"`);
        this.autoSave();
      });
    }

    // 2. Visual Theme & Tileset Quick Switcher
    const quickTheme = document.getElementById('quick-theme-select');
    if (quickTheme) {
      quickTheme.value = this.level.config.theme || 'dungeon';
      quickTheme.addEventListener('change', () => {
        this.level.config.theme = quickTheme.value;
        const setTheme = document.getElementById('set-theme');
        if (setTheme) setTheme.value = quickTheme.value;
        this.pushHistory();
        this.autoSave();
        this.editorCanvas.render();
        console.info(`[MazeGame:Editor] Visual tileset switched to "${quickTheme.value}"`);
        this.showToast(`Tileset switched to ${quickTheme.options[quickTheme.selectedIndex].text}!`, 'info');
      });
    }

    // 2b. Official Level Quick Loader Dropdown
    const quickPreset = document.getElementById('quick-preset-select');
    if (quickPreset) {
      quickPreset.addEventListener('change', () => {
        const val = quickPreset.value;
        if (val) {
          this.loadPresetLevel(val, false);
          quickPreset.value = '';
        }
      });
    }

    // 3. Layer Switcher Tabs
    const tabGround = document.getElementById('tab-layer-ground');
    const tabOverhead = document.getElementById('tab-layer-overhead');
    const statusLayer = document.getElementById('status-layer');

    const setLayer = (layer) => {
      tabGround?.classList.toggle('active', layer === LAYERS.GROUND);
      tabOverhead?.classList.toggle('active', layer === LAYERS.OVERHEAD);
      this.editorCanvas.setActiveLayer(layer);
      if (statusLayer) {
        statusLayer.textContent = `Layer: ${layer.toUpperCase()}`;
      }
      console.info(`[MazeGame:Editor] Active layer switched to "${layer.toUpperCase()}" (Elevation: ${layer === LAYERS.OVERHEAD ? 1 : 0})`);
    };

    tabGround?.addEventListener('click', () => setLayer(LAYERS.GROUND));
    tabOverhead?.addEventListener('click', () => setLayer(LAYERS.OVERHEAD));

    // 4. Palette Buttons Binding
    const paletteButtons = document.querySelectorAll('.palette-btn[data-tool], .palette-btn[data-tile], .palette-btn[data-entity]');
    paletteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        paletteButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tool = btn.dataset.tool;
        const tile = btn.dataset.tile;
        const entity = btn.dataset.entity;
        const color = btn.dataset.color;
        const name = btn.dataset.name;

        if (tool) {
          this.editorCanvas.setTool(tool);
          this.editorCanvas.selectedEntity = null;
          console.info(`[MazeGame:Editor] Active draw tool: "${tool.toUpperCase()}"`);
        } else if (tile !== undefined) {
          const parsedTile = !isNaN(Number(tile)) ? Number(tile) : tile;
          this.editorCanvas.setSelectedTile(parsedTile);
          console.info(`[MazeGame:Editor] Selected tile for painting: "${parsedTile}"`);
        } else if (entity) {
          this.editorCanvas.setSelectedEntity(entity, color ? { color, name } : null);
          console.info(`[MazeGame:Editor] Selected entity for placement: "${entity}" (${name || color || 'Default'})`);
        }
      });
    });

    // 5. Header Actions
    document.getElementById('btn-playtest')?.addEventListener('click', () => {
      console.info('[MazeGame:Editor] Playtest launch triggered');
      this.playTest();
    });
    document.getElementById('btn-playtest-opts')?.addEventListener('click', () => {
      console.info('[MazeGame:Editor] Playtest options modal opened');
      this.openPlaytestModal();
    });
    document.getElementById('btn-guide')?.addEventListener('click', () => {
      console.info('[MazeGame:Editor] Architect handbook opened');
      this.openGuideModal();
    });

    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const report = LevelValidator.validate(this.level);
      if (!report.valid) {
        console.warn('[MazeGame:Editor] Export requested on invalid level:', report.errors);
        if (!confirm('⚠️ This maze currently has validation errors. Do you still want to export?')) {
          this.openValidationModal();
          return;
        }
      }
      console.info('[MazeGame:Editor] Exporting level JSON to file:', this.level.title);
      JsonExporter.exportToFile(this.level);
    });

    document.getElementById('btn-copy-json')?.addEventListener('click', async () => {
      const ok = await JsonExporter.copyToClipboard(this.level);
      console.info(`[MazeGame:Editor] Level JSON clipboard copy status: ${ok ? 'SUCCESS' : 'FAILED'}`);
      this.showToast(ok ? 'JSON copied to clipboard!' : 'Failed to copy', ok ? 'success' : 'error');
    });

    // Quick Save button
    document.getElementById('btn-save-project')?.addEventListener('click', () => {
      console.info('[MazeGame:Editor] Quick save button clicked');
      this.quickSaveProject();
    });

    // Import file
    const fileInput = document.getElementById('editor-file-input');
    document.getElementById('btn-import-json')?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        console.info(`[MazeGame:Editor] Importing file "${file.name}"...`);
        const imported = await JsonExporter.importFromFile(file);
        this.loadLevel(imported);
        console.info(`[MazeGame:Editor] File "${file.name}" imported successfully as "${imported.title}"`);
        this.showToast('Labyrinth loaded successfully!', 'success');
      } catch (err) {
        console.error('[MazeGame:Editor] File import error:', err);
        alert(err.message);
      }
      fileInput.value = '';
    });

    // Undo / Redo
    document.getElementById('btn-undo')?.addEventListener('click', () => this.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => this.redo());

    // Clear / Reset
    document.getElementById('btn-clear')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the maze to empty floor?')) {
        const { width, height } = this.level.dimensions;
        this.level.layers.ground = LevelLoader.normalizeGrid([], width, height, TILES.FLOOR);
        this.level.layers.overhead = LevelLoader.normalizeGrid([], width, height, 0);
        this.level.entities = [];
        console.warn(`[MazeGame:Editor] Labyrinth canvas cleared to empty floor (${width}x${height})`);
        this.pushHistory();
        this.autoSave();
        this.updateValidationState();
        this.editorCanvas.render();
      }
    });

    // Brush Size Buttons
    document.querySelectorAll('.brush-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = parseInt(btn.dataset.size, 10);
        this.setBrushSize(size);
      });
    });

    // Settings Modal
    this.initSettingsModal();

    // Zoom buttons in viewport overlay
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.editorCanvas.setZoom(this.editorCanvas.zoom * 1.25);
      this.updateZoomBadge();
      console.info(`[MazeGame:Editor] Zoom In: ${Math.round(this.editorCanvas.zoom * 100)}%`);
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.editorCanvas.setZoom(this.editorCanvas.zoom / 1.25);
      this.updateZoomBadge();
      console.info(`[MazeGame:Editor] Zoom Out: ${Math.round(this.editorCanvas.zoom * 100)}%`);
    });
    document.getElementById('btn-zoom-fit')?.addEventListener('click', () => {
      this.editorCanvas.zoomToFit();
      this.updateZoomBadge();
      console.info(`[MazeGame:Editor] Zoom to Fit: ${Math.round(this.editorCanvas.zoom * 100)}%`);
    });
    this.updateZoomBadge();
  }

  setBrushSize(size) {
    const s = Math.max(1, Math.min(5, parseInt(size, 10) || 1));
    document.querySelectorAll('.brush-size-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.size, 10) === s);
    });
    const label = document.getElementById('brush-size-label');
    if (label) label.textContent = `${s}x${s}`;
    this.editorCanvas?.setBrushSize(s);
    this.showToast(`Brush size: ${s}x${s}`, 'info', 1000);
  }

  updateZoomBadge() {
    const badge = document.getElementById('zoom-badge');
    if (badge && this.editorCanvas) {
      badge.textContent = `${Math.round(this.editorCanvas.zoom * 100)}%`;
    }
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if typing inside input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        this.redo();
        return;
      }

      // Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.quickSaveProject();
        return;
      }

      // Tool shortcuts
      if (e.key.toLowerCase() === 'p') {
        this.selectToolBtn('pencil');
      } else if (e.key.toLowerCase() === 'l') {
        this.selectToolBtn('line');
      } else if (e.key.toLowerCase() === 'f') {
        this.selectToolBtn('fill');
      } else if (e.key.toLowerCase() === 'e') {
        this.selectToolBtn('eraser');
      } else if (e.key.toLowerCase() === 's') {
        this.selectToolBtn('select');
      } else if (e.key.toLowerCase() === 'g' || e.key.toLowerCase() === 'm') {
        this.selectToolBtn('move');
      } else if (e.key === '[') {
        this.setBrushSize((this.editorCanvas?.brushSize || 1) - 1);
      } else if (e.key === ']') {
        this.setBrushSize((this.editorCanvas?.brushSize || 1) + 1);
      } else if (e.key === '1') {
        document.getElementById('tab-layer-ground')?.click();
      } else if (e.key === '2') {
        document.getElementById('tab-layer-overhead')?.click();
      } else if (e.key.toLowerCase() === 'v') {
        this.openValidationModal();
      } else if (e.key.toLowerCase() === 't') {
        this.openPlaytestModal();
      } else if (e.key.toLowerCase() === 'h' || e.key === '?') {
        this.openGuideModal();
      }
    });
  }

  selectToolBtn(toolName) {
    const btn = document.querySelector(`.palette-btn[data-tool="${toolName}"]`);
    if (btn) btn.click();
  }

  initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const btnOpen = document.getElementById('btn-settings');
    const btnSave = document.getElementById('settings-btn-save');
    const btnClose = document.getElementById('settings-btn-close');

    // Tab Navigation within Properties Modal
    document.querySelectorAll('#prop-modal-tabs .modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        document.querySelectorAll('#prop-modal-tabs .modal-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('#settings-modal .modal-tab-pane').forEach(pane => {
          pane.classList.toggle('active', pane.id === `pane-prop-${targetTab}`);
        });
      });
    });

    // Dimension Quick Preset Buttons
    document.querySelectorAll('#settings-modal .dim-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('set-width').value = btn.dataset.w;
        document.getElementById('set-height').value = btn.dataset.h;
      });
    });

    btnOpen?.addEventListener('click', () => {
      document.getElementById('set-id').value = this.level.id || 'custom';
      document.getElementById('set-title').value = this.level.title || '';
      document.getElementById('set-author').value = this.level.author || '';
      document.getElementById('set-width').value = this.level.dimensions.width;
      document.getElementById('set-height').value = this.level.dimensions.height;
      document.getElementById('set-fog').checked = !!this.level.config.fogOfWar;
      document.getElementById('set-map-revealed').checked = !!this.level.config.mapRevealed;
      document.getElementById('set-radius').value = this.level.config.viewRadius || 6;
      document.getElementById('set-theme').value = this.level.config.theme || 'dungeon';
      document.getElementById('set-spawn-style').value = this.level.spawn?.style || 'stairs_down';
      document.getElementById('set-exit-style').value = this.level.exit?.style || 'portal';
      document.getElementById('set-help-title').value = this.level.help?.title || '';
      document.getElementById('set-help-message').value = this.level.help?.message || '';

      // Reset to first tab
      document.querySelector('#prop-modal-tabs .modal-tab-btn[data-tab="meta"]')?.click();
      modal.classList.add('active');
    });

    btnClose?.addEventListener('click', () => modal.classList.remove('active'));

    btnSave?.addEventListener('click', () => {
      const newW = Math.max(9, Math.min(150, parseInt(document.getElementById('set-width').value, 10) || 21));
      const newH = Math.max(9, Math.min(150, parseInt(document.getElementById('set-height').value, 10) || 21));

      this.level.id = document.getElementById('set-id').value.trim() || 'custom';
      this.level.title = document.getElementById('set-title').value.trim() || 'Custom Maze';
      this.level.author = document.getElementById('set-author').value.trim() || 'Architect';
      this.level.config.fogOfWar = document.getElementById('set-fog').checked;
      this.level.config.mapRevealed = document.getElementById('set-map-revealed').checked;
      this.level.config.viewRadius = parseInt(document.getElementById('set-radius').value, 10) || 6;
      this.level.config.theme = document.getElementById('set-theme').value;

      if (!this.level.spawn) this.level.spawn = { x: 1, y: 1, elevation: 0 };
      this.level.spawn.style = document.getElementById('set-spawn-style').value || 'stairs_down';

      if (!this.level.exit) this.level.exit = { x: newW - 2, y: newH - 2 };
      this.level.exit.style = document.getElementById('set-exit-style').value || 'portal';

      const helpTitle = document.getElementById('set-help-title').value.trim();
      const helpMsg = document.getElementById('set-help-message').value.trim();
      if (helpTitle || helpMsg) {
        this.level.help = { title: helpTitle, message: helpMsg };
      } else {
        this.level.help = null;
      }

      // Resize dimensions if changed (supports up to 150x150)
      if (newW !== this.level.dimensions.width || newH !== this.level.dimensions.height) {
        this.level.dimensions = { width: newW, height: newH };
        this.level.layers.ground = LevelLoader.normalizeGrid(this.level.layers.ground, newW, newH, TILES.FLOOR);
        this.level.layers.overhead = LevelLoader.normalizeGrid(this.level.layers.overhead, newW, newH, 0);
        this.editorCanvas.centerInViewport();
      }

      document.getElementById('level-title-input').value = this.level.title;
      this.pushHistory();
      this.autoSave();
      this.updateValidationState();
      this.editorCanvas.render();
      this.updateZoomBadge();
      modal.classList.remove('active');
      this.showToast(`Labyrinth properties saved (${newW}x${newH})!`, 'success');
    });
  }

  /* =========================================================
   * OFFICIAL PRESET & LEVEL LOADER SYSTEM
   * ========================================================= */
  loadPresetLevel(presetId, asCopy = false) {
    const rawId = String(presetId).trim().toLowerCase();
    let found = null;
    let category = 'Campaign';

    // 1. Check Tutorial levels
    if (rawId.startsWith('tutorial_') || rawId.startsWith('tut_') || rawId.startsWith('t')) {
      const match = rawId.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 1;
      found = TUTORIAL_LEVELS[num - 1] || TUTORIAL_LEVELS.find(l => String(l.id).toLowerCase() === rawId);
      category = 'Tutorial';
    } else {
      // 2. Check Campaign levels
      const match = rawId.match(/\d+/);
      const num = match ? match[0] : rawId;
      found = CAMPAIGN_LEVELS.find(l => String(l.id).toLowerCase() === String(num) || String(l.id).toLowerCase() === `level_${num}`) ||
              TUTORIAL_LEVELS.find(l => String(l.id).toLowerCase() === rawId);
      if (found && !found.id.startsWith('tutorial')) {
        category = 'Campaign';
      }
    }

    if (!found) {
      console.warn(`[MazeGame:Editor] Preset level "${presetId}" not found in default levels.`);
      this.showToast(`Preset level "${presetId}" not found`, 'error');
      return false;
    }

    const levelData = JSON.parse(JSON.stringify(found));
    if (asCopy) {
      levelData.id = `remix_${found.id}_${Date.now()}`;
      levelData.title = `${found.title} (Remix)`;
    }

    console.info(`[MazeGame:Editor] Loaded official game level "${found.title}" (${found.id}) [asCopy=${asCopy}]`);
    this.loadLevel(levelData);

    const quickSelect = document.getElementById('quick-preset-select');
    if (quickSelect && !asCopy) {
      quickSelect.value = found.id;
    }

    this.showToast(`Loaded ${category} "${found.title}" into editor!`, 'success');
    return true;
  }

  /* =========================================================
   * PROJECTS & TEMPLATES SYSTEM
   * ========================================================= */
  initProjectsModal() {
    const modal = document.getElementById('projects-modal');
    const btnOpen = document.getElementById('btn-projects');
    const btnClose = document.getElementById('projects-btn-close');
    const btnSaveAs = document.getElementById('btn-save-as-project');

    // Tab Navigation within Projects Modal (Official Presets / Saved / Blank)
    document.querySelectorAll('#project-modal-tabs .modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        document.querySelectorAll('#project-modal-tabs .modal-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('#projects-modal .modal-tab-pane').forEach(pane => {
          pane.classList.toggle('active', pane.id === `pane-proj-${targetTab}`);
          pane.style.display = pane.id === `pane-proj-${targetTab}` ? 'flex' : 'none';
        });
      });
    });

    // Preset Search Input & Category Filter Pills
    const searchInput = document.getElementById('preset-search-input');
    let currentFilter = 'all';

    searchInput?.addEventListener('input', () => {
      this.renderOfficialPresets(currentFilter, searchInput.value.trim().toLowerCase());
    });

    document.querySelectorAll('#preset-filter-pills button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#preset-filter-pills button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter || 'all';
        this.renderOfficialPresets(currentFilter, searchInput?.value.trim().toLowerCase() || '');
      });
    });

    btnOpen?.addEventListener('click', () => {
      this.renderProjectsModalContent();
      // Default to official tab
      document.querySelector('#project-modal-tabs .modal-tab-btn[data-tab="official"]')?.click();
      modal.classList.add('active');
    });

    btnClose?.addEventListener('click', () => modal.classList.remove('active'));

    btnSaveAs?.addEventListener('click', () => {
      const nameInput = document.getElementById('project-save-name');
      const name = nameInput.value.trim() || this.level.title || 'My Labyrinth';
      this.level.title = name;
      this.level.id = name.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
      StorageManager.saveProject(this.level);
      this.currentProjectId = this.level.id;
      document.getElementById('level-title-input').value = this.level.title;
      this.renderProjectsModalContent();
      this.showToast(`Saved project "${name}"!`, 'success');
    });

    // Preset Buttons
    document.getElementById('btn-preset-small')?.addEventListener('click', () => {
      if (confirm('Create new Small (15×15) labyrinth? Unsaved changes in active draft will be replaced.')) {
        this.createNewLevel(15, 15, 'Small Labyrinth');
        modal.classList.remove('active');
      }
    });

    document.getElementById('btn-preset-medium')?.addEventListener('click', () => {
      if (confirm('Create new Standard (21×21) labyrinth? Unsaved changes in active draft will be replaced.')) {
        this.createNewLevel(21, 21, 'Standard Labyrinth');
        modal.classList.remove('active');
      }
    });

    document.getElementById('btn-preset-large')?.addEventListener('click', () => {
      if (confirm('Create new Large (31×31) labyrinth? Unsaved changes in active draft will be replaced.')) {
        this.createNewLevel(31, 31, 'Large Labyrinth');
        modal.classList.remove('active');
      }
    });
  }

  renderProjectsModalContent() {
    this.renderOfficialPresets('all', '');
    this.renderSavedProjects();
  }

  renderOfficialPresets(filterCategory = 'all', searchTerm = '') {
    const container = document.getElementById('official-presets-container');
    if (!container) return;

    container.innerHTML = '';

    // Aggregate all 16 levels
    const allPresets = [];

    TUTORIAL_LEVELS.forEach((lvl, idx) => {
      allPresets.push({
        raw: lvl,
        id: lvl.id || `tutorial_${idx + 1}`,
        badge: `T${idx + 1}`,
        category: 'tutorial',
        categoryLabel: 'Tutorial Academy',
        badgeClass: 'tutorial',
        zoneLabel: 'Tutorial',
      });
    });

    CAMPAIGN_LEVELS.forEach(lvl => {
      const num = parseInt(lvl.id, 10) || 1;
      let cat = 'zone_1';
      let catLabel = 'Zone 1: Crypts';
      let badgeClass = 'zone_1';

      if (num >= 6 && num <= 8) {
        cat = 'zone_2';
        catLabel = 'Zone 2: Jungle';
        badgeClass = 'zone_2';
      } else if (num >= 9) {
        cat = 'zone_3';
        catLabel = 'Zone 3: Magma';
        badgeClass = 'zone_3';
      }

      allPresets.push({
        raw: lvl,
        id: lvl.id,
        badge: `L${lvl.id}`,
        category: cat,
        categoryLabel: catLabel,
        badgeClass: badgeClass,
        zoneLabel: catLabel,
      });
    });

    // Filter by Category & Search Term
    const filtered = allPresets.filter(item => {
      if (filterCategory !== 'all' && item.category !== filterCategory) {
        return false;
      }
      if (searchTerm) {
        const titleMatch = (item.raw.title || '').toLowerCase().includes(searchTerm);
        const idMatch = String(item.id).toLowerCase().includes(searchTerm);
        const themeMatch = (item.raw.config?.theme || '').toLowerCase().includes(searchTerm);
        const zoneMatch = item.zoneLabel.toLowerCase().includes(searchTerm);
        return titleMatch || idMatch || themeMatch || zoneMatch;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.75rem; text-align: center;">No official levels match "${searchTerm}".</div>`;
      return;
    }

    filtered.forEach(item => {
      const lvl = item.raw;
      const card = document.createElement('div');
      card.className = 'official-preset-card';

      const keyCount = (lvl.entities || []).filter(e => e.type === 'key').length;
      const doorCount = (lvl.entities || []).filter(e => e.type === 'door').length;
      const leverCount = (lvl.entities || []).filter(e => e.type === 'lever').length;
      const entityStr = [
        keyCount > 0 ? `🔑 ${keyCount}` : '',
        doorCount > 0 ? `🚪 ${doorCount}` : '',
        leverCount > 0 ? `🕹️ ${leverCount}` : '',
      ].filter(Boolean).join(' • ') || 'Standard Run';

      const theme = lvl.config?.theme || 'dungeon';
      const themeIcon = theme === 'jungle' ? '🌴' : (theme === 'lava' || theme === 'magma' ? '🌋' : (theme === 'temple' ? '🏛️' : (theme === 'snow' ? '❄️' : '🏰')));

      card.innerHTML = `
        <div class="official-preset-meta">
          <span class="official-preset-badge ${item.badgeClass}">${item.badge}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--text); display: flex; align-items: center; gap: 0.4rem;">
              <span>${this.escapeHtml(lvl.title)}</span>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 400;">(${item.zoneLabel})</span>
            </div>
            <div style="font-size: 0.73rem; color: var(--text-muted); margin-top: 0.15rem;">
              ${lvl.dimensions.width}×${lvl.dimensions.height} • ${themeIcon} ${theme.toUpperCase()} • ${entityStr}
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn btn-primary btn-sm btn-edit-level" title="Load this official level directly into editor to tweak and test" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;">
            ✏️ Edit Level
          </button>
          <button class="btn btn-secondary btn-sm btn-clone-remix" title="Clone this level with a new remix ID and custom copy" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;">
            📋 Clone Copy
          </button>
        </div>
      `;

      card.querySelector('.btn-edit-level').addEventListener('click', () => {
        this.loadPresetLevel(item.id, false);
        document.getElementById('projects-modal')?.classList.remove('active');
      });

      card.querySelector('.btn-clone-remix').addEventListener('click', () => {
        this.loadPresetLevel(item.id, true);
        document.getElementById('projects-modal')?.classList.remove('active');
      });

      container.appendChild(card);
    });
  }

  renderSavedProjects() {
    const savedContainer = document.getElementById('saved-projects-container');
    const nameInput = document.getElementById('project-save-name');

    if (nameInput) {
      nameInput.value = this.level.title || 'My Labyrinth';
    }

    const projects = StorageManager.listProjects();
    if (savedContainer) {
      savedContainer.innerHTML = '';
      if (projects.length === 0) {
        savedContainer.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem;">No saved projects yet. Click "Save Project" above to store your creations locally!</div>`;
      } else {
        projects.forEach(p => {
          const card = document.createElement('div');
          card.className = 'saved-project-card';
          const dateStr = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
          
          card.innerHTML = `
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--text);">${this.escapeHtml(p.title)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${p.dimensions.width}×${p.dimensions.height} • ${dateStr}</div>
            </div>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-primary btn-sm btn-load" title="Load this project into editor">Load</button>
              <button class="btn btn-secondary btn-sm btn-save-over" title="Overwrite with current working maze">Save Over</button>
              <button class="btn btn-danger btn-sm btn-delete" title="Delete project">🗑</button>
            </div>
          `;

          card.querySelector('.btn-load').addEventListener('click', () => {
            const data = StorageManager.loadProject(p.id);
            if (data) {
              this.loadLevel(data);
              this.currentProjectId = p.id;
              document.getElementById('projects-modal').classList.remove('active');
              this.showToast(`Loaded "${p.title}"`, 'success');
            }
          });

          card.querySelector('.btn-save-over').addEventListener('click', () => {
            this.level.id = p.id;
            this.level.title = p.title;
            StorageManager.saveProject(this.level);
            this.renderSavedProjects();
            this.showToast(`Overwrote project "${p.title}"!`, 'success');
          });

          card.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm(`Delete project "${p.title}"?`)) {
              StorageManager.deleteProject(p.id);
              this.renderSavedProjects();
              this.showToast(`Deleted "${p.title}"`, 'info');
            }
          });

          savedContainer.appendChild(card);
        });
      }
    }
  }

  quickSaveProject() {
    this.level.title = document.getElementById('level-title-input')?.value.trim() || this.level.title || 'My Labyrinth';
    this.level.id = this.level.id || this.currentProjectId || `project_${Date.now()}`;
    StorageManager.saveProject(this.level);
    this.autoSave();
    this.showToast(`Saved "${this.level.title}" to local browser storage!`, 'success');
  }

  createNewLevel(width, height, title) {
    this.level = LevelLoader.normalizeLevel({
      id: `project_${Date.now()}`,
      title,
      author: 'Architect',
      dimensions: { width, height },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: width - 2, y: height - 2 },
      layers: {
        ground: LevelLoader.normalizeGrid([], width, height, TILES.FLOOR),
        overhead: LevelLoader.normalizeGrid([], width, height, 0),
      },
      entities: [],
    });
    this.loadLevel(this.level);
    this.showToast(`Created new ${width}×${height} maze!`, 'success');
  }

  /* =========================================================
   * VALIDATOR MODAL & LIVE STATUS
   * ========================================================= */
  initValidationModal() {
    const modal = document.getElementById('validation-modal');
    const btnBadge = document.getElementById('btn-validate');
    const btnClose = document.getElementById('val-btn-close');
    const btnDismiss = document.getElementById('val-btn-dismiss');
    const btnRecheck = document.getElementById('val-btn-recheck');

    btnBadge?.addEventListener('click', () => this.openValidationModal());
    btnClose?.addEventListener('click', () => modal.classList.remove('active'));
    btnDismiss?.addEventListener('click', () => modal.classList.remove('active'));
    btnRecheck?.addEventListener('click', () => {
      this.updateValidationState();
      this.renderValidationModalContent();
      this.showToast('Validation refreshed!', 'info');
    });
  }

  updateValidationState() {
    const report = LevelValidator.validate(this.level);
    const badge = document.getElementById('btn-validate');
    const iconEl = document.getElementById('val-badge-icon');
    const textEl = document.getElementById('val-badge-text');

    if (!badge) return report;

    badge.classList.remove('valid', 'warning', 'error');

    if (!report.valid) {
      badge.classList.add('error');
      if (iconEl) iconEl.textContent = '❌';
      if (textEl) textEl.textContent = `${report.errors.length} Issue${report.errors.length > 1 ? 's' : ''}`;
    } else if (report.warnings.length > 0) {
      badge.classList.add('warning');
      if (iconEl) iconEl.textContent = '⚠️';
      if (textEl) textEl.textContent = `${report.warnings.length} Warn`;
    } else {
      badge.classList.add('valid');
      if (iconEl) iconEl.textContent = '✅';
      if (textEl) textEl.textContent = 'Valid';
    }

    return report;
  }

  openValidationModal() {
    const modal = document.getElementById('validation-modal');
    this.updateValidationState();
    this.renderValidationModalContent();
    modal.classList.add('active');
  }

  renderValidationModalContent() {
    const body = document.getElementById('val-modal-body');
    const title = document.getElementById('val-modal-title');
    if (!body) return;

    const report = LevelValidator.validate(this.level);

    if (title) {
      title.textContent = report.valid ? 'Level Validation Report (Passed)' : 'Level Validation Report (Issues Found)';
    }

    let html = '';

    // Summary banner
    if (report.valid && report.warnings.length === 0) {
      html += `
        <div style="background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: var(--radius-sm); padding: 0.75rem; color: var(--emerald); font-size: 0.875rem;">
          <strong>✓ All checks passed!</strong> The labyrinth is structurally sound, has a valid spawn and exit, and is 100% solvable.
        </div>
      `;
    } else if (report.valid && report.warnings.length > 0) {
      html += `
        <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: var(--radius-sm); padding: 0.75rem; color: var(--gold); font-size: 0.875rem;">
          <strong>⚠️ Solvable with warnings.</strong> The maze can be completed, but check the non-blocking notes below.
        </div>
      `;
    } else {
      html += `
        <div style="background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); border-radius: var(--radius-sm); padding: 0.75rem; color: var(--rose); font-size: 0.875rem;">
          <strong>❌ Solvability blockers detected!</strong> The maze cannot be completed in its current state. Please fix the errors below.
        </div>
      `;
    }

    // Diagnostics List
    html += `<div class="diag-list">`;

    for (const err of report.errors) {
      html += `
        <div class="diag-item error">
          <span>❌</span>
          <div style="flex: 1;">
            <div>${this.escapeHtml(err.message)}</div>
            ${err.x !== undefined ? `<div style="font-family: var(--font-mono); font-size: 0.75rem; margin-top: 0.2rem; opacity: 0.8;">Coordinate: (${err.x}, ${err.y})</div>` : ''}
          </div>
        </div>
      `;
    }

    for (const warn of report.warnings) {
      html += `
        <div class="diag-item warning">
          <span>⚠️</span>
          <div style="flex: 1;">
            <div>${this.escapeHtml(warn.message)}</div>
            ${warn.x !== undefined ? `<div style="font-family: var(--font-mono); font-size: 0.75rem; margin-top: 0.2rem; opacity: 0.8;">Coordinate: (${warn.x}, ${warn.y})</div>` : ''}
          </div>
        </div>
      `;
    }

    for (const inf of report.info) {
      html += `
        <div class="diag-item info">
          <span>ℹ️</span>
          <div>${this.escapeHtml(inf)}</div>
        </div>
      `;
    }

    html += `</div>`;
    body.innerHTML = html;
  }

  /* =========================================================
   * CORE EDITOR LOGIC & HISTORY
   * ========================================================= */
  loadLevel(levelData) {
    this.level = LevelLoader.normalizeLevel(levelData);
    this.currentProjectId = this.level.id;
    this.editorCanvas.setLevel(this.level);
    this.editorCanvas.centerInViewport();
    const titleInput = document.getElementById('level-title-input');
    if (titleInput) titleInput.value = this.level.title;
    const quickTheme = document.getElementById('quick-theme-select');
    if (quickTheme && this.level.config?.theme) quickTheme.value = this.level.config.theme;
    this.pushHistory();
    this.autoSave();
    this.updateValidationState();
  }

  playTest(customTestParams = null) {
    const report = LevelValidator.validate(this.level);
    if (!report.valid) {
      if (!confirm('⚠️ This maze has validation errors and may be unsolvable. Do you want to playtest anyway?')) {
        this.openValidationModal();
        return;
      }
    }

    const payload = JSON.parse(JSON.stringify(this.level));
    if (customTestParams) {
      if (customTestParams.testSpawn) {
        payload.testSpawn = customTestParams.testSpawn;
      }
      if (customTestParams.testInventory) {
        payload.testInventory = customTestParams.testInventory;
      }
    } else if (this.level.testSpawn) {
      payload.testSpawn = this.level.testSpawn;
    }

    StorageManager.saveCustomMaze(payload);
    window.location.href = 'maze.html?mode=custom';
  }

  /* =========================================================
   * PLAYTEST OPTIONS & INVENTORY PRELOAD MODAL
   * ========================================================= */
  initPlaytestModal() {
    const modal = document.getElementById('playtest-modal');
    const btnClose = document.getElementById('playtest-btn-close');
    const btnCancel = document.getElementById('playtest-btn-cancel');
    const btnLaunch = document.getElementById('playtest-btn-launch');
    const btnSelectAll = document.getElementById('btn-inv-select-all');
    const btnClear = document.getElementById('btn-inv-clear');

    btnClose?.addEventListener('click', () => modal?.classList.remove('active'));
    btnCancel?.addEventListener('click', () => modal?.classList.remove('active'));

    btnSelectAll?.addEventListener('click', () => {
      const chks = modal?.querySelectorAll('#test-inventory-checklist input[type="checkbox"]');
      chks?.forEach(c => { c.checked = true; });
    });

    btnClear?.addEventListener('click', () => {
      const chks = modal?.querySelectorAll('#test-inventory-checklist input[type="checkbox"]');
      chks?.forEach(c => { c.checked = false; });
    });

    btnLaunch?.addEventListener('click', () => {
      const radChoice = modal?.querySelector('input[name="test-spawn-choice"]:checked')?.value;
      let testSpawn = null;

      if (radChoice === 'custom') {
        const x = parseInt(document.getElementById('test-spawn-x')?.value, 10) || this.level.spawn?.x || 1;
        const y = parseInt(document.getElementById('test-spawn-y')?.value, 10) || this.level.spawn?.y || 1;
        const elev = parseInt(document.getElementById('test-spawn-elev')?.value, 10) || 0;
        testSpawn = { x, y, elevation: elev };
      }

      // Collect checked test inventory keys
      const testInventory = [];
      const chks = modal?.querySelectorAll('#test-inventory-checklist input[type="checkbox"]:checked');
      chks?.forEach(c => {
        testInventory.push(c.value);
      });

      modal?.classList.remove('active');
      this.playTest({ testSpawn, testInventory });
    });
  }

  openPlaytestModal() {
    const modal = document.getElementById('playtest-modal');
    if (!modal) return;

    // Set default spawn label
    const lblDefault = document.getElementById('lbl-spawn-default');
    if (lblDefault && this.level.spawn) {
      lblDefault.textContent = `(${this.level.spawn.x}, ${this.level.spawn.y}) • ${this.level.spawn.elevation === 1 ? 'Overhead' : 'Ground'}`;
    }

    // Set custom coordinates inputs
    const inputX = document.getElementById('test-spawn-x');
    const inputY = document.getElementById('test-spawn-y');
    const selElev = document.getElementById('test-spawn-elev');

    const sourceSpawn = this.level.testSpawn || this.level.spawn || { x: 1, y: 1, elevation: 0 };
    if (inputX) inputX.value = sourceSpawn.x;
    if (inputY) inputY.value = sourceSpawn.y;
    if (selElev) selElev.value = sourceSpawn.elevation || 0;

    const radCustom = document.getElementById('rad-spawn-custom');
    const radDefault = document.getElementById('rad-spawn-default');
    if (this.level.testSpawn && radCustom) {
      radCustom.checked = true;
    } else if (radDefault) {
      radDefault.checked = true;
    }

    // Render key inventory checklist
    const container = document.getElementById('test-inventory-checklist');
    if (container) {
      container.innerHTML = '';
      const existingKeys = (this.level.entities || []).filter(e => e.type === 'key');

      if (existingKeys.length === 0) {
        container.innerHTML = '<span style="font-size:0.75rem; color:var(--text-muted); padding:0.4rem;">No keys placed in labyrinth yet.</span>';
      } else {
        existingKeys.forEach(k => {
          const card = document.createElement('label');
          card.className = 'key-chk-card';
          card.innerHTML = `
            <input type="checkbox" value="${k.id}" />
            <span style="color:${k.color || '#fbbf24'};">🔑</span>
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${this.escapeHtml(k.name || k.id)}</span>
          `;
          container.appendChild(card);
        });
      }
    }

    modal.classList.add('active');
  }

  /* =========================================================
   * ARCHITECT HANDBOOK & GUIDE MODAL
   * ========================================================= */
  initGuideModal() {
    const modal = document.getElementById('guide-modal');
    const btnClose = document.getElementById('guide-btn-close');
    const btnDismiss = document.getElementById('guide-btn-dismiss');

    btnClose?.addEventListener('click', () => modal?.classList.remove('active'));
    btnDismiss?.addEventListener('click', () => modal?.classList.remove('active'));
  }

  openGuideModal() {
    const modal = document.getElementById('guide-modal');
    if (modal) {
      modal.classList.add('active');
    }
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

    this.updateUndoRedoButtons();
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.level = JSON.parse(this.history[this.historyIndex]);
      this.editorCanvas.setLevel(this.level);
      const titleInput = document.getElementById('level-title-input');
      if (titleInput) titleInput.value = this.level.title;
      this.autoSave();
      this.updateValidationState();
      this.updateUndoRedoButtons();
      this.showToast('Undo', 'info');
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.level = JSON.parse(this.history[this.historyIndex]);
      this.editorCanvas.setLevel(this.level);
      const titleInput = document.getElementById('level-title-input');
      if (titleInput) titleInput.value = this.level.title;
      this.autoSave();
      this.updateValidationState();
      this.updateUndoRedoButtons();
      this.showToast('Redo', 'info');
    }
  }

  updateUndoRedoButtons() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.disabled = this.historyIndex <= 0;
    if (btnRedo) btnRedo.disabled = this.historyIndex >= this.history.length - 1;
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

  escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
