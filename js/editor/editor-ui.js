/**
 * Level Editor Main Controller & UI Bindings
 */

import { TILES, LAYERS, DEFAULTS } from '../core/constants.js';
import { StorageManager } from '../core/storage.js';
import { LevelLoader } from '../levels/level-loader.js';
import { CAMPAIGN_LEVELS } from '../levels/default-levels.js';
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

    this.initCanvas();
    this.initInspector();
    this.initUI();
    this.initKeyboardShortcuts();
    this.initProjectsModal();
    this.initValidationModal();
    this.pushHistory();
    this.updateValidationState();
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
    document.getElementById('btn-playtest')?.addEventListener('click', () => this.playTest());
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const report = LevelValidator.validate(this.level);
      if (!report.valid) {
        if (!confirm('⚠️ This maze currently has validation errors. Do you still want to export?')) {
          this.openValidationModal();
          return;
        }
      }
      JsonExporter.exportToFile(this.level);
    });

    document.getElementById('btn-copy-json')?.addEventListener('click', async () => {
      const ok = await JsonExporter.copyToClipboard(this.level);
      this.showToast(ok ? 'JSON copied to clipboard!' : 'Failed to copy', ok ? 'success' : 'error');
    });

    // Quick Save button
    document.getElementById('btn-save-project')?.addEventListener('click', () => {
      this.quickSaveProject();
    });

    // Import file
    const fileInput = document.getElementById('editor-file-input');
    document.getElementById('btn-import-json')?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', async (e) => {
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
    document.getElementById('btn-undo')?.addEventListener('click', () => this.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => this.redo());

    // Clear / Reset
    document.getElementById('btn-clear')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the maze to empty floor?')) {
        const { width, height } = this.level.dimensions;
        this.level.layers.ground = LevelLoader.normalizeGrid([], width, height, TILES.FLOOR);
        this.level.layers.overhead = LevelLoader.normalizeGrid([], width, height, 0);
        this.level.entities = [];
        this.pushHistory();
        this.autoSave();
        this.updateValidationState();
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
      } else if (e.key.toLowerCase() === 'f') {
        this.selectToolBtn('fill');
      } else if (e.key.toLowerCase() === 'e') {
        this.selectToolBtn('eraser');
      } else if (e.key.toLowerCase() === 's') {
        this.selectToolBtn('select');
      } else if (e.key === '1') {
        document.getElementById('tab-layer-ground')?.click();
      } else if (e.key === '2') {
        document.getElementById('tab-layer-overhead')?.click();
      } else if (e.key.toLowerCase() === 'v') {
        this.openValidationModal();
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

    btnOpen?.addEventListener('click', () => {
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

    btnClose?.addEventListener('click', () => modal.classList.remove('active'));

    btnSave?.addEventListener('click', () => {
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
      this.updateValidationState();
      this.editorCanvas.render();
      modal.classList.remove('active');
      this.showToast('Level properties saved!', 'success');
    });
  }

  /* =========================================================
   * PROJECTS & TEMPLATES SYSTEM
   * ========================================================= */
  initProjectsModal() {
    const modal = document.getElementById('projects-modal');
    const btnOpen = document.getElementById('btn-projects');
    const btnClose = document.getElementById('projects-btn-close');
    const btnSaveAs = document.getElementById('btn-save-as-project');

    btnOpen?.addEventListener('click', () => {
      this.renderProjectsModalContent();
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
    const savedContainer = document.getElementById('saved-projects-container');
    const templatesContainer = document.getElementById('campaign-templates-container');
    const nameInput = document.getElementById('project-save-name');

    if (nameInput) {
      nameInput.value = this.level.title || 'My Labyrinth';
    }

    // 1. Render Saved Projects
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
            this.renderProjectsModalContent();
            this.showToast(`Overwrote project "${p.title}"!`, 'success');
          });

          card.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm(`Delete project "${p.title}"?`)) {
              StorageManager.deleteProject(p.id);
              this.renderProjectsModalContent();
              this.showToast(`Deleted "${p.title}"`, 'info');
            }
          });

          savedContainer.appendChild(card);
        });
      }
    }

    // 2. Render Campaign Starter Templates
    if (templatesContainer) {
      templatesContainer.innerHTML = '';
      CAMPAIGN_LEVELS.forEach(lvl => {
        const tCard = document.createElement('div');
        tCard.className = 'template-card';
        tCard.innerHTML = `
          <div style="font-family: var(--font-mono); font-weight: 700; font-size: 0.9rem; color: var(--accent);">L${lvl.id}</div>
          <div style="font-size: 0.75rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.escapeHtml(lvl.title)}</div>
        `;
        tCard.title = `Remix Level ${lvl.id}: ${lvl.title}`;
        tCard.addEventListener('click', () => {
          if (confirm(`Load Level ${lvl.id} (${lvl.title}) as a template into the editor?`)) {
            const template = JSON.parse(JSON.stringify(lvl));
            template.id = `remix_lvl_${lvl.id}_${Date.now()}`;
            template.title = `${lvl.title} (Remix)`;
            this.loadLevel(template);
            document.getElementById('projects-modal').classList.remove('active');
            this.showToast(`Loaded template "${lvl.title}"!`, 'success');
          }
        });
        templatesContainer.appendChild(tCard);
      });
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
    this.pushHistory();
    this.autoSave();
    this.updateValidationState();
  }

  playTest() {
    const report = LevelValidator.validate(this.level);
    if (!report.valid) {
      if (!confirm('⚠️ This maze has validation errors and may be unsolvable. Do you want to playtest anyway?')) {
        this.openValidationModal();
        return;
      }
    }
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
