/**
 * Casual Maze Game — Universal Guide & Mechanics Handbook Modal (BL-71, CMP-16)
 * 
 * Provides an interactive, multi-tabbed visual handbook covering:
 * - Controls & Multi-Input navigation (Keyboard, Mouse, Touch Drag, Virtual D-pad, Gamepad)
 * - Labyrinth Entities (Keys, Locked Doors, Levers, Portals, Checkpoints, Relics)
 * - Multi-Elevation Bridges & Directional Ramps (with clear SVG architecture diagrams)
 * - Secrets, Illusory Walls, Par Scoring & Prestige Medal Tiers
 */

import { audioFX } from './audio-fx.js';

export class GuideModal {
  constructor() {
    this.modalEl = null;
    this.isOpen = false;
    this.activeTab = 'controls';
    this._boundKeyHandler = this._handleKeyDown.bind(this);
    this.ensureDom();
  }

  ensureDom() {
    if (typeof document === 'undefined') return;

    let existing = document.getElementById('guide-modal');
    if (existing) {
      this.modalEl = existing;
      this._wireExistingDom();
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'guide-modal';
    modal.className = 'modal-backdrop';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-card guide-card-dialog" role="dialog" aria-modal="true" aria-labelledby="guide-modal-title" style="max-width: 720px; width: 95%;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.5rem;">📖</span>
            <div>
              <h3 id="guide-modal-title" style="margin: 0; font-size: 1.25rem;">Explorer &amp; Architect Handbook</h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Gameplay Rules, Mechanics &amp; Spatial Architecture</span>
            </div>
          </div>
          <button type="button" class="btn-close" id="btn-close-guide" title="Close Guide (Esc)">&times;</button>
        </div>

        <!-- Navigation Tabs -->
        <div class="guide-tabs-bar" style="display: flex; gap: 0.4rem; padding: 0.6rem 1rem; border-bottom: 1px solid var(--border-glass); background: rgba(0, 0, 0, 0.25); overflow-x: auto;">
          <button type="button" class="guide-tab-btn active" data-tab="controls" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: var(--radius-sm); border: 1px solid transparent; background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.35rem; white-space: nowrap;">
            <span>🎮</span> Controls &amp; Movement
          </button>
          <button type="button" class="guide-tab-btn" data-tab="entities" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: var(--radius-sm); border: 1px solid transparent; background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.35rem; white-space: nowrap;">
            <span>🗝️</span> Entities &amp; Locks
          </button>
          <button type="button" class="guide-tab-btn" data-tab="bridges" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: var(--radius-sm); border: 1px solid transparent; background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.35rem; white-space: nowrap;">
            <span>🌉</span> Bridges &amp; Elevation
          </button>
          <button type="button" class="guide-tab-btn" data-tab="secrets" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 600; border-radius: var(--radius-sm); border: 1px solid transparent; background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.35rem; white-space: nowrap;">
            <span>✨</span> Secrets &amp; Medals
          </button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem; max-height: 70vh; overflow-y: auto; padding: 1.1rem; padding-right: 0.5rem;">
          
          <!-- TAB 1: Controls & Movement -->
          <div class="guide-tab-pane" id="guide-pane-controls" style="display: flex; flex-direction: column; gap: 0.9rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45;">
              Explore labyrinths effortlessly using your choice of desktop keyboard, mouse clicks, mobile touch gestures, or gamepad controller.
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.8rem;">
              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem;">
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--accent); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                  <span>⌨️</span> Keyboard Navigation
                </div>
                <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.8rem; color: var(--text); line-height: 1.6;">
                  <li><kbd>WASD</kbd> or <kbd>Arrow Keys</kbd> : Step in cardinal directions</li>
                  <li><kbd>Q</kbd> / <kbd>R</kbd> : Rotate world camera 90° smoothly</li>
                  <li><kbd>E</kbd> / <kbd>Space</kbd> : Inspect &amp; activate adjacent interactable</li>
                  <li><kbd>V</kbd> : Toggle between 2.5D Angled and Blueprint Top-Down</li>
                  <li><kbd>M</kbd> : Toggle Tactical Minimap &amp; radar view</li>
                  <li><kbd>Esc</kbd> / <kbd>P</kbd> : Pause game menu</li>
                  <li><kbd>T</kbd> : Restart level (with confirmation safety)</li>
                </ul>
              </div>

              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem;">
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--emerald); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                  <span>📱</span> Touch &amp; Mobile Controls
                </div>
                <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.8rem; color: var(--text); line-height: 1.6;">
                  <li><strong>Touch Drag Steering</strong> : Slide finger across canvas to glide continuously (125ms repeat). Turn corners mid-drag!</li>
                  <li><strong>One-Tap BFS Pathfinding</strong> : Tap any visible corridor tile to auto-navigate around obstacles with glowing waypoint pips.</li>
                  <li><strong>Moveable Top Virtual D-pad</strong> : Positioned at top-left to avoid system gesture conflicts. Hold to auto-repeat, or drag handle to dock anywhere.</li>
                  <li><strong>Minimap Gestures</strong> : Pinch to zoom ($1.0\times$–$3.5\times$), double-tap to toggle corridor zoom, or drag to pan.</li>
                </ul>
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem;">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--gold); margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                <span>🎮</span> Gamepad Controller Support
              </div>
              <div style="font-size: 0.8rem; color: var(--text); line-height: 1.5;">
                Connect any USB or Bluetooth gamepad (Xbox, PlayStation, Generic). Left Stick or D-Pad moves the explorer; <kbd>A</kbd> / <kbd>✕</kbd> interacts; Bumpers (<kbd>LB</kbd>/<kbd>RB</kbd>) rotate the camera; <kbd>B</kbd> or <kbd>Start</kbd> pauses. Check the live input tester in <strong>Settings</strong>!
              </div>
            </div>
          </div>

