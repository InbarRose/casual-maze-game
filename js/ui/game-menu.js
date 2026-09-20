/**
 * Casual Maze Game — In-Game Pause & Action Menu Controller
 *
 * Provides a sleek, modern game pause menu drawer that suspends gameplay,
 * declutters the HUD, and offers instant access to game options, view toggles,
 * telemetry logs, audio settings, and save management.
 */

import { getSettingsModal, getProfileModal } from './app-header.js';
import { globalEvents } from '../core/events.js';

export class GameMenu {
  /**
   * @param {Object} options
   * @param {HTMLElement} [options.modalEl] The backdrop/dialog container for the pause menu
   * @param {Function} [options.onResume] Callback invoked when gameplay resumes
   * @param {Function} [options.onRestart] Callback invoked to restart level
   * @param {Function} [options.onTogglePerspective] Callback invoked to toggle camera perspective
   * @param {Function} [options.onToggleFreePan] Callback invoked to toggle free-pan mode
   * @param {Function} [options.onOpenLog] Callback invoked to view activity log
   * @param {Function} [options.onOpenHint] Callback invoked to view tutorial/prologue hint
   * @param {Function} [options.onSaveProgress] Callback invoked to export save file
   * @param {Function} [options.onToggleSound] Callback invoked to toggle sound mute
   * @param {Function} [options.onQuit] Callback invoked to return to level select / hub
   * @param {Function} [options.isOtherModalOpen] Predicate returning true if another modal is currently active
   */
  constructor(options = {}) {
    this.modalEl = options.modalEl || null;
    this.onResume = options.onResume || (() => {});
    this.onRestart = options.onRestart || (() => {});
    this.onTogglePerspective = options.onTogglePerspective || (() => {});
    this.onToggleFreePan = options.onToggleFreePan || (() => {});
    this.onOpenLog = options.onOpenLog || (() => {});
    this.onOpenHint = options.onOpenHint || (() => {});
    this.onWatchWalkthrough = options.onWatchWalkthrough || (() => {});
    this.onReportIssue = options.onReportIssue || (() => {});
    this.onSaveProgress = options.onSaveProgress || (() => {});
    this.onToggleSound = options.onToggleSound || (() => {});
    this.onToggleHotkeys = options.onToggleHotkeys || (() => true);
    this.onQuit = options.onQuit || (() => {
      if (typeof window !== 'undefined') window.location.href = 'index.html';
    });
    this.isOtherModalOpen = options.isOtherModalOpen || (() => false);

    this._isPaused = false;
    this._boundKeyHandler = this._handleKeyDown.bind(this);
    this._attachEventListeners();
  }

  /**
   * Whether the game is currently paused via the pause menu
   * @returns {boolean}
   */
  isPaused() {
    return this._isPaused;
  }

  /**
   * Open the pause menu and pause gameplay
   * @param {Object} [stats] Optional telemetry data to render in menu
   */
  pause(stats = {}) {
    this._isPaused = true;
    if (this.modalEl) {
      this.modalEl.classList.add('active');
    }
    this._updateMenuStats(stats);
    if (typeof window !== 'undefined' && window.gameLoop && typeof window.gameLoop.areHotkeysEnabled === 'function') {
      this.updateHotkeysButtonLabel(window.gameLoop.areHotkeysEnabled());
    }
    globalEvents.emit('game:paused');
  }

  /**
   * Close the pause menu and resume gameplay
   */
  resume() {
    this._isPaused = false;
    if (this.modalEl) {
      this.modalEl.classList.remove('active');
    }
    globalEvents.emit('game:resumed');
    this.onResume();
  }

  /**
   * Toggle between paused and resumed
   * @param {Object} [stats]
   */
  toggle(stats = {}) {
    if (this._isPaused) {
      this.resume();
    } else {
      this.pause(stats);
    }
  }

