/**
 * ProjectsModal Controller
 * Manages project templates, official campaign & tutorial levels,
 * project cloning, loading, and local browser storage saves.
 */

import { StorageManager } from '../../core/storage.js';
import { CAMPAIGN_LEVELS, TUTORIAL_LEVELS } from '../../levels/default-levels.js';

export class ProjectsModal {
  /**
   * @param {object} editor
   */
  constructor(editor) {
    this.editor = editor;
    this.currentFilter = 'all';
    this.init();
  }

  init() {
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

    searchInput?.addEventListener('input', () => {
      this.renderOfficialPresets(this.currentFilter, searchInput.value.trim().toLowerCase());
    });

    document.querySelectorAll('#preset-filter-pills button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#preset-filter-pills button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter || 'all';
        this.renderOfficialPresets(this.currentFilter, searchInput?.value.trim().toLowerCase() || '');
      });
    });

    btnOpen?.addEventListener('click', () => {
      this.open();
    });

    btnClose?.addEventListener('click', () => this.close());

    btnSaveAs?.addEventListener('click', () => {
      const nameInput = document.getElementById('project-save-name');
      const name = nameInput?.value.trim() || this.editor.level.title || 'My Labyrinth';
      this.editor.level.title = name;
      this.editor.level.id = name.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
      StorageManager.saveProject(this.editor.level);
      this.editor.currentProjectId = this.editor.level.id;
      const titleInput = document.getElementById('level-title-input');
      if (titleInput) titleInput.value = this.editor.level.title;
      this.renderProjectsModalContent();
      this.editor.showToast(`Saved project "${name}"!`, 'success');
    });

    // Preset Buttons
    document.getElementById('btn-preset-small')?.addEventListener('click', () => {
      if (confirm('Create new Small (15×15) labyrinth? Unsaved changes in active draft will be replaced.')) {
        this.editor.createNewLevel(15, 15, 'Small Labyrinth');
        this.close();
      }
    });

    document.getElementById('btn-preset-medium')?.addEventListener('click', () => {
      if (confirm('Create new Standard (21×21) labyrinth? Unsaved changes in active draft will be replaced.')) {
        this.editor.createNewLevel(21, 21, 'Standard Labyrinth');
        this.close();
      }
    });

    document.getElementById('btn-preset-large')?.addEventListener('click', () => {
      if (confirm('Create new Large (31×31) labyrinth? Unsaved changes in active draft will be replaced.')) {
        this.editor.createNewLevel(31, 31, 'Large Labyrinth');
        this.close();
      }
    });
  }

  open() {
    const modal = document.getElementById('projects-modal');
    this.renderProjectsModalContent();
    // Default to official tab
    document.querySelector('#project-modal-tabs .modal-tab-btn[data-tab="official"]')?.click();
    modal?.classList.add('active');
  }

  close() {
    const modal = document.getElementById('projects-modal');
    modal?.classList.remove('active');
  }

  renderProjectsModalContent() {
    this.renderOfficialPresets(this.currentFilter, '');
    this.renderSavedProjects();
  }

  renderOfficialPresets(filterCategory = 'all', searchTerm = '') {
    const container = document.getElementById('official-presets-container');
    if (!container) return;

    container.innerHTML = '';

    // Aggregate all levels
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
              <span>${this.editor.escapeHtml(lvl.title)}</span>
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
        this.editor.loadPresetLevel(item.id, false);
        this.close();
      });

      card.querySelector('.btn-clone-remix').addEventListener('click', () => {
        this.editor.loadPresetLevel(item.id, true);
        this.close();
      });

      container.appendChild(card);
    });
  }

  renderSavedProjects() {
    const savedContainer = document.getElementById('saved-projects-container');
    const nameInput = document.getElementById('project-save-name');

    if (nameInput) {
      nameInput.value = this.editor.level.title || 'My Labyrinth';
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
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--text);">${this.editor.escapeHtml(p.title)}</div>
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
              this.editor.loadLevel(data);
              this.editor.currentProjectId = p.id;
              this.close();
              this.editor.showToast(`Loaded "${p.title}"`, 'success');
            }
          });

          card.querySelector('.btn-save-over').addEventListener('click', () => {
            this.editor.level.id = p.id;
            this.editor.level.title = p.title;
            StorageManager.saveProject(this.editor.level);
            this.renderSavedProjects();
            this.editor.showToast(`Overwrote project "${p.title}"!`, 'success');
          });

          card.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm(`Delete project "${p.title}"?`)) {
              StorageManager.deleteProject(p.id);
              this.renderSavedProjects();
              this.editor.showToast(`Deleted "${p.title}"`, 'info');
            }
          });

          savedContainer.appendChild(card);
        });
      }
    }
  }
}