          <!-- TAB 2: Entities & Mechanics -->
          <div class="guide-tab-pane" id="guide-pane-entities" style="display: none; flex-direction: column; gap: 0.9rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45;">
              Every labyrinth is gated with 100% zero-bypass challenge integrity. Understand the interactive puzzle entities:
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.8rem;">
              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem;">
                <div style="font-weight: 700; color: #fbbf24; font-size: 0.85rem; margin-bottom: 0.4rem;">🗝️ Keys &amp; 🔒 Locked Security Gates</div>
                <div style="font-size: 0.8rem; color: var(--text); line-height: 1.5;">
                  Keys feature distinct ward cuts and color palettes (Gold, Iron, Emerald, Ruby, Violet). Pick up a key by stepping on it; approach the matching locked gate and press <kbd>E</kbd> (or tap) to permanently unlock it.
                </div>
              </div>

              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem;">
                <div style="font-weight: 700; color: #38bdf8; font-size: 0.85rem; margin-bottom: 0.4rem;">⚙️ Levers &amp; Dynamic Wall Gates</div>
                <div style="font-size: 0.8rem; color: var(--text); line-height: 1.5;">
                  Clockwork levers toggle mechanical barriers across the maze. Pulling a lever (<kbd>E</kbd>) raises or lowers linked wall segments, opening alternate transit routes.
                </div>
              </div>

              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem;">
                <div style="font-weight: 700; color: #c084fc; font-size: 0.85rem; margin-bottom: 0.4rem;">🌀 Astral Teleporters &amp; Portals</div>
                <div style="font-size: 0.8rem; color: var(--text); line-height: 1.5;">
                  Teleport discs transport the explorer instantly to paired nodes across dimensions. Step onto the pad to activate instant warp without momentum loss.
                </div>
              </div>

              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem;">
                <div style="font-weight: 700; color: #f43f5e; font-size: 0.85rem; margin-bottom: 0.4rem;">🔥 Flame Vents &amp; Rhythm Hazards</div>
                <div style="font-size: 0.8rem; color: var(--text); line-height: 1.5;">
                  Timed geothermal vents pulse periodically between dormant and searing states. Time your footsteps carefully to dash across during cooling cycles.
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: Bridges & Elevation -->
          <div class="guide-tab-pane" id="guide-pane-bridges" style="display: none; flex-direction: column; gap: 0.9rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45;">
              Multi-elevation structures allow pathways to cross over and under each other without colliding:
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
              <!-- B_EW Diagram -->
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem; text-align: center;">
                <div style="font-weight: 700; color: #fbbf24; font-size: 0.85rem; margin-bottom: 0.5rem;">Bridge EW (B_EW) Elevation Crossing</div>
                <svg viewBox="0 0 240 160" width="100%" height="140" style="max-width: 240px; display: block; margin: 0 auto;">
                  <rect x="0" y="0" width="240" height="160" fill="#0f172a" rx="6" />
                  <!-- Ground passage E <-> W (Cyan) -->
                  <rect x="10" y="60" width="220" height="40" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-dasharray="4" stroke-width="1.5" rx="4" />
                  <line x1="20" y1="80" x2="220" y2="80" stroke="#38bdf8" stroke-width="2" />
                  <text x="120" y="96" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">Ground Tunnel (Z=0) East ↔ West</text>

