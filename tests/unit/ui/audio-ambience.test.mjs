/**
 * Unit Tests: Audio FX Gain Sliders & Procedural Ambience Engine (BL-25, BL-28)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { audioFX, SoundFXEngine } from '../../../js/ui/audio-fx.js';
import { StorageManager } from '../../../js/core/storage.js';
import { globalEvents } from '../../../js/core/events.js';

describe('UI > Audio Gain Sliders & Procedural Ambience Engine (BL-25, BL-28)', () => {
  it('manages master, sfx, and bgm volumes with clamping and persistence (BL-25)', () => {
    const origMaster = audioFX.getMasterVolume();
    const origSfx = audioFX.getSfxVolume();
    const origBgm = audioFX.getBgmVolume();

    // Clamping tests
    audioFX.setMasterVolume(1.5);
    assertEqual(audioFX.getMasterVolume(), 1.0, 'Master volume clamps to max 1.0');
    assertEqual(StorageManager.getSetting('volume_master'), 1.0);

    audioFX.setMasterVolume(-0.2);
    assertEqual(audioFX.getMasterVolume(), 0.0, 'Master volume clamps to min 0.0');

    audioFX.setSfxVolume(0.75);
    assertEqual(audioFX.getSfxVolume(), 0.75, 'SFX volume sets to 0.75');
    assertEqual(StorageManager.getSetting('volume_sfx'), 0.75);

    audioFX.setBgmVolume(0.42);
    assertEqual(audioFX.getBgmVolume(), 0.42, 'BGM volume sets to 0.42');
    assertEqual(StorageManager.getSetting('volume_bgm'), 0.42);

    // Restore original values
    audioFX.setMasterVolume(origMaster);
    audioFX.setSfxVolume(origSfx);
    audioFX.setBgmVolume(origBgm);
  });

  it('builds 3-tier hierarchical audio routing graph with mock AudioContext', () => {
    const createdGains = [];
    const createdOscillators = [];
    const createdFilters = [];

    const mockCtx = {
      currentTime: 100,
      state: 'running',
      destination: { name: 'destination' },
      createGain() {
        const gainNode = {
          id: `gain_${createdGains.length}`,
          gain: {
            value: 1,
            setValueAtTime: function(v, t) { this.value = v; },
            linearRampToValueAtTime: function(v, t) { this.value = v; },
            exponentialRampToValueAtTime: function(v, t) { this.value = v; },
          },
          connections: [],
          connect(target) { this.connections.push(target); },
          disconnect() { this.connections = []; },
        };
        createdGains.push(gainNode);
        return gainNode;
      },
      createOscillator() {
        const osc = {
          type: 'sine',
          frequency: {
            value: 440,
            setValueAtTime: function(v) { this.value = v; },
            exponentialRampToValueAtTime: function(v) { this.value = v; },
          },
          connections: [],
          connect(target) { this.connections.push(target); },
          disconnect() { this.connections = []; },
          start() { this.started = true; },
          stop() { this.stopped = true; },
        };
        createdOscillators.push(osc);
        return osc;
      },
      createBiquadFilter() {
        const filter = {
          type: 'lowpass',
          frequency: {
            value: 350,
            setValueAtTime: function(v) { this.value = v; },
          },
          Q: {
            value: 1,
            setValueAtTime: function(v) { this.value = v; },
          },
          connections: [],
          connect(target) { this.connections.push(target); },
          disconnect() { this.connections = []; },
        };
        createdFilters.push(filter);
        return filter;
      },
    };

    const engine = new SoundFXEngine();
    engine._audioCtx = mockCtx;
    engine._initRouting();

    // Verify 3 gain nodes were created: master, sfx, bgm
    assert(createdGains.length >= 3, 'Created 3 gain nodes for routing hierarchy');
    const masterGain = engine._masterGain;
    const sfxGain = engine._sfxGain;
    const bgmGain = engine._bgmGain;

    assert(masterGain.connections.includes(mockCtx.destination), 'Master gain connects to destination');
    assert(sfxGain.connections.includes(masterGain), 'SFX gain connects to master gain');
    assert(bgmGain.connections.includes(masterGain), 'BGM gain connects to master gain');

    // Test volume adjustment updates gain values in real-time
    engine.setMasterVolume(0.6);
    assertEqual(masterGain.gain.value, 0.6);

    engine.setSfxVolume(0.85);
    assertEqual(sfxGain.gain.value, 0.85);

    engine.setBgmVolume(0.3);
    assertEqual(bgmGain.gain.value, 0.3);

    // Test mute clamps master gain to 0 while preserving slider volume
    engine.setMuted(true);
    assertEqual(masterGain.gain.value, 0, 'Master gain clamped to 0 when muted');
    assertEqual(engine.getMasterVolume(), 0.6, 'Logical volume value preserved while muted');

    engine.setMuted(false);
    assertEqual(masterGain.gain.value, 0.6, 'Master gain restored when unmuted');
  });

  it('generates procedural ambience loops for all 5 biomes without external assets (BL-28)', () => {
    const biomes = ['dungeon', 'jungle', 'magma', 'glacial', 'temple'];

    for (const biome of biomes) {
      const createdOscs = [];
      const createdGains = [];
      const createdFilters = [];

      const mockCtx = {
        currentTime: 50,
        state: 'running',
        destination: {},
        createGain() {
          const g = {
            gain: {
              value: 0,
              setValueAtTime: function(v) { this.value = v; },
              linearRampToValueAtTime: function(v) { this.value = v; },
              exponentialRampToValueAtTime: function(v) { this.value = v; },
            },
            connect() {},
            disconnect() {},
          };
          createdGains.push(g);
          return g;
        },
        createOscillator() {
          const osc = {
            type: 'sine',
            frequency: {
              value: 440,
              setValueAtTime: function(v) { this.value = v; },
              exponentialRampToValueAtTime: function(v) { this.value = v; },
            },
            connect() {},
            disconnect() {},
            start() { this.started = true; },
            stop() { this.stopped = true; },
          };
          createdOscs.push(osc);
          return osc;
        },
        createBiquadFilter() {
          const f = {
            type: 'lowpass',
            frequency: {
              value: 200,
              setValueAtTime: function(v) { this.value = v; },
            },
            Q: {
              value: 1,
              setValueAtTime: function(v) { this.value = v; },
            },
            connect() {},
            disconnect() {},
          };
          createdFilters.push(f);
          return f;
        },
      };

      const engine = new SoundFXEngine();
      engine._audioCtx = mockCtx;
      engine._initRouting();

      // Start ambience for the biome
      engine.startAmbience(biome);
      assertEqual(engine.getActiveBiome(), biome, `Active biome reported as ${biome}`);
      assert(createdOscs.length >= 1, `At least 1 oscillator synthesized for ${biome}`);
      assert(createdOscs.every(osc => osc.started), `All oscillators started for ${biome}`);

      // Ambience pause & resume
      engine.pauseAmbience();
      assert(engine._ambienceGain.gain.value <= 0.001, 'Ambience gain ramped down on pause');

      engine.resumeAmbience();
      assert(engine._ambienceGain.gain.value > 0.05, 'Ambience gain ramped up on resume');

      // Ambience stop and disposal
      engine.stopAmbience(0.01);
      assertEqual(engine.getActiveBiome(), null, 'Active biome reset to null after stop');
    }
  });

  it('normalizes aliases and handles theme switches seamlessly', () => {
    const engine = new SoundFXEngine();
    assertEqual(engine._normalizeBiome('stone'), 'dungeon');
    assertEqual(engine._normalizeBiome('dungeon_catacombs'), 'dungeon');
    assertEqual(engine._normalizeBiome('lush_jungle'), 'jungle');
    assertEqual(engine._normalizeBiome('swamp_mire'), 'jungle');
    assertEqual(engine._normalizeBiome('magma_chamber'), 'magma');
    assertEqual(engine._normalizeBiome('volcanic_caldera'), 'magma');
    assertEqual(engine._normalizeBiome('glacial_cavern'), 'glacial');
    assertEqual(engine._normalizeBiome('snow_summit'), 'glacial');
    assertEqual(engine._normalizeBiome('temple_sanctuary'), 'temple');
    assertEqual(engine._normalizeBiome('amethyst_crystal'), 'temple');
  });

  it('handles headless mode safely when AudioContext is unavailable', () => {
    const engine = new SoundFXEngine();
    engine._audioCtx = null;

    // None of these should throw in headless Node.js
    engine.startAmbience('glacial');
    assertEqual(engine.getActiveBiome(), 'glacial');

    engine.pauseAmbience();
    engine.resumeAmbience();
    engine.stopAmbience();
    assertEqual(engine.getActiveBiome(), null);

    engine.playMove();
    engine.playCollect();
    engine.playUnlock();

    assert(true, 'All ambience and SFX methods run safely in headless mode');
  });

  it('reacts to global events for pause, resume, and sound toggles', () => {
    let pausedTriggered = false;
    let resumedTriggered = false;

    const engine = new SoundFXEngine();
    engine.pauseAmbience = () => { pausedTriggered = true; };
    engine.resumeAmbience = () => { resumedTriggered = true; };

    globalEvents.emit('game:paused');
    assert(pausedTriggered, 'game:paused event pauses ambience');

    globalEvents.emit('game:resumed');
    assert(resumedTriggered, 'game:resumed event resumes ambience');
  });
});
