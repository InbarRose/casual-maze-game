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
import { ProjectsModal } from './modals/projects-modal.js';
import { ValidationModal } from './modals/validation-modal.js';
import { PlaytestModal } from './modals/playtest-modal.js';
import { GuideModal } from './modals/guide-modal.js';
import { MazeGenerator } from '../core/maze-generator.js';
import { getCustomPrefabs, deleteCustomPrefab, captureLevelRegionAsPrefab } from './prefabs.js';

export class EditorUI {
  constructor() {
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;

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
    this.projectsModal = new ProjectsModal(this);
    this.validationModal = new ValidationModal(this);
    this.playtestModal = new PlaytestModal(this);
    this.guideModal = new GuideModal(this);
    this.pushHistory();
    this.updateValidationState();
    this.updateStatusBarTelemetry();

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
        this.updateStatusBarTelemetry();
      },
      onEntityClick: (entity) => {
        this.inspector.open(entity, this.level);
      },
      onObjectMoved: (type, ref, fromX, fromY, toX, toY, targetZ) => {
        this.pushHistory();
        this.autoSave();
        this.updateValidationState();
        this.updateStatusBarTelemetry();
        const z = targetZ ?? (this.editorCanvas.activeLayer === 'overhead' ? 1 : 0);
        const objName = ref?.name || (type === 'spawn' ? 'Spawn Point' : (type === 'test_spawn' ? 'Test Spawn' : (type === 'exit' ? 'Exit Portal' : 'Object')));
        this.showToast(`Relocated ${objName} to (${toX}, ${toY}, ${z})!`, 'success');
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
        this.showToast(`Linked lever to (${targetX}, ${targetY}, ${layer === 'overhead' ? 1 : 0}) on ${layer}!`, 'success');
      },
      onHoverCoord: (gx, gy, gz) => {
        const coordEl = document.getElementById('status-coord');
        if (coordEl) {
          const { width, height } = this.level.dimensions;
          const z = gz ?? (this.editorCanvas.activeLayer === 'overhead' ? 1 : 0);
          if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
            const tile = this.level.layers[this.editorCanvas.activeLayer]?.[gy]?.[gx];
            const elevLabel = z === 1 ? 'Overhead' : (z === -1 ? 'Basement' : 'Ground');
            coordEl.textContent = `(X: ${gx}, Y: ${gy}, Z: ${z}) [${elevLabel}] • Tile: ${tile ?? 'Empty'}`;
          } else {
            coordEl.textContent = `(X: --, Y: --, Z: ${z})`;
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
        this.updateStatusBarTelemetry();
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
      titleInput.addEventListener('change', () => {
        this.pushHistory();
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

    // 3. Layer Switcher Tabs & Floating HUD (BL-22)
    const tabGround = document.getElementById('tab-layer-ground');
    const tabOverhead = document.getElementById('tab-layer-overhead');
    const statusLayer = document.getElementById('status-layer');
    const hudIndicator = document.getElementById('layer-hud-indicator');
    const hudTitle = document.getElementById('layer-hud-title');
    const btnHudGround = document.getElementById('btn-hud-ground');
    const btnHudOverhead = document.getElementById('btn-hud-overhead');

    const setLayer = (layer) => {
      tabGround?.classList.toggle('active', layer === LAYERS.GROUND);
      tabOverhead?.classList.toggle('active', layer === LAYERS.OVERHEAD);
      btnHudGround?.classList.toggle('active', layer === LAYERS.GROUND);
      btnHudOverhead?.classList.toggle('active', layer === LAYERS.OVERHEAD);

      if (hudIndicator) {
        hudIndicator.className = `layer-hud-indicator ${layer === LAYERS.OVERHEAD ? 'overhead' : 'ground'}`;
      }
      if (hudTitle) {
        hudTitle.textContent = layer === LAYERS.OVERHEAD ? 'Overhead (Z=1)' : 'Ground (Z=0)';
      }

      this.editorCanvas.setActiveLayer(layer);
      const z = layer === LAYERS.OVERHEAD ? 1 : 0;
      if (statusLayer) {
        statusLayer.innerHTML = `<span class="status-pip ${layer === LAYERS.OVERHEAD ? 'overhead' : 'ground'}">●</span> Layer: ${layer.toUpperCase()}`;
      }
      console.info(`[MazeGame:Editor] Active layer switched to "${layer.toUpperCase()}" (Z-Level: ${z})`);
    };

    tabGround?.addEventListener('click', () => setLayer(LAYERS.GROUND));
    tabOverhead?.addEventListener('click', () => setLayer(LAYERS.OVERHEAD));
    btnHudGround?.addEventListener('click', () => setLayer(LAYERS.GROUND));
    btnHudOverhead?.addEventListener('click', () => setLayer(LAYERS.OVERHEAD));

    // Floating HUD View Mode Buttons (Focus / All / Solo)
    const btnHudFocus = document.getElementById('btn-hud-view-focus');
    const btnHudAll = document.getElementById('btn-hud-view-all');
    const btnHudSolo = document.getElementById('btn-hud-view-solo');

    const setLayerViewMode = (mode) => {
      btnHudFocus?.classList.toggle('active', mode === 'focus');
      btnHudAll?.classList.toggle('active', mode === 'all');
      btnHudSolo?.classList.toggle('active', mode === 'solo');
      this.editorCanvas.setLayerViewMode(mode);
      console.info(`[MazeGame:Editor] Layer view mode set to "${mode}"`);
    };

    btnHudFocus?.addEventListener('click', () => setLayerViewMode('focus'));
    btnHudAll?.addEventListener('click', () => setLayerViewMode('all'));
    btnHudSolo?.addEventListener('click', () => setLayerViewMode('solo'));

    // 4. Palette Buttons Binding (BL-20 Architectural Prefabs included)
    const paletteButtons = document.querySelectorAll(
      '.palette-btn[data-tool], .palette-btn[data-tile], .palette-btn[data-entity], .palette-btn[data-prefab]'
    );
    paletteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        paletteButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tool = btn.dataset.tool;
        const tile = btn.dataset.tile;
        const entity = btn.dataset.entity;
        const prefab = btn.dataset.prefab;
        const color = btn.dataset.color;
        const name = btn.dataset.name;
        const symbol = btn.dataset.symbol;
        const itemType = btn.dataset.itemtype;
        const style = btn.dataset.style;

        if (tool) {
          this.editorCanvas.setTool(tool);
          this.editorCanvas.selectedEntity = null;
          this.editorCanvas.selectedPrefab = null;
          console.info(`[MazeGame:Editor] Active draw tool: "${tool.toUpperCase()}"`);
        } else if (tile !== undefined) {
          const parsedTile = !isNaN(Number(tile)) ? Number(tile) : tile;
          this.editorCanvas.setSelectedTile(parsedTile);
          this.editorCanvas.selectedPrefab = null;
          console.info(`[MazeGame:Editor] Selected tile for painting: "${parsedTile}"`);
        } else if (entity) {
          const entityData = { color, name, symbol, itemType, style };
          this.editorCanvas.setSelectedEntity(entity, entityData);
          this.editorCanvas.selectedPrefab = null;
          console.info(`[MazeGame:Editor] Selected entity for placement: "${entity}" (${name || symbol || color || 'Default'})`);
        } else if (prefab) {
          this.editorCanvas.setPrefab(prefab);
          console.info(`[MazeGame:Editor] Selected architectural prefab for stamping: "${prefab}"`);
          this.showToast(`Selected "${btn.textContent.trim()}" prefab. Click canvas to stamp!`, 'info', 1500);
        }
      });
    });

