/**
 * Casual Maze Game — Procedural Web Audio Sound FX & Environmental Ambience Engine
 * 
 * 100% pure static, zero external dependencies, zero audio files to download.
 * Generates crisp, responsive game sound effects and continuous biome ambient
 * soundscapes procedurally via the browser's native Web Audio API oscillators,
 * biquad filters, and hierarchical gain envelopes.
 */

import { StorageManager } from '../core/storage.js';
import { globalEvents } from '../core/events.js';

const STORAGE_KEY_MUTED = 'casual_maze_sound_muted';

class SoundFXEngine {
  constructor() {
    this._audioCtx = null;
    this._muted = false;
    this._initialized = false;

    // Volume levels (0.0 to 1.0)
    this._masterVolume = 0.8;
    this._sfxVolume = 0.85;
    this._bgmVolume = 0.5;

    // Gain Nodes
    this._masterGain = null;
    this._sfxGain = null;
    this._bgmGain = null;

    // Continuous Environmental Ambience State
    this._currentAmbienceBiome = null;
    this._ambienceGain = null;
    this._ambienceNodes = [];
    this._ambienceIntervals = [];

    this._loadMutePreference();
    this._loadVolumePreferences();
    this._initGlobalEventListeners();
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
   * Load volume settings from storage
   * @private
   */
  _loadVolumePreferences() {
    try {
      this._masterVolume = StorageManager.getSetting('volume_master', 0.8);
      this._sfxVolume = StorageManager.getSetting('volume_sfx', 0.85);
      this._bgmVolume = StorageManager.getSetting('volume_bgm', 0.5);
    } catch {
      this._masterVolume = 0.8;
      this._sfxVolume = 0.85;
      this._bgmVolume = 0.5;
    }
  }

  /**
   * Set up hierarchical gain nodes:
   * destination <- masterGain <- (sfxGain + bgmGain)
   * @private
   */
  _initGainNodes() {
    if (!this._audioCtx || typeof this._audioCtx.createGain !== 'function') return;
    if (this._masterGain && this._sfxGain && this._bgmGain) return;

    try {
      this._masterGain = this._audioCtx.createGain();
      this._sfxGain = this._audioCtx.createGain();
      this._bgmGain = this._audioCtx.createGain();

      const currentTime = this._audioCtx.currentTime || 0;
      if (this._masterGain.gain && typeof this._masterGain.gain.setValueAtTime === 'function') {
        this._masterGain.gain.setValueAtTime(this._muted ? 0 : this._masterVolume, currentTime);
      }
      if (this._sfxGain.gain && typeof this._sfxGain.gain.setValueAtTime === 'function') {
        this._sfxGain.gain.setValueAtTime(this._sfxVolume, currentTime);
      }
      if (this._bgmGain.gain && typeof this._bgmGain.gain.setValueAtTime === 'function') {
        this._bgmGain.gain.setValueAtTime(this._bgmVolume, currentTime);
      }

      if (typeof this._sfxGain.connect === 'function') {
        this._sfxGain.connect(this._masterGain);
      }
      if (typeof this._bgmGain.connect === 'function') {
        this._bgmGain.connect(this._masterGain);
      }
      if (typeof this._masterGain.connect === 'function' && this._audioCtx.destination) {
        this._masterGain.connect(this._audioCtx.destination);
      }
    } catch {
      // Graceful fallback in environments with partial Web Audio API
    }
  }

  /**
   * Alias for _initGainNodes
   * @private
   */
  _initRouting() {
    this._initGainNodes();
  }

  /**
   * Lazily initialize or resume AudioContext upon first user interaction
   * @returns {AudioContext|null}
   */
  getContext() {
    if (this._audioCtx) {
      if (this._audioCtx.state === 'suspended' && typeof this._audioCtx.resume === 'function') {
        this._audioCtx.resume().catch(() => {});
      }
      this._initGainNodes();
      return this._audioCtx;
    }

    if (typeof window === 'undefined') return null;
    
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return null;

    try {
      this._audioCtx = new AudioCtxClass();
    } catch {
      return null;
    }

    if (this._audioCtx && this._audioCtx.state === 'suspended' && typeof this._audioCtx.resume === 'function') {
      this._audioCtx.resume().catch(() => {});
    }

    this._initialized = true;
    this._initGainNodes();
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
    if (this._masterGain && this._audioCtx) {
      const target = this._muted ? 0 : this._masterVolume;
      const t = this._audioCtx.currentTime || 0;
      if (typeof this._masterGain.gain.setValueAtTime === 'function') {
        this._masterGain.gain.setValueAtTime(target, t);
      }
    }
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
   * Mute audio
   */
  mute() {
    this.setMuted(true);
  }

  /**
   * Unmute audio
   */
  unmute() {
    this.setMuted(false);
  }

  /**
   * Item collect chime (alias to playKeyPickup)
   */
  playCollect() {
    this.playKeyPickup();
  }

  /* =========================================================
   * REAL-TIME AUDIO GAIN SLIDERS (BL-25)
   * ========================================================= */

  /**
   * Set Master Volume level [0.0 to 1.0]
   * @param {number} volume
   * @returns {number} Clamped volume
   */
  setMasterVolume(volume) {
    const clamped = Math.max(0, Math.min(1, Number(volume) || 0));
    this._masterVolume = clamped;
    try { StorageManager.setSetting('volume_master', clamped); } catch {}

    if (this._masterGain && this._audioCtx) {
      const target = this._muted ? 0 : clamped;
      const t = this._audioCtx.currentTime || 0;
      if (typeof this._masterGain.gain.setValueAtTime === 'function') {
        this._masterGain.gain.setValueAtTime(target, t);
      }
    }
    return this._masterVolume;
  }

  /**
   * Get Master Volume level [0.0 to 1.0]
   * @returns {number}
   */
  getMasterVolume() {
    return this._masterVolume;
  }

  /**
   * Set Sound Effects Volume level [0.0 to 1.0]
   * @param {number} volume
   * @returns {number} Clamped volume
   */
  setSfxVolume(volume) {
    const clamped = Math.max(0, Math.min(1, Number(volume) || 0));
    this._sfxVolume = clamped;
    try { StorageManager.setSetting('volume_sfx', clamped); } catch {}

    if (this._sfxGain && this._audioCtx) {
      const t = this._audioCtx.currentTime || 0;
      if (typeof this._sfxGain.gain.setValueAtTime === 'function') {
        this._sfxGain.gain.setValueAtTime(clamped, t);
      }
    }
    return this._sfxVolume;
  }

  /**
   * Get Sound Effects Volume level [0.0 to 1.0]
   * @returns {number}
   */
  getSfxVolume() {
    return this._sfxVolume;
  }

  /**
   * Set Background Ambience / Music Volume level [0.0 to 1.0]
   * @param {number} volume
   * @returns {number} Clamped volume
   */
  setBgmVolume(volume) {
    const clamped = Math.max(0, Math.min(1, Number(volume) || 0));
    this._bgmVolume = clamped;
    try { StorageManager.setSetting('volume_bgm', clamped); } catch {}

    if (this._bgmGain && this._audioCtx) {
      const t = this._audioCtx.currentTime || 0;
      if (typeof this._bgmGain.gain.setValueAtTime === 'function') {
        this._bgmGain.gain.setValueAtTime(clamped, t);
      }
    }
    return this._bgmVolume;
  }

  /**
   * Get Background Ambience / Music Volume level [0.0 to 1.0]
   * @returns {number}
   */
  getBgmVolume() {
    return this._bgmVolume;
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

      // Route through sfxGain if available, falling back to destination
      const targetNode = this._sfxGain || ctx.destination;
      gainNode.connect(targetNode);

      osc.start(startTime);
      osc.stop(stopTime);
    } catch {
      // Graceful fallback on audio glitch
    }
  }

  /**
   * Subtle soft footstep / movement tap
   */
  playMove() {
    this._playTone({ freq: 220, freqEnd: 110, type: 'sine', duration: 0.04, gain: 0.03 });
  }

  /**
   * Door / gate unlock chime (alias for settings preview)
   */
  playUnlock() {
    this.playDoorUnlock();
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
   * Secret chamber unveiled harp arpeggio
   */
  playSecretFound() {
    // 5-note shimmering celestial arpeggio (F#5, A#5, C#6, F6, G#6)
    this._playTone({ freq: 739.99, type: 'sine', duration: 0.28, gain: 0.08, delay: 0 });
    this._playTone({ freq: 932.33, type: 'sine', duration: 0.32, gain: 0.09, delay: 0.07 });
    this._playTone({ freq: 1108.73, type: 'sine', duration: 0.36, gain: 0.1, delay: 0.14 });
    this._playTone({ freq: 1396.91, type: 'sine', duration: 0.42, gain: 0.11, delay: 0.21 });
    this._playTone({ freq: 1661.22, type: 'triangle', duration: 0.65, gain: 0.12, delay: 0.28 });
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

  /* =========================================================
   * CONTINUOUS ENVIRONMENTAL AMBIENCE LOOPS (BL-28)
   * 100% Zero-Dependency Procedural Web Audio Synthesis
   * ========================================================= */

  /**
   * Normalize biome theme name to canonical set
   * @param {string} theme
   * @returns {string} 'dungeon' | 'jungle' | 'magma' | 'glacial' | 'temple'
   */
  _normalizeBiome(theme = 'dungeon') {
    const raw = String(theme || 'dungeon').toLowerCase().trim();
    if (raw.includes('lava') || raw.includes('magma') || raw.includes('volcan')) return 'magma';
    if (raw.includes('jungle') || raw.includes('forest') || raw.includes('swamp')) return 'jungle';
    if (raw.includes('snow') || raw.includes('ice') || raw.includes('glaci') || raw.includes('frost')) return 'glacial';
    if (raw.includes('temple') || raw.includes('cave') || raw.includes('amethyst') || raw.includes('ruin') || raw.includes('sunset')) return 'temple';
    return 'dungeon';
  }

  /**
   * Get currently active ambient biome soundscape
   * @returns {string|null}
   */
  getActiveBiome() {
    return this._currentAmbienceBiome;
  }

  /**
   * Start or crossfade into procedural environmental ambience for the specified biome
   * @param {string} [theme='dungeon']
   */
  startAmbience(theme = 'dungeon') {
    const biome = this._normalizeBiome(theme);
    if (this._currentAmbienceBiome === biome && this._ambienceGain) {
      this.resumeAmbience();
      return;
    }

    const ctx = this.getContext();
    if (!ctx) {
      this._currentAmbienceBiome = biome;
      return;
    }

    // Stop or fade out previous ambience
    if (this._ambienceGain || this._ambienceNodes.length > 0) {
      this.stopAmbience(0.6);
    }

    this._currentAmbienceBiome = biome;

    try {
      const now = ctx.currentTime || 0;
      const targetBgm = this._bgmGain || ctx.destination;

      // Master gain for this ambient soundscape instance
      const ambienceGain = ctx.createGain();
      if (ambienceGain.gain && typeof ambienceGain.gain.setValueAtTime === 'function') {
        ambienceGain.gain.setValueAtTime(0.0001, now);
        if (typeof ambienceGain.gain.linearRampToValueAtTime === 'function') {
          ambienceGain.gain.linearRampToValueAtTime(0.18, now + 0.8);
        }
      }
      if (typeof ambienceGain.connect === 'function') {
        ambienceGain.connect(targetBgm);
      }

      this._ambienceGain = ambienceGain;
      this._ambienceNodes.push(ambienceGain);

      // Procedural synthesizers per biome:
      if (biome === 'dungeon') {
        this._buildDungeonAmbience(ctx, ambienceGain);
      } else if (biome === 'jungle') {
        this._buildJungleAmbience(ctx, ambienceGain);
      } else if (biome === 'magma') {
        this._buildMagmaAmbience(ctx, ambienceGain);
      } else if (biome === 'glacial') {
        this._buildGlacialAmbience(ctx, ambienceGain);
      } else if (biome === 'temple') {
        this._buildTempleAmbience(ctx, ambienceGain);
      }
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Build Dungeon Ambience: Subterranean draft drone with breathing air pressure
   * @private
   */
  _buildDungeonAmbience(ctx, dest) {
    const now = ctx.currentTime || 0;
    // 55Hz (A1) low stone corridor drone
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    if (drone.frequency && typeof drone.frequency.setValueAtTime === 'function') {
      drone.frequency.setValueAtTime(55, now);
    }

    const filter = ctx.createBiquadFilter ? ctx.createBiquadFilter() : null;
    if (filter) {
      filter.type = 'lowpass';
      if (filter.frequency && typeof filter.frequency.setValueAtTime === 'function') {
        filter.frequency.setValueAtTime(130, now);
      }
      drone.connect(filter);
      filter.connect(dest);
      this._ambienceNodes.push(filter);
    } else {
      drone.connect(dest);
    }

    if (typeof drone.start === 'function') drone.start(now);
    this._ambienceNodes.push(drone);
  }

  /**
   * Build Jungle Ambience: Warm resonant canopy breeze & periodic chirps
   * @private
   */
  _buildJungleAmbience(ctx, dest) {
    const now = ctx.currentTime || 0;
    // Dual soft warm breeze oscillators
    const breeze1 = ctx.createOscillator();
    breeze1.type = 'sine';
    if (breeze1.frequency && typeof breeze1.frequency.setValueAtTime === 'function') {
      breeze1.frequency.setValueAtTime(140, now);
    }
    breeze1.connect(dest);
    if (typeof breeze1.start === 'function') breeze1.start(now);
    this._ambienceNodes.push(breeze1);

    const breeze2 = ctx.createOscillator();
    breeze2.type = 'sine';
    if (breeze2.frequency && typeof breeze2.frequency.setValueAtTime === 'function') {
      breeze2.frequency.setValueAtTime(210, now);
    }
    breeze2.connect(dest);
    if (typeof breeze2.start === 'function') breeze2.start(now);
    this._ambienceNodes.push(breeze2);

    // Periodic canopy insect/frog chirps
    const chirpTimer = setInterval(() => {
      if (this._muted || !this._audioCtx || this._currentAmbienceBiome !== 'jungle') return;
      try {
        const t = this._audioCtx.currentTime || 0;
        const chirpOsc = this._audioCtx.createOscillator();
        const chirpGain = this._audioCtx.createGain();
        chirpOsc.type = 'sine';
        chirpOsc.frequency.setValueAtTime(2200, t);
        chirpOsc.frequency.exponentialRampToValueAtTime(1800, t + 0.05);

        chirpGain.gain.setValueAtTime(0.001, t);
        chirpGain.gain.linearRampToValueAtTime(0.04, t + 0.01);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

        chirpOsc.connect(chirpGain);
        chirpGain.connect(dest);
        chirpOsc.start(t);
        chirpOsc.stop(t + 0.06);
      } catch {}
    }, 3500);
    this._ambienceIntervals.push(chirpTimer);
  }

  /**
   * Build Magma Ambience: Sub-bass volcanic rumble & molten rock heat
   * @private
   */
  _buildMagmaAmbience(ctx, dest) {
    const now = ctx.currentTime || 0;
    const rumble = ctx.createOscillator();
    rumble.type = 'triangle';
    if (rumble.frequency && typeof rumble.frequency.setValueAtTime === 'function') {
      rumble.frequency.setValueAtTime(42, now);
    }

    const rumbleFilter = ctx.createBiquadFilter ? ctx.createBiquadFilter() : null;
    if (rumbleFilter) {
      rumbleFilter.type = 'lowpass';
      if (rumbleFilter.frequency && typeof rumbleFilter.frequency.setValueAtTime === 'function') {
        rumbleFilter.frequency.setValueAtTime(95, now);
      }
      rumble.connect(rumbleFilter);
      rumbleFilter.connect(dest);
      this._ambienceNodes.push(rumbleFilter);
    } else {
      rumble.connect(dest);
    }

    if (typeof rumble.start === 'function') rumble.start(now);
    this._ambienceNodes.push(rumble);
  }

  /**
   * Build Glacial Ambience: High arctic wind whistle & crystalline harmonics
   * @private
   */
  _buildGlacialAmbience(ctx, dest) {
    const now = ctx.currentTime || 0;
    const wind = ctx.createOscillator();
    wind.type = 'triangle';
    if (wind.frequency && typeof wind.frequency.setValueAtTime === 'function') {
      wind.frequency.setValueAtTime(320, now);
    }

    const windFilter = ctx.createBiquadFilter ? ctx.createBiquadFilter() : null;
    if (windFilter) {
      windFilter.type = 'bandpass';
      if (windFilter.frequency && typeof windFilter.frequency.setValueAtTime === 'function') {
        windFilter.frequency.setValueAtTime(650, now);
      }
      if (windFilter.Q && typeof windFilter.Q.setValueAtTime === 'function') {
        windFilter.Q.setValueAtTime(2.5, now);
      }
      wind.connect(windFilter);
      windFilter.connect(dest);
      this._ambienceNodes.push(windFilter);
    } else {
      wind.connect(dest);
    }

    if (typeof wind.start === 'function') wind.start(now);
    this._ambienceNodes.push(wind);

    // Periodic crystal chime harmonic (1760Hz)
    const crystalTimer = setInterval(() => {
      if (this._muted || !this._audioCtx || this._currentAmbienceBiome !== 'glacial') return;
      try {
        const t = this._audioCtx.currentTime || 0;
        const chime = this._audioCtx.createOscillator();
        const chimeGain = this._audioCtx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(1760, t);

        chimeGain.gain.setValueAtTime(0.001, t);
        chimeGain.gain.linearRampToValueAtTime(0.035, t + 0.02);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

        chime.connect(chimeGain);
        chimeGain.connect(dest);
        chime.start(t);
        chime.stop(t + 0.8);
      } catch {}
    }, 4200);
    this._ambienceIntervals.push(crystalTimer);
  }

  /**
   * Build Temple Ambience: Sacred singing bowl binaural beating & mineral droplet ping
   * @private
   */
  _buildTempleAmbience(ctx, dest) {
    const now = ctx.currentTime || 0;
    // Dual binaural oscillators creating 2.5Hz sacred beating drone
    const bowl1 = ctx.createOscillator();
    bowl1.type = 'sine';
    if (bowl1.frequency && typeof bowl1.frequency.setValueAtTime === 'function') {
      bowl1.frequency.setValueAtTime(216, now);
    }
    bowl1.connect(dest);
    if (typeof bowl1.start === 'function') bowl1.start(now);
    this._ambienceNodes.push(bowl1);

    const bowl2 = ctx.createOscillator();
    bowl2.type = 'sine';
    if (bowl2.frequency && typeof bowl2.frequency.setValueAtTime === 'function') {
      bowl2.frequency.setValueAtTime(218.5, now);
    }
    bowl2.connect(dest);
    if (typeof bowl2.start === 'function') bowl2.start(now);
    this._ambienceNodes.push(bowl2);

    // Periodic subterranean water droplet ping
    const dropletTimer = setInterval(() => {
      if (this._muted || !this._audioCtx || this._currentAmbienceBiome !== 'temple') return;
      try {
        const t = this._audioCtx.currentTime || 0;
        const drop = this._audioCtx.createOscillator();
        const dropGain = this._audioCtx.createGain();
        drop.type = 'sine';
        drop.frequency.setValueAtTime(1200, t);
        drop.frequency.exponentialRampToValueAtTime(650, t + 0.08);

        dropGain.gain.setValueAtTime(0.001, t);
        dropGain.gain.linearRampToValueAtTime(0.045, t + 0.01);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

        drop.connect(dropGain);
        dropGain.connect(dest);
        drop.start(t);
        drop.stop(t + 0.12);
      } catch {}
    }, 5000);
    this._ambienceIntervals.push(dropletTimer);
  }

  /**
   * Stop active environmental ambience loops and clean up nodes
   * @param {number} [fadeDuration=0.5]
   */
  stopAmbience(fadeDuration = 0.5) {
    for (const timer of this._ambienceIntervals) {
      clearInterval(timer);
    }
    this._ambienceIntervals = [];

    const gain = this._ambienceGain;
    const nodes = [...this._ambienceNodes];
    this._ambienceGain = null;
    this._ambienceNodes = [];
    this._currentAmbienceBiome = null;

    if (gain && this._audioCtx && gain.gain && typeof gain.gain.linearRampToValueAtTime === 'function') {
      const now = this._audioCtx.currentTime || 0;
      gain.gain.setValueAtTime(gain.gain.value || 0.18, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
    }

    setTimeout(() => {
      for (const node of nodes) {
        try {
          if (typeof node.stop === 'function') node.stop();
          if (typeof node.disconnect === 'function') node.disconnect();
        } catch {}
      }
    }, Math.max(50, fadeDuration * 1000));
  }

  /**
   * Temporarily pause or mute ambience without destroying nodes
   */
  pauseAmbience() {
    if (this._ambienceGain && this._audioCtx && this._ambienceGain.gain && typeof this._ambienceGain.gain.linearRampToValueAtTime === 'function') {
      const now = this._audioCtx.currentTime || 0;
      this._ambienceGain.gain.setValueAtTime(this._ambienceGain.gain.value || 0.18, now);
      this._ambienceGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
    }
  }

  /**
   * Resume paused ambience to active volume
   */
  resumeAmbience() {
    if (this._ambienceGain && this._audioCtx && this._ambienceGain.gain && typeof this._ambienceGain.gain.linearRampToValueAtTime === 'function') {
      const now = this._audioCtx.currentTime || 0;
      this._ambienceGain.gain.setValueAtTime(0.0001, now);
      this._ambienceGain.gain.linearRampToValueAtTime(0.18, now + 0.5);
    }
  }

  /**
   * Register global events listeners for automated sound triggering
   * @private
   */
  _initGlobalEventListeners() {
    if (typeof globalEvents === 'undefined' || !globalEvents.on) return;

    globalEvents.on('key:collected', () => this.playKeyPickup());
    globalEvents.on('door:unlocked', () => this.playDoorUnlock());
    globalEvents.on('lever:toggled', (e) => this.playLeverToggle(e?.state));
    globalEvents.on('hazard:hit', () => this.playHazardHit());
    globalEvents.on('checkpoint:activated', () => this.playCheckpoint());
    globalEvents.on('sound:toggled', (e) => this.setMuted(e?.muted));
    globalEvents.on('game:paused', () => this.pauseAmbience());
    globalEvents.on('game:resumed', () => this.resumeAmbience());
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

// Exports
export const audioFX = new SoundFXEngine();
export { SoundFXEngine, SoundFXEngine as AudioFx };
