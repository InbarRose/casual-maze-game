/**
 * Entity Inspector & Lever Wiring Component
 */

import { ENTITY_TYPES, KEY_COLOR_PRESETS, LEVER_TILE_OPTIONS, LAYERS, TILES } from '../core/constants.js';

export class EntityInspector {
  /**
   * @param {object} options
   * @param {HTMLElement} options.modalContainer
   * @param {Function} options.onUpdate
   * @param {Function} options.onDelete
   * @param {Function} options.onStartPickTarget
   * @param {Function} [options.onTestToggle]
   */
  constructor({ modalContainer, onUpdate, onDelete, onStartPickTarget, onTestToggle }) {
    this.modal = modalContainer;
    this.onUpdate = onUpdate;
    this.onDelete = onDelete;
    this.onStartPickTarget = onStartPickTarget;
    this.onTestToggle = onTestToggle;
    this.currentEntity = null;
    this.levelRef = null;

    this.initElements();
  }

  initElements() {
    this.titleEl = this.modal.querySelector('#inspector-title');
    this.formEl = this.modal.querySelector('#inspector-form');
    this.bodyEl = this.modal.querySelector('#inspector-body');
    this.btnSave = this.modal.querySelector('#inspector-btn-save');
    this.btnDelete = this.modal.querySelector('#inspector-btn-delete');
    this.btnClose = this.modal.querySelector('#inspector-btn-close');

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.close());
    }

    if (this.btnDelete) {
      this.btnDelete.addEventListener('click', () => {
        if (this.currentEntity && this.onDelete) {
          this.onDelete(this.currentEntity);
          this.close();
        }
      });
    }

    if (this.btnSave) {
      this.btnSave.addEventListener('click', () => {
        this.saveCurrentForm();
        this.close();
      });
    }
  }

  /**
   * Open inspector for an entity
   * @param {object} entity
   * @param {object} level
   */
  open(entity, level) {
    this.currentEntity = entity;
    this.levelRef = level;
    this.renderForm();
    this.modal.classList.add('active');
  }

  /**
   * Close inspector modal
   */
  close() {
    this.modal.classList.remove('active');
    this.currentEntity = null;
  }

  /**
   * Render dynamic form fields based on entity type
   */
  renderForm() {
    const e = this.currentEntity;
    if (!e) return;

    this.titleEl.textContent = `Configure ${e.type.toUpperCase()}: ${e.id || ''}`;
    this.bodyEl.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'entity-props-form';

    // 1. Common: ID
    container.appendChild(this.createInputRow('ID / Code', 'entity-id', e.id || '', 'text'));

    // 2. Type Specific: Key
    if (e.type === ENTITY_TYPES.KEY) {
      container.appendChild(this.createInputRow('Key Name', 'entity-name', e.name || 'Golden Key', 'text'));
      container.appendChild(this.createColorPaletteRow('Key Color & Preset', 'entity-color', e.color || '#fbbf24', (preset) => {
        const nameInput = container.querySelector('#entity-name');
        if (nameInput && (!nameInput.value || nameInput.value.includes('Key'))) {
          nameInput.value = preset.name;
        }
      }));
    }

    // 3. Type Specific: Door
    if (e.type === ENTITY_TYPES.DOOR) {
      const existingKeys = (this.levelRef?.entities || []).filter(item => item.type === ENTITY_TYPES.KEY);
      container.appendChild(this.createKeySelectorRow('Required Key ID', 'entity-requires-key', e.requiresKey || '', existingKeys, (selectedKey) => {
        if (selectedKey?.color) {
          const colorInput = container.querySelector('#entity-color');
          const hexInput = container.querySelector('#entity-color-hex');
          if (colorInput) colorInput.value = selectedKey.color;
          if (hexInput) hexInput.value = selectedKey.color;
        }
      }));
      container.appendChild(this.createColorPaletteRow('Door Theme Color', 'entity-color', e.color || '#fbbf24'));
    }

    // 4. Type Specific: Lever
    if (e.type === ENTITY_TYPES.LEVER) {
      container.appendChild(this.createInputRow('Switch / Mechanism Name', 'entity-name', e.name || 'Floor Switch', 'text'));

      // Initial State Switch & Test Trigger Button
      const stateRow = document.createElement('div');
      stateRow.className = 'form-row';
      stateRow.innerHTML = `
        <label>Mechanism State &amp; Preview</label>
        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem; background:rgba(255,255,255,0.03); padding:0.6rem 0.8rem; border-radius:var(--radius-sm); border:1px solid var(--border);">
          <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; font-size:0.85rem; font-weight:600; margin:0;">
            <input type="checkbox" id="entity-state" ${e.state ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" />
            <span>Initial State: <strong id="lever-state-label" style="color:${e.state ? 'var(--emerald)' : 'var(--text-muted)'};">${e.state ? 'Pulled (Active)' : 'Unpulled (Inactive)'}</strong></span>
          </label>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-test-lever" title="Preview mechanism trigger on editor canvas" style="font-size:0.75rem; padding:0.25rem 0.6rem;">
            ⚡ Toggle Preview
          </button>
        </div>
      `;

      const chkState = stateRow.querySelector('#entity-state');
      const stateLabel = stateRow.querySelector('#lever-state-label');
      chkState.addEventListener('change', () => {
        e.state = chkState.checked;
        stateLabel.textContent = e.state ? 'Pulled (Active)' : 'Unpulled (Inactive)';
        stateLabel.style.color = e.state ? 'var(--emerald)' : 'var(--text-muted)';
      });

      const btnTestLever = stateRow.querySelector('#btn-test-lever');
      btnTestLever.addEventListener('click', () => {
        this.saveCurrentForm();
        if (this.onTestToggle) {
          this.onTestToggle(e);
        }
      });

      container.appendChild(stateRow);

      // Targets List
      const targetsSection = document.createElement('div');
      targetsSection.className = 'form-row';
      targetsSection.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
          <label style="margin:0;">Wired Target Tiles (<span id="targets-count">${(e.targets || []).length}</span>):</label>
          <button type="button" class="btn btn-accent btn-sm" id="btn-pick-target" style="padding:0.25rem 0.65rem; font-size:0.75rem;">
            + Pick Target Tile
          </button>
        </div>
        <div class="targets-list" id="targets-list-container"></div>
      `;

      container.appendChild(targetsSection);

      // Render targets
      const listContainer = targetsSection.querySelector('#targets-list-container');
      this.renderTargetsList(listContainer, e.targets || []);

      // Wire Pick button
      const btnPick = targetsSection.querySelector('#btn-pick-target');
      btnPick.addEventListener('click', () => {
        this.saveCurrentForm();
        this.close();
        if (this.onStartPickTarget) {
          this.onStartPickTarget(e);
        }
      });
    }

    this.bodyEl.appendChild(container);
  }

  /**
   * Render list of lever targets with customizable state transitions
   */
  renderTargetsList(container, targets) {
    container.innerHTML = '';

    if (targets.length === 0) {
      container.innerHTML = '<div style="font-size:0.78rem; color:var(--text-muted); padding:0.6rem; text-align:center; border:1px dashed var(--border); border-radius:var(--radius-sm);">No target tiles linked yet. Click <strong>"+ Pick Target Tile"</strong> to wire tiles on the canvas!</div>';
      return;
    }

    targets.forEach((t, idx) => {
      // Default fallback values
      if (t.stateA === undefined) t.stateA = 0; // Floor when active
      if (t.stateB === undefined) t.stateB = 1; // Wall when inactive
      if (!t.layer) t.layer = LAYERS.GROUND;

      const item = document.createElement('div');
      item.className = 'target-item-card';
      item.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:var(--radius-sm); padding:0.6rem; margin-bottom:0.5rem; display:flex; flex-direction:column; gap:0.4rem;';

      let optionsA = '';
      let optionsB = '';
      LEVER_TILE_OPTIONS.forEach(opt => {
        optionsA += `<option value="${opt.value}" ${String(t.stateA) === String(opt.value) ? 'selected' : ''}>${opt.label}</option>`;
        optionsB += `<option value="${opt.value}" ${String(t.stateB) === String(opt.value) ? 'selected' : ''}>${opt.label}</option>`;
      });

      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:0.4rem; font-family:var(--font-mono); font-size:0.8rem; font-weight:700; color:var(--accent);">
            <span>🎯 Target #${idx + 1}: (${t.x}, ${t.y})</span>
            <select class="select-field sel-target-layer" style="padding:0.1rem 0.4rem; font-size:0.72rem; width:auto;">
              <option value="ground" ${t.layer === 'ground' ? 'selected' : ''}>Ground (0)</option>
              <option value="overhead" ${t.layer === 'overhead' ? 'selected' : ''}>Overhead (1)</option>
            </select>
          </div>
          <button type="button" class="btn btn-danger btn-sm btn-del-target" title="Remove target" style="padding:0.15rem 0.45rem; font-size:0.7rem;">✕</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.75rem;">
          <div>
            <label style="font-size:0.7rem; color:var(--emerald); margin-bottom:0.15rem; display:block;">Active / Pulled State (State A):</label>
            <select class="select-field sel-target-state-a" style="font-size:0.75rem; padding:0.25rem 0.4rem;">${optionsA}</select>
          </div>
          <div>
            <label style="font-size:0.7rem; color:var(--rose); margin-bottom:0.15rem; display:block;">Inactive / Rest State (State B):</label>
            <select class="select-field sel-target-state-b" style="font-size:0.75rem; padding:0.25rem 0.4rem;">${optionsB}</select>
          </div>
        </div>
      `;

      const selLayer = item.querySelector('.sel-target-layer');
      selLayer.addEventListener('change', () => {
        t.layer = selLayer.value;
      });

      const selA = item.querySelector('.sel-target-state-a');
      selA.addEventListener('change', () => {
        const val = selA.value;
        t.stateA = !isNaN(Number(val)) ? Number(val) : val;
      });

      const selB = item.querySelector('.sel-target-state-b');
      selB.addEventListener('change', () => {
        const val = selB.value;
        t.stateB = !isNaN(Number(val)) ? Number(val) : val;
      });

      item.querySelector('.btn-del-target').addEventListener('click', () => {
        targets.splice(idx, 1);
        this.renderTargetsList(container, targets);
        const countSpan = this.modal.querySelector('#targets-count');
        if (countSpan) countSpan.textContent = targets.length;
      });

      container.appendChild(item);
    });
  }

  createInputRow(label, id, value, type = 'text') {
    const row = document.createElement('div');
    row.className = 'form-row';
    row.innerHTML = `
      <label for="${id}">${label}</label>
      <input type="${type}" id="${id}" class="input-field" value="${value}" />
    `;
    return row;
  }

  createColorPaletteRow(label, id, value, onPresetSelected) {
    const row = document.createElement('div');
    row.className = 'form-row';

    let swatchesHtml = '';
    KEY_COLOR_PRESETS.forEach(p => {
      swatchesHtml += `
        <button type="button" class="color-swatch-chip" data-color="${p.color}" data-name="${p.name}" title="${p.name} (${p.label})" style="background:${p.color}; width:24px; height:24px; border-radius:50%; border:2px solid ${value === p.color ? '#ffffff' : 'transparent'}; cursor:pointer; box-shadow: 0 0 6px ${p.color}40;"></button>
      `;
    });

    row.innerHTML = `
      <label for="${id}">${label}</label>
      <div style="display:flex; flex-direction:column; gap:0.4rem;">
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <input type="color" id="${id}" class="input-field" value="${value}" style="width:44px; height:34px; padding:2px; cursor:pointer;" />
          <input type="text" id="${id}-hex" class="input-field" value="${value}" style="flex:1;" />
        </div>
        <div style="display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap; padding-top:0.2rem;">
          <span style="font-size:0.75rem; color:var(--text-muted);">Quick Presets:</span>
          ${swatchesHtml}
        </div>
      </div>
    `;

    const colorInput = row.querySelector(`#${id}`);
    const hexInput = row.querySelector(`#${id}-hex`);
    const swatchBtns = row.querySelectorAll('.color-swatch-chip');

    const updateActiveSwatches = (hex) => {
      swatchBtns.forEach(btn => {
        btn.style.border = btn.dataset.color.toLowerCase() === hex.toLowerCase() ? '2px solid #ffffff' : '2px solid transparent';
      });
    };

    colorInput.addEventListener('input', () => {
      hexInput.value = colorInput.value;
      updateActiveSwatches(colorInput.value);
    });

    hexInput.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
        colorInput.value = hexInput.value;
        updateActiveSwatches(hexInput.value);
      }
    });

    swatchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const col = btn.dataset.color;
        const name = btn.dataset.name;
        colorInput.value = col;
        hexInput.value = col;
        updateActiveSwatches(col);
        if (onPresetSelected) {
          onPresetSelected({ color: col, name });
        }
      });
    });

    return row;
  }

  createKeySelectorRow(label, id, value, existingKeys, onSelectKey) {
    const row = document.createElement('div');
    row.className = 'form-row';

    let options = `<option value="">-- Select or Type Key ID --</option>`;
    for (const k of existingKeys) {
      options += `<option value="${k.id}" ${k.id === value ? 'selected' : ''}>${k.name || k.id} (${k.id})</option>`;
    }

    row.innerHTML = `
      <label for="${id}">${label}</label>
      <select id="${id}-select" class="select-field" style="margin-bottom:0.35rem;">${options}</select>
      <input type="text" id="${id}" class="input-field" value="${value}" placeholder="or enter custom key ID" />
    `;

    const select = row.querySelector(`#${id}-select`);
    const input = row.querySelector(`#${id}`);

    select.addEventListener('change', () => {
      if (select.value) {
        input.value = select.value;
        const match = existingKeys.find(k => k.id === select.value);
        if (match && onSelectKey) {
          onSelectKey(match);
        }
      }
    });

    return row;
  }

  /**
   * Save form values back to currentEntity
   */
  saveCurrentForm() {
    const e = this.currentEntity;
    if (!e) return;

    const idInput = this.bodyEl.querySelector('#entity-id');
    if (idInput && idInput.value.trim()) {
      e.id = idInput.value.trim();
    }

    const nameInput = this.bodyEl.querySelector('#entity-name');
    if (nameInput) {
      e.name = nameInput.value.trim();
    }

    const colorInput = this.bodyEl.querySelector('#entity-color-hex') || this.bodyEl.querySelector('#entity-color');
    if (colorInput) {
      e.color = colorInput.value.trim();
    }

    const reqKeyInput = this.bodyEl.querySelector('#entity-requires-key');
    if (reqKeyInput) {
      e.requiresKey = reqKeyInput.value.trim();
    }

    const chkState = this.bodyEl.querySelector('#entity-state');
    if (chkState) {
      e.state = chkState.checked;
    }

    if (this.onUpdate) {
      this.onUpdate(e);
    }
  }
}
