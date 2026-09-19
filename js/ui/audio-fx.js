/**
 * Casual Maze Game — Procedural Web Audio Sound FX Engine
 * 
 * 100% pure static, zero external dependencies, zero audio files to download.
 * Generates crisp, responsive game sound effects procedurally via the browser's
 * native Web Audio API oscillators and gain envelopes.
 */

const STORAGE_KEY_MUTED = 'casual_maze_sound_muted';

class SoundFXEngine {
  constructor() {
    this._audioCtx = null;
    this._muted = false;
    this._initialized = false;
    this._loadMutePreference();
  }

  /**
   * Load muted preference from localStorage if available
   * @private
   */
  _loadMutePreference() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY_MUTED);
        this._muted = stored === 'true';
      }
    } catch {
      this._muted = false;
    }
  }

  /**
   * Save muted preference to localStorage
   * @private
   */
  _saveMutePreference() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MUTED, String(this._muted));
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  /**
   * Lazily initialize or resume AudioContext upon first user interaction
   * @returns {AudioContext|null}
   */
  getContext() {
    if (typeof window === 'undefined') return null;
    
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return null;

    if (!this._audioCtx) {
      try {
        this._audioCtx = new AudioCtxClass();
      } catch {
        return null;
      }
    }

    if (this._audioCtx && this._audioCtx.state === 'suspended') {
      this._audioCtx.resume().catch(() => {});
    }

    this._initialized = true;
    return this._audioCtx;
  }

  /**
   * Returns whether sound effects are currently muted
   * @returns {boolean}
   */
  isMuted() {
    return this._muted;
  }

  /**
   * Set mute state
   * @param {boolean} muted
   */
  setMuted(muted) {
    this._muted = Boolean(muted);
    this._saveMutePreference();
  }

  /**
   * Toggle mute state
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.setMuted(!this._muted);
    return this._muted;
  }

  /**
   * Helper to create and connect an oscillator with an envelope
   * @private
   */
  _playTone({ freq = 440, type = 'sine', duration = 0.1, gain = 0.1, freqEnd = null, delay = 0 }) {
    if (this._muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime + delay;
      const stopTime = startTime + duration;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      if (freqEnd !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqEnd), stopTime);
      }

      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(stopTime);
    } catch {
      // Graceful fallback on audio glitch
    }
  }

  /**
   * Subtle high-frequency hover blip
   */
  playHover() {
    this._playTone({ freq: 520, freqEnd: 740, type: 'sine', duration: 0.025, gain: 0.035 });
  }

  /**
   * Tactile mechanical button click
   */
  playClick() {
    this._playTone({ freq: 880, freqEnd: 420, type: 'sine', duration: 0.035, gain: 0.07 });
  }

  /**
   * Sparkling key acquisition chime
   */
  playKeyPickup() {
    // 3-note ascending arpeggio (E5, G#5, B5)
    this._playTone({ freq: 659.25, type: 'sine', duration: 0.12, gain: 0.08, delay: 0 });
    this._playTone({ freq: 830.61, type: 'sine', duration: 0.14, gain: 0.09, delay: 0.04 });
    this._playTone({ freq: 987.77, type: 'sine', duration: 0.22, gain: 0.11, delay: 0.08 });
  }

  /**
   * Resonant heavy stone gate / door unseal thud
   */
  playDoorUnlock() {
    this._playTone({ freq: 160, freqEnd: 70, type: 'triangle', duration: 0.28, gain: 0.14 });
    this._playTone({ freq: 320, freqEnd: 120, type: 'sine', duration: 0.15, gain: 0.08, delay: 0.02 });
  }

  /**
   * Lever / mechanical switch toggle
   * @param {boolean} [state=true] ON (rising) or OFF (falling)
   */
  playLeverToggle(state = true) {
    if (state) {
      this._playTone({ freq: 440, freqEnd: 720, type: 'triangle', duration: 0.08, gain: 0.09 });
    } else {
      this._playTone({ freq: 720, freqEnd: 380, type: 'triangle', duration: 0.08, gain: 0.09 });
    }
  }

  /**
   * Teleportation wormhole shimmer sweep
   */
  playTeleport() {
    this._playTone({ freq: 280, freqEnd: 1100, type: 'sine', duration: 0.28, gain: 0.09 });
    this._playTone({ freq: 420, freqEnd: 880, type: 'triangle', duration: 0.22, gain: 0.06, delay: 0.05 });
  }

  /**
   * Triumphant victory fanfare chord
   */
  playVictory() {
    // 4-note royal fanfare (C5, E5, G5, C6)
    this._playTone({ freq: 523.25, type: 'triangle', duration: 0.22, gain: 0.1, delay: 0 });
    this._playTone({ freq: 659.25, type: 'triangle', duration: 0.25, gain: 0.11, delay: 0.08 });
    this._playTone({ freq: 783.99, type: 'triangle', duration: 0.32, gain: 0.12, delay: 0.16 });
    this._playTone({ freq: 1046.50, type: 'sine', duration: 0.6, gain: 0.14, delay: 0.24 });
  }

  /**
   * Hazard hit / warning buzz
   */
  playHazardHit() {
    this._playTone({ freq: 140, freqEnd: 90, type: 'sawtooth', duration: 0.25, gain: 0.1 });
  }

  /**
   * Checkpoint / beacon activation chime
   */
  playCheckpoint() {
    this._playTone({ freq: 587.33, type: 'sine', duration: 0.18, gain: 0.08, delay: 0 });
    this._playTone({ freq: 880.00, type: 'sine', duration: 0.3, gain: 0.1, delay: 0.06 });
  }

  /**
   * Modal open whoosh
   */
  playModalOpen() {
    this._playTone({ freq: 220, freqEnd: 460, type: 'sine', duration: 0.12, gain: 0.05 });
  }

  /**
   * Modal close release
   */
  playModalClose() {
    this._playTone({ freq: 460, freqEnd: 220, type: 'sine', duration: 0.09, gain: 0.04 });
  }

  /**
   * Attach tactile hover & click sound FX to interactive buttons & links within a container
   * @param {HTMLElement|Document} [root=document]
   */
  attachToInteractiveElements(root = typeof document !== 'undefined' ? document : null) {
    if (!root || !root.querySelectorAll) return;

    const targets = root.querySelectorAll('button, .btn, .level-pill, .mode-tab, a.btn');
    targets.forEach((el) => {
      if (el.dataset.soundAttached === 'true') return;
      el.dataset.soundAttached = 'true';

      el.addEventListener('mouseenter', () => this.playHover(), { passive: true });
      el.addEventListener('click', () => this.playClick(), { passive: true });
    });
  }
}

// Singleton instance
export const audioFX = new SoundFXEngine();
