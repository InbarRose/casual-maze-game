/**
 * PlaytestModal Controller
 * Configures playtesting options including custom test spawns and backpack key preloading.
 */

export class PlaytestModal {
  /**
   * @param {object} editor
   */
  constructor(editor) {
    this.editor = editor;
    this.init();
  }

  init() {
    const modal = document.getElementById('playtest-modal');
    const btnClose = document.getElementById('playtest-btn-close');
    const btnCancel = document.getElementById('playtest-btn-cancel');
    const btnLaunch = document.getElementById('playtest-btn-launch');
    const btnSelectAll = document.getElementById('btn-inv-select-all');
    const btnClear = document.getElementById('btn-inv-clear');

    btnClose?.addEventListener('click', () => this.close());
    btnCancel?.addEventListener('click', () => this.close());

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
        const x = parseInt(document.getElementById('test-spawn-x')?.value, 10) || this.editor.level.spawn?.x || 1;
        const y = parseInt(document.getElementById('test-spawn-y')?.value, 10) || this.editor.level.spawn?.y || 1;
        const elev = parseInt(document.getElementById('test-spawn-elev')?.value, 10) || 0;
        testSpawn = { x, y, elevation: elev };
      }

      // Collect checked test inventory keys
      const testInventory = [];
      const chks = modal?.querySelectorAll('#test-inventory-checklist input[type="checkbox"]:checked');
      chks?.forEach(c => {
        testInventory.push(c.value);
      });

      this.close();
      this.editor.playTest({ testSpawn, testInventory });
    });
  }

  open() {
    const modal = document.getElementById('playtest-modal');
    if (!modal) return;

    // Set default spawn label
    const lblDefault = document.getElementById('lbl-spawn-default');
    if (lblDefault && this.editor.level.spawn) {
      lblDefault.textContent = `(${this.editor.level.spawn.x}, ${this.editor.level.spawn.y}) • ${this.editor.level.spawn.elevation === 1 ? 'Overhead' : 'Ground'}`;
    }

    // Set custom coordinates inputs
    const inputX = document.getElementById('test-spawn-x');
    const inputY = document.getElementById('test-spawn-y');
    const selElev = document.getElementById('test-spawn-elev');

    const sourceSpawn = this.editor.level.testSpawn || this.editor.level.spawn || { x: 1, y: 1, elevation: 0 };
    if (inputX) inputX.value = sourceSpawn.x;
    if (inputY) inputY.value = sourceSpawn.y;
    if (selElev) selElev.value = sourceSpawn.elevation || 0;

    const radCustom = document.getElementById('rad-spawn-custom');
    const radDefault = document.getElementById('rad-spawn-default');
    if (this.editor.level.testSpawn && radCustom) {
      radCustom.checked = true;
    } else if (radDefault) {
      radDefault.checked = true;
    }

    // Render key inventory checklist
    const container = document.getElementById('test-inventory-checklist');
    if (container) {
      container.innerHTML = '';
      const existingKeys = (this.editor.level.entities || []).filter(e => e.type === 'key');

      if (existingKeys.length === 0) {
        container.innerHTML = '<span style="font-size:0.75rem; color:var(--text-muted); padding:0.4rem;">No keys placed in labyrinth yet.</span>';
      } else {
        existingKeys.forEach(k => {
          const card = document.createElement('label');
          card.className = 'key-chk-card';
          card.innerHTML = `
            <input type="checkbox" value="${k.id}" />
            <span style="color:${k.color || '#fbbf24'};">🔑</span>
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${this.editor.escapeHtml(k.name || k.id)}</span>
          `;
          container.appendChild(card);
        });
      }
    }

    modal.classList.add('active');
  }

  close() {
    const modal = document.getElementById('playtest-modal');
    modal?.classList.remove('active');
  }
}
