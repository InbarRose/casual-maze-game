/**
 * Casual Maze Game — Player Profile & Save Management Modal
 * 
 * Displays player rank, stars, completion stats, display name customization,
 * and 1-click save state backup/restore.
 */

import { StorageManager } from '../core/storage.js';
import { ENGINE_VERSION } from '../core/version.js';

export class ProfileModal {
  constructor() {
    this.modalEl = null;
    this.isOpen = false;
    this.ensureDom();
  }

  ensureDom() {
    if (typeof document === 'undefined') return;

    let existing = document.getElementById('profile-modal');
    if (existing) {
      this.modalEl = existing;
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.className = 'modal-backdrop';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-card profile-card" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span id="profile-rank-icon" style="font-size: 1.6rem;">🧭</span>
            <div>
              <h3 id="profile-title" style="margin: 0; font-size: 1.25rem;">Player Profile</h3>
              <div id="profile-rank-title" style="font-size: 0.8rem; color: var(--accent); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">Novice Pathfinder</div>
            </div>
          </div>
          <button type="button" class="btn-close" id="btn-close-profile" title="Close Profile (Esc)">&times;</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.2rem;">
          <!-- Player Identity -->
          <div class="profile-field-group" style="background: rgba(0, 0, 0, 0.25); padding: 0.8rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <label for="profile-name-input" style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.4rem;">Explorer Codename</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" id="profile-name-input" class="text-input" style="flex: 1; padding: 0.45rem 0.75rem; font-size: 0.95rem; font-weight: 700; background: var(--bg); border: 1px solid var(--card-border); border-radius: var(--radius-sm); color: var(--text);" maxlength="24" placeholder="Explorer" />
              <button type="button" id="btn-save-profile-name" class="btn btn-secondary btn-sm" style="padding: 0.45rem 0.8rem;">Save</button>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="profile-stats-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
            <div class="stat-box" style="background: rgba(0, 0, 0, 0.25); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Total Stars</div>
              <div id="profile-stars-val" style="font-size: 1.6rem; font-weight: 800; color: var(--gold); margin-top: 0.2rem;">★ 0</div>
            </div>
            <div class="stat-box" style="background: rgba(0, 0, 0, 0.25); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Campaign Clear</div>
              <div id="profile-campaign-val" style="font-size: 1.6rem; font-weight: 800; color: var(--accent); margin-top: 0.2rem;">0 / 32</div>
            </div>
            <div class="stat-box" style="background: rgba(0, 0, 0, 0.25); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Story Chapters</div>
              <div id="profile-stories-val" style="font-size: 1.6rem; font-weight: 800; color: var(--purple); margin-top: 0.2rem;">0</div>
            </div>
            <div class="stat-box" style="background: rgba(0, 0, 0, 0.25); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Total Steps</div>
              <div id="profile-steps-val" style="font-size: 1.6rem; font-weight: 800; color: var(--emerald); margin-top: 0.2rem;">0</div>
            </div>
          </div>

          <!-- Save Data Management -->
          <div style="background: rgba(0, 0, 0, 0.25); padding: 0.8rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); display: flex; flex-direction: column; gap: 0.6rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Save Data & Synchronization</div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              <button type="button" id="btn-profile-copy-json" class="btn btn-secondary btn-sm" style="flex: 1; min-width: 130px;" title="Copy all progress JSON to clipboard">📋 Copy Save</button>
              <button type="button" id="btn-profile-download" class="btn btn-secondary btn-sm" style="flex: 1; min-width: 130px;" title="Download save backup as .json file">💾 Backup File</button>
              <button type="button" id="btn-profile-import" class="btn btn-secondary btn-sm" style="flex: 1; min-width: 130px;" title="Import saved progress from .json file">📂 Import Save</button>
              <input type="file" id="profile-file-input" accept=".json" style="display: none;" />
            </div>
            <div id="profile-msg-bar" style="font-size: 0.8rem; min-height: 1.2rem; color: var(--emerald); text-align: center;"></div>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-glass); padding-top: 0.8rem; margin-top: 0.4rem;">
          <button type="button" id="btn-profile-reset" class="btn btn-danger btn-sm" style="opacity: 0.8; font-size: 0.78rem;" title="Reset progress to zero">⚠️ Reset Save</button>
          <button type="button" class="btn btn-primary btn-sm" id="btn-done-profile">Done</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this.bindEvents();
  }

