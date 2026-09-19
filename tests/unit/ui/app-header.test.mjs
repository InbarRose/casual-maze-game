/**
 * Unit Tests: Universal Global App Header, Profile & Settings Modals
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { StorageManager } from '../../../js/core/storage.js';
import { initAppHeader, getProfileModal, getSettingsModal } from '../../../js/ui/app-header.js';

describe('UI > Universal App Navigation & Modals', () => {
  it('computes player profile, stars, and ranks dynamically', () => {
    localStorage.clear();

    const initial = StorageManager.getPlayerProfile();
    assertEqual(initial.name, 'Explorer');
    assertEqual(initial.rankTitle, 'Novice Pathfinder');
    assertEqual(initial.rankIcon, '🧭');
    assertEqual(initial.totalStars, 0);

    // Update explorer codename
    StorageManager.setPlayerName('Ariadne');
    const renamed = StorageManager.getPlayerProfile();
    assertEqual(renamed.name, 'Ariadne');

    // Simulate stars progression via saveLevelCompletion
    StorageManager.saveLevelCompletion('1', {
      time: 2000,
      steps: 12,
      earnedParSteps: true,
      earnedParTime: true,
      flawless: true,
    });
    // Level 1 gives 1 (complete) + 1 (parSteps) + 1 (parTime) + 1 (flawless) = 4 stars
    const fourStars = StorageManager.getPlayerProfile();
    assertEqual(fourStars.totalStars, 4);
    assertEqual(fourStars.rankTitle, 'Labyrinth Scout');
    assertEqual(fourStars.rankIcon, '🗺️');
  });

  it('initializes universal app header and footer', () => {
    const { header, footer, profileModal, settingsModal } = initAppHeader({ activeTab: 'editor' });

    assert(header !== null, 'Header mounted successfully');
    assert(footer !== null, 'Footer mounted successfully');
    assert(profileModal !== null, 'ProfileModal instance initialized');
    assert(settingsModal !== null, 'SettingsModal instance initialized');

    // Verify header structure
    assert(header.innerHTML.includes('CASUAL MAZE'), 'Header includes brand title');
    assert(header.innerHTML.includes('v'), 'Header includes engine version badge');
    assert(header.innerHTML.includes('Architect Studio'), 'Header includes editor tab link');
    assert(header.innerHTML.includes('btn-app-profile'), 'Header includes profile trigger');
    assert(header.innerHTML.includes('btn-app-settings'), 'Header includes settings trigger');

    // Verify footer structure
    assert(footer.innerHTML.includes('Casual Maze Game'), 'Footer includes game title');
    assert(footer.innerHTML.includes('WASD'), 'Footer includes shortcut guide');
    assert(footer.innerHTML.includes('test.html?mode=diagnostics'), 'Footer includes issue report link');
  });

  it('manages profile modal open, save, and close lifecycle', () => {
    const profileModal = getProfileModal();

    assert(profileModal !== null, 'Profile modal instance obtained');
    profileModal.open();
    assertEqual(profileModal.isOpen, true);

    profileModal.close();
    assertEqual(profileModal.isOpen, false);
  });

  it('manages settings modal audio and display preference changes', () => {
    const settingsModal = getSettingsModal();

    assert(settingsModal !== null, 'Settings modal instance obtained');
    settingsModal.open();
    assertEqual(settingsModal.isOpen, true);

    // Test setting persistence
    StorageManager.setSetting('volume_master', 0.65);
    assertEqual(StorageManager.getSetting('volume_master'), 0.65);

    StorageManager.setSetting('smooth_rotation', false);
    assertEqual(StorageManager.getSetting('smooth_rotation'), false);

    settingsModal.close();
    assertEqual(settingsModal.isOpen, false);
  });
});
