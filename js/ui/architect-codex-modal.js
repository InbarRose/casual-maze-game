/**
 * Casual Maze Game — The Architect's Codex & Collectible Journal Modal (BL-176, ADR-0050)
 * 
 * Provides an interactive illuminated codex book interface displaying:
 * - All collected Architect's Lost Folios and philosophical field letters
 * - Exact discovery coordinates (X, Y, Z) and level metadata
 * - Chapter navigation and discovery completion ratios
 * - Archivist Achievements and prestigious collection badges
 */

import { StorageManager } from '../core/storage.js';
import { ARCHITECT_NOTEBOOK_ACHIEVEMENTS } from '../core/constants.js';
import { CAMPAIGN_LEVELS } from '../levels/default-levels.js';
import { audioFX } from './audio-fx.js';

export class ArchitectCodexModal {
  constructor() {
    this.modalEl = null;
    this.isOpen = false;
    this.activeChapter = 'all';
    this.selectedFolioId = null;
    this._boundKeyHandler = this._handleKeyDown.bind(this);
    this.ensureDom();
  }

  ensureDom() {
    if (typeof document === 'undefined') return;

    let existing = document.getElementById('architect-codex-modal');
    if (existing) {
      this.modalEl = existing;
      this._wireExistingDom();
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'architect-codex-modal';
    modal.className = 'modal-backdrop';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-card codex-card-dialog" role="dialog" aria-modal="true" aria-labelledby="codex-modal-title" style="max-width: 860px; width: 95%;">
        <!-- Header -->
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.75rem;">📖</span>
            <div>
              <h3 id="codex-modal-title" style="margin: 0; font-size: 1.25rem; font-family: Georgia, serif; color: #fbbf24;">The Architect's Lost Codex</h3>
              <span id="codex-modal-subtitle" style="font-size: 0.75rem; color: var(--text-muted);">Recovered Field Letters, Spatial Coordinates &amp; Architectural Lore</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div id="codex-progress-badge" class="badge" style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.4); color: #fbbf24; font-weight: 700; font-size: 0.8rem; padding: 0.35rem 0.65rem; border-radius: 999px;">
              📜 0 / 40 Folios
            </div>
            <button type="button" class="btn-close" id="btn-close-codex" title="Close Codex (Esc)">&times;</button>
          </div>
        </div>

        <!-- Chapter Navigation Pills -->
        <div class="codex-nav-bar" style="display: flex; gap: 0.4rem; overflow-x: auto; padding: 0.6rem 0.4rem; border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1)); scrollbar-width: thin;">
          <button type="button" class="btn btn-xs codex-chapter-tab active" data-chapter="all">All Folios</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="chapter_1">Ch 1: Foundation</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="chapter_2">Ch 2: Verticality</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="chapter_3">Ch 3: Clockwork</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="chapter_4">Ch 4: Astral</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="chapter_5">Ch 5: Caldera</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="chapter_6">Ch 6: Enigmas</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="chapter_7">Ch 7: Citadel</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="chapter_8">Ch 8: Monolith</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="chapter_9">Ch 9: Aqueducts</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="chapter_10">Ch 10: Prism</button>
          <button type="button" class="btn btn-xs codex-chapter-tab" data-chapter="achievements">🏆 Achievements</button>
        </div>

        <!-- Body: Two-Column Illuminated Manuscript Layout -->
        <div class="modal-body codex-body-grid" style="display: grid; grid-template-columns: 280px 1fr; gap: 1rem; min-height: 420px; max-height: 60vh; padding: 1rem 0;">
          <!-- Left Column: Directory / Index -->
          <div id="codex-directory-panel" style="display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; padding-right: 0.5rem; border-right: 1px solid var(--border-glass, rgba(255, 255, 255, 0.08));">
            <!-- Populated dynamically -->
          </div>

          <!-- Right Column: Illuminated Manuscript Reader -->
          <div id="codex-reader-panel" style="overflow-y: auto; padding: 0.5rem;">
            <!-- Populated dynamically -->
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-glass, rgba(255, 255, 255, 0.1)); padding-top: 0.75rem;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">
            💡 <em>Press <kbd style="background: rgba(255, 255, 255, 0.15); padding: 0.1rem 0.35rem; border-radius: 3px;">J</kbd> anytime to open/close the Architect's Codex</em>
          </span>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-codex-close-footer">Return to Labyrinth</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;
    this._wireExistingDom();
  }

  _wireExistingDom() {
    if (!this.modalEl) return;

    const closeBtn = this.modalEl.querySelector('#btn-close-codex');
    const closeFooterBtn = this.modalEl.querySelector('#btn-codex-close-footer');
    if (closeBtn) closeBtn.onclick = () => this.close();
    if (closeFooterBtn) closeFooterBtn.onclick = () => this.close();

    // Backdrop click
    this.modalEl.onclick = (e) => {
      if (e.target === this.modalEl) this.close();
    };

    // Chapter tabs
    const tabs = this.modalEl.querySelectorAll('.codex-chapter-tab');
    tabs.forEach((tab) => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeChapter = tab.dataset.chapter || 'all';
        try { audioFX.playClick(); } catch {}
        this.renderContent();
      };
    });
  }

  open() {
    this.ensureDom();
    if (!this.modalEl) return;

    this.isOpen = true;
    this.modalEl.style.display = 'flex';
    this.modalEl.classList.add('active');
    document.addEventListener('keydown', this._boundKeyHandler);

    try { audioFX.playModalOpen(); } catch {}
    this.renderContent();
  }

  close() {
    if (!this.modalEl || !this.isOpen) return;

    this.isOpen = false;
    this.modalEl.style.display = 'none';
    this.modalEl.classList.remove('active');
    document.removeEventListener('keydown', this._boundKeyHandler);

    try { audioFX.playModalClose(); } catch {}
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  _handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  }

  /**
   * Render the directory list and illuminated folio reader
   */
  renderContent() {
    if (!this.modalEl) return;

    const codex = StorageManager.loadArchitectCodex();
    const stats = StorageManager.getCodexStats();
    const badge = this.modalEl.querySelector('#codex-progress-badge');
    if (badge) {
      badge.textContent = `📜 ${stats.totalCollected} / 40 Folios (${Math.round((stats.totalCollected / 40) * 100)}%)`;
    }

    const dirPanel = this.modalEl.querySelector('#codex-directory-panel');
    const readerPanel = this.modalEl.querySelector('#codex-reader-panel');
    if (!dirPanel || !readerPanel) return;

    if (this.activeChapter === 'achievements') {
      this.renderAchievements(dirPanel, readerPanel, stats);
      return;
    }

    // Filter folios for the active chapter
    // We construct the list from all official campaign levels and stored folios
    const allCampaignLevels = Array.isArray(CAMPAIGN_LEVELS) ? CAMPAIGN_LEVELS : [];
    const expectedFolios = [];

    allCampaignLevels.forEach((lvl, idx) => {
      const ch = lvl.chapter || `chapter_${Math.floor(idx / 4) + 1}`;
      if (this.activeChapter === 'all' || ch === this.activeChapter) {
        // Find existing note in level entities
        const noteEnt = (lvl.entities || []).find(e => e.type === 'signpost');
        const defaultId = noteEnt?.id || `sign_ch${Math.floor(idx / 4) + 1}_${lvl.id}`;
        const stored = codex[defaultId] || Object.values(codex).find(f => f.levelId === String(lvl.id));

        expectedFolios.push({
          id: defaultId,
          levelId: String(lvl.id),
          levelTitle: lvl.title,
          chapter: ch,
          discovered: !!stored,
          data: stored || {
            id: defaultId,
            title: noteEnt?.title || `Architect's Journal #${lvl.id}`,
            text: noteEnt?.text || lvl.architectNote || 'This letter has not yet been discovered in the labyrinth depths.',
            author: 'The Architect',
            x: noteEnt?.x ?? '?',
            y: noteEnt?.y ?? '?',
            z: noteEnt?.z ?? 0,
            coordString: noteEnt ? `(${noteEnt.x}, ${noteEnt.y}, ${noteEnt.z ?? 0})` : 'Undiscovered',
            levelId: String(lvl.id),
            levelTitle: lvl.title,
            chapter: ch,
          },
        });
      }
    });

    // If no selected folio, select the first discovered one or the first one
    if (!this.selectedFolioId && expectedFolios.length > 0) {
      const firstDiscovered = expectedFolios.find(f => f.discovered);
      this.selectedFolioId = firstDiscovered ? firstDiscovered.id : expectedFolios[0].id;
    }

    // 1. Render Left Directory List
    dirPanel.innerHTML = '';
    expectedFolios.forEach((folio) => {
      const isSelected = folio.id === this.selectedFolioId;
      const item = document.createElement('div');
      item.className = `codex-directory-item ${isSelected ? 'selected' : ''} ${folio.discovered ? 'discovered' : 'locked'}`;
      item.style.cssText = `
        padding: 0.6rem 0.75rem;
        border-radius: 6px;
        cursor: pointer;
        background: ${isSelected ? 'rgba(251, 191, 36, 0.15)' : (folio.discovered ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.2)')};
        border: 1px solid ${isSelected ? '#fbbf24' : (folio.discovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)')};
        transition: all 0.15s ease;
      `;

      item.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
          <div style="font-weight: 700; font-size: 0.82rem; color: ${folio.discovered ? '#fbbf24' : 'var(--text-muted)'};">
            ${folio.discovered ? '📜' : '🔒'} ${folio.discovered ? folio.data.title : `Folio #${folio.levelId}`}
          </div>
          <span style="font-size: 0.7rem; color: var(--text-muted);">Lvl ${folio.levelId}</span>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">
          ${folio.discovered ? `📍 Coordinates: ${folio.data.coordString}` : `Hidden in ${folio.levelTitle}`}
        </div>
      `;

      item.onclick = () => {
        this.selectedFolioId = folio.id;
        try { audioFX.playClick(); } catch {}
        this.renderContent();
      };

      dirPanel.appendChild(item);
    });

    // 2. Render Right Reading Page
    const activeFolio = expectedFolios.find(f => f.id === this.selectedFolioId) || expectedFolios[0];
    if (activeFolio) {
      if (activeFolio.discovered) {
        const d = activeFolio.data;
        const initialLetter = d.text ? d.text.trim().charAt(0) : 'T';
        const remainingText = d.text ? d.text.trim().slice(1) : '';

        readerPanel.innerHTML = `
          <div class="codex-parchment-sheet" style="
            background: #fffbeb;
            color: #451a03;
            border: 2px solid #ca8a04;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4), inset 0 0 40px rgba(217, 119, 6, 0.15);
            border-radius: 8px;
            padding: 1.5rem 1.8rem;
            min-height: 380px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            font-family: Georgia, 'Times New Roman', serif;
          ">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #d97706; padding-bottom: 0.75rem; margin-bottom: 1.2rem;">
                <div>
                  <h4 style="margin: 0; font-size: 1.2rem; color: #78350f;">${d.title}</h4>
                  <div style="font-size: 0.8rem; color: #92400e; margin-top: 0.2rem;">
                    From the Journal of <strong>${d.author || 'The Architect'}</strong>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span class="badge" style="background: #fef3c7; color: #92400e; border: 1px solid #d97706; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px;">
                    📍 ${d.coordString}
                  </span>
                  <div style="font-size: 0.7rem; color: #b45309; margin-top: 0.25rem;">
                    Level: ${activeFolio.levelTitle} (${activeFolio.levelId})
                  </div>
                </div>
              </div>

              <!-- Illuminated Text Body -->
              <div style="line-height: 1.7; font-size: 0.98rem; color: #451a03;">
                <span style="float: left; font-size: 2.8rem; line-height: 0.8; font-weight: bold; color: #b45309; padding-right: 0.5rem; padding-top: 0.2rem;">
                  ${initialLetter}
                </span>
                ${remainingText}
              </div>
            </div>

            <!-- Footer Stamp -->
            <div style="margin-top: 1.5rem; pt-3; border-top: 1px dashed rgba(180, 83, 9, 0.3); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #92400e;">
              <span>❦ Official Archive Record</span>
              <span>Discovered: ${d.discoveredAtDate ? new Date(d.discoveredAtDate).toLocaleDateString() : 'Active Expedition'}</span>
            </div>
          </div>
        `;
      } else {
        // Locked / Undiscovered Folio
        readerPanel.innerHTML = `
          <div style="
            background: rgba(0, 0, 0, 0.25);
            border: 1px dashed rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            padding: 2rem;
            min-height: 380px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: var(--text-muted);
          ">
            <span style="font-size: 3rem; margin-bottom: 0.75rem; opacity: 0.6;">🔒</span>
            <h4 style="margin: 0; font-size: 1.15rem; color: var(--text);">Undiscovered Architect Folio</h4>
            <p style="max-width: 360px; font-size: 0.85rem; margin-top: 0.5rem; line-height: 1.5;">
              This lost folio rests upon a stone lectern deep within <strong>${activeFolio.levelTitle}</strong> (Level ${activeFolio.levelId}).
              Explore the labyrinth corridors, inspect dead ends, and collect the letter to reveal its lore.
            </p>
          </div>
        `;
      }
    }
  }

  /**
   * Render achievements and badges tab
   */
  renderAchievements(dirPanel, readerPanel, stats) {
    dirPanel.innerHTML = `
      <div style="padding: 0.5rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
        <h4 style="margin: 0 0 0.5rem 0; color: #fbbf24;">Archivist Badges</h4>
        Earn prestigious titles by exploring every chapter and collecting the Architect's lost field journals.
      </div>
    `;

    const achs = stats.achievements || [];
    readerPanel.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <h4 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; color: #fbbf24;">Expedition Achievements</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem;">
          ${achs.map(a => `
            <div style="
              background: ${a.unlocked ? 'rgba(251, 191, 36, 0.1)' : 'rgba(0, 0, 0, 0.25)'};
              border: 1px solid ${a.unlocked ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)'};
              border-radius: 8px;
              padding: 0.75rem;
              display: flex;
              gap: 0.6rem;
              align-items: flex-start;
            ">
              <span style="font-size: 1.6rem;">${a.icon}</span>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong style="font-size: 0.82rem; color: ${a.unlocked ? '#fbbf24' : 'var(--text)'};">${a.label}</strong>
                  <span style="font-size: 0.7rem; color: ${a.unlocked ? '#10b981' : 'var(--text-muted)'}; font-weight: 700;">
                    ${a.unlocked ? 'UNLOCKED' : `${a.current} / ${a.target}`}
                  </span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">
                  ${a.desc}
                </div>
                <!-- Progress bar -->
                <div style="width: 100%; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; margin-top: 0.45rem; overflow: hidden;">
                  <div style="width: ${a.progressPercent}%; height: 100%; background: ${a.unlocked ? '#10b981' : '#fbbf24'};"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

export const architectCodexModal = new ArchitectCodexModal();
