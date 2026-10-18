/**
 * GameStateManager
 * Manages gameplay session state, timer, pause/resume, secrets, scoring, and victory evaluation.
 * Adheres to SRP (Single Responsibility Principle) and ADR-007 / ADR-0035 standards (<= 300 lines).
 */

import { globalEvents } from '../core/events.js';
import { StorageManager } from '../core/storage.js';
import { audioFX } from '../ui/audio-fx.js';
import { TILES, ELEVATION } from '../core/constants.js';

export class GameStateManager {
  /**
   * @param {object} options
   * @param {object} options.level
   * @param {object} [options.logger]
   * @param {object} [options.uiCallbacks]
   */
  constructor({ level, logger = null, uiCallbacks = {} } = {}) {
    this.level = level;
    this.logger = logger;
    this.uiCallbacks = uiCallbacks;

    this.isRunning = false;
    this.isPaused = false;
    this.isWon = false;
    this.elapsedTime = 0; // milliseconds
    this.lastTime = 0;
    this.obscuringOverlays = new Set();

    // Scoring & Secrets metrics
    this.hazardHits = 0;
    this.revealedSecrets = new Set();
    this.secretsFound = 0;
    this.totalSecrets = this.calculateTotalSecrets(this.level);

    // Lore Journal
    this.levelJournal = [];

    // Checkpoint & snapshot state
    this.activeCheckpoint = null;
    this.checkpointSnapshot = null;
  }

  /**
   * Set or update active level reference
   * @param {object} level
   */
  setLevel(level) {
    this.level = level;
    this.totalSecrets = this.calculateTotalSecrets(level);
  }

  /**
   * Count total secret wall tiles present across all rooms
   * @param {object} level
   * @returns {number}
   */
  calculateTotalSecrets(level) {
    if (!level) return 0;
    let count = 0;

    const inspectGround = (ground) => {
      if (!Array.isArray(ground)) return;
      for (const row of ground) {
        if (!Array.isArray(row)) continue;
        for (const cell of row) {
          if (cell === TILES.SECRET_WALL) count++;
        }
      }
    };

    if (level.rooms && Object.keys(level.rooms).length > 0) {
      for (const r of Object.values(level.rooms)) {
        inspectGround(r.layers?.ground);
      }
    } else {
      inspectGround(level.layers?.ground);
    }
    return count;
  }

  /**
   * Update session elapsed time by delta seconds
   * @param {number} dt Delta time in seconds
   */
  tick(dt) {
    if (this.isRunning && !this.isPaused && !this.isWon) {
      this.elapsedTime += dt * 1000;
    }
  }

  /**
   * Pause gameplay simulation
   */
  pause() {
    this.isPaused = true;
    globalEvents.emit('game:paused');
  }

  /**
   * Resume gameplay simulation
   */
  resume() {
    this.isPaused = false;
    this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    globalEvents.emit('game:resumed');
  }

  /**
   * Pause/resume when an obscuring overlay covers the game viewport
   * @param {boolean} obscured
   * @param {string} [overlayId='overlay']
   */
  setObscured(obscured, overlayId = 'overlay') {
    if (obscured) {
      this.obscuringOverlays.add(overlayId);
      this.isPaused = true;
      globalEvents.emit('game:paused', { reason: `obscured:${overlayId}` });
    } else {
      this.obscuringOverlays.delete(overlayId);
      if (this.obscuringOverlays.size === 0) {
        this.isPaused = false;
        this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        globalEvents.emit('game:resumed', { reason: `unobscured:${overlayId}` });
      }
    }
  }

  /**
   * Reset session metrics for restart or new attempt
   */
  reset() {
    this.isWon = false;
    this.elapsedTime = 0;
    this.revealedSecrets = new Set();
    this.secretsFound = 0;
    this.hazardHits = 0;
    this.levelJournal = [];
  }

  /**
   * Record a discovered secret chamber
   * @param {number} x
   * @param {number} y
   * @returns {boolean} True if new secret recorded
   */
  recordSecret(x, y) {
    const key = `${x},${y}`;
    if (this.revealedSecrets.has(key)) return false;
    this.revealedSecrets.add(key);
    this.secretsFound++;
    return true;
  }