    // 5. Header Actions
    document.getElementById('btn-auto-fix')?.addEventListener('click', () => {
      console.info('[MazeGame:Editor] Auto-fix action clicked');
      this.runAutoFix();
    });

    // Procedural Maze Generator (BL-50)
    document.getElementById('btn-generate-maze')?.addEventListener('click', () => {
      this.openGeneratorModal();
    });
    document.getElementById('generator-btn-close')?.addEventListener('click', () => {
      this.closeGeneratorModal();
    });
    document.getElementById('generator-btn-cancel')?.addEventListener('click', () => {
      this.closeGeneratorModal();
    });
    document.getElementById('generator-btn-submit')?.addEventListener('click', () => {
      this.generateProceduralMaze();
    });

    // Custom Prefab Palette & Capture Modal (BL-39)
    this.renderCustomPrefabs();
    document.getElementById('btn-open-save-prefab')?.addEventListener('click', () => {
      this.openSavePrefabModal();
    });
    document.getElementById('save-prefab-btn-close')?.addEventListener('click', () => {
      this.closeSavePrefabModal();
    });
    document.getElementById('save-prefab-btn-cancel')?.addEventListener('click', () => {
      this.closeSavePrefabModal();
    });
    document.getElementById('save-prefab-btn-submit')?.addEventListener('click', () => {
      this.saveCustomPrefabFromModal();
    });

