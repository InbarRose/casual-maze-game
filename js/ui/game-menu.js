/**
 * Casual Maze Game — In-Game Pause & Action Menu Controller
 *
 * Provides a sleek, modern game pause menu drawer that suspends gameplay,
 * declutters the HUD, and offers instant access to game options, view toggles,
 * telemetry logs, audio settings, and save management.
 */

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
    this.onSaveProgress = options.onSaveProgress || (() => {});
    this.onToggleSound = options.onToggleSound || (() => {});
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
  }

  /**
   * Close the pause menu and resume gameplay
   */
  resume() {
    this._isPaused = false;
    if (this.modalEl) {
      this.modalEl.classList.remove('active');
    }
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

    if (!this.modalEl) return;

    const btnResume = this.modalEl.querySelector('#btn-pause-resume');
    if (btnResume) btnResume.addEventListener('click', () => this.resume());

    const btnRestart = this.modalEl.querySelector('#btn-pause-restart');
    if (btnRestart) btnRestart.addEventListener('click', () => {
      this.resume();
      this.onRestart();
    });

    const btnPerspective = this.modalEl.querySelector('#btn-pause-perspective');
    if (btnPerspective) btnPerspective.addEventListener('click', () => {
      this.onTogglePerspective();
      this._updatePerspectiveButtonLabel();
    });

    const btnFreePan = this.modalEl.querySelector('#btn-pause-freepan');
    if (btnFreePan) btnFreePan.addEventListener('click', () => {
      this.resume();
      this.onToggleFreePan();
    });

    const btnLog = this.modalEl.querySelector('#btn-pause-log');
    if (btnLog) btnLog.addEventListener('click', () => {
      this.resume();
      this.onOpenLog();
    });

    const btnHint = this.modalEl.querySelector('#btn-pause-hint');
    if (btnHint) btnHint.addEventListener('click', () => {
      this.resume();
      this.onOpenHint();
    });

    const btnSave = this.modalEl.querySelector('#btn-pause-save');
    if (btnSave) btnSave.addEventListener('click', () => {
      this.onSaveProgress();
    });

    const btnSound = this.modalEl.querySelector('#btn-pause-sound');
    if (btnSound) btnSound.addEventListener('click', () => {
      const isMuted = this.onToggleSound();
      this.updateSoundButtonLabel(isMuted);
    });

    const btnQuit = this.modalEl.querySelector('#btn-pause-quit');
    if (btnQuit) btnQuit.addEventListener('click', () => {
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
   * Teardown listener attachments
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._boundKeyHandler);
    }
  }
}
