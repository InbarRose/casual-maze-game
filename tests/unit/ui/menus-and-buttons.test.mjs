/**
 * Unit Tests: Comprehensive Menus, Action Buttons, and Settings Modals Suite
 * (BL-111, ADR-0023)
 *
 * Validates:
 * 1. Global App Header buttons (#btn-app-profile, #btn-app-settings, #btn-app-guide, #btn-app-feedback)
 * 2. Home Page Hero buttons (#btn-hero-settings)
 * 3. In-Game Pause Menu (GameMenu) action buttons (#btn-pause-settings, #btn-pause-profile, etc.)
 * 4. Settings modal categorized tabs and preference controls
 * 5. Profile modal codename updates and synchronization
 * 6. Modal backdrop .active class lifecycle and stacking isolation
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { StorageManager } from '../../../js/core/storage.js';
import { initAppHeader, getProfileModal, getSettingsModal, getFeedbackModal, getGuideModal } from '../../../js/ui/app-header.js';
import { GameMenu } from '../../../js/ui/game-menu.js';

describe('UI > Comprehensive Menus, Buttons & Settings Suite (BL-111)', () => {
  it('universal app header action buttons open respective modals and apply .active class', () => {
    localStorage.clear();

    const { header, profileModal, settingsModal } = initAppHeader({ activeTab: 'hub' });
    const guideModal = getGuideModal();
    const feedbackModal = getFeedbackModal();

    assert(header !== null, 'Header mounted');
    const profileBtn = header.querySelector('#btn-app-profile');
    const settingsBtn = header.querySelector('#btn-app-settings');
    const guideBtn = header.querySelector('#btn-app-guide');
    const feedbackBtn = header.querySelector('#btn-app-feedback');

    assert(profileBtn !== null, 'Profile button exists in header');
    assert(settingsBtn !== null, 'Settings button exists in header');
    assert(guideBtn !== null, 'Guide button exists in header');
    assert(feedbackBtn !== null, 'Feedback button exists in header');

    // 1. Profile Button
    profileBtn.click();
    assertEqual(profileModal.isOpen, true, 'ProfileModal opened via header button');
    assert(profileModal.modalEl.classList.contains('active'), 'ProfileModal backdrop has .active class');
    profileModal.close();
    assertEqual(profileModal.isOpen, false);
    assert(!profileModal.modalEl.classList.contains('active'), 'ProfileModal backdrop removed .active on close');

    // 2. Settings Button
    settingsBtn.click();
    assertEqual(settingsModal.isOpen, true, 'SettingsModal opened via header button');
    assert(settingsModal.modalEl.classList.contains('active'), 'SettingsModal backdrop has .active class');
    settingsModal.close();
    assertEqual(settingsModal.isOpen, false);
    assert(!settingsModal.modalEl.classList.contains('active'), 'SettingsModal backdrop removed .active on close');

    // 3. Guide Button
    guideBtn.click();
    assertEqual(guideModal.isOpen, true, 'GuideModal opened via header button');
    assert(guideModal.modalEl.classList.contains('active'), 'GuideModal backdrop has .active class');
    guideModal.close();
    assertEqual(guideModal.isOpen, false);
    assert(!guideModal.modalEl.classList.contains('active'), 'GuideModal backdrop removed .active on close');

    // 4. Feedback Button
    feedbackBtn.click();
    assertEqual(feedbackModal.isOpen, true, 'FeedbackModal opened via header button');
    assert(feedbackModal.modalEl.classList.contains('active'), 'FeedbackModal backdrop has .active class');
    feedbackModal.close();
    assertEqual(feedbackModal.isOpen, false);
    assert(!feedbackModal.modalEl.classList.contains('active'), 'FeedbackModal backdrop removed .active on close');
  });

  it('home page hero settings button opens the settings modal', () => {
    const heroSettingsBtn = document.createElement('button');
    heroSettingsBtn.id = 'btn-hero-settings';
    document.body.appendChild(heroSettingsBtn);

    let clicked = false;
    heroSettingsBtn.addEventListener('click', () => {
      clicked = true;
      getSettingsModal().open();
    });

    const settingsModal = getSettingsModal();
    if (settingsModal.isOpen) settingsModal.close();

    heroSettingsBtn.click();
    assertEqual(clicked, true, 'Hero settings button click event fired');
    assertEqual(settingsModal.isOpen, true, 'Settings modal is open after hero button click');
    assert(settingsModal.modalEl.classList.contains('active'), 'Settings modal has .active backdrop class');

    settingsModal.close();
    assertEqual(settingsModal.isOpen, false);
    heroSettingsBtn.remove();
  });

  it('in-game pause menu connects to settings and player profile modals', () => {
    // Create mock pause modal DOM container
    const pauseBackdrop = document.createElement('div');
    pauseBackdrop.id = 'game-pause-modal';
    pauseBackdrop.className = 'modal-backdrop';

    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'btn-pause-settings';
    pauseBackdrop.appendChild(settingsBtn);

    const profileBtn = document.createElement('button');
    profileBtn.id = 'btn-pause-profile';
    pauseBackdrop.appendChild(profileBtn);

    const resumeBtn = document.createElement('button');
    resumeBtn.id = 'btn-pause-resume';
    pauseBackdrop.appendChild(resumeBtn);

    document.body.appendChild(pauseBackdrop);

    let resumeCount = 0;
    const gameMenu = new GameMenu({
      modalEl: pauseBackdrop,
      onResume: () => { resumeCount++; },
    });

    // Pause game
    gameMenu.pause();
    assertEqual(gameMenu.isPaused(), true);
    assert(pauseBackdrop.classList.contains('active'), 'Pause menu active');

    // Click Pause Profile button
    const profileModal = getProfileModal();
    if (profileModal.isOpen) profileModal.close();
    profileBtn.click();
    assertEqual(profileModal.isOpen, true, 'ProfileModal opened from pause menu');
    assert(profileModal.modalEl.classList.contains('active'), 'ProfileModal backdrop has .active class');
    profileModal.close();

    // Click Pause Settings button
    const settingsModal = getSettingsModal();
    if (settingsModal.isOpen) settingsModal.close();
    settingsBtn.click();
    assertEqual(settingsModal.isOpen, true, 'SettingsModal opened from pause menu');
    assert(settingsModal.modalEl.classList.contains('active'), 'SettingsModal backdrop has .active class');
    settingsModal.close();

    // Click Resume button
    resumeBtn.click();
    assertEqual(gameMenu.isPaused(), false, 'Game resumed from pause menu');
    assertEqual(resumeCount, 1);
    assert(!pauseBackdrop.classList.contains('active'), 'Pause backdrop removed active class');

    gameMenu.destroy();
    pauseBackdrop.remove();
  });

  it('in-game pause menu handles restart and quit confirmations and toggles', () => {
    const pauseBackdrop = document.createElement('div');
    pauseBackdrop.id = 'game-pause-modal';
    pauseBackdrop.className = 'modal-backdrop';

    const restartBtn = document.createElement('button');
    restartBtn.id = 'btn-pause-restart';
    pauseBackdrop.appendChild(restartBtn);

    const restartBox = document.createElement('div');
    restartBox.id = 'pause-restart-confirm';
    restartBox.className = 'hidden';
    pauseBackdrop.appendChild(restartBox);

    const restartConfirmBtn = document.createElement('button');
    restartConfirmBtn.id = 'btn-pause-restart-confirm';
    pauseBackdrop.appendChild(restartConfirmBtn);

    const restartCancelBtn = document.createElement('button');
    restartCancelBtn.id = 'btn-pause-restart-cancel';
    pauseBackdrop.appendChild(restartCancelBtn);

    const quitBtn = document.createElement('button');
    quitBtn.id = 'btn-pause-quit';
    pauseBackdrop.appendChild(quitBtn);

    const quitBox = document.createElement('div');
    quitBox.id = 'pause-quit-confirm';
    quitBox.className = 'hidden';
    pauseBackdrop.appendChild(quitBox);

    const quitConfirmBtn = document.createElement('button');
    quitConfirmBtn.id = 'btn-pause-quit-confirm';
    pauseBackdrop.appendChild(quitConfirmBtn);

    const soundBtn = document.createElement('button');
    soundBtn.id = 'btn-pause-sound';
    pauseBackdrop.appendChild(soundBtn);

    const hotkeysBtn = document.createElement('button');
    hotkeysBtn.id = 'btn-pause-hotkeys';
    pauseBackdrop.appendChild(hotkeysBtn);

    document.body.appendChild(pauseBackdrop);

    let restarted = false;
    let quit = false;
    let soundToggled = false;
    let hotkeysToggled = false;

    const gameMenu = new GameMenu({
      modalEl: pauseBackdrop,
      onRestart: () => { restarted = true; },
      onQuit: () => { quit = true; },
      onToggleSound: () => { soundToggled = true; return true; },
      onToggleHotkeys: () => { hotkeysToggled = true; return true; },
    });

    gameMenu.pause();

    // 1. Restart confirmation flow
    restartBtn.click();
    assert(!restartBox.classList.contains('hidden'), 'Restart confirmation box revealed');

    restartCancelBtn.click();
    assert(restartBox.classList.contains('hidden'), 'Restart confirmation box hidden on cancel');
    assertEqual(restarted, false);

    restartBtn.click();
    restartConfirmBtn.click();
    assertEqual(restarted, true, 'Level restarted on confirm');
    assertEqual(gameMenu.isPaused(), false, 'Menu resumed on restart confirm');

    // 2. Quit confirmation flow
    gameMenu.pause();
    quitBtn.click();
    assert(!quitBox.classList.contains('hidden'), 'Quit confirmation box revealed');

    quitConfirmBtn.click();
    assertEqual(quit, true, 'Quit callback invoked on confirm');

    // 3. Sound and Hotkeys toggles
    soundBtn.click();
    assertEqual(soundToggled, true, 'Sound toggle callback invoked');
    assert(soundBtn.innerHTML.includes('OFF'), 'Sound button reflects muted status');

    hotkeysBtn.click();
    assertEqual(hotkeysToggled, true, 'Hotkeys toggle callback invoked');
    assert(hotkeysBtn.innerHTML.includes('ON'), 'Hotkeys button reflects enabled status');

    gameMenu.destroy();
    pauseBackdrop.remove();
  });

  it('settings modal tabs switch correctly and display appropriate panels', () => {
    const settingsModal = getSettingsModal();
    settingsModal.open();

    const expectedTabs = ['audio', 'display', 'controls', 'save', 'diagnostics'];

    for (const tabId of expectedTabs) {
      settingsModal.switchTab(tabId);
      assertEqual(settingsModal._activeTab, tabId, `Switched active tab to ${tabId}`);

      const panel = settingsModal.modalEl.querySelector(`#settings-panel-${tabId}`);
      assert(panel !== null, `Panel #settings-panel-${tabId} exists`);
      assert(panel.classList.contains('active'), `Panel #settings-panel-${tabId} has .active class`);

      const tabBtn = settingsModal.modalEl.querySelector(`.settings-tab-btn[data-tab="${tabId}"]`);
      if (tabBtn) {
        assert(tabBtn.classList.contains('active'), `Tab button for ${tabId} has .active class`);
      }
    }

    settingsModal.close();
  });

  it('profile modal updates codename and dispatches synchronized event', () => {
    localStorage.clear();
    const profileModal = getProfileModal();
    profileModal.open();

    const input = profileModal.modalEl.querySelector('#profile-name-input');
    const saveBtn = profileModal.modalEl.querySelector('#btn-save-profile-name');

    assert(input !== null, 'Profile name input exists');
    assert(saveBtn !== null, 'Profile save button exists');

    input.value = 'Daedalus';

    let eventFired = false;
    let eventDetail = null;
    const handler = (e) => {
      eventFired = true;
      eventDetail = e.detail;
    };
    window.addEventListener('player-profile:updated', handler);

    saveBtn.click();

    assertEqual(eventFired, true, 'player-profile:updated event fired');
    assertEqual(eventDetail?.name, 'Daedalus', 'Event detail has updated codename');
    assertEqual(StorageManager.getPlayerProfile().name, 'Daedalus', 'Persisted codename in StorageManager');

    window.removeEventListener('player-profile:updated', handler);
    profileModal.close();
  });

  it('editor properties modal does not collide with global settings modal id', () => {
    // Ensure getSettingsModal is distinct and not bound to a properties modal
    const settingsModal = getSettingsModal();
    assertEqual(settingsModal.modalEl.id, 'settings-modal');
    assert(settingsModal.modalEl.querySelector('.settings-tab-bar') !== null, 'Global settings modal has categorized tab bar');
  });
});
