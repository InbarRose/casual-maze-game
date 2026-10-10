/**
 * Casual Maze Game — Universal Global Settings Modal
 * 
 * Provides audio sliders with live sound preview, perspective toggle,
 * camera rotation transition toggle, controls cheatsheet, and diagnostics access.
 */

import { StorageManager } from '../core/storage.js';
import { AudioFx } from './audio-fx.js';
import { globalEvents } from '../core/events.js';
import { getFeedbackModal } from './feedback-modal.js';

export class SettingsModal {
  constructor() {
    this.modalEl = null;
    this.isOpen = false;
    this.audio = new AudioFx();
    this._gamepadRafId = null;
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

    this._activeTab = 'audio';

    modal.innerHTML = `
      <div class="modal-card settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.5rem;">⚙️</span>
            <h3 id="settings-modal-title" style="margin: 0; font-size: 1.25rem;">Game Settings</h3>
          </div>
          <button type="button" class="btn-close" id="btn-close-settings" title="Close Settings (Esc)">&times;</button>
        </div>

        <!-- Categorized Navigation Tab Bar (BL-107) -->
        <nav class="settings-tab-bar" id="settings-tab-bar" role="tablist" aria-label="Settings Categories">
          <button type="button" class="settings-tab-btn active" role="tab" aria-selected="true" data-tab="audio" id="tab-btn-audio">
            🔊 <span>Audio</span>
          </button>
          <button type="button" class="settings-tab-btn" role="tab" aria-selected="false" data-tab="display" id="tab-btn-display">
            🎥 <span>Display</span>
          </button>
          <button type="button" class="settings-tab-btn" role="tab" aria-selected="false" data-tab="controls" id="tab-btn-controls">
            🎮 <span>Controls</span>
          </button>
          <button type="button" class="settings-tab-btn" role="tab" aria-selected="false" data-tab="save" id="tab-btn-save">
            💾 <span>Save Data</span>
          </button>
          <button type="button" class="settings-tab-btn" role="tab" aria-selected="false" data-tab="diagnostics" id="tab-btn-diagnostics">
            🔬 <span>Support</span>
          </button>
        </nav>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem; max-height: 60vh; overflow-y: auto; padding-right: 0.3rem;">
          
          <!-- Section 1: Audio & Sound -->
          <div class="settings-group settings-tab-panel active" id="settings-panel-audio" role="tabpanel" aria-labelledby="tab-btn-audio" style="background: rgba(0, 0, 0, 0.25); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
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
          <div class="settings-group settings-tab-panel" id="settings-panel-display" role="tabpanel" aria-labelledby="tab-btn-display" style="background: rgba(0, 0, 0, 0.25); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
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

            <!-- Note & Lore Presentation Mode (BL-81) -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.8rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06);">
              <div>
                <div style="font-size: 0.85rem; font-weight: 600;">Note &amp; Lore Presentation</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Card popup modal or clean activity feed stream</div>
              </div>
              <select id="setting-note-mode-select" class="select-field" style="padding: 0.35rem 0.6rem; font-size: 0.85rem; font-weight: 600;">
                <option value="modal">📜 Card Modal Popup</option>
                <option value="feed_only">💬 Activity Feed Stream</option>
              </select>
            </div>
          </div>

          <!-- Section 3: Keyboard & Navigation Controls -->
          <div class="settings-group settings-tab-panel" id="settings-panel-controls" role="tabpanel" aria-labelledby="tab-btn-controls" style="background: rgba(0, 0, 0, 0.25); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.8rem; color: var(--emerald); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
              <span>🎮 Controls & Navigation</span>
              <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; text-transform: none; color: var(--text-muted); cursor: pointer;">
                <input type="checkbox" id="setting-simple-mode" /> Simple Keyboard Mode
              </label>
            </div>

            <!-- Movement Keybinding Scheme (Issue #63, BL-100) -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <div>
                <div style="font-size: 0.85rem; font-weight: 600;">Keyboard Movement Keys</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Choose your preferred directional key scheme</div>
              </div>
              <select id="setting-keybinding-select" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); color: var(--text); padding: 0.35rem 0.65rem; font-size: 0.82rem; outline: none; cursor: pointer;">
                <option value="wasd_arrows">WASD &amp; Arrow Keys</option>
                <option value="arrows_only">Arrow Keys Only</option>
                <option value="esdf">ESDF (Touch Typist)</option>
                <option value="azerty">AZERTY (ZQSD)</option>
                <option value="numpad">Numpad (8462 / Arrows)</option>
              </select>
            </div>

            <!-- Mouse / Touch Pointer Movement Mode (Issue #63, BL-100) -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <div>
                <div style="font-size: 0.85rem; font-weight: 600;">Mouse &amp; Tap Navigation</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Configure how floor clicks/taps move your explorer</div>
              </div>
              <select id="setting-mouse-mode-select" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); color: var(--text); padding: 0.35rem 0.65rem; font-size: 0.82rem; outline: none; cursor: pointer;">
                <option value="click_path">Click / Tap: Pathfinding (Default)</option>
                <option value="drag_only">Drag / Swipe Steering Only</option>
                <option value="disabled">Disabled (Keys / Gamepad Only)</option>
              </select>
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
              <div id="settings-move-keys-label"><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">WASD</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Arrows</kbd> : Move Explorer</div>
              <div id="settings-mouse-mode-label"><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Click / Tap</kbd> : Click to Move &amp; Interact</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Q</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">R</kbd> : Rotate Camera 90°</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">E</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Space</kbd> : Examine / Interact</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">V</kbd> : Toggle 2.5D / Top-Down</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">L</kbd> : Activity Log &amp; Replay</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">M</kbd> : Minimap &amp; Free-Pan</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">T</kbd> : Restart Level (Confirm)</div>
              <div><kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">P</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Esc</kbd> : Pause / In-Game Menu</div>
            </div>

            <!-- Gamepad Controller Layout & Live Input Tester (BL-70) -->
            <details id="settings-gamepad-details" style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06);">
              <summary style="font-size: 0.82rem; font-weight: 600; color: var(--accent); cursor: pointer; user-select: none; display: flex; align-items: center; justify-content: space-between;">
                <span>🎮 Controller Guide &amp; Live Input Tester</span>
                <span id="gamepad-connection-badge" style="font-size: 0.72rem; padding: 2px 7px; border-radius: 12px; background: rgba(148, 163, 184, 0.15); color: var(--text-muted); font-weight: 500;">No Gamepad</span>
              </summary>

              <div style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.6rem;">
                <div id="gamepad-info-banner" style="font-size: 0.75rem; font-family: var(--font-mono); background: #070b12; padding: 0.5rem 0.7rem; border-radius: 4px; border: 1px solid var(--border-glass); color: var(--text-muted);">
                  Connect any standard controller (Xbox, PlayStation, Generic USB/Bluetooth) and press any button.
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; font-size: 0.78rem;">
                  <div id="gp-btn-stick" class="gp-indicator" style="padding: 4px 6px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    <kbd style="font-family: var(--font-mono); font-size: 0.75rem;">L-Stick / D-Pad</kbd> : Move Explorer
                  </div>
                  <div id="gp-btn-a" class="gp-indicator" style="padding: 4px 6px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    <kbd style="font-family: var(--font-mono); font-size: 0.75rem;">A / ✕ (Btn 0)</kbd> : Interact / Inspect [E]
                  </div>
                  <div id="gp-btn-b" class="gp-indicator" style="padding: 4px 6px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    <kbd style="font-family: var(--font-mono); font-size: 0.75rem;">B / ◯ (Btn 1)</kbd> : Pause / Back [Esc]
                  </div>
                  <div id="gp-btn-x" class="gp-indicator" style="padding: 4px 6px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    <kbd style="font-family: var(--font-mono); font-size: 0.75rem;">X / ▢ (Btn 2)</kbd> : View Mode [V]
                  </div>
                  <div id="gp-btn-lb" class="gp-indicator" style="padding: 4px 6px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    <kbd style="font-family: var(--font-mono); font-size: 0.75rem;">LB (Btn 4)</kbd> : Rotate Left [Q]
                  </div>
                  <div id="gp-btn-rb" class="gp-indicator" style="padding: 4px 6px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    <kbd style="font-family: var(--font-mono); font-size: 0.75rem;">RB (Btn 5)</kbd> : Rotate Right [R]
                  </div>
                  <div id="gp-btn-select" class="gp-indicator" style="padding: 4px 6px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    <kbd style="font-family: var(--font-mono); font-size: 0.75rem;">Select (Btn 8)</kbd> : Map / Pan [M]
                  </div>
                  <div id="gp-btn-start" class="gp-indicator" style="padding: 4px 6px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    <kbd style="font-family: var(--font-mono); font-size: 0.75rem;">Start (Btn 9)</kbd> : Pause Menu
                  </div>
                </div>

                <div id="gamepad-live-monitor" style="display: none; font-size: 0.72rem; font-family: var(--font-mono); background: rgba(0,0,0,0.4); border-radius: 4px; padding: 0.4rem 0.6rem; color: #38bdf8; justify-content: space-between; align-items: center;">
                  <span id="gamepad-active-btns">Active: None</span>
                  <span id="gamepad-active-axes">Stick: (0.00, 0.00)</span>
                </div>
              </div>
            </details>
          </div>

          <!-- Section 4: Save Data Backup & Cloudless Sync (BL-53) -->
          <div class="settings-group settings-tab-panel" id="settings-panel-save" role="tabpanel" aria-labelledby="tab-btn-save" style="background: rgba(0, 0, 0, 0.25); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.8rem; color: var(--gold); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.6rem;">
              <span>💾 Save Data &amp; Profile Backup</span>
            </div>
            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
              <button type="button" id="btn-settings-export-save" class="btn btn-secondary btn-sm" style="flex: 1; min-width: 140px;" title="Export all progress, stars, medals, and settings to a JSON file">📥 Backup Save (.json)</button>
              <button type="button" id="btn-settings-import-save" class="btn btn-secondary btn-sm" style="flex: 1; min-width: 140px;" title="Restore all progress from a JSON backup file">📤 Restore Save (.json)</button>
              <input type="file" id="settings-save-file-input" accept=".json" style="display: none;" />
            </div>
            <div id="settings-restore-confirm-box" style="display: none; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 0.6rem; font-size: 0.75rem; color: var(--text); margin-top: 0.4rem;">
              <div style="margin-bottom: 0.3rem; font-weight: 600; color: #bae6fd;">⚠️ Restoring this backup will replace current progress, stars, and medals. Continue?</div>
              <div id="settings-restore-preview-info" style="display: none; font-family: var(--font-mono); font-size: 0.72rem; opacity: 0.9; margin-bottom: 0.4rem; color: #e0f2fe; background: rgba(0,0,0,0.25); padding: 4px 6px; border-radius: 4px;"></div>
              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button type="button" id="btn-settings-cancel-restore" class="btn btn-secondary btn-xs" style="padding: 3px 8px;">Cancel</button>
                <button type="button" id="btn-settings-confirm-restore" class="btn btn-primary btn-xs" style="padding: 3px 8px;">Confirm Restore</button>
              </div>
            </div>
            <button type="button" id="btn-settings-rollback-snapshot" class="btn btn-secondary btn-xs" style="display: none; width: 100%; margin-top: 0.4rem; color: #38bdf8; border-color: rgba(56, 189, 248, 0.3);" title="Undo previous restore and revert to emergency snapshot">
              ↩️ Undo Last Restore (Revert to Snapshot)
            </button>
            <div id="settings-save-msg" style="font-size: 0.78rem; min-height: 1.1rem; margin-top: 0.4rem; color: var(--emerald); text-align: center;"></div>

            <!-- Destructive Action: Reset Progress with Confirmation -->
            <div style="margin-top: 0.8rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 0.4rem;">
              <button type="button" id="btn-settings-reset-save" class="btn btn-secondary btn-sm" style="color: var(--rose, #f43f5e); border-color: rgba(244, 63, 94, 0.3); font-size: 0.75rem; width: 100%;" title="Reset all progress, stars, and medals">
                🗑️ Reset All Progress
              </button>
              <div id="settings-reset-confirm-box" style="display: none; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 6px; padding: 0.6rem; font-size: 0.75rem; color: var(--text);">
                <div style="margin-bottom: 0.5rem; font-weight: 600; color: #fecdd3;">⚠️ Are you sure? All stars, medals, and campaign completions will be permanently erased.</div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                  <button type="button" id="btn-settings-cancel-reset" class="btn btn-secondary btn-xs" style="padding: 3px 8px;">Cancel</button>
                  <button type="button" id="btn-settings-confirm-reset" class="btn btn-danger btn-xs" style="padding: 3px 8px; background: #e11d48; border-color: #f43f5e; color: #fff;">Confirm Reset</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 5: Diagnostics & Feedback (BL-69, BL-70) -->
          <div class="settings-group settings-tab-panel" id="settings-panel-diagnostics" role="tabpanel" aria-labelledby="tab-btn-diagnostics" style="background: rgba(0, 0, 0, 0.25); padding: 0.9rem 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="font-size: 0.8rem; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
              🔬 Diagnostics &amp; Support
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <div>
                <div style="font-size: 0.85rem; font-weight: 600;">Replay Theater &amp; Test Lab</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Watch level walkthroughs, test runners, and engine diagnostics</div>
              </div>
              <a href="test.html" class="btn btn-secondary btn-sm" style="text-decoration: none;">🧪 Open Lab</a>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; padding-top: 0.6rem; border-top: 1px solid rgba(255, 255, 255, 0.06);">
              <div>
                <div style="font-size: 0.85rem; font-weight: 600;">Feedback &amp; Bug Reporting</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Export diagnostic telemetry bundle and open GitHub issue</div>
              </div>
              <button type="button" id="btn-settings-open-feedback" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 0.35rem;">
                <span>🐞</span> Send Feedback
              </button>
            </div>
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

    // Navigation Tab Switching (BL-107)
    const tabBtns = this.modalEl.querySelectorAll('.settings-tab-btn');
    tabBtns.forEach((btn) => {
      btn.onclick = () => {
        const tabId = btn.getAttribute('data-tab');
        if (tabId) this.switchTab(tabId);
      };
    });

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

    // Note & Lore Presentation Mode (BL-81)
    const noteModeSelect = this.modalEl.querySelector('#setting-note-mode-select');
    if (noteModeSelect) {
      noteModeSelect.onchange = () => {
        const mode = noteModeSelect.value;
        StorageManager.setSetting('note_display_mode', mode);
        globalEvents.emit('settings:note_mode_changed', { mode });
      };
    }

    // Movement Keybinding Scheme Selector (Issue #63, BL-100)
    const keybindingSelect = this.modalEl.querySelector('#setting-keybinding-select');
    if (keybindingSelect) {
      keybindingSelect.onchange = () => {
        const preset = keybindingSelect.value;
        StorageManager.setSetting('keybinding_preset', preset);
        this._updateControlsCardLabels(preset, mouseModeSelect ? mouseModeSelect.value : 'click_path');
        globalEvents.emit('settings:controls_changed', {
          keybindingPreset: preset,
          mouseMoveMode: mouseModeSelect ? mouseModeSelect.value : 'click_path',
        });
      };
    }

    // Pointer Movement Mode Selector (Issue #63, BL-100)
    const mouseModeSelect = this.modalEl.querySelector('#setting-mouse-mode-select');
    if (mouseModeSelect) {
      mouseModeSelect.onchange = () => {
        const mode = mouseModeSelect.value;
        StorageManager.setSetting('mouse_move_mode', mode);
        this._updateControlsCardLabels(keybindingSelect ? keybindingSelect.value : 'wasd_arrows', mode);
        globalEvents.emit('settings:controls_changed', {
          keybindingPreset: keybindingSelect ? keybindingSelect.value : 'wasd_arrows',
          mouseMoveMode: mode,
        });
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

    // Save Data Export / Import Handlers (BL-53)
    const exportBtn = this.modalEl.querySelector('#btn-settings-export-save');
    const importBtn = this.modalEl.querySelector('#btn-settings-import-save');
    const saveFileInput = this.modalEl.querySelector('#settings-save-file-input');
    const saveMsg = this.modalEl.querySelector('#settings-save-msg');

    if (exportBtn) {
      exportBtn.onclick = () => {
        this.audio.playTabClick?.() || this.audio.playClick();
        const filename = StorageManager.downloadFullBackupFile();
        if (saveMsg) {
          saveMsg.textContent = `📥 Saved to Downloads: ${filename}!`;
          saveMsg.style.color = 'var(--emerald)';
          setTimeout(() => { if (saveMsg.textContent.includes('Saved to Downloads')) saveMsg.textContent = ''; }, 5000);
        }
      };
    }

    const restoreBox = this.modalEl.querySelector('#settings-restore-confirm-box');
    const cancelRestoreBtn = this.modalEl.querySelector('#btn-settings-cancel-restore');
    const confirmRestoreBtn = this.modalEl.querySelector('#btn-settings-confirm-restore');
    let pendingRestoreFile = null;

    const executeRestore = async (file) => {
      try {
        const res = await StorageManager.importSaveFile(file);
        if (saveMsg) {
          saveMsg.textContent = `Restored ${res.stats.campaignLevels} levels, ${res.stats.storyChapters} story chapters!`;
          saveMsg.style.color = 'var(--emerald)';
        }
        this.audio.playVictory?.();
        this.refresh();
      } catch (err) {
        if (saveMsg) {
          saveMsg.textContent = `Import failed: ${err.message}`;
          saveMsg.style.color = 'var(--rose)';
        }
      }
    };

    if (importBtn && saveFileInput) {
      importBtn.onclick = () => {
        this.audio.playTabClick?.() || this.audio.playClick();
        saveFileInput.click();
      };

      saveFileInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (restoreBox) {
          pendingRestoreFile = file;
          restoreBox.style.display = 'block';
          if (saveMsg) saveMsg.textContent = '';
          const previewEl = this.modalEl.querySelector('#settings-restore-preview-info');
          if (previewEl && typeof FileReader !== 'undefined') {
            const reader = new FileReader();
            reader.onload = (evt) => {
              try {
                const parsed = JSON.parse(evt.target?.result);
                const meta = parsed.metadata || {};
                const dt = meta.exportedDateFormatted || (parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleDateString() : 'Unknown date');
                const pName = meta.playerName || parsed.profile?.name || 'Explorer';
                const stars = meta.totalStars ?? Object.values(parsed.progress?.campaign || {}).reduce((acc, c) => acc + (c?.medals ? Object.values(c.medals).filter(Boolean).length : 0), 0);
                const lvls = meta.completedLevels ?? Object.keys(parsed.progress?.campaign || {}).length;
                const ver = meta.engineVersion || parsed.schemaVersion || '1.0';
                previewEl.textContent = `📦 Backup: ${dt} • 👤 ${pName} • ⭐ ${stars} Stars • 🏆 ${lvls} Levels • v${ver}`;
                previewEl.style.display = 'block';
              } catch (_) {
                previewEl.style.display = 'none';
              }
            };
            reader.readAsText(file);
          }
        } else {
          // Fallback if restoreBox is not in DOM
          executeRestore(file);
        }
      };

      if (cancelRestoreBtn && restoreBox) {
        cancelRestoreBtn.onclick = () => {
          pendingRestoreFile = null;
          restoreBox.style.display = 'none';
          saveFileInput.value = '';
          const previewEl = this.modalEl.querySelector('#settings-restore-preview-info');
          if (previewEl) previewEl.style.display = 'none';
        };
      }

      if (confirmRestoreBtn && restoreBox) {
        confirmRestoreBtn.onclick = async () => {
          if (!pendingRestoreFile) return;
          const file = pendingRestoreFile;
          pendingRestoreFile = null;
          restoreBox.style.display = 'none';
          saveFileInput.value = '';
          const previewEl = this.modalEl.querySelector('#settings-restore-preview-info');
          if (previewEl) previewEl.style.display = 'none';
          await executeRestore(file);
          updateRollbackVisibility();
        };
      }
    }

    // Rollback Emergency Snapshot Handler (BL-76)
    const rollbackBtn = this.modalEl.querySelector('#btn-settings-rollback-snapshot');
    const updateRollbackVisibility = () => {
      if (!rollbackBtn) return;
      const snapshot = StorageManager.getEmergencySnapshot();
      rollbackBtn.style.display = snapshot ? 'block' : 'none';
    };
    updateRollbackVisibility();

    if (rollbackBtn) {
      rollbackBtn.onclick = () => {
        try {
          const res = StorageManager.rollbackEmergencySnapshot();
          if (saveMsg) {
            saveMsg.textContent = `↩️ Reverted to previous save state (${res.stats.campaignLevels} levels)!`;
            saveMsg.style.color = 'var(--emerald)';
          }
          this.audio.playVictory?.();
          this.refresh();
          updateRollbackVisibility();
        } catch (err) {
          if (saveMsg) {
            saveMsg.textContent = `Rollback failed: ${err.message}`;
            saveMsg.style.color = 'var(--rose)';
          }
        }
      };
    }

    // Reset Progress Confirmation Logic
    const resetBtn = this.modalEl.querySelector('#btn-settings-reset-save');
    const resetBox = this.modalEl.querySelector('#settings-reset-confirm-box');
    const cancelResetBtn = this.modalEl.querySelector('#btn-settings-cancel-reset');
    const confirmResetBtn = this.modalEl.querySelector('#btn-settings-confirm-reset');

    if (resetBtn && resetBox) {
      resetBtn.onclick = () => {
        resetBox.style.display = 'block';
        resetBtn.style.display = 'none';
      };
      cancelResetBtn.onclick = () => {
        resetBox.style.display = 'none';
        resetBtn.style.display = 'block';
      };
      confirmResetBtn.onclick = () => {
        StorageManager.resetAllProgress();
        resetBox.style.display = 'none';
        resetBtn.style.display = 'block';
        if (saveMsg) {
          saveMsg.textContent = 'All game progress has been reset.';
          saveMsg.style.color = 'var(--rose)';
        }
        this.audio.playClick?.();
        this.refresh();
        updateRollbackVisibility();
      };
    }

    // Feedback & Bug Reporting Modal Trigger (BL-69, BL-70)
    const feedbackBtn = this.modalEl.querySelector('#btn-settings-open-feedback');
    if (feedbackBtn) {
      feedbackBtn.onclick = () => {
        this.close();
        getFeedbackModal().open({ pageTitle: 'Game Settings' });
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
    const noteMode = StorageManager.getSetting('note_display_mode', 'modal');
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
    const noteModeSelect = this.modalEl.querySelector('#setting-note-mode-select');
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

    if (noteModeSelect) noteModeSelect.value = noteMode;
    if (hotkeysToggleEl) hotkeysToggleEl.checked = effectiveHotkeys;
    if (simpleModeCbEl) simpleModeCbEl.checked = !effectiveHotkeys;

    const keybindingPreset = StorageManager.getSetting('keybinding_preset', 'wasd_arrows');
    const mouseMoveMode = StorageManager.getSetting('mouse_move_mode', 'click_path');

    const keybindingSelect = this.modalEl.querySelector('#setting-keybinding-select');
    const mouseModeSelect = this.modalEl.querySelector('#setting-mouse-mode-select');

    if (keybindingSelect) keybindingSelect.value = keybindingPreset;
    if (mouseModeSelect) mouseModeSelect.value = mouseMoveMode;
    this._updateControlsCardLabels(keybindingPreset, mouseMoveMode);
  }

  _updateControlsCardLabels(keybindingPreset, mouseMoveMode) {
    if (!this.modalEl) return;
    const moveKeysLabel = this.modalEl.querySelector('#settings-move-keys-label');
    const mouseModeLabel = this.modalEl.querySelector('#settings-mouse-mode-label');

    if (moveKeysLabel) {
      if (keybindingPreset === 'arrows_only') {
        moveKeysLabel.innerHTML = '<kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Arrows</kbd> : Move Explorer';
      } else if (keybindingPreset === 'esdf') {
        moveKeysLabel.innerHTML = '<kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">ESDF</kbd> : Move Explorer';
      } else if (keybindingPreset === 'azerty') {
        moveKeysLabel.innerHTML = '<kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">ZQSD</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Arrows</kbd> : Move Explorer';
      } else if (keybindingPreset === 'numpad') {
        moveKeysLabel.innerHTML = '<kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Numpad 8462</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Arrows</kbd> : Move';
      } else {
        moveKeysLabel.innerHTML = '<kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">WASD</kbd> / <kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Arrows</kbd> : Move Explorer';
      }
    }

    if (mouseModeLabel) {
      if (mouseMoveMode === 'drag_only') {
        mouseModeLabel.innerHTML = '<kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Drag / Swipe</kbd> : Drag to Steer (Tapping Ignored)';
      } else if (mouseMoveMode === 'disabled') {
        mouseModeLabel.innerHTML = '<kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Pointer Move</kbd> : Disabled (Keys/Gamepad Only)';
      } else {
        mouseModeLabel.innerHTML = '<kbd style="background: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); border: 1px solid #334155;">Click / Tap</kbd> : Click to Move &amp; Interact';
      }
    }
  }

  /**
   * Switch the active settings category tab
   * @param {string} tabId 'audio' | 'display' | 'controls' | 'save' | 'diagnostics'
   */
  switchTab(tabId) {
    if (!this.modalEl) return;
    this._activeTab = tabId;

    const tabBtns = this.modalEl.querySelectorAll('.settings-tab-btn');
    tabBtns.forEach((btn) => {
      const match = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    const panels = this.modalEl.querySelectorAll('.settings-tab-panel');
    panels.forEach((panel) => {
      const match = panel.id === `settings-panel-${tabId}`;
      panel.classList.toggle('active', match);
    });
  }

  open(targetTab = null) {
    this.ensureDom();
    this.refresh();
    if (targetTab) {
      this.switchTab(targetTab);
    } else if (this._activeTab) {
      this.switchTab(this._activeTab);
    }
    if (this.modalEl) {
      this.modalEl.style.display = 'flex';
      this.isOpen = true;
      this._startGamepadPolling();
    }
  }

  close() {
    this._stopGamepadPolling();
    if (this.modalEl) {
      this.modalEl.style.display = 'none';
      this.isOpen = false;
    }
  }

  _startGamepadPolling() {
    if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') return;
    this._stopGamepadPolling();
    const poll = () => {
      if (!this.isOpen) return;
      this._updateGamepadStatus();
      this._gamepadRafId = requestAnimationFrame(poll);
    };
    this._gamepadRafId = requestAnimationFrame(poll);
  }

  _stopGamepadPolling() {
    if (this._gamepadRafId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this._gamepadRafId);
      this._gamepadRafId = null;
    }
  }

  _updateGamepadStatus() {
    if (!this.modalEl) return;

    const gamepads = (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function')
      ? navigator.getGamepads()
      : [];
    let activePad = null;
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        activePad = gamepads[i];
        break;
      }
    }

    const badge = this.modalEl.querySelector('#gamepad-connection-badge');
    const banner = this.modalEl.querySelector('#gamepad-info-banner');
    const monitor = this.modalEl.querySelector('#gamepad-live-monitor');
    const activeBtnsEl = this.modalEl.querySelector('#gamepad-active-btns');
    const activeAxesEl = this.modalEl.querySelector('#gamepad-active-axes');

    if (!activePad) {
      if (badge) {
        badge.textContent = 'No Gamepad';
        badge.style.background = 'rgba(148, 163, 184, 0.15)';
        badge.style.color = 'var(--text-muted)';
      }
      if (banner) {
        banner.textContent = 'Connect any standard controller (Xbox, PlayStation, Generic USB/Bluetooth) and press any button.';
      }
      if (monitor) {
        monitor.style.display = 'none';
      }
      this._clearGamepadHighlights();
      return;
    }

    // Active gamepad connected
    if (badge) {
      badge.textContent = `Connected (#${activePad.index})`;
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.color = 'var(--emerald, #10b981)';
    }
    if (banner) {
      banner.textContent = `🎮 ${activePad.id || 'Standard Gamepad'} (${activePad.buttons?.length || 0} buttons, ${activePad.axes?.length || 0} axes)`;
    }
    if (monitor) {
      monitor.style.display = 'flex';
    }

    const pressedButtonIndices = [];
    const btnMap = {
      0: 'gp-btn-a',
      1: 'gp-btn-b',
      2: 'gp-btn-x',
      4: 'gp-btn-lb',
      5: 'gp-btn-rb',
      8: 'gp-btn-select',
      9: 'gp-btn-start',
    };

    // D-Pad buttons
    const isDpad = activePad.buttons && (
      activePad.buttons[12]?.pressed ||
      activePad.buttons[13]?.pressed ||
      activePad.buttons[14]?.pressed ||
      activePad.buttons[15]?.pressed
    );

    // Sticks
    const ax0 = activePad.axes?.[0] || 0;
    const ax1 = activePad.axes?.[1] || 0;
    const isStickMoved = Math.abs(ax0) > 0.25 || Math.abs(ax1) > 0.25;

    // Highlight stick/dpad
    const stickEl = this.modalEl.querySelector('#gp-btn-stick');
    if (stickEl) {
      this._setHighlight(stickEl, isStickMoved || isDpad);
    }

    // Highlight action buttons
    for (const [btnIndex, elId] of Object.entries(btnMap)) {
      const idx = Number(btnIndex);
      const isPressed = !!activePad.buttons?.[idx]?.pressed;
      const el = this.modalEl.querySelector(`#${elId}`);
      if (el) {
        this._setHighlight(el, isPressed);
      }
      if (isPressed) {
        pressedButtonIndices.push(`B${idx}`);
      }
    }

    if (activeBtnsEl) {
      activeBtnsEl.textContent = pressedButtonIndices.length > 0
        ? `Pressed: ${pressedButtonIndices.join(', ')}`
        : 'Pressed: None';
    }
    if (activeAxesEl) {
      activeAxesEl.textContent = `Stick: (${ax0.toFixed(2)}, ${ax1.toFixed(2)})`;
    }
  }

  _setHighlight(el, active) {
    if (!el) return;
    if (active) {
      el.style.background = 'rgba(56, 189, 248, 0.25)';
      el.style.borderColor = 'var(--accent, #38bdf8)';
      el.style.color = '#ffffff';
      el.style.fontWeight = '700';
    } else {
      el.style.background = 'rgba(255, 255, 255, 0.03)';
      el.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      el.style.color = '';
      el.style.fontWeight = '';
    }
  }

  _clearGamepadHighlights() {
    if (!this.modalEl) return;
    const indicators = this.modalEl.querySelectorAll ? this.modalEl.querySelectorAll('.gp-indicator') : [];
    if (indicators && indicators.length > 0) {
      indicators.forEach(el => this._setHighlight(el, false));
    } else {
      const ids = ['gp-btn-stick', 'gp-btn-a', 'gp-btn-b', 'gp-btn-x', 'gp-btn-lb', 'gp-btn-rb', 'gp-btn-select', 'gp-btn-start'];
      for (const id of ids) {
        const el = this.modalEl.querySelector(`#${id}`);
        if (el) this._setHighlight(el, false);
      }
    }
  }
}
