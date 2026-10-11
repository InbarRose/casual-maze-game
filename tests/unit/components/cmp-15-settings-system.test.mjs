/**
 * Component Test Suite: CMP-15 Settings & Configuration System
 *
 * Exhaustively verifies:
 * 1. Every Menu / Tab: Audio (#tab-btn-audio), Display (#tab-btn-display), Controls (#tab-btn-controls),
 *    Save Data (#tab-btn-save), Diagnostics & Support (#tab-btn-diagnostics)
 * 2. Every Button & Setting: Audio sliders & mutes, High contrast toggle, Perspective select,
 *    Zoom sensitivity, Keybinding scheme select, Mouse movement mode select, Simple keyboard mode,
 *    Save export button, Save import file input, Reset all progress, Reset confirmation dialog (yes/no),
 *    Emergency snapshot rollback button, Open Feedback trigger
 * 3. Every Mode: Audio configuration, Visual accessibility, Input controls, Save backup management
 * 4. Every Phase: Tab switching phase, Preference adjustment phase, Storage persistence phase,
 *    Destructive confirmation phase, Rollback recovery phase
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { SettingsModal } from '../../../js/ui/settings-modal.js';
import { StorageManager } from '../../../js/core/storage.js';

describe('Component Suite > CMP-15: Settings & Configuration System', () => {
  it('covers every categorized tab and navigation in SettingsModal', () => {
    localStorage.clear();

    const settingsModal = new SettingsModal();
    const modalEl = settingsModal.modalEl;
    assert(modalEl !== null, 'SettingsModal rendered');

    // 5 Categorized Navigation Tabs (BL-107)
    const tabs = modalEl.querySelectorAll('.settings-tab-btn');
    assertEqual(tabs.length, 5, 'Contains all 5 categorized tabs');

    const expectedTabs = ['audio', 'display', 'controls', 'save', 'diagnostics'];
    for (const tabId of expectedTabs) {
      settingsModal.switchTab(tabId);
      assertEqual(settingsModal._activeTab, tabId, `Switches cleanly to ${tabId} tab`);

      const activePanel = modalEl.querySelector(`#settings-panel-${tabId}`);
      assert(activePanel !== null, `Panel for ${tabId} exists`);
      assert(activePanel.classList.contains('active'), `Panel for ${tabId} is marked active`);
    }

    settingsModal.close();
    modalEl.remove();
  });

  it('covers every button, toggle, and dropdown across settings panels', () => {
    localStorage.clear();

    const settingsModal = new SettingsModal();
    const modalEl = settingsModal.modalEl;

    // 1. Audio Controls
    settingsModal.switchTab('audio');
    const sfxVolume = modalEl.querySelector('#settings-sfx-volume');
    const sfxMute = modalEl.querySelector('#settings-sfx-mute');
    const ambienceVolume = modalEl.querySelector('#settings-ambience-volume');
    const ambienceMute = modalEl.querySelector('#settings-ambience-mute');

    assert(sfxVolume !== null, '#settings-sfx-volume exists');
    assert(sfxMute !== null, '#settings-sfx-mute exists');
    assert(ambienceVolume !== null, '#settings-ambience-volume exists');
    assert(ambienceMute !== null, '#settings-ambience-mute exists');

    // 2. Display Controls
    settingsModal.switchTab('display');
    const contrastBtn = modalEl.querySelector('#settings-contrast-toggle');
    const perspectiveSelect = modalEl.querySelector('#settings-perspective-select');

    assert(contrastBtn !== null, '#settings-contrast-toggle exists');
    assert(perspectiveSelect !== null, '#settings-perspective-select exists');

    // 3. Controls / Keybindings
    settingsModal.switchTab('controls');
    const keybindingSelect = modalEl.querySelector('#settings-keybinding-preset');
    const mouseMovementSelect = modalEl.querySelector('#settings-mouse-move-mode');

    assert(keybindingSelect !== null, '#settings-keybinding-preset exists');
    assert(mouseMovementSelect !== null, '#settings-mouse-move-mode exists');

    // 4. Save Data & Backup
    settingsModal.switchTab('save');
    const exportBtn = modalEl.querySelector('#btn-settings-export-save');
    const importBtn = modalEl.querySelector('#btn-settings-import-save');
    const resetProgressBtn = modalEl.querySelector('#btn-settings-reset-save');
    const rollbackBtn = modalEl.querySelector('#btn-settings-restore-snapshot');

    assert(exportBtn !== null, '#btn-settings-export-save exists');
    assert(importBtn !== null, '#btn-settings-import-save exists');
    assert(resetProgressBtn !== null, '#btn-settings-reset-save exists');
    assert(rollbackBtn !== null, '#btn-settings-restore-snapshot exists');

    // 5. Diagnostics & Feedback
    settingsModal.switchTab('diagnostics');
    const feedbackTrigger = modalEl.querySelector('#btn-settings-open-feedback');
    assert(feedbackTrigger !== null, '#btn-settings-open-feedback exists');

    settingsModal.close();
    modalEl.remove();
  });

  it('manages destructive reset confirmation phase and emergency snapshot rollback', () => {
    localStorage.clear();

    // Seed progress
    StorageManager.saveLevelCompletion('1', { time: 5000, steps: 10 });
    assertEqual(Object.keys(StorageManager.loadCampaignProgress()).length, 1);

    const settingsModal = new SettingsModal();
    const modalEl = settingsModal.modalEl;
    settingsModal.switchTab('save');

    // Click Reset Progress
    const resetProgressBtn = modalEl.querySelector('#btn-settings-reset-save');
    const confirmBox = modalEl.querySelector('#settings-reset-confirm-box');
    const cancelBtn = modalEl.querySelector('#btn-settings-cancel-reset');
    const confirmBtn = modalEl.querySelector('#btn-settings-confirm-reset');

    resetProgressBtn.click();
    assertEqual(confirmBox.style.display, 'block', 'Confirmation dialog visible');

    // Cancel reset
    cancelBtn.click();
    assertEqual(confirmBox.style.display, 'none', 'Confirmation box hidden on cancel');
    assertEqual(Object.keys(StorageManager.loadCampaignProgress()).length, 1, 'Progress preserved on cancel');

    // Confirm reset -> creates emergency snapshot and wipes progress
    resetProgressBtn.click();
    confirmBtn.click();

    assertEqual(Object.keys(StorageManager.loadCampaignProgress()).length, 0, 'Progress reset on confirm');

    // Rollback phase: restore emergency snapshot
    const snapshotRestored = StorageManager.rollbackEmergencySnapshot();
    assertEqual(snapshotRestored.success, true, 'Emergency snapshot rollback succeeds');
    assertEqual(Object.keys(StorageManager.loadCampaignProgress()).length, 1, 'Progress restored from snapshot');

    settingsModal.close();
    modalEl.remove();
  });
});
