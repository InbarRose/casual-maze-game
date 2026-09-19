/**
 * Unit Tests: Procedural Web Audio Sound FX Engine
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { audioFX } from '../../../js/ui/audio-fx.js';

describe('UI > Procedural Web Audio Sound FX Engine', () => {
  it('manages mute state and defaults safely', () => {
    const originalMute = audioFX.isMuted();

    audioFX.setMuted(true);
    assertEqual(audioFX.isMuted(), true);

    const toggled = audioFX.toggleMute();
    assertEqual(toggled, false);
    assertEqual(audioFX.isMuted(), false);

    // Restore
    audioFX.setMuted(originalMute);
  });

  it('safely invokes all sound triggers in headless/test environment without exceptions', () => {
    // None of these should throw even if window.AudioContext is undefined
    audioFX.playHover();
    audioFX.playClick();
    audioFX.playKeyPickup();
    audioFX.playDoorUnlock();
    audioFX.playLeverToggle(true);
    audioFX.playLeverToggle(false);
    audioFX.playTeleport();
    audioFX.playVictory();
    audioFX.playHazardHit();
    audioFX.playCheckpoint();
    audioFX.playModalOpen();
    audioFX.playModalClose();
    assert(true, 'All audio triggers executed safely');
  });

  it('correctly uses mock AudioContext when available', () => {
    let oscCreated = 0;
    let oscStarted = 0;
    let oscStopped = 0;
    let gainCreated = 0;

    const mockCtx = {
      currentTime: 10,
      state: 'running',
      destination: {},
      createOscillator() {
        oscCreated++;
        return {
          type: 'sine',
          frequency: {
            setValueAtTime: () => {},
            exponentialRampToValueAtTime: () => {},
          },
          connect: () => {},
          start: () => { oscStarted++; },
          stop: () => { oscStopped++; },
        };
      },
      createGain() {
        gainCreated++;
        return {
          gain: {
            setValueAtTime: () => {},
            linearRampToValueAtTime: () => {},
            exponentialRampToValueAtTime: () => {},
          },
          connect: () => {},
        };
      },
    };

    // Inject mock context
    audioFX._audioCtx = mockCtx;
    audioFX.setMuted(false);

    audioFX.playClick();
    assert(oscCreated >= 1, 'Mock oscillator was created for click sound');
    assert(gainCreated >= 1, 'Mock gain node was created for click sound');
    assertEqual(oscStarted, 1);
    assertEqual(oscStopped, 1);

    // Test muted state prevents sound generation
    audioFX.setMuted(true);
    const prevOsc = oscCreated;
    audioFX.playClick();
    assertEqual(oscCreated, prevOsc, 'No audio played while muted');

    // Clean up
    audioFX._audioCtx = null;
    audioFX.setMuted(false);
  });

  it('safely attaches listeners to mock DOM elements', () => {
    const listeners = [];
    const mockElement = {
      dataset: {},
      addEventListener: (evt, fn) => {
        listeners.push({ evt, fn });
      },
    };

    const mockRoot = {
      querySelectorAll: (sel) => [mockElement],
    };

    audioFX.attachToInteractiveElements(mockRoot);
    assertEqual(mockElement.dataset.soundAttached, 'true');
    assertEqual(listeners.length, 2);
    assertEqual(listeners[0].evt, 'mouseenter');
    assertEqual(listeners[1].evt, 'click');

    // Subsequent attach should skip already attached element
    audioFX.attachToInteractiveElements(mockRoot);
    assertEqual(listeners.length, 2, 'Does not duplicate listeners');
  });
});