                  <!-- Overhead Bridge Deck & Ramps N <-> S (Gold) -->
                  <rect x="95" y="10" width="50" height="40" fill="rgba(251, 191, 36, 0.25)" stroke="#fbbf24" stroke-width="1.5" rx="3" />
                  <text x="120" y="28" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">R_S (▲)</text>
                  <text x="120" y="42" fill="#94a3b8" font-size="8" text-anchor="middle">Climb South</text>

                  <rect x="90" y="55" width="60" height="50" fill="#fbbf24" stroke="#d97706" stroke-width="2" rx="4" />
                  <text x="120" y="80" fill="#1e293b" font-size="11" font-weight="800" text-anchor="middle">B_EW</text>
                  <text x="120" y="94" fill="#1e293b" font-size="8" font-weight="700" text-anchor="middle">Overhead (Z=1)</text>

                  <rect x="95" y="110" width="50" height="40" fill="rgba(251, 191, 36, 0.25)" stroke="#fbbf24" stroke-width="1.5" rx="3" />
                  <text x="120" y="128" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">R_N (▼)</text>
                  <text x="120" y="142" fill="#94a3b8" font-size="8" text-anchor="middle">Climb North</text>
                </svg>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; text-align: left;">
                  • <strong>Ground Level (Z=0)</strong> runs <strong>East ↔ West</strong> underneath.<br/>
                  • <strong>Overhead Level (Z=1)</strong> runs <strong>North ↔ South</strong> across bridge deck.
                </div>
              </div>

              <!-- B_NS Diagram -->
              <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem; text-align: center;">
                <div style="font-weight: 700; color: #fbbf24; font-size: 0.85rem; margin-bottom: 0.5rem;">Bridge NS (B_NS) Elevation Crossing</div>
                <svg viewBox="0 0 240 160" width="100%" height="140" style="max-width: 240px; display: block; margin: 0 auto;">
                  <rect x="0" y="0" width="240" height="160" fill="#0f172a" rx="6" />
                  <!-- Ground passage N <-> S (Cyan) -->
                  <rect x="100" y="10" width="40" height="140" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-dasharray="4" stroke-width="1.5" rx="4" />
                  <line x1="120" y1="15" x2="120" y2="145" stroke="#38bdf8" stroke-width="2" />
                  <text x="120" y="152" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">Ground (Z=0) N ↔ S</text>

                  <!-- Overhead Bridge Deck & Ramps E <-> W (Gold) -->
                  <rect x="10" y="60" width="50" height="40" fill="rgba(251, 191, 36, 0.25)" stroke="#fbbf24" stroke-width="1.5" rx="3" />
                  <text x="35" y="78" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">R_E (▶)</text>
                  <text x="35" y="92" fill="#94a3b8" font-size="8" text-anchor="middle">Climb East</text>

                  <rect x="65" y="55" width="110" height="50" fill="#fbbf24" stroke="#d97706" stroke-width="2" rx="4" />
                  <text x="120" y="80" fill="#1e293b" font-size="11" font-weight="800" text-anchor="middle">B_NS</text>
                  <text x="120" y="94" fill="#1e293b" font-size="8" font-weight="700" text-anchor="middle">Overhead (Z=1)</text>

                  <rect x="180" y="60" width="50" height="40" fill="rgba(251, 191, 36, 0.25)" stroke="#fbbf24" stroke-width="1.5" rx="3" />
                  <text x="205" y="78" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">R_W (◀)</text>
                  <text x="205" y="92" fill="#94a3b8" font-size="8" text-anchor="middle">Climb West</text>
                </svg>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; text-align: left;">
                  • <strong>Ground Level (Z=0)</strong> runs <strong>North ↔ South</strong> underneath.<br/>
                  • <strong>Overhead Level (Z=1)</strong> runs <strong>East ↔ West</strong> across bridge deck.
                </div>
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem; font-size: 0.8rem; color: var(--text);">
              <strong>Directional Ramp Rules</strong>: Ramps (<kbd>R_N</kbd>, <kbd>R_S</kbd>, <kbd>R_E</kbd>, <kbd>R_W</kbd>) seamlessly transition the player between Ground ($Z=0$) and Upper Deck ($Z=1$). Walk in the ramp's arrow direction to ascend; step backward to descend. Flank entry is blocked to preserve physical realism.
            </div>
          </div>

