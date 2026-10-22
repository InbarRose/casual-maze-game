/**
 * Unit Tests: The Architect's Codex & Collectible Folio System (BL-176, ADR-0050)
 */

import { describe, it, beforeEach, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { resetStorageMocks } from '../../harness/mocks.mjs';
import { StorageManager } from '../../../js/core/storage.js';
import { Signpost } from '../../../js/entities/signpost.js';
import { WallDecor } from '../../../js/entities/wall-decor.js';
import { ArchitectCodexModal } from '../../../js/ui/architect-codex-modal.js';
import { globalEvents } from '../../../js/core/events.js';

function createMockCanvas(width = 400, height = 400) {
  return {
    width,
    height,
    getContext: () => ({
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 10 }),
      clearRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      roundRect: () => {},
      quadraticCurveTo: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      setLineDash: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      drawImage: () => {},
    }),
  };
}

describe('UI & Core > The Architect\'s Codex & Collectible Folios (BL-176, ADR-0050)', () => {
  beforeEach(() => {
    resetStorageMocks();
  });

  it('StorageManager correctly saves, retrieves, and checks Architect Folios with coordinates', () => {
    assertEqual(StorageManager.hasArchitectFolio('folio_1'), false, 'Folio initially not discovered');

    const folioData = {
      id: 'folio_1',
      title: "Architect's Field Journal #1",
      author: 'The Architect',
      text: 'Every grand labyrinth begins with a single step.',
      style: 'lectern_stone',
      x: 1,
      y: 2,
      z: 0,
      coordString: '(1, 2, 0)',
      levelId: '1',
      levelTitle: 'First Footsteps',
      chapter: 'chapter_1',
      zone: 'zone_1',
    };

    const saved = StorageManager.saveArchitectFolio(folioData);
    assertEqual(saved, true, 'saveArchitectFolio returns true');
    assertEqual(StorageManager.hasArchitectFolio('folio_1'), true, 'hasArchitectFolio returns true after saving');

    const codex = StorageManager.loadArchitectCodex();
    assert(codex['folio_1'] !== undefined, 'Folio exists in codex map');
    assertEqual(codex['folio_1'].coordString, '(1, 2, 0)', 'Discovered coordinates are accurately preserved');
    assertEqual(codex['folio_1'].levelTitle, 'First Footsteps', 'Level title is preserved');
  });

  it('computes accurate chapter breakdown and archivist achievements in getCodexStats', () => {
    // Save 4 folios in Chapter 1 to unlock Chapter 1 Archivist
    for (let i = 1; i <= 4; i++) {
      StorageManager.saveArchitectFolio({
        id: `folio_ch1_${i}`,
        title: `Journal #${i}`,
        chapter: 'chapter_1',
        levelId: String(i),
        x: i,
        y: i,
      });
    }

    const stats = StorageManager.getCodexStats();
    assertEqual(stats.totalCollected, 4, 'Total collected is 4');
    assertEqual(stats.byChapter['chapter_1'], 4, 'Chapter 1 has 4 collected folios');

    const ch1Achievement = stats.achievements.find(a => a.id === 'ch1_archivist');
    assert(ch1Achievement !== undefined, 'Found Chapter 1 archivist achievement');
    assertEqual(ch1Achievement.unlocked, true, 'Chapter 1 Archivist is unlocked after 4 folios');
    assertEqual(ch1Achievement.current, 4, 'Progress is 4');

    const ch2Achievement = stats.achievements.find(a => a.id === 'ch2_archivist');
    assertEqual(ch2Achievement.unlocked, false, 'Chapter 2 Archivist is locked');
  });

  it('includes Architect Codex in full save profile backup and restoration', () => {
    StorageManager.saveArchitectFolio({
      id: 'test_backup_folio',
      title: 'Ancient Folio',
      x: 5,
      y: 8,
      coordString: '(5, 8, 0)',
    });

    const backup = StorageManager.exportSaveProfile();
    assert(backup.architectCodex !== undefined, 'Save profile contains architectCodex');
    assert(backup.architectCodex['test_backup_folio'] !== undefined, 'Folio preserved in backup payload');

    // Reset storage
    StorageManager.resetAllProgress();
    assertEqual(StorageManager.hasArchitectFolio('test_backup_folio'), false, 'Codex is empty after reset');

    // Restore from backup
    StorageManager.importSaveProfile(backup);
    assertEqual(StorageManager.hasArchitectFolio('test_backup_folio'), true, 'Folio restored from backup');
  });

  it('Signpost entity supports lectern styles, coordinate reporting, and pick-up collection', () => {
    const lectern = new Signpost({
      id: 'sign_test_lectern',
      style: 'lectern_stone',
      title: "The Architect's Secret",
      text: 'Look behind the waterfall.',
      x: 3,
      y: 4,
      elevation: 0,
    });

    assertEqual(lectern.style, 'lectern_stone', 'Style initialized as lectern_stone');
    assertEqual(lectern.collected, false, 'Initially uncollected');
    assertEqual(lectern.getCoordString(), '(3, 4, 0)', 'getCoordString returns canonical coordinates');

    // Collect / read
    const payload = lectern.readSign();
    assertEqual(lectern.collected, true, 'Marked as collected after readSign()');
    assertEqual(payload.coordString, '(3, 4, 0)', 'Payload includes coordinates');
    assertEqual(payload.title, "The Architect's Secret", 'Payload includes title');

    // Verify canvas rendering runs without errors
    const canvas = createMockCanvas();
    const ctx = canvas.getContext();
    lectern.render(ctx, 100, 100, 32, 'angled');
    lectern.render(ctx, 100, 100, 32, 'topdown');
  });

  it('WallDecor entity renders runic plates and wall carvings cleanly', () => {
    const plate = new WallDecor({
      id: 'plate_test',
      decorType: 'runic_plate',
      title: 'Ancient Inscription',
      text: 'The third gate demands sapphire.',
      x: 5,
      y: 6,
    });

    assertEqual(plate.decorType, 'runic_plate', 'DecorType is runic_plate');
    const inspected = plate.inspect();
    assertEqual(inspected.title, 'Ancient Inscription', 'Title inspected');

    const canvas = createMockCanvas();
    const ctx = canvas.getContext();
    plate.render(ctx, 50, 50, 32, 'angled');
    plate.render(ctx, 50, 50, 32, 'topdown');
  });

  it('ArchitectCodexModal opens, toggles, renders tabs, and closes on Escape', () => {
    const modal = new ArchitectCodexModal();
    assertEqual(modal.isOpen, false, 'Modal initially closed');

    modal.open();
    assertEqual(modal.isOpen, true, 'Modal is open');
    assert(modal.modalEl.style.display !== 'none', 'Modal display is visible');

    // Simulate Escape key
    modal._handleKeyDown({ key: 'Escape', preventDefault: () => {} });
    assertEqual(modal.isOpen, false, 'Modal closed on Escape key');

    // Toggle
    modal.toggle();
    assertEqual(modal.isOpen, true, 'Modal toggled open');
    modal.toggle();
    assertEqual(modal.isOpen, false, 'Modal toggled closed');
  });
});
