/**
 * Casual Maze Game — Universal Global Settings Modal
 * 
 * Provides audio sliders with live sound preview, perspective toggle,
 * camera rotation transition toggle, controls cheatsheet, and diagnostics access.
 */

import { StorageManager } from '../core/storage.js';
import { AudioFx } from './audio-fx.js';
import { globalEvents } from '../core/events.js';

export class SettingsModal {
  constructor() {
    this.modalEl = null;
    this.isOpen = false;
    this.audio = new AudioFx();
    this.ensureDom();
  }

  ensureDom() {
    if (typeof document === 'undefined') return;

    let existing = document.getElementById('settings-modal');
    if (existing) {
      this.modalEl = existing;
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal-backdrop';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-card settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.5rem;">⚙️</span>
            <h3 id="settings-modal-title" style="margin: 0; font-size: 1.25rem;">Game Settings</h3>
          </div>
          <button type="button" class="btn-close" id="btn-close-settings" title="Close Settings (Esc)">&times;</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.2rem; max-height: 70vh; overflow-y: auto; padding-right: 0.3rem;">
          
          <!-- Section 1: Audio & Sound -->
          <div class="settings-group" style="background: rgba(0, 0, 0, 0.25); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.8rem; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
              <span>🔊 Audio & Procedural Sound FX</span>
              <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; text-transform: none; color: var(--text-muted); cursor: pointer;">
                <input type="checkbox" id="setting-mute-all" /> Mute All
              </label>
            </div>

            <!-- Master Volume -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
              <label for="setting-vol-master" style="font-size: 0.85rem; font-weight: 600;">Master Volume</label>
              <div style="display: flex; align-items: center; gap: 0.7rem; width: 60%;">
                <input type="range" id="setting-vol-master" min="0" max="100" value="80" style="flex: 1;" />
                <span id="setting-vol-master-label" style="font-size: 0.8rem; font-family: var(--font-mono); width: 35px; text-align: right;">80%</span>
              </div>
            </div>

            <!-- Sound Effects Volume -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
              <label for="setting-vol-sfx" style="font-size: 0.85rem; font-weight: 600;">Sound Effects (SFX)</label>
              <div style="display: flex; align-items: center; gap: 0.7rem; width: 60%;">
                <input type="range" id="setting-vol-sfx" min="0" max="100" value="85" style="flex: 1;" />
                <span id="setting-vol-sfx-label" style="font-size: 0.8rem; font-family: var(--font-mono); width: 35px; text-align: right;">85%</span>
              </div>
            </div>

            <!-- BGM Volume -->
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <label for="setting-vol-bgm" style="font-size: 0.85rem; font-weight: 600;">Ambient Music (BGM)</label>
              <div style="display: flex; align-items: center; gap: 0.7rem; width: 60%;">
                <input type="range" id="setting-vol-bgm" min="0" max="100" value="50" style="flex: 1;" />
                <span id="setting-vol-bgm-label" style="font-size: 0.8rem; font-family: var(--font-mono); width: 35px; text-align: right;">50%</span>
              </div>
            </div>
          </div>

          <!-- Section 2: Display & Perspective -->
          <div class="settings-group" style="background: rgba(0, 0, 0, 0.25); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.8rem; color: var(--gold); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">
              🎥 Camera & View Perspective
            </div>

            <!-- Perspective Mode -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem;">
              <div>
                <div style="font-size: 0.85rem; font-weight: 600;">Default Perspective</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Choose between 2.5D angled depth or flat retro 2D</div>
              </div>
              <select id="setting-perspective-select" class="select-field" style="padding: 0.35rem 0.6rem; font-size: 0.85rem; font-weight: 600;">
                <option value="angled">🏰 2.5D Angled View</option>
                <option value="topdown">🗺️ Flat Top-Down</option>
              </select>
            </div>

            <!-- Smooth Camera Rotation -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem;">
              <div>
                <div style="font-size: 0.85rem; font-weight: 600;">Smooth Camera Rotation</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Animate world rotation easing [Q/E]</div>
              </div>
              <label class="switch" style="position: relative; display: inline-block; width: 44px; height: 24px;">
                <input type="checkbox" id="setting-smooth-rotation" checked />
                <span class="slider" style="position: absolute; cursor: pointer; inset: 0; background-color: #334155; border-radius: 24px; transition: 0.2s;"></span>
              </label>
            </div>

            <!-- High Contrast Mode -->
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 0.85rem; font-weight: 600;">High Contrast Grid</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Sharpen maze floor contrast & wall outlines</div>
              </div>
              <label class="switch" style="position: relative; display: inline-block; width: 44px; height: 24px;">
                <input type="checkbox" id="setting-high-contrast" />
                <span class="slider" style="position: absolute; cursor: pointer; inset: 0; background-color: #334155; border-radius: 24px; transition: 0.2s;"></span>
              </label>
            </div>
          </div>

          <!-- Section 3: Keyboard & Navigation Controls -->
          <div class="settings-group" style="background: rgba(0, 0, 0, 0.25); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.8rem; color: var(--emerald); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
              <span>🎮 Controls & Navigation</span>
              <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; text-transform: none; color: var(--text-muted); cursor: pointer;">
                <input type="checkbox" id="setting-simple-mode" /> Simple Keyboard Mode
              </label>
            </div>

            <!-- Enable Single-Letter Hotkeys Toggle -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <div>
                <div style="font-size: 0.85rem; font-weight: 600;">Enable Single-Letter Hotkeys</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Allow Q/R (Rotate), T (Restart), M (Map), V (3D), L (Log)</div>
              </div>
              <label class="switch" style="position: relative; display: inline-block; width: 44px; height: 24px;">
                <input type="checkbox" id="setting-hotkeys-toggle" checked />
                <span class="slider" style="position: absolute; cursor: pointer; inset: 0; background-color: #334155; border-radius: 24px; transition: 0.2s;"></span>
              </label>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.8rem;">
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">WASD</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Arrows</kbd> : Move Explorer</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Click / Tap</kbd> : Click to Move &amp; Interact</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Q</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">R</kbd> : Rotate Camera 90°</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">E</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Space</kbd> : Examine / Interact</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">V</kbd> : Toggle 2.5D / Top-Down</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">L</kbd> : Activity Log &amp; Replay</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">M</kbd> : Minimap &amp; Free-Pan</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">T</kbd> : Restart Level (Confirm)</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">P</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Esc</kbd> : Pause / In-Game Menu</div>
            </div>
          </div>

          <!-- Section 4: Diagnostics & Links -->
          <div class="settings-group" style="background: rgba(0, 0, 0, 0.25); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.85rem; font-weight: 600;">Replay Theater & Diagnostics Lab</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Watch level walkthroughs, test runners, and issue reporting</div>
            </div>
            <a href="test.html" class="btn btn-secondary btn-sm" style="text-decoration: none;">🧪 Open Lab</a>
          </div>

        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-glass); padding-top: 0.8rem; margin-top: 0.4rem;">
          <button type="button" class="btn btn-primary btn-sm" id="btn-done-settings">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this.bindEvents();
  }