  bindEvents() {
    if (!this.modalEl) return;

    const closeBtn = this.modalEl.querySelector('#btn-close-profile');
    const doneBtn = this.modalEl.querySelector('#btn-done-profile');
    if (closeBtn) closeBtn.onclick = () => this.close();
    if (doneBtn) doneBtn.onclick = () => this.close();

    this.modalEl.onclick = (e) => {
      if (e.target === this.modalEl) this.close();
    };

    const saveNameBtn = this.modalEl.querySelector('#btn-save-profile-name');
    const nameInput = this.modalEl.querySelector('#profile-name-input');
    if (saveNameBtn && nameInput) {
      saveNameBtn.onclick = () => {
        StorageManager.setPlayerName(nameInput.value);
        this.showMessage('Explorer name updated!', 'var(--emerald)');
        this.refresh();
      };
      nameInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          saveNameBtn.click();
        }
      };
    }

    const copyBtn = this.modalEl.querySelector('#btn-profile-copy-json');
    if (copyBtn) {
      copyBtn.onclick = async () => {
        try {
          await StorageManager.copySaveProfileToClipboard();
          this.showMessage('Save state copied to clipboard!', 'var(--emerald)');
        } catch {
          this.showMessage('Unable to copy to clipboard', 'var(--rose)');
        }
      };
    }

    const downloadBtn = this.modalEl.querySelector('#btn-profile-download');
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const file = StorageManager.downloadSaveFile();
        this.showMessage(`Saved to ${file}`, 'var(--emerald)');
      };
    }

    const importBtn = this.modalEl.querySelector('#btn-profile-import');
    const fileInput = this.modalEl.querySelector('#profile-file-input');
    if (importBtn && fileInput) {
      importBtn.onclick = () => fileInput.click();
      fileInput.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const res = await StorageManager.importSaveFile(file);
          this.showMessage(`Successfully imported: ${res.stats.campaignLevels} levels, ${res.stats.storyChapters} story chapters`, 'var(--emerald)');
          this.refresh();
        } catch (err) {
          this.showMessage(`Import failed: ${err.message}`, 'var(--rose)');
        }
      };
    }

    const resetBtn = this.modalEl.querySelector('#btn-profile-reset');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Are you sure you want to reset all progress, stars, and records? This cannot be undone.')) {
          StorageManager.clearAllProgress();
          this.showMessage('All progress has been reset', 'var(--gold)');
          this.refresh();
        }
      };
    }

    document.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.close();
      }
    });
  }

  showMessage(msg, color = 'var(--text)') {
    const bar = this.modalEl?.querySelector('#profile-msg-bar');
    if (bar) {
      bar.textContent = msg;
      bar.style.color = color;
      clearTimeout(this._msgTimer);
      this._msgTimer = setTimeout(() => {
        if (bar.textContent === msg) bar.textContent = '';
      }, 4000);
    }
  }

  refresh() {
    if (!this.modalEl) return;
    const profile = StorageManager.getPlayerProfile();

    const rankIcon = this.modalEl.querySelector('#profile-rank-icon');
    const rankTitle = this.modalEl.querySelector('#profile-rank-title');
    const nameInput = this.modalEl.querySelector('#profile-name-input');
    const starsVal = this.modalEl.querySelector('#profile-stars-val');
    const campVal = this.modalEl.querySelector('#profile-campaign-val');
    const storiesVal = this.modalEl.querySelector('#profile-stories-val');
    const stepsVal = this.modalEl.querySelector('#profile-steps-val');

    if (rankIcon) rankIcon.textContent = profile.rankIcon;
    if (rankTitle) rankTitle.textContent = profile.rankTitle;
    if (nameInput) nameInput.value = profile.name;
    if (starsVal) starsVal.textContent = `★ ${profile.totalStars}`;
    if (campVal) campVal.textContent = `${profile.campaignLevels} / 32`;
    if (storiesVal) storiesVal.textContent = String(profile.storyChapters);
    if (stepsVal) stepsVal.textContent = profile.totalSteps.toLocaleString();

    // Trigger profile update event for app header badge
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player-profile:updated', { detail: profile }));
    }
  }

  open() {
    this.ensureDom();
    this.refresh();
    if (this.modalEl) {
      this.modalEl.style.display = 'flex';
      this.isOpen = true;
    }
  }

  close() {
    if (this.modalEl) {
      this.modalEl.style.display = 'none';
      this.isOpen = false;
    }
  }
}
