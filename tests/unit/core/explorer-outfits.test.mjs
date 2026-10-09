/**
 * Unit Tests: Explorer Outfits, Wardrobe Customization & Palette Rendering (BL-78, CMP-11, CMP-14)
 */

import { describe, it, beforeEach, assert, assertEqual, setupMocks, createMockCanvas } from '../../harness/index.mjs';
import { EXPLORER_OUTFITS } from '../../../js/core/constants.js';
import { StorageManager } from '../../../js/core/storage.js';
import { Player } from '../../../js/entities/player.js';
import { ProfileModal } from '../../../js/ui/profile-modal.js';

describe('Core > Explorer Avatar Outfits & Wardrobe Customization (BL-78, CMP-11, CMP-14)', () => {
  beforeEach(() => {
    setupMocks();
    const existing = document.getElementById('profile-modal');
    if (existing) existing.remove();
  });

  it('defines valid colorway schemas for all official explorer outfits', () => {
    const requiredKeys = [
      'id', 'name', 'icon', 'desc', 'shirt', 'shirtDark', 'shirtCheck',
      'pants', 'pantsDark', 'boots', 'pack', 'packDark', 'packFlap',
      'bedroll', 'skin', 'hair', 'cap',
    ];

    const outfitKeys = Object.keys(EXPLORER_OUTFITS);
    assert(outfitKeys.length >= 6, 'Should define at least 6 official outfits');
    assert(outfitKeys.includes('classic'), 'Must include classic pathfinder outfit');
    assert(outfitKeys.includes('emerald'), 'Must include emerald ranger outfit');
    assert(outfitKeys.includes('arctic'), 'Must include frost nomad outfit');
    assert(outfitKeys.includes('desert'), 'Must include desert scout outfit');
    assert(outfitKeys.includes('obsidian'), 'Must include obsidian rogue outfit');
    assert(outfitKeys.includes('alchemist'), 'Must include arcane scholar outfit');

    const hexRegex = /^#[0-9a-fA-F]{6}$/;

    for (const [key, outfit] of Object.entries(EXPLORER_OUTFITS)) {
      assertEqual(outfit.id, key, `Outfit id should match catalog key "${key}"`);
      for (const prop of requiredKeys) {
        assert(outfit[prop] !== undefined, `Outfit "${key}" missing property "${prop}"`);
      }
      assert(hexRegex.test(outfit.shirt), `Shirt color in "${key}" must be 6-digit hex`);
      assert(hexRegex.test(outfit.pants), `Pants color in "${key}" must be 6-digit hex`);
      assert(hexRegex.test(outfit.pack), `Pack color in "${key}" must be 6-digit hex`);
    }
  });

  it('persists and retrieves player outfit in StorageManager', () => {
    // Default should be classic
    assertEqual(StorageManager.getPlayerOutfit(), 'classic');

    // Setting emerald
    const ok = StorageManager.setPlayerOutfit('emerald');
    assert(ok, 'setPlayerOutfit should return truthy on success');
    assertEqual(StorageManager.getPlayerOutfit(), 'emerald');

    // Setting invalid should fallback to classic
    StorageManager.setPlayerOutfit('invalid_outfit_foo');
    assertEqual(StorageManager.getPlayerOutfit(), 'classic');

    // Included in profile
    const profile = StorageManager.getPlayerProfile();
    assertEqual(profile.outfit, 'classic');

    StorageManager.setPlayerOutfit('arctic');
    const profile2 = StorageManager.getPlayerProfile();
    assertEqual(profile2.outfit, 'arctic');
  });

  it('initializes Player entity with saved outfit and supports live setOutfit()', () => {
    StorageManager.setPlayerOutfit('obsidian');

    const player = new Player(2, 3, 0, 32);
    assertEqual(player.outfitId, 'obsidian');
    assertEqual(player.palette.name, 'Obsidian Rogue');
    assertEqual(player.palette.shirt, '#475569');

    // Live update via setOutfit
    player.setOutfit('alchemist');
    assertEqual(player.outfitId, 'alchemist');
    assertEqual(player.palette.name, 'Arcane Scholar');
    assertEqual(player.palette.shirt, '#9333ea');

    player.destroy();
  });

  it('renders all 6 outfits without errors in both angled and topdown perspectives', () => {
    const canvas = createMockCanvas(400, 400);
    const ctx = canvas.getContext('2d');

    const player = new Player(5, 5, 0, 32);

    for (const outfitId of Object.keys(EXPLORER_OUTFITS)) {
      player.setOutfit(outfitId);

      // Angled perspective
      let threwAngled = false;
      try {
        player.render(ctx, 160, 160, 32, 'angled', 0);
      } catch {
        threwAngled = true;
      }
      assert(!threwAngled, `renderAngledExplorer threw for outfit "${outfitId}"`);

      // Top-down perspective
      let threwTopdown = false;
      try {
        player.render(ctx, 160, 160, 32, 'topdown', 0);
      } catch {
        threwTopdown = true;
      }
      assert(!threwTopdown, `renderTopDownExplorer threw for outfit "${outfitId}"`);
    }

    player.destroy();
  });

  it('manages ProfileModal wardrobe selection and dispatches live update event', () => {
    StorageManager.setPlayerOutfit('classic');

    let eventDetail = null;
    const listener = (e) => {
      eventDetail = e.detail;
    };
    window.addEventListener('player:outfit_changed', listener);

    const modal = new ProfileModal();
    modal.open();

    const badge = modal.modalEl.querySelector('#profile-outfit-badge');
    assert(badge !== null, 'Should render #profile-outfit-badge');
    assertEqual(badge.textContent, 'Classic Pathfinder');

    const outfitBtns = modal.modalEl.querySelectorAll('.outfit-select-btn');
    assertEqual(outfitBtns.length, Object.keys(EXPLORER_OUTFITS).length);

    // Find and click the Emerald Ranger button
    const emeraldBtn = Array.from(outfitBtns).find(btn => btn.dataset.outfitId === 'emerald');
    assert(emeraldBtn !== null, 'Emerald outfit button should exist');

    emeraldBtn.click();

    assertEqual(StorageManager.getPlayerOutfit(), 'emerald');
    assert(eventDetail !== null, 'Should dispatch player:outfit_changed event');
    assertEqual(eventDetail.outfitId, 'emerald');

    window.removeEventListener('player:outfit_changed', listener);
    modal.close();
  });
});