  bindEvents() {
    if (!this.modalEl) return;

    const closeBtn = this.modalEl.querySelector('#btn-close-settings');
    const doneBtn = this.modalEl.querySelector('#btn-done-settings');
    if (closeBtn) closeBtn.onclick = () => this.close();
    if (doneBtn) doneBtn.onclick = () => this.close();

    this.modalEl.onclick = (e) => {
      if (e.target === this.modalEl) this.close();
    };

    // Mute All Checkbox
    const muteAllCb = this.modalEl.querySelector('#setting-mute-all');
    if (muteAllCb) {
      muteAllCb.onchange = () => {
        const isMuted = muteAllCb.checked;
        StorageManager.setSetting('muted', isMuted);
        if (isMuted) {
          this.audio.mute();
        } else {
          this.audio.unmute();
          this.audio.playCollect();
        }
        globalEvents.emit('sound:toggled', { muted: isMuted });
      };
    }

    // Master Volume
    const masterSlider = this.modalEl.querySelector('#setting-vol-master');
    const masterLabel = this.modalEl.querySelector('#setting-vol-master-label');
    if (masterSlider && masterLabel) {
      masterSlider.oninput = () => {
        const val = parseInt(masterSlider.value, 10);
        masterLabel.textContent = `${val}%`;
        this.audio.setMasterVolume(val / 100);
      };
      masterSlider.onchange = () => {
        this.audio.playMove();
      };
    }

    // SFX Volume
    const sfxSlider = this.modalEl.querySelector('#setting-vol-sfx');
    const sfxLabel = this.modalEl.querySelector('#setting-vol-sfx-label');
    if (sfxSlider && sfxLabel) {
      sfxSlider.oninput = () => {
        const val = parseInt(sfxSlider.value, 10);
        sfxLabel.textContent = `${val}%`;
        this.audio.setSfxVolume(val / 100);
      };
      sfxSlider.onchange = () => {
        this.audio.playUnlock();
      };
    }

    // BGM Volume
    const bgmSlider = this.modalEl.querySelector('#setting-vol-bgm');
    const bgmLabel = this.modalEl.querySelector('#setting-vol-bgm-label');
    if (bgmSlider && bgmLabel) {
      bgmSlider.oninput = () => {
        const val = parseInt(bgmSlider.value, 10);
        bgmLabel.textContent = `${val}%`;
        this.audio.setBgmVolume(val / 100);
      };
    }

    // Perspective Selector
    const perspSelect = this.modalEl.querySelector('#setting-perspective-select');
    if (perspSelect) {
      perspSelect.onchange = () => {
        const val = perspSelect.value;
        StorageManager.setSetting('perspective', val);
        globalEvents.emit('perspective:toggled', { mode: val });
      };
    }

    // Smooth Rotation Toggle
    const smoothRotToggle = this.modalEl.querySelector('#setting-smooth-rotation');
    if (smoothRotToggle) {
      smoothRotToggle.onchange = () => {
        StorageManager.setSetting('smooth_rotation', smoothRotToggle.checked);
      };
    }

    // High Contrast Toggle
    const contrastToggle = this.modalEl.querySelector('#setting-high-contrast');
    if (contrastToggle) {
      contrastToggle.onchange = () => {
        StorageManager.setSetting('high_contrast', contrastToggle.checked);
        if (typeof document !== 'undefined') {
          document.body.classList.toggle('high-contrast-mode', contrastToggle.checked);
        }
      };
    }

    // Hotkeys & Simple Keyboard Mode Toggles
    const hotkeysToggle = this.modalEl.querySelector('#setting-hotkeys-toggle');
    const simpleModeCb = this.modalEl.querySelector('#setting-simple-mode');

    if (hotkeysToggle) {
      hotkeysToggle.onchange = () => {
        const enabled = hotkeysToggle.checked;
        StorageManager.setSetting('hotkeys_enabled', enabled);
        StorageManager.setSetting('simple_keyboard_mode', !enabled);
        if (simpleModeCb) simpleModeCb.checked = !enabled;
        globalEvents.emit('hotkeys:toggled', { enabled });
      };
    }

    if (simpleModeCb) {
      simpleModeCb.onchange = () => {
        const simple = simpleModeCb.checked;
        StorageManager.setSetting('simple_keyboard_mode', simple);
        StorageManager.setSetting('hotkeys_enabled', !simple);
        if (hotkeysToggle) hotkeysToggle.checked = !simple;
        globalEvents.emit('hotkeys:toggled', { enabled: !simple });
      };
    }

    document.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.close();
      }
    });
  }

  refresh() {
    if (!this.modalEl) return;

    const isMuted = StorageManager.getSetting('muted', false);
    const volMaster = Math.round(StorageManager.getSetting('volume_master', 0.8) * 100);
    const volSfx = Math.round(StorageManager.getSetting('volume_sfx', 0.85) * 100);
    const volBgm = Math.round(StorageManager.getSetting('volume_bgm', 0.5) * 100);
    const perspective = StorageManager.getSetting('perspective', 'angled');
    const smoothRot = StorageManager.getSetting('smooth_rotation', true);
    const highContrast = StorageManager.getSetting('high_contrast', false);
    const hotkeysEnabled = StorageManager.getSetting('hotkeys_enabled', true);
    const simpleMode = StorageManager.getSetting('simple_keyboard_mode', false);
    const effectiveHotkeys = hotkeysEnabled && !simpleMode;

    const muteAllCb = this.modalEl.querySelector('#setting-mute-all');
    const masterSlider = this.modalEl.querySelector('#setting-vol-master');
    const masterLabel = this.modalEl.querySelector('#setting-vol-master-label');
    const sfxSlider = this.modalEl.querySelector('#setting-vol-sfx');
    const sfxLabel = this.modalEl.querySelector('#setting-vol-sfx-label');
    const bgmSlider = this.modalEl.querySelector('#setting-vol-bgm');
    const bgmLabel = this.modalEl.querySelector('#setting-vol-bgm-label');
    const perspSelect = this.modalEl.querySelector('#setting-perspective-select');
    const smoothRotToggle = this.modalEl.querySelector('#setting-smooth-rotation');
    const contrastToggle = this.modalEl.querySelector('#setting-high-contrast');
    const hotkeysToggleEl = this.modalEl.querySelector('#setting-hotkeys-toggle');
    const simpleModeCbEl = this.modalEl.querySelector('#setting-simple-mode');

    if (muteAllCb) muteAllCb.checked = isMuted;
    if (masterSlider) masterSlider.value = volMaster;
    if (masterLabel) masterLabel.textContent = `${volMaster}%`;
    if (sfxSlider) sfxSlider.value = volSfx;
    if (sfxLabel) sfxLabel.textContent = `${volSfx}%`;
    if (bgmSlider) bgmSlider.value = volBgm;
    if (bgmLabel) bgmLabel.textContent = `${volBgm}%`;
    if (perspSelect) perspSelect.value = perspective;
    if (smoothRotToggle) smoothRotToggle.checked = smoothRot;
    if (contrastToggle) contrastToggle.checked = highContrast;
    if (hotkeysToggleEl) hotkeysToggleEl.checked = effectiveHotkeys;
    if (simpleModeCbEl) simpleModeCbEl.checked = !effectiveHotkeys;
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
