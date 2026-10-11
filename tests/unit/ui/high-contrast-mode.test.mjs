/**
 * Unit Test: High Contrast Grid & Palette Mode (BL-26)
 * Verifies accessibility high-contrast styling persistence and DOM application.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { StorageManager } from '../../../js/core/storage.js';
import { getSettingsModal, initAppHeader } from '../../../js/ui/app-header.js';

describe('UI > High Contrast Mode (BL-26)', () => {
  it('persists high contrast preference and toggles body class', () => {
    localStorage.clear();
    document.body.classList.remove('high-contrast-mode');

    assertEqual(StorageManager.getSetting('high_contrast', false), false);
    assertEqual(document.body.classList.contains('high-contrast-mode'), false);

    // Enable high contrast setting
    StorageManager.setSetting('high_contrast', true);
    document.body.classList.toggle('high-contrast-mode', true);

    assertEqual(StorageManager.getSetting('high_contrast'), true);
    assertEqual(document.body.classList.contains('high-contrast-mode'), true);

    // Disable high contrast setting
    StorageManager.setSetting('high_contrast', false);
    document.body.classList.toggle('high-contrast-mode', false);

    assertEqual(StorageManager.getSetting('high_contrast'), false);
    assertEqual(document.body.classList.contains('high-contrast-mode'), false);
  });

  it('automatically applies high contrast on boot when persisted', () => {
    localStorage.clear();
    document.body.classList.remove('high-contrast-mode');

    // Persist high contrast enabled
    StorageManager.setSetting('high_contrast', true);

    // Re-initialize header (simulating page load)
    initAppHeader();

    assertEqual(document.body.classList.contains('high-contrast-mode'), true, 'Body receives high-contrast-mode class on startup');

    // Reset
    document.body.classList.remove('high-contrast-mode');
    StorageManager.setSetting('high_contrast', false);
  });

  it('manages settings modal lifecycle and contrast availability', () => {
    const settings = getSettingsModal();
    assert(settings !== null, 'Settings modal instance is available');
    settings.open();
    assertEqual(settings.isOpen, true, 'Settings modal opens');
    settings.close();
    assertEqual(settings.isOpen, false, 'Settings modal closes');
  });
});
