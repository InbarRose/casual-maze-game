/**
 * Casual Maze Game — Player Profile & Save Management Modal
 * 
 * Displays player rank, stars, completion stats, display name customization,
 * and 1-click save state backup/restore.
 */

import { StorageManager } from '../core/storage.js';
import { ENGINE_VERSION } from '../core/version.js';
import { EXPLORER_OUTFITS, CHARACTER_CUSTOMIZATION } from '../core/constants.js';
import { Player } from '../entities/player.js';
import { audioFX } from './audio-fx.js';

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

          <!-- Character Visual Customization & Avatar Preview (BL-95, ADR-0014) -->
          <div class="profile-field-group" style="background: rgba(0, 0, 0, 0.25); padding: 0.8rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
              <label style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Character Appearance</label>
              <span id="profile-customization-badge" style="font-size: 0.75rem; color: var(--accent); font-weight: 700;">Male Explorer</span>
            </div>
            
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap;">
              <!-- Live Avatar Preview Canvas -->
              <div style="width: 80px; height: 80px; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-glass-bright); border-radius: 12px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
                <canvas id="profile-avatar-canvas" width="80" height="80" style="width: 80px; height: 80px; display: block;"></canvas>
                <span style="position: absolute; bottom: 2px; right: 4px; font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">2.5D</span>
              </div>

              <!-- Gender / Presentation Selector -->
              <div style="flex: 1; min-width: 180px;">
                <label style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.25rem;">Identity / Silhouette</label>
                <div id="profile-gender-group" style="display: flex; gap: 0.35rem;">
                  <!-- Populated dynamically via refresh() -->
                </div>
              </div>
            </div>

            <!-- Hair Style Selector -->
            <div style="margin-bottom: 0.6rem;">
              <label style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.25rem;">Hair Style</label>
              <div id="profile-hairstyle-group" style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                <!-- Populated dynamically via refresh() -->
              </div>
            </div>

            <!-- Hair Color & Skin Tone Pickers -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
              <div>
                <label style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.25rem;">Hair Color</label>
                <div id="profile-haircolor-group" style="display: flex; gap: 0.35rem; flex-wrap: wrap; align-items: center;">
                  <!-- Populated dynamically via refresh() -->
                </div>
              </div>
              <div>
                <label style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.25rem;">Skin Tone</label>
                <div id="profile-skintone-group" style="display: flex; gap: 0.35rem; flex-wrap: wrap; align-items: center;">
                  <!-- Populated dynamically via refresh() -->
                </div>
              </div>
            </div>
          </div>

          <!-- Explorer Wardrobe & Attire (BL-78, CMP-11, CMP-14) -->
          <div class="profile-field-group" style="background: rgba(0, 0, 0, 0.25); padding: 0.8rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <label style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Explorer Wardrobe</label>
              <span id="profile-outfit-badge" style="font-size: 0.75rem; color: var(--accent); font-weight: 700;">Classic Pathfinder</span>
            </div>
            <div id="profile-outfit-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
              <!-- Populated dynamically via refresh() -->
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

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-glass); padding-top: 0.8rem; margin-top: 0.4rem; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button type="button" id="btn-profile-reset" class="btn btn-danger btn-sm" style="opacity: 0.8; font-size: 0.78rem;" title="Reset progress to zero">⚠️ Reset Save</button>
            <div id="profile-reset-confirm-box" style="display: none; background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.35); border-radius: 6px; padding: 0.35rem 0.65rem; font-size: 0.75rem; color: var(--text);">
              <span style="font-weight: 600; color: #fecdd3; margin-right: 0.5rem;">⚠️ Reset all progress?</span>
              <button type="button" id="btn-profile-cancel-reset" class="btn btn-secondary btn-xs" style="padding: 2px 7px;">Cancel</button>
              <button type="button" id="btn-profile-confirm-reset" class="btn btn-danger btn-xs" style="padding: 2px 7px; background: #e11d48; margin-left: 0.35rem;">Confirm</button>
            </div>
          </div>
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
        this.showMessage(`📥 Saved to Downloads: ${file}`, 'var(--emerald)');
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
    const resetBox = this.modalEl.querySelector('#profile-reset-confirm-box');
    const cancelResetBtn = this.modalEl.querySelector('#btn-profile-cancel-reset');
    const confirmResetBtn = this.modalEl.querySelector('#btn-profile-confirm-reset');

    if (resetBtn && resetBox) {
      resetBtn.onclick = () => {
        resetBox.style.display = 'inline-flex';
        resetBtn.style.display = 'none';
      };
      if (cancelResetBtn) {
        cancelResetBtn.onclick = () => {
          resetBox.style.display = 'none';
          resetBtn.style.display = 'inline-block';
        };
      }
      if (confirmResetBtn) {
        confirmResetBtn.onclick = () => {
          StorageManager.clearAllProgress();
          resetBox.style.display = 'none';
          resetBtn.style.display = 'inline-block';
          this.showMessage('All progress has been reset', 'var(--gold)');
          this.refresh();
        };
      }
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

    // -------------------------------------------------------------
    // Character Visual Customization Controls (BL-95, ADR-0014)
    // -------------------------------------------------------------
    const custom = StorageManager.getPlayerCustomization();
    const currentOutfitId = profile.outfit || 'classic';
    const currentOutfit = EXPLORER_OUTFITS[currentOutfitId] || EXPLORER_OUTFITS.classic;

    const customBadge = this.modalEl.querySelector('#profile-customization-badge');
    if (customBadge) {
      const gLabel = CHARACTER_CUSTOMIZATION?.GENDER_META?.[custom.gender]?.label || 'Explorer';
      customBadge.textContent = gLabel.split(' / ')[0] + ' Explorer';
    }

    // 1. Gender / Silhouette Buttons
    const genderGroup = this.modalEl.querySelector('#profile-gender-group');
    if (genderGroup) {
      genderGroup.innerHTML = '';
      Object.values(CHARACTER_CUSTOMIZATION.GENDER_META).forEach((meta) => {
        const isSelected = custom.gender === meta.id;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn btn-sm gender-select-btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`;
        btn.dataset.gender = meta.id;
        btn.style.cssText = 'flex: 1; padding: 0.35rem 0.5rem; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; gap: 0.25rem;';
        btn.innerHTML = `<span>${meta.icon}</span> <span>${meta.id.charAt(0).toUpperCase() + meta.id.slice(1)}</span>`;
        btn.onclick = () => {
          StorageManager.setPlayerCustomization({ gender: meta.id });
          try { audioFX.playClick(); } catch (_) {}
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('player:customization_changed', { detail: { gender: meta.id } }));
          }
          this.refresh();
        };
        genderGroup.appendChild(btn);
      });
    }

    // 2. Hair Style Buttons
    const hairStyleGroup = this.modalEl.querySelector('#profile-hairstyle-group');
    if (hairStyleGroup) {
      hairStyleGroup.innerHTML = '';
      Object.values(CHARACTER_CUSTOMIZATION.HAIR_STYLE_META).forEach((meta) => {
        const isSelected = custom.hairStyle === meta.id;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn btn-xs hairstyle-select-btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`;
        btn.dataset.hairStyle = meta.id;
        btn.style.cssText = `padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 6px; ${isSelected ? 'border-color: var(--accent);' : ''}`;
        btn.innerHTML = `${meta.icon} ${meta.id.charAt(0).toUpperCase() + meta.id.slice(1)}`;
        btn.onclick = () => {
          StorageManager.setPlayerCustomization({ hairStyle: meta.id });
          try { audioFX.playClick(); } catch (_) {}
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('player:customization_changed', { detail: { hairStyle: meta.id } }));
          }
          this.refresh();
        };
        hairStyleGroup.appendChild(btn);
      });
    }

    // 3. Hair Color Swatches
    const hairColorGroup = this.modalEl.querySelector('#profile-haircolor-group');
    if (hairColorGroup) {
      hairColorGroup.innerHTML = '';
      Object.values(CHARACTER_CUSTOMIZATION.HAIR_COLORS).forEach((hc) => {
        const isSelected = custom.hairColor === hc.id;
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'hair-swatch-btn';
        swatch.title = hc.label;
        swatch.style.cssText = `
          width: 20px; height: 20px; border-radius: 50%; background: ${hc.color};
          border: 2px solid ${isSelected ? 'var(--gold, #fbbf24)' : 'rgba(255,255,255,0.3)'};
          cursor: pointer; padding: 0; outline: none; transition: transform 0.15s ease;
          ${isSelected ? 'transform: scale(1.2); box-shadow: 0 0 6px rgba(251, 191, 36, 0.6);' : ''}
        `;
        swatch.onclick = () => {
          StorageManager.setPlayerCustomization({ hairColor: hc.id });
          try { audioFX.playClick(); } catch (_) {}
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('player:customization_changed', { detail: { hairColor: hc.id } }));
          }
          this.refresh();
        };
        hairColorGroup.appendChild(swatch);
      });
    }

    // 4. Skin Tone Swatches
    const skinToneGroup = this.modalEl.querySelector('#profile-skintone-group');
    if (skinToneGroup) {
      skinToneGroup.innerHTML = '';
      Object.values(CHARACTER_CUSTOMIZATION.SKIN_TONES).forEach((st) => {
        const isSelected = custom.skinTone === st.id;
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'skin-swatch-btn';
        swatch.title = st.label;
        swatch.style.cssText = `
          width: 20px; height: 20px; border-radius: 50%; background: ${st.color};
          border: 2px solid ${isSelected ? 'var(--gold, #fbbf24)' : 'rgba(255,255,255,0.3)'};
          cursor: pointer; padding: 0; outline: none; transition: transform 0.15s ease;
          ${isSelected ? 'transform: scale(1.2); box-shadow: 0 0 6px rgba(251, 191, 36, 0.6);' : ''}
        `;
        swatch.onclick = () => {
          StorageManager.setPlayerCustomization({ skinTone: st.id });
          try { audioFX.playClick(); } catch (_) {}
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('player:customization_changed', { detail: { skinTone: st.id } }));
          }
          this.refresh();
        };
        skinToneGroup.appendChild(swatch);
      });
    }

    // 5. Draw Avatar Preview Canvas
    const avatarCanvas = this.modalEl.querySelector('#profile-avatar-canvas');
    if (avatarCanvas && typeof avatarCanvas.getContext === 'function') {
      const actx = avatarCanvas.getContext('2d');
      if (actx) {
        actx.clearRect(0, 0, 80, 80);
        // Create preview player instance
        const previewPlayer = new Player(0, 0, 0, 48, [], currentOutfitId, custom);
        previewPlayer.facing = 'south';
        // Draw 2.5D explorer centered
        previewPlayer.drawExplorerSprite(actx, 40, 44, 48, 0);
      }
    }

    // Render Explorer Wardrobe Grid (BL-78)
    const outfitGrid = this.modalEl.querySelector('#profile-outfit-grid');
    const outfitBadge = this.modalEl.querySelector('#profile-outfit-badge');
    if (outfitBadge) outfitBadge.textContent = currentOutfit.name;

    if (outfitGrid) {
      outfitGrid.innerHTML = '';
      Object.values(EXPLORER_OUTFITS).forEach((outfit) => {
        const isSelected = outfit.id === currentOutfitId;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn btn-sm outfit-select-btn ${isSelected ? 'active' : ''}`;
        btn.dataset.outfitId = outfit.id;
        btn.style.cssText = `
          display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem;
          padding: 0.45rem 0.55rem; border-radius: var(--radius-sm);
          border: 1px solid ${isSelected ? 'var(--gold, #fbbf24)' : 'var(--card-border, rgba(255,255,255,0.1))'};
          background: ${isSelected ? 'rgba(251, 191, 36, 0.15)' : 'rgba(0, 0, 0, 0.25)'};
          color: var(--text); cursor: pointer; text-align: left; width: 100%; box-sizing: border-box;
          transition: border-color 0.15s ease, background 0.15s ease;
        `;
        btn.title = `${outfit.name}: ${outfit.desc}`;
        btn.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span style="font-size: 1.15rem;">${outfit.icon}</span>
            <div style="display: flex; gap: 3px; align-items: center;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${outfit.shirt}; display: inline-block;"></span>
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${outfit.pants}; display: inline-block;"></span>
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${outfit.pack}; display: inline-block;"></span>
              ${isSelected ? '<span style="font-size: 0.75rem; color: var(--gold); font-weight: 800; margin-left: 2px;">✓</span>' : ''}
            </div>
          </div>
          <div style="font-size: 0.75rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; color: ${isSelected ? 'var(--gold)' : 'var(--text)'};">${outfit.name.split(' ')[0]}</div>
        `;
        btn.onclick = () => {
          StorageManager.setPlayerOutfit(outfit.id);
          try { audioFX.playClick(); } catch (_) {}
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('player:outfit_changed', { detail: { outfitId: outfit.id } }));
          }
          this.showMessage(`Equipped: ${outfit.name}`, 'var(--emerald)');
          this.refresh();
        };
        outfitGrid.appendChild(btn);
      });
    }

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