  /**
   * Bind DOM buttons inside the pause menu dialog
   * @private
   */
  _attachEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._boundKeyHandler);
    }

    if (!this.modalEl || typeof this.modalEl.querySelector !== 'function') return;

    const bindClick = (sel, handler) => {
      const btn = this.modalEl.querySelector(sel);
      if (btn && typeof btn.addEventListener === 'function') {
        btn.addEventListener('click', handler);
      }
    };

    bindClick('#btn-pause-resume', () => this.resume());

    bindClick('#btn-pause-restart', () => {
      this.resume();
      this.onRestart();
    });

    bindClick('#btn-pause-perspective', () => {
      this.onTogglePerspective();
      this.updatePerspectiveButtonLabel();
    });

    bindClick('#btn-pause-freepan', () => {
      this.resume();
      this.onToggleFreePan();
    });

    bindClick('#btn-pause-log', () => {
      this.resume();
      this.onOpenLog();
    });

    bindClick('#btn-pause-hint', () => {
      this.resume();
      this.onOpenHint();
    });

    bindClick('#btn-pause-save', () => {
      this.onSaveProgress();
    });

    bindClick('#btn-pause-walkthrough', () => {
      this.onWatchWalkthrough();
    });

    bindClick('#btn-pause-settings', () => {
      const modal = getSettingsModal();
      modal.open();
    });

    bindClick('#btn-pause-profile', () => {
      const modal = getProfileModal();
      modal.open();
    });

    bindClick('#btn-pause-report-issue', () => {
      this.onReportIssue();
    });

    bindClick('#btn-pause-sound', () => {
      const isMuted = this.onToggleSound();
      this.updateSoundButtonLabel(isMuted);
    });

    bindClick('#btn-pause-hotkeys', () => {
      const enabled = this.onToggleHotkeys();
      this.updateHotkeysButtonLabel(enabled);
    });

    bindClick('#btn-pause-quit', () => {
      this.onQuit();
    });
  }

  /**
   * Handle key shortcuts for pausing/resuming
   * @private
   */
  _handleKeyDown(e) {
    // If another modal (activity log, victory, inspection) is open, let that modal handle Escape
    if (this.isOtherModalOpen() && !this._isPaused) return;

    if (e.code === 'KeyP' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      this.toggle();
    } else if (e.code === 'Escape') {
      if (this._isPaused) {
        e.preventDefault();
        this.resume();
      }
    }
  }

  /**
   * Update stats displayed inside the pause modal header
   * @private
   */
  _updateMenuStats(stats = {}) {
    if (!this.modalEl) return;

    const titleEl = this.modalEl.querySelector('#pause-stat-title');
    if (titleEl && stats.title) titleEl.textContent = stats.title;

    const timeEl = this.modalEl.querySelector('#pause-stat-time');
    if (timeEl && stats.timeStr) timeEl.textContent = stats.timeStr;

    const stepsEl = this.modalEl.querySelector('#pause-stat-steps');
    if (stepsEl && stats.steps !== undefined) stepsEl.textContent = String(stats.steps);

    const keysEl = this.modalEl.querySelector('#pause-stat-keys');
    if (keysEl && stats.keysHeld !== undefined) keysEl.textContent = String(stats.keysHeld);
  }

  /**
   * Update the sound toggle button label
   * @param {boolean} isMuted
   */
  updateSoundButtonLabel(isMuted) {
    if (!this.modalEl) return;
    const btnSound = this.modalEl.querySelector('#btn-pause-sound');
    if (btnSound) {
      btnSound.innerHTML = isMuted
        ? '🔇 <span>Sound FX: OFF</span>'
        : '🔊 <span>Sound FX: ON</span>';
    }
  }

  /**
   * Update perspective button label
   * @param {string} [mode] 'angled' or 'topdown'
   */
  updatePerspectiveButtonLabel(mode = 'angled') {
    if (!this.modalEl) return;
    const btnPerspective = this.modalEl.querySelector('#btn-pause-perspective');
    if (btnPerspective) {
      btnPerspective.innerHTML = mode === 'angled'
        ? '📐 <span>View: Angled 2.5D [V]</span>'
        : '🗺️ <span>View: Top-Down [V]</span>';
    }
  }

  /**
   * Update hotkeys button label
   * @param {boolean} enabled
   */
  updateHotkeysButtonLabel(enabled) {
    if (!this.modalEl) return;
    const btnHotkeys = this.modalEl.querySelector('#btn-pause-hotkeys');
    if (btnHotkeys) {
      btnHotkeys.innerHTML = enabled
        ? '⌨️ <span>Hotkeys: ON [Full]</span>'
        : '⌨️ <span>Hotkeys: OFF [Simple Mode]</span>';
    }
  }

  /**
   * Teardown listener attachments
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._boundKeyHandler);
    }
  }
}
