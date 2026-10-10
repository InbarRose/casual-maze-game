/**
 * Character Visual Customization & Profile Modal Tests (BL-95, ADR-0014)
 */

import { describe, it, beforeEach, assert, assertEqual, setupMocks } from '../../harness/index.mjs';
import { CHARACTER_CUSTOMIZATION, EXPLORER_OUTFITS } from '../../../js/core/constants.js';
import { StorageManager } from '../../../js/core/storage.js';
import { Player } from '../../../js/entities/player.js';
import { ProfileModal } from '../../../js/ui/profile-modal.js';

describe('Player Character Visual Customization (BL-95)', () => {
  beforeEach(() => {
    setupMocks();
    const existing = document.getElementById('profile-modal');
    if (existing) existing.remove();
  });
  it('defines comprehensive gender, hair style, hair color, and skin tone constants', () => {
    assert(CHARACTER_CUSTOMIZATION !== null, 'CHARACTER_CUSTOMIZATION should exist');
    assertEqual(CHARACTER_CUSTOMIZATION.GENDER.MALE, 'male');
    assertEqual(CHARACTER_CUSTOMIZATION.GENDER.FEMALE, 'female');
    assertEqual(CHARACTER_CUSTOMIZATION.GENDER.NEUTRAL, 'neutral');

    assert(CHARACTER_CUSTOMIZATION.HAIR_STYLES.SHORT !== undefined, 'Should have short hair');
    assert(CHARACTER_CUSTOMIZATION.HAIR_STYLES.PONYTAIL !== undefined, 'Should have ponytail');
    assert(CHARACTER_CUSTOMIZATION.HAIR_STYLES.CURLS !== undefined, 'Should have curls');
    assert(CHARACTER_CUSTOMIZATION.HAIR_STYLES.BOB !== undefined, 'Should have bob');
    assert(CHARACTER_CUSTOMIZATION.HAIR_STYLES.BALD !== undefined, 'Should have bald');

    assert(CHARACTER_CUSTOMIZATION.HAIR_COLORS.brunette !== undefined, 'Should have brunette');
    assert(CHARACTER_CUSTOMIZATION.HAIR_COLORS.blonde !== undefined, 'Should have blonde');
    assert(CHARACTER_CUSTOMIZATION.SKIN_TONES.fair !== undefined, 'Should have fair skin');
    assert(CHARACTER_CUSTOMIZATION.SKIN_TONES.deep !== undefined, 'Should have deep skin');
  });

  it('manages StorageManager player customization getters, defaults, and persistence', () => {
    const defaults = StorageManager.getPlayerCustomization();
    assertEqual(defaults.gender, 'male');
    assertEqual(defaults.hairStyle, 'short');
    assertEqual(defaults.hairColor, 'brunette');
    assertEqual(defaults.skinTone, 'fair');

    StorageManager.setPlayerCustomization({
      gender: 'female',
      hairStyle: 'ponytail',
      hairColor: 'blonde',
      skinTone: 'warm',
    });

    const updated = StorageManager.getPlayerCustomization();
    assertEqual(updated.gender, 'female');
    assertEqual(updated.hairStyle, 'ponytail');
    assertEqual(updated.hairColor, 'blonde');
    assertEqual(updated.skinTone, 'warm');

    const profile = StorageManager.getPlayerProfile();
    assertEqual(profile.customization.gender, 'female');
    assertEqual(profile.customization.hairStyle, 'ponytail');
  });

  it('initializes Player entity with customized appearance and responds to live customization events', () => {
    const player = new Player(2, 3, 0, 36, [], 'emerald', {
      gender: 'female',
      hairStyle: 'ponytail',
      hairColor: 'auburn',
      skinTone: 'olive',
    });

    assertEqual(player.customization.gender, 'female');
    assertEqual(player.customization.hairStyle, 'ponytail');
    assertEqual(player.customization.hairColor, 'auburn');
    assertEqual(player.customization.skinTone, 'olive');

    // Dispatch live event
    window.dispatchEvent(new CustomEvent('player:customization_changed', {
      detail: { hairStyle: 'curls', hairColor: 'silver' },
    }));

    assertEqual(player.customization.hairStyle, 'curls');
    assertEqual(player.customization.hairColor, 'silver');
    assertEqual(player.customization.gender, 'female'); // preserved

    player.destroy();
  });

  it('renders customized appearance controls and triggers in ProfileModal', () => {
    StorageManager.setPlayerCustomization({
      gender: 'male',
      hairStyle: 'short',
      hairColor: 'brunette',
      skinTone: 'fair',
    });

    let lastDispatched = null;
    const listener = (e) => {
      lastDispatched = e.detail;
    };
    window.addEventListener('player:customization_changed', listener);

    const existing = document.getElementById('profile-modal');
    if (existing) existing.remove();

    const modal = new ProfileModal();
    modal.open();

    const badge = modal.modalEl.querySelector('#profile-customization-badge');
    assert(badge !== null, 'Should have #profile-customization-badge');
    assert(badge.textContent.includes('Male Explorer'), 'Badge reflects male');

    const genderBtns = modal.modalEl.querySelectorAll('.gender-select-btn');
    assertEqual(genderBtns.length, 3, 'Should render 3 gender options');

    const hairBtns = modal.modalEl.querySelectorAll('.hairstyle-select-btn');
    assertEqual(hairBtns.length, 5, 'Should render 5 hair style options');

    const hairSwatches = modal.modalEl.querySelectorAll('.hair-swatch-btn');
    assertEqual(hairSwatches.length, 6, 'Should render 6 hair color swatches');

    const skinSwatches = modal.modalEl.querySelectorAll('.skin-swatch-btn');
    assertEqual(skinSwatches.length, 5, 'Should render 5 skin tone swatches');

    // Click Female button
    const femaleBtn = Array.from(genderBtns).find(b => b.dataset.gender === 'female');
    assert(femaleBtn !== null, 'Female button found');
    femaleBtn.click();

    assertEqual(StorageManager.getPlayerCustomization().gender, 'female');
    assertEqual(lastDispatched?.gender, 'female');

    window.removeEventListener('player:customization_changed', listener);
    modal.close();
  });
});
