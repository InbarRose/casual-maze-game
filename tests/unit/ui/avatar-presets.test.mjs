/**
 * Unit Tests: 8 Preset Avatar Archetypes & Color Palette Customization (BL-118, Issue #84)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { CHARACTER_CUSTOMIZATION } from '../../../js/core/constants.js';
import { StorageManager } from '../../../js/core/storage.js';
import { Player } from '../../../js/entities/player.js';
import { ProfileModal } from '../../../js/ui/profile-modal.js';

describe('UI > 8 Preset Avatar Archetypes & Palette Customization (Issue #84, BL-118)', () => {
  it('defines 8 distinct visual avatar archetypes in CHARACTER_CUSTOMIZATION', () => {
    const expected = ['adventurer', 'fighter', 'wizard', 'rogue', 'cleric', 'ranger', 'paladin', 'bard'];
    const definedKeys = Object.values(CHARACTER_CUSTOMIZATION.ARCHETYPES);

    assertEqual(definedKeys.length, 8, '8 avatar archetypes defined');
    expected.forEach((key) => {
      assert(definedKeys.includes(key), `Archetype ${key} is present`);
      const meta = CHARACTER_CUSTOMIZATION.ARCHETYPE_META[key];
      assert(meta !== undefined, `Metadata exists for archetype ${key}`);
      assert(Boolean(meta.icon), `Archetype ${key} has icon`);
      assert(Boolean(meta.name), `Archetype ${key} has name`);
      assert(Boolean(meta.title), `Archetype ${key} has title`);
      assert(Boolean(meta.defaultPrimary), `Archetype ${key} has default primary color`);
      assert(Boolean(meta.defaultSecondary), `Archetype ${key} has default secondary color`);
    });
  });

  it('provides curated primary/secondary color swatches', () => {
    const swatches = Object.values(CHARACTER_CUSTOMIZATION.PALETTE_COLORS);
    assert(swatches.length >= 8, 'At least 8 curated palette swatches defined');
    swatches.forEach(swatch => {
      assert(Boolean(swatch.id), 'Swatch has id');
      assert(Boolean(swatch.color), 'Swatch has hex color');
      assert(swatch.color.startsWith('#'), 'Swatch color is valid hex');
    });
  });

  it('persists and retrieves archetype and color customization via StorageManager', () => {
    localStorage.clear();

    const initial = StorageManager.getPlayerCustomization();
    assertEqual(initial.archetype, 'adventurer', 'Defaults to adventurer archetype');
    assert(Boolean(initial.primaryColor), 'Has default primary color');
    assert(Boolean(initial.secondaryColor), 'Has default secondary color');

    // Mutate to Wizard with Cobalt and Violet
    StorageManager.setPlayerCustomization({
      archetype: 'wizard',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
    });

    const updated = StorageManager.getPlayerCustomization();
    assertEqual(updated.archetype, 'wizard');
    assertEqual(updated.primaryColor, '#3b82f6');
    assertEqual(updated.secondaryColor, '#8b5cf6');
    // Legacy fields preserved
    assertEqual(updated.gender, 'male');
  });

  it('renders all 8 archetypes across all 4 facings without canvas errors', () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      fillRect: () => {},
      clearRect: () => {},
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
    };

    const archetypes = ['adventurer', 'fighter', 'wizard', 'rogue', 'cleric', 'ranger', 'paladin', 'bard'];
    const facings = ['south', 'north', 'east', 'west'];

    archetypes.forEach(archetype => {
      const custom = {
        archetype,
        primaryColor: '#2563eb',
        secondaryColor: '#dc2626',
        gender: 'male',
        hairStyle: 'short',
        hairColor: 'brunette',
        skinTone: 'fair',
      };

      const player = new Player(0, 0, 0, 32, [], 'classic', custom);

      facings.forEach(facing => {
        player.facing = facing;
        // 2.5D rendering
        player.drawExplorerSprite(mockCtx, 50, 50, 32, 0);
        player.renderAngledExplorer(mockCtx, 50, 50, 32, 0);
        // Top-down rendering
        player.renderTopDownExplorer(mockCtx, 50, 50, 32, 0);
      });
    });
  });

  it('renders 8 archetype buttons and color swatches in ProfileModal', () => {
    localStorage.clear();

    const profileModal = new ProfileModal();
    const modalEl = profileModal.modalEl;
    assert(modalEl !== null, 'ProfileModal element created');

    const archetypeBtns = modalEl.querySelectorAll('.archetype-select-btn');
    assertEqual(archetypeBtns.length, 8, '8 archetype buttons rendered in ProfileModal');

    const primarySwatches = modalEl.querySelectorAll('.primary-swatch-btn');
    assert(primarySwatches.length >= 8, 'At least 8 primary color swatches rendered');

    const secondarySwatches = modalEl.querySelectorAll('.secondary-swatch-btn');
    assert(secondarySwatches.length >= 8, 'At least 8 secondary color swatches rendered');

    // Click on wizard archetype button
    const wizardBtn = Array.from(archetypeBtns).find(btn => btn.dataset.archetype === 'wizard');
    assert(wizardBtn !== undefined, 'Wizard archetype button found');
    wizardBtn.click();

    const saved = StorageManager.getPlayerCustomization();
    assertEqual(saved.archetype, 'wizard', 'Wizard archetype persisted on button click');

    profileModal.close();
    modalEl.remove();
  });
});
