/**
 * In-Game Interactive Puzzle Minigame Modal
 * 100% Static Vanilla JS overlay for unlocking PuzzleGates.
 * Supports Rune Memory Sequence and Cipher Dial Combination challenges.
 */

import { globalEvents } from '../core/events.js';

export class PuzzleModal {
  constructor() {
    this.overlay = null;
    this.activeGate = null;
    this.onComplete = null;
    this.onCancel = null;
    this.userSequence = [];
    this.isFlashing = false;
  }

  /**
   * Open the puzzle challenge for a PuzzleGate entity
   * @param {PuzzleGate} puzzleGate
   * @param {Function} onComplete Callback when solved
   * @param {Function} onCancel Callback when closed/escaped
   */
  open(puzzleGate, onComplete, onCancel) {
    this.activeGate = puzzleGate;
    this.onComplete = onComplete;
    this.onCancel = onCancel;
    this.userSequence = [];

    this.createModalDOM();
    this.bindEvents();

    if (puzzleGate.puzzleType === 'rune_memory') {
      this.playMemorySequence();
    }
  }

  /**
   * Close and destroy the modal
   */
  close() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    if (this.handleKeyDown) {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  /**
   * Create modal DOM structure
   */
  createModalDOM() {
    this.close(); // Clean any previous

    const overlay = document.createElement('div');
    overlay.className = 'puzzle-modal-overlay';
    overlay.id = 'puzzle-modal-overlay';

    const gate = this.activeGate;
    const isMemory = gate.puzzleType === 'rune_memory';

    overlay.innerHTML = `
      <div class="puzzle-modal-card" role="dialog" aria-modal="true">
        <header class="puzzle-modal-header">
          <div class="puzzle-modal-title">
            <span class="puzzle-icon">${isMemory ? '🔮' : '🔐'}</span>
            <h3>${gate.name || 'Ancient Gate Seal'}</h3>
          </div>
          <button type="button" class="puzzle-close-btn" id="puzzle-btn-close" title="Close [Esc]">✕</button>
        </header>

        <div class="puzzle-modal-clue">
          <p>${gate.clue || 'Solve the mystic mechanism to unlock the path.'}</p>
        </div>

        <div class="puzzle-modal-stage" id="puzzle-stage">
          ${isMemory ? this.renderMemoryStageHTML() : this.renderCipherStageHTML()}
        </div>

        <div class="puzzle-feedback" id="puzzle-feedback">
          ${isMemory ? 'Memorize the sequence, then repeat it.' : 'Align dials to match the celestial sequence.'}
        </div>

        <footer class="puzzle-modal-footer">
          <button type="button" class="btn btn-secondary" id="puzzle-btn-abort">Back Away [Esc]</button>
          ${!isMemory ? '<button type="button" class="btn btn-primary" id="puzzle-btn-submit">Engage Dial Lock</button>' : ''}
        </footer>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  /**
   * HTML for Rune Memory stage
   */
  renderMemoryStageHTML() {
    const runes = [
      { id: 0, label: 'Arcane', icon: '🔮', color: '#a855f7', key: '1' },
      { id: 1, label: 'Pyre', icon: '🔥', color: '#f43f5e', key: '2' },
      { id: 2, label: 'Nature', icon: '🌿', color: '#34d399', key: '3' },
      { id: 3, label: 'Storm', icon: '⚡', color: '#38bdf8', key: '4' },
    ];

    const targetLen = this.activeGate.solution.length;
    const pips = Array.from({ length: targetLen }, (_, i) => `<span class="rune-pip" id="pip-${i}">⚪</span>`).join('');

    const buttons = runes.map(r => `
      <button type="button" class="rune-pad-btn" data-rune="${r.id}" style="--rune-color: ${r.color};">
        <span class="rune-btn-icon">${r.icon}</span>
        <span class="rune-btn-label">${r.label}</span>
        <span class="rune-btn-key">[${r.key}]</span>
      </button>
    `).join('');

    return `
      <div class="memory-puzzle-container">
        <div class="rune-pips-bar" id="rune-pips-bar">${pips}</div>
        <div class="rune-grid">${buttons}</div>
        <div class="rune-controls">
          <button type="button" class="btn btn-sm btn-secondary" id="puzzle-btn-replay">🔄 Replay Sequence</button>
        </div>
      </div>
    `;
  }

  /**
   * HTML for Cipher Dial stage
   */
  renderCipherStageHTML() {
    const dials = [0, 1, 2].map(i => `
      <div class="cipher-dial-column" data-dial="${i}">
        <button type="button" class="dial-arrow-btn dial-up" data-dial="${i}" data-dir="1">▲</button>
        <div class="dial-display" id="dial-val-${i}">0</div>
        <button type="button" class="dial-arrow-btn dial-down" data-dial="${i}" data-dir="-1">▼</button>
      </div>
    `).join('');

    return `
      <div class="cipher-puzzle-container">
        <div class="cipher-dials-row">${dials}</div>
      </div>
    `;
  }

  /**
   * Bind DOM & Keyboard events
   */
  bindEvents() {
    const closeBtn = document.getElementById('puzzle-btn-close');
    const abortBtn = document.getElementById('puzzle-btn-abort');
    const submitBtn = document.getElementById('puzzle-btn-submit');
    const replayBtn = document.getElementById('puzzle-btn-replay');

    const doClose = () => {
      this.close();
      if (typeof this.onCancel === 'function') this.onCancel();
    };

    if (closeBtn) closeBtn.addEventListener('click', doClose);
    if (abortBtn) abortBtn.addEventListener('click', doClose);

    // Rune Memory buttons
    if (this.activeGate.puzzleType === 'rune_memory') {
      const runeBtns = this.overlay.querySelectorAll('.rune-pad-btn');
      runeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (this.isFlashing) return;
          const runeId = Number(btn.getAttribute('data-rune'));
          this.handleRuneInput(runeId);
        });
      });

      if (replayBtn) {
        replayBtn.addEventListener('click', () => {
          if (!this.isFlashing) this.playMemorySequence();
        });
      }
    } else {
      // Cipher Dial arrows
      const arrows = this.overlay.querySelectorAll('.dial-arrow-btn');
      this.dialValues = [0, 0, 0];
      arrows.forEach(arrow => {
        arrow.addEventListener('click', () => {
          const dialIdx = Number(arrow.getAttribute('data-dial'));
          const dir = Number(arrow.getAttribute('data-dir'));
          this.dialValues[dialIdx] = (this.dialValues[dialIdx] + dir + 10) % 10;
          const disp = document.getElementById(`dial-val-${dialIdx}`);
          if (disp) disp.textContent = this.dialValues[dialIdx];
        });
      });

      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          this.handleCipherSubmit();
        });
      }
    }

    // Keyboard controls
    this.handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        doClose();
      } else if (this.activeGate.puzzleType === 'rune_memory') {
        if (['1', '2', '3', '4'].includes(e.key) && !this.isFlashing) {
          this.handleRuneInput(Number(e.key) - 1);
        }
      } else if (e.key === 'Enter') {
        if (submitBtn) this.handleCipherSubmit();
      }
    };

    window.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Flash the memory sequence to the player
   */
  async playMemorySequence() {
    this.isFlashing = true;
    this.userSequence = [];
    this.updatePips();

    const feedback = document.getElementById('puzzle-feedback');
    if (feedback) feedback.textContent = '👀 Watch the ancient sequence...';

    const sequence = this.activeGate.solution;
    await new Promise(r => setTimeout(r, 450));

    for (let i = 0; i < sequence.length; i++) {
      const runeId = sequence[i];
      const btn = this.overlay?.querySelector(`.rune-pad-btn[data-rune="${runeId}"]`);
      if (btn) {
        btn.classList.add('rune-active-flash');
        await new Promise(r => setTimeout(r, 400));
        btn.classList.remove('rune-active-flash');
        await new Promise(r => setTimeout(r, 200));
      }
    }

    this.isFlashing = false;
    if (feedback) feedback.textContent = '👉 Your turn! Press the runes in order.';
  }

  /**
   * Process a rune input from player
   * @param {number} runeId
   */
  handleRuneInput(runeId) {
    this.userSequence.push(runeId);
    const stepIdx = this.userSequence.length - 1;
    const expectedRune = this.activeGate.solution[stepIdx];

    // Brief press flash
    const btn = this.overlay?.querySelector(`.rune-pad-btn[data-rune="${runeId}"]`);
    if (btn) {
      btn.classList.add('rune-active-press');
      setTimeout(() => btn.classList.remove('rune-active-press'), 220);
    }

    if (runeId !== expectedRune) {
      // Wrong input!
      const feedback = document.getElementById('puzzle-feedback');
      if (feedback) {
        feedback.textContent = '❌ Runic sequence disrupted! Try again...';
        feedback.classList.add('shake');
        setTimeout(() => feedback.classList.remove('shake'), 400);
      }
      setTimeout(() => this.playMemorySequence(), 800);
      return;
    }

    this.updatePips();

    // Check if finished entire sequence
    if (this.userSequence.length === this.activeGate.solution.length) {
      this.handleSolveSuccess();
    }
  }

  /**
   * Update visual progress pips
   */
  updatePips() {
    const total = this.activeGate?.solution?.length || 4;
    for (let i = 0; i < total; i++) {
      const pip = document.getElementById(`pip-${i}`);
      if (pip) {
        pip.textContent = i < this.userSequence.length ? '🟢' : '⚪';
      }
    }
  }

  /**
   * Check cipher dial submit
   */
  handleCipherSubmit() {
    const feedback = document.getElementById('puzzle-feedback');
    const isCorrect = this.activeGate.verifySolution(this.dialValues);

    if (isCorrect) {
      this.handleSolveSuccess();
    } else {
      if (feedback) {
        feedback.textContent = '❌ The mechanism clicks but remains sealed. Try another combination.';
        feedback.classList.add('shake');
        setTimeout(() => feedback.classList.remove('shake'), 400);
      }
    }
  }

  /**
   * Handle puzzle completion
   */
  handleSolveSuccess() {
    const feedback = document.getElementById('puzzle-feedback');
    if (feedback) {
      feedback.textContent = '✨ Seal unlocked! The barrier dissolves...';
      feedback.style.color = '#34d399';
    }

    this.activeGate.unlock();
    globalEvents.emit('puzzle:solved', {
      gateId: this.activeGate.id,
      name: this.activeGate.name,
      puzzleType: this.activeGate.puzzleType,
      x: this.activeGate.x,
      y: this.activeGate.y,
    });

    setTimeout(() => {
      this.close();
      if (typeof this.onComplete === 'function') {
        this.onComplete(true);
      }
    }, 600);
  }
}
