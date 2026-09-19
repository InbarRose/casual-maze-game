/**
 * Puzzle Gate Entity
 * A mystic obstacle barrier that requires solving an interactive minigame (Rune Memory, Cipher Lock) to unlock.
 */

import { ENTITY_TYPES, ELEVATION, formatXYZ } from '../core/constants.js';

export class PuzzleGate {
  /**
   * @param {object} config
   */
  constructor(config) {
    this.id = config.id || `puzzle_gate_${Math.random().toString(36).substr(2, 9)}`;
    this.type = ENTITY_TYPES.PUZZLE_GATE;
    this.x = Number(config.x) || 0;
    this.y = Number(config.y) || 0;
    this.z = config.z !== undefined ? Number(config.z) : (config.elevation !== undefined ? Number(config.elevation) : ELEVATION.GROUND);
    this.elevation = this.z;

    this.puzzleType = config.puzzleType || 'rune_memory'; // 'rune_memory' | 'cipher_dial'
    this.name = config.name || (this.puzzleType === 'cipher_dial' ? 'Cipher Barrier' : 'Rune Memory Gate');
    this.color = config.color || '#a855f7';
    this.isUnlocked = !!config.isUnlocked;

    // Solution definition
    // For rune_memory: array of indices e.g. [0, 2, 1, 3]
    // For cipher_dial: array of numbers e.g. [3, 7, 2]
    this.solution = Array.isArray(config.solution) ? [...config.solution] : (this.puzzleType === 'cipher_dial' ? [3, 7, 2] : [0, 2, 1, 3]);
    this.clue = config.clue || (this.puzzleType === 'cipher_dial' ? 'Align the three concentric runic dials to match the celestial sequence.' : 'Memorize and repeat the glowing rune sequence.');

    // Visual animation
    this.pulseTimer = 0;
    this.dissolveProgress = this.isUnlocked ? 1.0 : 0.0;
  }

  /**
   * Canonical (X, Y, Z) coordinate string
   * @returns {string}
   */
  getCoordString() {
    return formatXYZ(this.x, this.y, this.z);
  }

  /**
   * Unlock gate upon successful puzzle solve
   */
  unlock() {
    this.isUnlocked = true;
  }

  /**
   * Verify an attempt against this puzzle's solution
   * @param {Array<number>} attempt
   * @returns {boolean}
   */
  verifySolution(attempt) {
    if (!Array.isArray(attempt) || attempt.length !== this.solution.length) {
      return false;
    }
    return attempt.every((val, idx) => val === this.solution[idx]);
  }

  /**
   * Update visual pulse and dissolve animation
   * @param {number} dt
   */
  update(dt) {
    this.pulseTimer += dt * 3.5;
    if (this.isUnlocked && this.dissolveProgress < 1.0) {
      this.dissolveProgress = Math.min(1.0, this.dissolveProgress + dt * 2.5);
    }
  }

  /**
   * Render puzzle gate barrier
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} tileSize
   */
  render(ctx, screenX, screenY, tileSize) {
    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const pulse = Math.sin(this.pulseTimer) * 0.15 + 0.85;

    ctx.save();

    if (this.isUnlocked) {
      // Unlocked / Dissolved gateway frame
      const alpha = Math.max(0.15, 1.0 - this.dissolveProgress * 0.7);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(screenX + tileSize * 0.1, screenY + tileSize * 0.1, tileSize * 0.8, tileSize * 0.8);

      ctx.fillStyle = '#34d399';
      ctx.font = `${Math.floor(tileSize * 0.3)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔓', cx, cy);
    } else {
      // Active locked barrier
      // Outer barrier forcefield
      ctx.fillStyle = 'rgba(88, 28, 135, 0.45)';
      ctx.fillRect(screenX + tileSize * 0.08, screenY + tileSize * 0.08, tileSize * 0.84, tileSize * 0.84);

      // Energy border with glow
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12 * pulse;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(2, tileSize * 0.07);
      ctx.strokeRect(screenX + tileSize * 0.08, screenY + tileSize * 0.08, tileSize * 0.84, tileSize * 0.84);

      // Mystic Rune Lock Core
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.font = `bold ${Math.floor(tileSize * 0.38)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.puzzleType === 'cipher_dial' ? '🔐' : '🔯', cx, cy);

      // Interaction prompt hint below
      ctx.fillStyle = '#f3e8ff';
      ctx.shadowBlur = 0;
      ctx.font = `bold ${Math.max(8, Math.floor(tileSize * 0.2))}px "JetBrains Mono", monospace`;
      ctx.fillText('PUZZLE', cx, screenY + tileSize * 0.85);
    }

    ctx.restore();
  }
}
