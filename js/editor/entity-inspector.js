/**
 * Entity Inspector & Lever Wiring Component
 */

import { ENTITY_TYPES } from '../core/constants.js';

export class EntityInspector {
  /**
   * @param {object} options
   * @param {HTMLElement} options.modalContainer
   * @param {Function} options.onUpdate
   * @param {Function} options.onDelete
   * @param {Function} options.onStartPickTarget
   */
  constructor({ modalContainer, onUpdate, onDelete, onStartPickTarget }) {
    this.modal = modalContainer;
    this.onUpdate = onUpdate;
    this.onDelete = onDelete;
    this.onStartPickTarget = onStartPickTarget;
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
      container.appendChild(this.createColorPickerRow('Key Color', 'entity-color', e.color || '#fbbf24'));
    }

    // 3. Type Specific: Door
    if (e.type === ENTITY_TYPES.DOOR) {
      // Key selector from existing keys
      const existingKeys = (this.levelRef?.entities || []).filter(item => item.type === ENTITY_TYPES.KEY);
      container.appendChild(this.createKeySelectorRow('Required Key ID', 'entity-requires-key', e.requiresKey || '', existingKeys));
      container.appendChild(this.createColorPickerRow('Door Theme Color', 'entity-color', e.color || '#fbbf24'));
    }

    // 4. Type Specific: Lever
    if (e.type === ENTITY_TYPES.LEVER) {
      container.appendChild(this.createInputRow('Switch Name', 'entity-name', e.name || 'Floor Switch', 'text'));

      // Targets List
      const targetsSection = document.createElement('div');
      targetsSection.className = 'form-row';
      targetsSection.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
          <label>Wired Target Tiles (${(e.targets || []).length}):</label>
          <button type="button" class="btn btn-accent btn-sm" id="btn-pick-target" style="padding:0.25rem 0.6rem; font-size:0.75rem;">
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
   * Render list of lever targets
   */
  renderTargetsList(container, targets) {
    container.innerHTML = '';

    if (targets.length === 0) {
      container.innerHTML = '<span style="font-size:0.75rem; color:var(--text-muted); padding:0.4rem;">No target tiles linked yet. Click "+ Pick Target Tile" to wire.</span>';
      return;
    }

    targets.forEach((t, idx) => {
      const item = document.createElement('div');
      item.className = 'target-item';
      item.innerHTML = `
        <span>[${t.layer || 'ground'}] (${t.x}, ${t.y}) ➔ Toggle</span>
        <button type="button" class="btn btn-danger btn-sm" style="padding:0.15rem 0.4rem; font-size:0.7rem;">✕</button>
      `;

      item.querySelector('button').addEventListener('click', () => {
        targets.splice(idx, 1);
        this.renderTargetsList(container, targets);
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

  createColorPickerRow(label, id, value) {
    const row = document.createElement('div');
    row.className = 'form-row';
    row.innerHTML = `
      <label for="${id}">${label}</label>
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <input type="color" id="${id}" class="input-field" value="${value}" style="width:48px; height:36px; padding:2px; cursor:pointer;" />
        <input type="text" id="${id}-hex" class="input-field" value="${value}" style="flex:1;" />
      </div>
    `;

    const colorInput = row.querySelector(`#${id}`);
    const hexInput = row.querySelector(`#${id}-hex`);

    colorInput.addEventListener('input', () => { hexInput.value = colorInput.value; });
    hexInput.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
        colorInput.value = hexInput.value;
      }
    });

    return row;
  }

  createKeySelectorRow(label, id, value, existingKeys) {
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
      if (select.value) input.value = select.value;
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

    if (this.onUpdate) {
      this.onUpdate(e);
    }
  }
}