          <!-- TAB 4: Secrets & Medals -->
          <div class="guide-tab-pane" id="guide-pane-secrets" style="display: none; flex-direction: column; gap: 0.9rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45;">
              Master labyrinth completion with speed, efficiency, and sharp observation:
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.8rem;">
              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem;">
                <div style="font-weight: 700; color: #a78bfa; font-size: 0.85rem; margin-bottom: 0.4rem;">✨ Illusory Walls &amp; Secret Chambers</div>
                <div style="font-size: 0.8rem; color: var(--text); line-height: 1.5;">
                  Certain masonry walls are illusory! Look closely for faint fracture cracks and floating ethereal motes. Walking directly into an illusory wall dissolves it into an archway revealing hidden stars, lore notes, or shortcut bypasses.
                </div>
              </div>

              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem;">
                <div style="font-weight: 700; color: #34d399; font-size: 0.85rem; margin-bottom: 0.4rem;">🎯 Par Calibration &amp; Medal Tiers</div>
                <div style="font-size: 0.8rem; color: var(--text); line-height: 1.5;">
                  Every level features calibrated <strong>Par Steps</strong> and <strong>Par Time</strong> based on optimal BFS solvers. Beat the par thresholds to earn Silver and Gold victory medals, plus the prestigious <strong>Secret Sleuth</strong> badge for uncovering all hidden alcoves!
                </div>
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem;">
              <div style="font-weight: 700; color: #f59e0b; font-size: 0.85rem; margin-bottom: 0.4rem;">★ Star Economy &amp; Explorer Ranks</div>
              <div style="font-size: 0.8rem; color: var(--text); line-height: 1.5;">
                Earn up to 4 stars per campaign level (Completion, Par Steps, Par Time, and Flawless Zero-Damage). Amass stars to ascend through the prestige ranks: from <em>Novice Pathfinder</em> (0★) to <em>Grand Architect</em> (100★)!
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-glass); padding-top: 0.8rem; margin-top: 0.2rem;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-guide-done">Close Handbook</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this._attachEvents();
  }

  _wireExistingDom() {
    if (!this.modalEl) return;
    const btnClose = this.modalEl.querySelector('#guide-btn-close') || this.modalEl.querySelector('#btn-close-guide');
    const btnDismiss = this.modalEl.querySelector('#guide-btn-dismiss') || this.modalEl.querySelector('#btn-guide-done');
    if (btnClose) btnClose.onclick = () => this.close();
    if (btnDismiss) btnDismiss.onclick = () => this.close();
  }

  _attachEvents() {
    if (!this.modalEl) return;

    const closeBtn = this.modalEl.querySelector('#btn-close-guide');
    const doneBtn = this.modalEl.querySelector('#btn-guide-done');

    if (closeBtn) closeBtn.onclick = () => this.close();
    if (doneBtn) doneBtn.onclick = () => this.close();

    // Close on backdrop click
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    // Tab buttons
    const tabBtns = this.modalEl.querySelectorAll('.guide-tab-btn');
    tabBtns.forEach((btn) => {
      btn.onclick = () => {
        const targetTab = btn.getAttribute('data-tab');
        if (targetTab) this.switchTab(targetTab);
      };
    });
  }

  switchTab(tabName) {
    if (!this.modalEl) return;
    this.activeTab = tabName;

    // Update tab button styles
    const tabBtns = this.modalEl.querySelectorAll('.guide-tab-btn');
    tabBtns.forEach((btn) => {
      const isCurrent = btn.getAttribute('data-tab') === tabName;
      if (isCurrent) {
        btn.classList.add('active');
        btn.style.background = 'rgba(56, 189, 248, 0.2)';
        btn.style.borderColor = 'var(--accent, #38bdf8)';
        btn.style.color = '#ffffff';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.borderColor = 'transparent';
        btn.style.color = 'var(--text-muted)';
      }
    });

    // Toggle panes
    const panes = ['controls', 'entities', 'bridges', 'secrets'];
    for (const pane of panes) {
      const paneEl = this.modalEl.querySelector(`#guide-pane-${pane}`);
      if (paneEl) {
        paneEl.style.display = pane === tabName ? 'flex' : 'none';
      }
    }

    try { audioFX.playTabClick?.() || audioFX.playClick(); } catch (_) {}
  }

  _handleKeyDown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      e.preventDefault();
      this.close();
    }
  }

  open(initialTab = 'controls') {
    this.ensureDom();
    if (!this.modalEl) return;

    this.isOpen = true;
    this.switchTab(initialTab);

    this.modalEl.style.display = 'flex';
    this.modalEl.classList.add('active');
    document.body.classList.add('modal-open');

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._boundKeyHandler);
    }

    try { audioFX.playClick(); } catch (_) {}
  }

  close() {
    if (!this.modalEl) return;
    this.isOpen = false;
    this.modalEl.style.display = 'none';
    this.modalEl.classList.remove('active');
    document.body.classList.remove('modal-open');

    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._boundKeyHandler);
    }

    try { audioFX.playClick(); } catch (_) {}
  }
}

let guideModalInstance = null;

export function getGuideModal() {
  if (!guideModalInstance && typeof document !== 'undefined') {
    guideModalInstance = new GuideModal();
  }
  return guideModalInstance;
}
