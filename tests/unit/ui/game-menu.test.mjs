/**
 * Unit Tests: In-Game Pause & Action Menu Controller
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameMenu } from '../../../js/ui/game-menu.js';

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
});
