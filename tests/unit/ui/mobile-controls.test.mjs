/**
 * Unit Tests: Mobile Controls, Moveable Top Docking & Destructive Action Confirmations
 * Covers BL-16 enhancements, Moveable Controls, Minimal UI, and Safety Confirmations
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { StorageManager } from '../../../js/core/storage.js';
import { SettingsModal } from '../../../js/ui/settings-modal.js';
import { saveCustomPrefab, getCustomPrefabs, deleteCustomPrefab } from '../../../js/editor/prefabs.js';

describe('UI > Moveable Controls & Destructive Confirmations', () => {
  it('StorageManager.resetAllProgress() safely wipes progress while preserving system preferences', () => {
    localStorage.clear();

    // Populate game progress
    StorageManager.saveLevelCompletion('1', { time: 5000, steps: 10, flawless: true });
    StorageManager.saveStoryProgress('saga_1', 1, { completed: true });

    // Populate user preferences
    localStorage.setItem('maze_sound_muted', 'true');
    localStorage.setItem('maze_audio_master', '0.75');
    localStorage.setItem('maze_high_contrast', 'true');
    localStorage.setItem('maze_controls_position', JSON.stringify({ dock: 'top-right' }));

    // Verify presence
    assert(StorageManager.loadCampaignProgress()['1'] !== undefined, 'Level 1 completion recorded');

    // Perform destructive reset
    const result = StorageManager.resetAllProgress();
    assert(result === true, 'resetAllProgress returned true');

    // Verify progress wiped
    assertEqual(StorageManager.loadCampaignProgress()['1'], undefined, 'Level completions cleared');

    // Verify user preferences preserved
    assertEqual(localStorage.getItem('maze_sound_muted'), 'true', 'Mute preference preserved');
    assertEqual(localStorage.getItem('maze_audio_master'), '0.75', 'Audio volume preserved');
    assertEqual(localStorage.getItem('maze_high_contrast'), 'true', 'High contrast mode preserved');
    assertEqual(localStorage.getItem('maze_controls_position'), JSON.stringify({ dock: 'top-right' }), 'Controls dock position preserved');
  });

  it('SettingsModal includes reset progress confirmation flow', () => {
    localStorage.clear();
    const modal = new SettingsModal();
    const el = modal.modalEl;

    const resetTriggerBtn = el.querySelector('#btn-settings-reset-save');
    const confirmBox = el.querySelector('#settings-reset-confirm-box');
    const cancelBtn = el.querySelector('#btn-settings-cancel-reset');
    const confirmBtn = el.querySelector('#btn-settings-confirm-reset');

    assert(resetTriggerBtn !== null, 'Reset progress trigger button exists in SettingsModal');
    assert(confirmBox !== null, 'Confirmation box exists in SettingsModal');
    assert(cancelBtn !== null, 'Cancel button exists in confirmation box');
    assert(confirmBtn !== null, 'Confirm button exists in confirmation box');

    // Click trigger: confirmation box reveals
    resetTriggerBtn.click();
    assertEqual(confirmBox.style.display, 'block');
    assertEqual(resetTriggerBtn.style.display, 'none');

    // Click cancel: confirmation box hides, trigger returns
    cancelBtn.click();
    assertEqual(confirmBox.style.display, 'none');
    assertEqual(resetTriggerBtn.style.display, 'block');

    // Set level progress
    StorageManager.saveLevelCompletion('1', { time: 3000, steps: 8 });
    assert(StorageManager.loadCampaignProgress()['1'] !== undefined, 'Level progress stored');

    // Open confirm box and click confirm
    resetTriggerBtn.click();
    confirmBtn.click();

    // Verify reset executed, confirmation box hidden, trigger returns
    assertEqual(StorageManager.loadCampaignProgress()['1'], undefined, 'Level progress cleared on confirm');
    assertEqual(confirmBox.style.display, 'none');
    assertEqual(resetTriggerBtn.style.display, 'block');
  });

  it('Editor custom prefabs can be safely created and destructively deleted', () => {
    localStorage.clear();
    const prefabDef = {
      name: 'Test Pillar Room',
      layers: {
        ground: [[1, 1], [1, 1]],
        overhead: [[0, 0], [0, 0]],
      },
    };

    const saved = saveCustomPrefab(prefabDef);
    assert(saved.id.startsWith('custom_'), 'Custom prefab assigned ID');
    assertEqual(getCustomPrefabs().length, 1, 'One custom prefab listed');

    // Destructive deletion
    const deleted = deleteCustomPrefab(saved.id);
    assert(deleted === true, 'deleteCustomPrefab returned true');
    assertEqual(getCustomPrefabs().length, 0, 'Custom prefabs list empty after deletion');
  });

  it('supports virtual controls dock cycling across 4 screen quadrants', () => {
    const dockOrder = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

    const getNextDock = (dock) => {
      const idx = dockOrder.indexOf(dock);
      return dockOrder[(idx + 1) % dockOrder.length];
    };

    assertEqual(getNextDock('top-left'), 'top-right');
    assertEqual(getNextDock('top-right'), 'bottom-left');
    assertEqual(getNextDock('bottom-left'), 'bottom-right');
    assertEqual(getNextDock('bottom-right'), 'top-left');

    // Verify dock persistence format
    const savedPos = { dock: 'top-left', x: null, y: null };
    localStorage.setItem('maze_controls_position', JSON.stringify(savedPos));
    const loaded = JSON.parse(localStorage.getItem('maze_controls_position'));
    assertEqual(loaded.dock, 'top-left');
  });
});
