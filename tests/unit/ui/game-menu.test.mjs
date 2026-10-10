/**
 * Unit Tests: In-Game Pause & Action Menu Controller
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameMenu } from '../../../js/ui/game-menu.js';
import { GameLoop } from '../../../js/engine/game-loop.js';

describe('UI > In-Game Pause & Action Menu', () => {
  it('initializes in an active running (non-paused) state', () => {
    const menu = new GameMenu();
    assertEqual(menu.isPaused(), false);
    menu.destroy();
  });

  it('toggles pause and resume states with callbacks and CSS class manipulation', () => {
    let resumedCount = 0;
    const mockModal = {
      classList: {
        _classes: new Set(),
        add(cls) { this._classes.add(cls); },
        remove(cls) { this._classes.delete(cls); },
        contains(cls) { return this._classes.has(cls); },
      },
      querySelector: () => null,
    };

    const menu = new GameMenu({
      modalEl: mockModal,
      onResume: () => { resumedCount++; },
    });

    menu.pause();
    assertEqual(menu.isPaused(), true);
    assert(mockModal.classList.contains('active'), 'Active class added to modal backdrop');

    menu.resume();
    assertEqual(menu.isPaused(), false);
    assert(!mockModal.classList.contains('active'), 'Active class removed from modal backdrop');
    assertEqual(resumedCount, 1);

    menu.toggle();
    assertEqual(menu.isPaused(), true);

    menu.toggle();
    assertEqual(menu.isPaused(), false);
    assertEqual(resumedCount, 2);

    menu.destroy();
  });

  it('updates telemetry stats inside pause modal elements', () => {
    const elements = {};
    const mockModal = {
      classList: { add: () => {}, remove: () => {} },
      querySelector: (sel) => {
        if (!elements[sel]) elements[sel] = { textContent: '' };
        return elements[sel];
      },
    };

    const menu = new GameMenu({ modalEl: mockModal });

    menu.pause({
      title: 'The Hidden Underpass',
      timeStr: '01:23.4',
      steps: 42,
      keysHeld: 2,
    });

    assertEqual(elements['#pause-stat-title'].textContent, 'The Hidden Underpass');
    assertEqual(elements['#pause-stat-time'].textContent, '01:23.4');
    assertEqual(elements['#pause-stat-steps'].textContent, '42');
    assertEqual(elements['#pause-stat-keys'].textContent, '2');

    menu.destroy();
  });

  it('updates sound button label according to mute status', () => {
    const soundBtn = { innerHTML: '' };
    const mockModal = {
      classList: { add: () => {}, remove: () => {} },
      querySelector: (sel) => (sel === '#btn-pause-sound' ? soundBtn : null),
    };

    const menu = new GameMenu({ modalEl: mockModal });

    menu.updateSoundButtonLabel(false);
    assert(soundBtn.innerHTML.includes('ON'), 'Displays ON when unmuted');

    menu.updateSoundButtonLabel(true);
    assert(soundBtn.innerHTML.includes('OFF'), 'Displays OFF when muted');

    menu.destroy();
  });

  it('handles keyboard shortcuts P and Escape', () => {
    const mockModal = {
      classList: {
        _classes: new Set(),
        add(cls) { this._classes.add(cls); },
        remove(cls) { this._classes.delete(cls); },
        contains(cls) { return this._classes.has(cls); },
      },
      querySelector: () => null,
    };

    let resumed = 0;
    const menu = new GameMenu({
      modalEl: mockModal,
      onResume: () => { resumed++; },
    });

    // Press P to pause
    menu._handleKeyDown({ code: 'KeyP', preventDefault: () => {} });
    assertEqual(menu.isPaused(), true);

    // Press Escape to resume
    menu._handleKeyDown({ code: 'Escape', preventDefault: () => {} });
    assertEqual(menu.isPaused(), false);
    assertEqual(resumed, 1);

    // If other modal is open, P is blocked
    menu.isOtherModalOpen = () => true;
    menu._handleKeyDown({ code: 'KeyP', preventDefault: () => {} });
    assertEqual(menu.isPaused(), false, 'P shortcut blocked when other modal is open');

    menu.destroy();
  });

  it('automatically pauses engine when view is obscured by modals and resumes when cleared (BL-92, ADR-0010)', () => {
    const mockCanvas = {
      getContext: () => ({
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        putImageData: () => {},
        createImageData: () => ({ data: new Uint8ClampedArray(4) }),
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        closePath: () => {},
        stroke: () => {},
        fill: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        rect: () => {},
      }),
      width: 800,
      height: 600,
    };

    const mockLevel = {
      id: 1,
      name: 'Pause Chamber',
      dimensions: { width: 5, height: 5 },
      spawn: { x: 1, y: 1 },
      grid: Array(5).fill(null).map(() => Array(5).fill(0)),
      entities: [],
    };

    const gameLoop = new GameLoop({
      mainCanvas: mockCanvas,
      minimapCanvas: mockCanvas,
      level: mockLevel,
    });

    assertEqual(gameLoop.isPaused, false, 'Engine initially unpaused');
    assertEqual(gameLoop.obscuringOverlays.size, 0, 'No obscuring overlays initially');

    // 1. Lore Journal opens -> Engine auto-pauses
    gameLoop.setObscured(true, 'lore_journal');
    assertEqual(gameLoop.isPaused, true, 'Engine auto-paused by lore_journal overlay');
    assertEqual(gameLoop.obscuringOverlays.has('lore_journal'), true);

    // 2. Settings modal also opens while journal is open
    gameLoop.setObscured(true, 'settings_modal');
    assertEqual(gameLoop.isPaused, true, 'Engine remains paused with multiple overlays');
    assertEqual(gameLoop.obscuringOverlays.size, 2);

    // 3. Settings modal closes, but journal still open -> Remains paused
    gameLoop.setObscured(false, 'settings_modal');
    assertEqual(gameLoop.isPaused, true, 'Engine remains paused while journal still active');
    assertEqual(gameLoop.obscuringOverlays.size, 1);

    // 4. Lore journal closes -> All obscuring overlays cleared, engine auto-resumes!
    gameLoop.setObscured(false, 'lore_journal');
    assertEqual(gameLoop.isPaused, false, 'Engine auto-resumed after all overlays cleared');
    assertEqual(gameLoop.obscuringOverlays.size, 0);

    // 5. GameMenu.pause() synchronizes with GameLoop
    const menu = new GameMenu();
    menu.pause();
    assertEqual(gameLoop.isPaused, true, 'GameMenu pause emits game:paused and pauses GameLoop');

    menu.resume();
    assertEqual(gameLoop.isPaused, false, 'GameMenu resume emits game:resumed and resumes GameLoop');

    menu.destroy();
    gameLoop.stop();
  });
});