  /**
   * Calculate overall numerical performance score (0 - 3000+)
   * @param {object} stats
   * @returns {number}
   */
  calculatePerformanceScore(stats) {
    const baseScore = 1000;
    const stepPenalty = Math.max(0, (stats.steps || 0) * 10);
    const timePenalty = Math.max(0, Math.floor((stats.time || 0) / 1000) * 5);
    const runScore = Math.max(0, baseScore - stepPenalty - timePenalty);

    const secretBonus = (stats.secretsFound || 0) * 300;
    const parStepsBonus = stats.earnedParSteps ? 250 : 0;
    const parTimeBonus = stats.earnedParTime ? 250 : 0;
    const flawlessBonus = stats.flawless ? 200 : 0;

    return runScore + secretBonus + parStepsBonus + parTimeBonus + flawlessBonus;
  }

  /**
   * Handle level victory evaluation, scoring, persistence, and event dispatch
   * @param {object} player
   * @param {object|null} [exit=null]
   * @returns {object} Final completion stats
   */
  completeLevel(player, exit = null) {
    this.isWon = true;
    try {
      audioFX.stopAmbience();
    } catch {}

    const earnedParSteps = this.level.parSteps !== undefined ? player.stepsTaken <= this.level.parSteps : false;
    const earnedParTime = this.level.parTime !== undefined ? (this.elapsedTime / 1000) <= this.level.parTime : false;
    const flawless = (this.hazardHits || 0) === 0;
    const secretsFound = this.secretsFound || 0;
    const totalSecrets = this.totalSecrets || 0;
    const secretSleuth = totalSecrets > 0 && secretsFound >= totalSecrets;

    let tier = 'bronze';
    if ((earnedParSteps && earnedParTime) || (secretSleuth && (earnedParSteps || earnedParTime))) {
      tier = 'gold';
    } else if (earnedParSteps || earnedParTime || secretSleuth || flawless) {
      tier = 'silver';
    }

    const rawStats = {
      time: this.elapsedTime,
      steps: player.stepsTaken,
      earnedParSteps,
      earnedParTime,
      parSteps: this.level.parSteps,
      parTime: this.level.parTime,
      secretsFound,
      totalSecrets,
      secretSleuth,
      flawless,
      hazardHits: this.hazardHits || 0,
      tier,
      targetLevel: exit?.targetLevel || null,
      branchLabel: exit?.label || null,
      exitId: exit?.id || null,
    };

    const performanceScore = this.calculatePerformanceScore(rawStats);
    const stats = { ...rawStats, performanceScore };

    if (this.logger) {
      this.logger.logVictory(stats, this.elapsedTime);
    }
    StorageManager.saveLevelCompletion(this.level.id, stats);
    globalEvents.emit('level:completed', { levelId: this.level.id, stats });

    if (typeof this.uiCallbacks.onVictory === 'function') {
      this.uiCallbacks.onVictory(stats);
    }

    return stats;
  }

  /**
   * Record a discovered architect note or lore inscription into the level journal
   * @param {object} entry
   * @param {number} [steps=0]
   * @returns {Array<object>} Current level journal entries
   */
  recordJournalEntry(entry, steps = 0) {
    const id = entry.id || `${entry.title || 'Note'}_${entry.text || ''}`;
    const exists = this.levelJournal.some(e => (e.id && e.id === id) || (e.title === entry.title && e.text === entry.text));
    if (!exists) {
      const journalItem = {
        id,
        title: entry.title || "Architect's Note",
        author: entry.author || 'The Architect',
        text: entry.text || entry.message || '',
        decorType: entry.decorType || 'note',
        response: entry.response || '',
        facing: entry.facing || '',
        discoveredAtSteps: steps,
        discoveredAtTime: this.elapsedTime || 0,
      };
      this.levelJournal.push(journalItem);
      globalEvents.emit('journal:entry_added', journalItem);
    }
    return this.levelJournal;
  }

  /**
   * Get all journal entries discovered in the current level
   * @returns {Array<object>}
   */
  getJournalEntries() {
    return this.levelJournal || [];
  }
}
