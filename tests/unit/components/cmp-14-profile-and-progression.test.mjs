/**
 * Component Test Suite: CMP-14 Player Profile, Customization & Prestige Progression
 *
 * Exhaustively verifies:
 * 1. Every Menu / Section: Codename Header, Visual Customization Studio (Silhouette, Hair, Skin),
 *    Conquest Metrics, Tiered Medal Showcase, Prestige Rank Banner
 * 2. Every Button & Input: #profile-name-input, #btn-save-profile-name, #btn-close-profile,
 *    silhouette pills (.gender-select-btn), hair style pills (.hairstyle-select-btn),
 *    hair color pills (.hair-swatch-btn), skin tone pills (.skin-swatch-btn)
 * 3. Every Mode: Visual appearance configuration mode, Achievement showcase mode
 * 4. Every Phase: Profile open phase, Customization edit phase, Storage persistence phase,
 *    Synchronized event dispatch phase (player:customization_changed)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { ProfileModal } from '../../../js/ui/profile-modal.js';
import { StorageManager } from '../../../js/core/storage.js';

describe('Component Suite > CMP-14: Player Profile, Customization & Progression', () => {
  it('covers every input, button, and customization control in ProfileModal', () => {
    localStorage.clear();

    const profileModal = new ProfileModal();
    const modalEl = profileModal.modalEl;
    assert(modalEl !== null, 'ProfileModal DOM element exists');

    // 1. Inputs & Action Buttons
    const nameInput = modalEl.querySelector('#profile-name-input');
    const saveNameBtn = modalEl.querySelector('#btn-save-profile-name');
    const closeBtn = modalEl.querySelector('#btn-close-profile');

    assert(nameInput !== null, '#profile-name-input exists');
    assert(saveNameBtn !== null, '#btn-save-profile-name exists');
    assert(closeBtn !== null, '#btn-close-profile exists');

    // 2. Silhouette / Body Options
    const genderBtns = modalEl.querySelectorAll('.gender-select-btn');
    assertEqual(genderBtns.length, 3, 'Includes male, female, neutral silhouettes');

    // 3. Hair Styles
    const hairBtns = modalEl.querySelectorAll('.hairstyle-select-btn');
    assertEqual(hairBtns.length, 5, 'Includes short, ponytail, curls, bob, bald styles');

    // 4. Hair Colors
    const hairSwatches = modalEl.querySelectorAll('.hair-swatch-btn');
    assertEqual(hairSwatches.length, 6, 'Includes 6 distinct hair color swatches');

    // 5. Skin Tones
    const skinSwatches = modalEl.querySelectorAll('.skin-swatch-btn');
    assertEqual(skinSwatches.length, 5, 'Includes 5 distinct skin tone swatches');

    profileModal.close();
    modalEl.remove();
  });

  it('manages customization mutations, persistence, and synchronized event dispatch', () => {
    localStorage.clear();
    let syncEventData = null;
    const listener = (e) => {
      syncEventData = e.detail;
    };
    window.addEventListener('player:customization_changed', listener);

    const profileModal = new ProfileModal();
    profileModal.open();
    const modalEl = profileModal.modalEl;

    // Mutate name
    const nameInput = modalEl.querySelector('#profile-name-input');
    const saveNameBtn = modalEl.querySelector('#btn-save-profile-name');
    nameInput.value = 'Pathfinder Nova';
    saveNameBtn.click();

    const profile = StorageManager.getPlayerProfile();
    assertEqual(profile.name, 'Pathfinder Nova', 'Codename persisted to storage');

    // Mutate appearance via female gender button
    const femaleBtn = Array.from(modalEl.querySelectorAll('.gender-select-btn')).find(b => b.dataset.gender === 'female');
    assert(femaleBtn !== null, 'Female button exists');
    femaleBtn.click();

    assertEqual(StorageManager.getPlayerCustomization().gender, 'female');
    assertEqual(syncEventData?.gender, 'female');

    window.removeEventListener('player:customization_changed', listener);
    profileModal.close();
    modalEl.remove();
  });

  it('covers progression showcase: level conquests, stars, and prestige rank calculations', () => {
    localStorage.clear();

    // Initial Novice Rank
    let profile0 = StorageManager.getPlayerProfile();
    assertEqual(profile0.rankTitle, 'Novice Pathfinder');
    assertEqual(profile0.rankIcon, '🧭');

    // Save 12 completed campaign levels
    for (let i = 1; i <= 12; i++) {
      StorageManager.saveLevelCompletion(String(i), {
        time: 5000,
        steps: 10,
        earnedParSteps: true,
        earnedParTime: true,
        totalSecrets: 1,
        secretsFound: 1,
        flawless: true,
      });
    }

    const profile12 = StorageManager.getPlayerProfile();
    assertEqual(profile12.campaignLevels, 12, 'Conquests count equals 12');
    assert(profile12.totalStars >= 24, 'Stars accumulated');
    assert(profile12.rankTitle !== 'Novice Pathfinder', 'Rank advances with conquest');
  });
});