    document.querySelectorAll('.gen-size-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gen-size-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const w = btn.dataset.w;
        const h = btn.dataset.h;
        const wInput = document.getElementById('gen-width');
        const hInput = document.getElementById('gen-height');
        if (wInput) wInput.value = w;
        if (hInput) hInput.value = h;
      });
    });

    const braidSlider = document.getElementById('gen-braid');
    const braidVal = document.getElementById('gen-braid-val');
    braidSlider?.addEventListener('input', () => {
      if (braidVal) braidVal.textContent = `${braidSlider.value}%`;
    });

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
      const filename = JsonExporter.exportToFile(this.level);
      this.showToast(`📥 Exported ${filename} (saved to Downloads folder)!`, 'success');
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

    // Clear / Reset (Inline Confirmation BL-64, BL-73)
    const clearModal = document.getElementById('modal-clear-confirm');
    const clearProceedBtn = document.getElementById('clear-confirm-btn-proceed');
    const clearCancelBtn = document.getElementById('clear-confirm-btn-cancel');
    const clearCloseBtn = document.getElementById('clear-confirm-btn-close');

    const executeClear = () => {
      const { width, height } = this.level.dimensions;
      this.level.layers.ground = LevelLoader.normalizeGrid([], width, height, TILES.FLOOR);
      this.level.layers.overhead = LevelLoader.normalizeGrid([], width, height, 0);
      this.level.entities = [];
      console.warn(`[MazeGame:Editor] Labyrinth canvas cleared to empty floor (${width}x${height})`);
      this.pushHistory();
      this.autoSave();
      this.updateValidationState();
      this.editorCanvas.render();
      if (clearModal) clearModal.style.display = 'none';
      this.showToast('Labyrinth cleared to empty floor.', 'info');
    };

    document.getElementById('btn-clear')?.addEventListener('click', () => {
      if (clearModal) {
        clearModal.style.display = 'flex';
      } else if (typeof confirm === 'function' && confirm('Are you sure you want to reset the maze to empty floor?')) {
        executeClear();
      }
    });

    clearProceedBtn?.addEventListener('click', executeClear);
    clearCancelBtn?.addEventListener('click', () => {
      if (clearModal) clearModal.style.display = 'none';
    });
    clearCloseBtn?.addEventListener('click', () => {
      if (clearModal) clearModal.style.display = 'none';
    });

    // Playtest Unsolvable Warning Modal (BL-75)
    const playtestConfirmModal = document.getElementById('modal-playtest-confirm');
    const playtestProceedBtn = document.getElementById('playtest-confirm-btn-proceed');
    const playtestIssuesBtn = document.getElementById('playtest-confirm-btn-issues');
    const playtestCloseBtn = document.getElementById('playtest-confirm-btn-close');

    playtestIssuesBtn?.addEventListener('click', () => {
      if (playtestConfirmModal) playtestConfirmModal.style.display = 'none';
      this.openValidationModal();
    });
    playtestCloseBtn?.addEventListener('click', () => {
      if (playtestConfirmModal) playtestConfirmModal.style.display = 'none';
    });
    playtestProceedBtn?.addEventListener('click', () => {
      if (playtestConfirmModal) playtestConfirmModal.style.display = 'none';
      this.executePlayTest(this.pendingPlayTestParams);
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
      this.updateMiniMap();
      console.info(`[MazeGame:Editor] Zoom In: ${Math.round(this.editorCanvas.zoom * 100)}%`);
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.editorCanvas.setZoom(this.editorCanvas.zoom / 1.25);
      this.updateZoomBadge();
      this.updateMiniMap();
      console.info(`[MazeGame:Editor] Zoom Out: ${Math.round(this.editorCanvas.zoom * 100)}%`);
    });
    document.getElementById('btn-zoom-fit')?.addEventListener('click', () => {
      this.editorCanvas.zoomToFit();
      this.updateZoomBadge();
      this.updateMiniMap();
      console.info(`[MazeGame:Editor] Zoom to Fit: ${Math.round(this.editorCanvas.zoom * 100)}%`);
    });
    this.updateZoomBadge();

    // Accordion Tool Palette Collapsible Headers (BL-104)
    document.querySelectorAll('.sidebar-accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const accordion = header.closest('.sidebar-accordion');
        if (accordion) {
          accordion.classList.toggle('active');
        }
      });
    });

    // Interactive Floating Mini-Map Overview HUD (BL-103)
    this.initMiniMap();

    // 2D / 2.5D Perspective Controls (BL-110)
    this.initPerspectiveControls();

    // Sidebar Category Navigation & Live Search (BL-110)
    this.initSidebarCategoryAndSearch();
  }

  /**
   * Initialize interactive mini-map HUD and events (BL-103, BL-110)
   */
  initMiniMap() {
    const miniHud = document.getElementById('editor-minimap-hud');
    const miniCanvas = document.getElementById('editor-minimap-canvas');
    const btnToggle = document.getElementById('btn-toggle-minimap');

    if (btnToggle && miniHud) {
      btnToggle.addEventListener('click', () => {
        miniHud.classList.toggle('minimized');
        const isMin = miniHud.classList.contains('minimized');
        btnToggle.textContent = isMin ? '▲' : '−';
        btnToggle.title = isMin ? 'Expand Mini-Map Overview [_]' : 'Collapse Mini-Map Overview [_]';
      });
    }

    if (miniCanvas) {
      let isMiniMouseDown = false;

      const handleMiniNav = (e) => {
        if (!this.editorCanvas) return;
        this.editorCanvas.handleMiniMapNavigation(e.clientX, e.clientY, miniCanvas);
        this.updateMiniMap();
      };

      miniCanvas.addEventListener('mousedown', (e) => {
        isMiniMouseDown = true;
        handleMiniNav(e);
      });

      window.addEventListener('mousemove', (e) => {
        if (isMiniMouseDown) {
          handleMiniNav(e);
        }
      });

      window.addEventListener('mouseup', () => {
        if (isMiniMouseDown) {
          isMiniMouseDown = false;
        }
      });
    }

    this.updateMiniMap();
  }

  /**
   * Refresh mini-map overview render pass (BL-103)
   */
  updateMiniMap() {
    const miniCanvas = document.getElementById('editor-minimap-canvas');
    if (miniCanvas && this.editorCanvas) {
      this.editorCanvas.renderMiniMap(miniCanvas);
    }
  }

  /**
   * Initialize 2D / 2.5D Perspective Switcher (BL-110)
   */
  initPerspectiveControls() {
    const btnPerspective = document.getElementById('btn-perspective');
    const btnHudPerspective = document.getElementById('btn-hud-perspective');

    btnPerspective?.addEventListener('click', () => {
      this.togglePerspective();
    });

    btnHudPerspective?.addEventListener('click', () => {
      this.togglePerspective();
    });

    this.updatePerspectiveUI(this.editorCanvas?.getPerspective?.() || '2d');
  }

  /**
   * Toggle editor perspective between 2D and 2.5D (BL-110)
   */
  togglePerspective() {
    if (!this.editorCanvas) return;
    const newMode = this.editorCanvas.togglePerspective();
    this.updatePerspectiveUI(newMode);
    const label = newMode === '2.5d' ? '2.5D Angled View' : '2D Blueprint View';
    this.showToast(`Switched to ${label}`, 'info', 1500);
    console.info(`[MazeGame:Editor] View perspective toggled to "${newMode}"`);
  }

  /**
   * Update Perspective UI indicators across HUD, buttons, and status bar (BL-110)
   * @param {'2d'|'2.5d'} mode
   */
  updatePerspectiveUI(mode) {
    const is25D = mode === '2.5d';
    const btnPerspective = document.getElementById('btn-perspective');
    const btnHudPerspective = document.getElementById('btn-hud-perspective');
    const labelEl = document.getElementById('perspective-label');
    const statusPerspective = document.getElementById('status-perspective');

    if (btnPerspective) {
      btnPerspective.classList.toggle('active', is25D);
      btnPerspective.title = is25D
        ? 'Current: 2.5D Angled View (Click or Press 3 for 2D Blueprint)'
        : 'Current: 2D Blueprint View (Click or Press 3 for 2.5D Angled)';
    }

    if (labelEl) {
      labelEl.textContent = is25D ? '2.5D' : '2D';
    }

    if (btnHudPerspective) {
      btnHudPerspective.classList.toggle('active', is25D);
      btnHudPerspective.textContent = is25D ? '📐 2.5D' : '📐 2D';
    }

    if (statusPerspective) {
      statusPerspective.textContent = is25D ? '📐 Mode: 2.5D Angled' : '📐 Mode: 2D Blueprint';
    }
  }

  /**
   * Initialize sidebar category navigation pills and real-time asset search (BL-110)
   */
  initSidebarCategoryAndSearch() {
    const categoryPills = document.querySelectorAll('#sidebar-category-nav .category-pill');
    const searchInput = document.getElementById('sidebar-asset-search');
    const clearBtn = document.getElementById('btn-clear-asset-search');
    const accordions = document.querySelectorAll('.sidebar-accordion');

    // 1. Category Filtering
    const filterCategory = (category) => {
      categoryPills.forEach(p => p.classList.toggle('active', p.dataset.category === category));

      accordions.forEach(acc => {
        const accType = acc.dataset.accordion;
        let visible = false;
        let shouldOpen = false;

        if (category === 'all') {
          visible = true;
          // In 'all' mode, tools and tiles open, others collapsed
          shouldOpen = (accType === 'tools' || accType === 'tiles');
        } else if (category === 'tools') {
          visible = (accType === 'tools');
          shouldOpen = true;
        } else if (category === 'tiles') {
          visible = (accType === 'tiles' || accType === 'ramps');
          shouldOpen = true;
        } else if (category === 'prefabs') {
          visible = (accType === 'prefabs' || accType === 'custom-prefabs');
          shouldOpen = true;
        } else if (category === 'entities') {
          visible = (accType === 'entities');
          shouldOpen = true;
        }

        acc.style.display = visible ? '' : 'none';
        if (visible && shouldOpen) {
          acc.classList.add('active');
        }
      });
    };

    categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterCategory(pill.dataset.category);
        if (searchInput) searchInput.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
      });
    });

    // 2. Real-Time Search Filter
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

        if (!query) {
          // Restore active category view
          const activePill = document.querySelector('#sidebar-category-nav .category-pill.active');
          filterCategory(activePill?.dataset.category || 'all');
          return;
        }

        // Search mode: show all accordions containing matches and filter palette buttons
        accordions.forEach(acc => {
          const buttons = acc.querySelectorAll('.palette-btn');
          let matchCount = 0;

          buttons.forEach(btn => {
            const text = (btn.textContent || '').toLowerCase();
            const tool = (btn.dataset.tool || '').toLowerCase();
            const tile = (btn.dataset.tile || '').toLowerCase();
            const entity = (btn.dataset.entity || '').toLowerCase();
            const prefab = (btn.dataset.prefab || '').toLowerCase();
            const name = (btn.dataset.name || '').toLowerCase();
            const itemType = (btn.dataset.itemtype || '').toLowerCase();
            const title = (btn.getAttribute('title') || '').toLowerCase();

            const isMatch = text.includes(query) || tool.includes(query) || tile.includes(query) ||
              entity.includes(query) || prefab.includes(query) || name.includes(query) ||
              itemType.includes(query) || title.includes(query);

            if (isMatch) {
              btn.style.display = '';
              matchCount++;
            } else {
              btn.style.display = 'none';
            }
          });

          // Show & expand accordion if it has matches
          if (matchCount > 0) {
            acc.style.display = '';
            acc.classList.add('active');
          } else {
            acc.style.display = 'none';
          }
        });
      });

      clearBtn?.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        const activePill = document.querySelector('#sidebar-category-nav .category-pill.active');
        filterCategory(activePill?.dataset.category || 'all');
        // Restore all button displays
        document.querySelectorAll('.palette-btn').forEach(b => b.style.display = '');
        searchInput.focus();
      });
    }
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
      } else if (e.key === '3') {
        this.togglePerspective();
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
  openProjectsModal() {
    this.projectsModal.open();
  }

  renderProjectsModalContent() {
    this.projectsModal.renderProjectsModalContent();
  }

  renderOfficialPresets(filterCategory = 'all', searchTerm = '') {
    this.projectsModal.renderOfficialPresets(filterCategory, searchTerm);
  }

  renderSavedProjects() {
    this.projectsModal.renderSavedProjects();
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
  openValidationModal() {
    this.validationModal.open();
  }

  updateValidationState() {
    return this.validationModal.updateValidationState();
  }

  renderValidationModalContent() {
    this.validationModal.renderValidationModalContent();
  }

  /**
   * Focus viewport on diagnostic issue coordinates with pulsing pin (BL-75)
   * @param {number} x
   * @param {number} y
   * @param {number} [z=0]
   * @param {string} [message='']
   * @param {'error'|'warning'} [type='error']
   */
  jumpToCoordinate(x, y, z = 0, message = '', type = 'error') {
    // 1. Switch active layer if necessary
    if (z === 1 && this.currentLayer !== LAYERS.OVERHEAD) {
      this.setLayer(LAYERS.OVERHEAD);
    } else if (z === 0 && this.currentLayer !== LAYERS.GROUND) {
      this.setLayer(LAYERS.GROUND);
    }

    // 2. Center viewport on tile
    this.editorCanvas.centerOnTile(x, y);

    // 3. Set diagnostic issue pin beacon
    this.editorCanvas.setDiagnosticPin({ x, y, z, message, type });

    // 4. Play acoustic jump pip sound if available (BL-77)
    try {
      if (typeof audioFX !== 'undefined' && audioFX.playDiagnosticJump) {
        audioFX.playDiagnosticJump();
      }
    } catch (_) {}

    // 5. Close validation modal
    this.validationModal.close();

    // 6. Show toast notification
    const zLabel = z === 1 ? 'Overhead' : 'Ground';
    this.showToast(`📍 Focused on issue at (${x}, ${y}) [${zLabel}]`, 'info', 3000);
  }

  runAutoFix() {
    const { fixedLevel, changes, fixedCount } = LevelValidator.autoFix(this.level);
    if (fixedCount === 0) {
      this.showToast('No issues detected! Labyrinth is already structurally sound.', 'info');
      return;
    }

    this.level = fixedLevel;
    this.editorCanvas.setLevel(this.level);
    this.pushHistory();
    this.autoSave();
    this.updateValidationState();
    this.editorCanvas.render();

    console.info(`[MazeGame:Editor] One-click auto-fix applied ${fixedCount} repair(s):\n${changes.map(c => `• ${c}`).join('\n')}`);
    this.showToast(`🪄 Auto-fixed ${fixedCount} issue${fixedCount > 1 ? 's' : ''}!`, 'success', 3500);

    // Refresh validation modal if currently open
    if (document.getElementById('validation-modal')?.classList.contains('active')) {
      this.renderValidationModalContent();
    }
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
    this.updateStatusBarTelemetry();
  }

  /**
   * Update live AAA telemetry indicators in bottom status bar (BL-102)
   */
  updateStatusBarTelemetry() {
    const sizeEl = document.getElementById('status-grid-size');
    if (sizeEl && this.level?.dimensions) {
      sizeEl.textContent = `📐 ${this.level.dimensions.width}×${this.level.dimensions.height}`;
    }

    const entEl = document.getElementById('status-entity-count');
    if (entEl && this.level) {
      const count = (this.level.entities || []).length;
      entEl.textContent = `📦 ${count} Entit${count === 1 ? 'y' : 'ies'}`;
    }

    this.updateMiniMap();
  }

  playTest(customTestParams = null) {
    const report = LevelValidator.validate(this.level);
    if (!report.valid) {
      const playtestModal = document.getElementById('modal-playtest-confirm');
      if (playtestModal) {
        this.pendingPlayTestParams = customTestParams;
        playtestModal.style.display = 'flex';
        return;
      }
    }

    this.executePlayTest(customTestParams);
  }

  executePlayTest(customTestParams = null) {
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
  openPlaytestModal() {
    this.playtestModal.open();
  }

  /* =========================================================
   * ARCHITECT HANDBOOK & GUIDE MODAL
   * ========================================================= */
  openGuideModal() {
    this.guideModal.open();
  }

  /* =========================================================
   * PROCEDURAL MAZE GENERATOR (BL-50)
   * ========================================================= */
  openGeneratorModal() {
    const modal = document.getElementById('modal-maze-generator');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  closeGeneratorModal() {
    const modal = document.getElementById('modal-maze-generator');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  generateProceduralMaze() {
    const widthInput = document.getElementById('gen-width');
    const heightInput = document.getElementById('gen-height');
    const themeSelect = document.getElementById('gen-theme');
    const braidSlider = document.getElementById('gen-braid');
    const keysSelect = document.getElementById('gen-keys');

    const width = parseInt(widthInput?.value, 10) || 17;
    const height = parseInt(heightInput?.value, 10) || 17;
    const theme = themeSelect?.value || 'dungeon';
    const braid = (parseInt(braidSlider?.value, 10) || 25) / 100;
    const keyPairs = parseInt(keysSelect?.value, 10) || 1;

    if (this.historyIndex > 0 && typeof confirm === 'function') {
      if (!confirm('⚠️ Generating a new labyrinth will replace your current editor changes. Continue?')) {
        return;
      }
    }

    try {
      const generated = MazeGenerator.generate({
        width,
        height,
        theme,
        braid,
        keyPairs,
      });

      this.loadLevel(generated);
      this.pushHistory();
      this.autoSave();
      this.closeGeneratorModal();

      this.showToast(`⚡ Generated ${generated.dimensions.width}×${generated.dimensions.height} solvable ${generated.config.theme} labyrinth!`, 'success');
      console.info(`[MazeGame:Editor] Generated procedural level "${generated.title}" (${generated.dimensions.width}x${generated.dimensions.height})`);
    } catch (err) {
      console.error('[MazeGame:Editor] Procedural generation error:', err);
      this.showToast('Failed to generate maze: ' + (err.message || err), 'error');
    }
  }

  renderCustomPrefabs() {
    const container = document.getElementById('custom-prefab-palette');
    if (!container) return;
    container.innerHTML = '';

    const customPrefabs = getCustomPrefabs();
    if (customPrefabs.length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.style.cssText = 'font-size: 0.72rem; color: var(--text-muted); padding: 6px; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-sm);';
      emptyNote.textContent = 'No custom prefabs yet. Click "Save Region" to create one.';
      container.appendChild(emptyNote);
      return;
    }

    customPrefabs.forEach((p) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; gap: 4px; align-items: center; width: 100%;';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'palette-btn custom-prefab-btn';
      btn.dataset.prefab = p.id;
      btn.title = `${p.name} (${p.width}×${p.height})`;
      btn.style.cssText = 'flex: 1; text-align: left; padding: 4px 8px; font-size: 0.75rem; display: flex; align-items: center; gap: 6px; overflow: hidden;';
      btn.innerHTML = `<span class="palette-icon" style="font-size: 0.9rem;">📦</span> <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${this.escapeHtml(p.name)}</span> <span style="font-size: 0.65rem; color: var(--text-muted);">${p.width}×${p.height}</span>`;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.editorCanvas.setPrefab(p.id);
        console.info(`[MazeGame:Editor] Selected custom prefab for stamping: "${p.id}"`);
        this.showToast(`Selected "${p.name}" (${p.width}×${p.height}). Click canvas to stamp!`, 'info', 1500);
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn-secondary btn-xs';
      delBtn.title = `Delete ${p.name}`;
      delBtn.style.cssText = 'padding: 2px 6px; color: var(--danger, #f43f5e); font-size: 0.7rem;';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof confirm === 'function' && !confirm(`⚠️ Are you sure you want to delete custom prefab "${p.name}"?`)) {
          return;
        }
        deleteCustomPrefab(p.id);
        this.renderCustomPrefabs();
        this.showToast(`Deleted custom prefab "${p.name}"`, 'info');
      });

      row.appendChild(btn);
      row.appendChild(delBtn);
      container.appendChild(row);
    });
  }

  openSavePrefabModal() {
    const modal = document.getElementById('modal-save-prefab');
    if (!modal) return;

    const maxW = this.level.dimensions.width;
    const maxH = this.level.dimensions.height;
    const defaultW = Math.min(5, maxW);
    const defaultH = Math.min(5, maxH);

    const nameInput = document.getElementById('prefab-capture-name');
    const xInput = document.getElementById('prefab-capture-x');
    const yInput = document.getElementById('prefab-capture-y');
    const wInput = document.getElementById('prefab-capture-w');
    const hInput = document.getElementById('prefab-capture-h');

    if (nameInput) nameInput.value = 'Custom Module';
    if (xInput) { xInput.value = 0; xInput.max = maxW - 1; }
    if (yInput) { yInput.value = 0; yInput.max = maxH - 1; }
    if (wInput) { wInput.value = defaultW; wInput.max = maxW; }
    if (hInput) { hInput.value = defaultH; hInput.max = maxH; }

    modal.style.display = 'flex';
  }

  closeSavePrefabModal() {
    const modal = document.getElementById('modal-save-prefab');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  saveCustomPrefabFromModal() {
    const nameInput = document.getElementById('prefab-capture-name');
    const xInput = document.getElementById('prefab-capture-x');
    const yInput = document.getElementById('prefab-capture-y');
    const wInput = document.getElementById('prefab-capture-w');
    const hInput = document.getElementById('prefab-capture-h');

    const name = nameInput?.value?.trim() || 'Custom Module';
    const x = Math.max(0, parseInt(xInput?.value, 10) || 0);
    const y = Math.max(0, parseInt(yInput?.value, 10) || 0);
    const w = Math.max(1, Math.min(this.level.dimensions.width - x, parseInt(wInput?.value, 10) || 5));
    const h = Math.max(1, Math.min(this.level.dimensions.height - y, parseInt(hInput?.value, 10) || 5));

    try {
      const saved = captureLevelRegionAsPrefab(this.level, name, x, y, w, h);
      this.closeSavePrefabModal();
      this.renderCustomPrefabs();

      // Automatically select newly created custom prefab for immediate stamping
      this.editorCanvas.setPrefab(saved.id);
      const activeBtn = document.querySelector(`.custom-prefab-btn[data-prefab="${saved.id}"]`);
      if (activeBtn) {
        document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');
      }

      this.showToast(`💾 Saved custom prefab "${saved.name}" (${saved.width}×${saved.height})!`, 'success');
      console.info(`[MazeGame:Editor] Saved custom prefab "${saved.name}" from (${x}, ${y}, ${w}x${h})`);
    } catch (err) {
      console.error('[MazeGame:Editor] Failed to save custom prefab:', err);
      this.showToast('Failed to save prefab: ' + (err.message || err), 'error');
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

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  getHistoryState() {
    return {
      index: this.historyIndex,
      count: this.history.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }

  clearHistory() {
    this.history = [];
    this.historyIndex = -1;
    this.pushHistory();
  }

  undo() {
    if (this.canUndo()) {
      this.historyIndex--;
      this.applyHistorySnapshot(this.history[this.historyIndex]);
      this.showToast('Undo', 'info');
    }
  }

  redo() {
    if (this.canRedo()) {
      this.historyIndex++;
      this.applyHistorySnapshot(this.history[this.historyIndex]);
      this.showToast('Redo', 'info');
    }
  }

  applyHistorySnapshot(snapshotJson) {
    this.level = JSON.parse(snapshotJson);
    this.editorCanvas.setLevel(this.level);
    this.editorCanvas.centerInViewport();

    // Synchronize UI inputs and selects with restored level state
    const titleInput = document.getElementById('level-title-input');
    if (titleInput) titleInput.value = this.level.title || 'Untitled Labyrinth';

    const quickTheme = document.getElementById('quick-theme-select');
    if (quickTheme && this.level.config?.theme) {
      quickTheme.value = this.level.config.theme;
    }
    const setTheme = document.getElementById('set-theme');
    if (setTheme && this.level.config?.theme) {
      setTheme.value = this.level.config.theme;
    }

    const setW = document.getElementById('set-width');
    if (setW && this.level.dimensions?.width) {
      setW.value = this.level.dimensions.width;
    }
    const setH = document.getElementById('set-height');
    if (setH && this.level.dimensions?.height) {
      setH.value = this.level.dimensions.height;
    }

    this.autoSave();
    this.updateValidationState();
    this.updateUndoRedoButtons();
    this.updateZoomBadge();
  }

  updateUndoRedoButtons() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) {
      btnUndo.disabled = !this.canUndo();
      btnUndo.setAttribute('aria-disabled', String(!this.canUndo()));
    }
    if (btnRedo) {
      btnRedo.disabled = !this.canRedo();
      btnRedo.setAttribute('aria-disabled', String(!this.canRedo()));
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

  escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
