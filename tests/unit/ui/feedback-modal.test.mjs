/**
 * Unit Tests: Feedback & Bug Reporting Modal (BL-69) and Settings Gamepad Tester (BL-70)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { FeedbackModal, getFeedbackModal } from '../../../js/ui/feedback-modal.js';
import { getSettingsModal } from '../../../js/ui/app-header.js';
import { StorageManager } from '../../../js/core/storage.js';

describe('UI > Universal Feedback Modal & Gamepad Guide (BL-69, BL-70)', () => {
  it('initializes FeedbackModal and verifies singleton instance', () => {
    const modal1 = getFeedbackModal();
    const modal2 = getFeedbackModal();

    assert(modal1 instanceof FeedbackModal, 'Returns FeedbackModal instance');
    assertEqual(modal1, modal2);
    assertEqual(modal1.isOpen, false);
  });

  it('manages FeedbackModal open, context population, and close lifecycle', () => {
    const modal = getFeedbackModal();

    modal.open({
      pageTitle: 'Test Chamber Beta',
      activeLevel: { id: 'lvl_test_99', title: 'The Crystal Vault' },
    });

    assertEqual(modal.isOpen, true);
    assert(document.body.classList.contains('modal-open'), 'Body has modal-open class');

    const locEl = modal.modalEl.querySelector('#feedback-context-location');
    assert(locEl !== null, 'Location element exists');
    assert(locEl.textContent.includes('The Crystal Vault') || locEl.textContent.includes('lvl_test_99'), 'Location displays active level title/id');

    const previewEl = modal.modalEl.querySelector('#feedback-telemetry-preview');
    assert(previewEl !== null, 'Preview pre element exists');
    assert(previewEl.textContent.includes('engineVersion') || previewEl.textContent.includes('activeLevel'), 'Preview contains telemetry JSON');

    // Close modal
    modal.close();
    assertEqual(modal.isOpen, false);
    assert(!document.body.classList.contains('modal-open'), 'Body modal-open class removed');
  });

  it('generates diagnostic markdown bundle with player notes', () => {
    const modal = getFeedbackModal();
    modal.open({
      pageTitle: 'Arcane Maze',
      activeLevel: { id: 'test_bundle', title: 'Bundle Chamber' },
    });

    const notesEl = modal.modalEl.querySelector('#feedback-user-notes');
    if (notesEl) {
      notesEl.value = 'Ramp transition in south corner feels sticky.';
    }

    const bundle = modal._generateBundle();
    assert(bundle !== null, 'Generated bundle object');
    assert(typeof bundle.markdown === 'string', 'Bundle markdown is string');
    assert(bundle.markdown.includes('### Bug Report Diagnostic Bundle'), 'Markdown has diagnostic title');
    assert(bundle.markdown.includes('Engine Version'), 'Markdown has engine version');

    modal.close();
  });

  it('verifies SettingsModal contains Gamepad Guide, Live Tester, and Feedback trigger (BL-70)', () => {
    const settingsModal = getSettingsModal();
    settingsModal.open();

    assertEqual(settingsModal.isOpen, true);

    // Verify Gamepad details & status elements
    const gpDetails = settingsModal.modalEl.querySelector('#settings-gamepad-details');
    assert(gpDetails !== null, 'Gamepad details element exists');

    const gpBadge = settingsModal.modalEl.querySelector('#gamepad-connection-badge');
    assert(gpBadge !== null, 'Gamepad connection badge exists');

    const gpBanner = settingsModal.modalEl.querySelector('#gamepad-info-banner');
    assert(gpBanner !== null, 'Gamepad info banner exists');

    // Verify indicators for all key buttons
    assert(settingsModal.modalEl.querySelector('#gp-btn-stick') !== null, 'Stick indicator exists');
    assert(settingsModal.modalEl.querySelector('#gp-btn-a') !== null, 'A button indicator exists');
    assert(settingsModal.modalEl.querySelector('#gp-btn-b') !== null, 'B button indicator exists');
    assert(settingsModal.modalEl.querySelector('#gp-btn-x') !== null, 'X button indicator exists');
    assert(settingsModal.modalEl.querySelector('#gp-btn-lb') !== null, 'LB button indicator exists');
    assert(settingsModal.modalEl.querySelector('#gp-btn-rb') !== null, 'RB button indicator exists');
    assert(settingsModal.modalEl.querySelector('#gp-btn-select') !== null, 'Select button indicator exists');
    assert(settingsModal.modalEl.querySelector('#gp-btn-start') !== null, 'Start button indicator exists');

    // Verify Feedback reporting button in Section 5
    const feedbackBtn = settingsModal.modalEl.querySelector('#btn-settings-open-feedback');
    assert(feedbackBtn !== null, 'Diagnostics feedback button exists in settings');

    // Verify status update without connected gamepad
    settingsModal._updateGamepadStatus();
    assertEqual(gpBadge.textContent, 'No Gamepad');

    // Mock connected gamepad and verify live updates
    const origGetGamepads = navigator.getGamepads;
    navigator.getGamepads = () => [
      {
        index: 0,
        id: 'Xbox 360 Controller (Standard Pad)',
        connected: true,
        axes: [0.0, -0.85],
        buttons: [
          { pressed: true, value: 1.0 }, // A pressed
          { pressed: false, value: 0.0 }, // B
          { pressed: false, value: 0.0 }, // X
          { pressed: false, value: 0.0 }, // Y
          { pressed: false, value: 0.0 }, // LB
          { pressed: true, value: 1.0 },  // RB pressed
        ],
      },
    ];

    try {
      settingsModal._updateGamepadStatus();
      assert(gpBadge.textContent.includes('Connected (#0)'), 'Badge reflects connected pad');
      assert(gpBanner.textContent.includes('Xbox 360 Controller'), 'Banner displays controller name');

      const aBtn = settingsModal.modalEl.querySelector('#gp-btn-a');
      assert(aBtn.style.color === 'rgb(255, 255, 255)' || aBtn.style.fontWeight === '700', 'A button is highlighted');

      const rbBtn = settingsModal.modalEl.querySelector('#gp-btn-rb');
      assert(rbBtn.style.color === 'rgb(255, 255, 255)' || rbBtn.style.fontWeight === '700', 'RB button is highlighted');

      // Clear highlights
      settingsModal._clearGamepadHighlights();
      assert(aBtn.style.color === '' || aBtn.style.fontWeight === '', 'A button highlight cleared');
    } finally {
      navigator.getGamepads = origGetGamepads;
    }

    settingsModal.close();
    assertEqual(settingsModal.isOpen, false);
  });
});
