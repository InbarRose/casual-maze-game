/**
 * Unit Tests: Level Lore Journal, Activity Feed & Unobtrusive Examination UX (BL-81)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { globalEvents } from '../../../js/core/events.js';
import { StorageManager } from '../../../js/core/storage.js';
import { ENTITY_TYPES } from '../../../js/core/constants.js';

function createMockCanvas(width = 800, height = 600) {
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
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      roundRect: () => {},
      setLineDash: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      drawImage: () => {},
    }),
  };
}

describe('UI > Level Lore Journal & Unobtrusive Note UX (BL-81)', () => {
  const sampleLevel = {
    id: 'test_journal_1',
    title: 'Journal Testing Grounds',
    dimensions: { width: 7, height: 7 },
    spawn: { x: 1, y: 1, elevation: 0 },
    exit: { x: 5, y: 5, elevation: 0 },
    layers: {
      ground: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1],
      ],
    },
    entities: [
      {
        type: ENTITY_TYPES.SIGNPOST,
        x: 2,
        y: 1,
        elevation: 0,
        title: "Architect's Field Journal",
        author: 'Chief Architect Daedalus',
        text: 'The western corridors conceal ancient mechanisms.',
      },
      {
        type: ENTITY_TYPES.WALL_DECOR,
        x: 1,
        y: 2,
        elevation: 0,
        decorType: 'fresco',
        title: 'Fresco of the Sun',
        author: 'Ancient Artisans',
        text: 'Depicts an eternal twilight over stone pillars.',
      },
    ],
  };

  it('does not auto-read signpost upon arrival and provides single interaction candidate', () => {
    const mainCanvas = createMockCanvas();
    const minimapCanvas = createMockCanvas(150, 150);

    let readFired = false;
    let steppedFired = false;
    const unsubRead = globalEvents.on('signpost:read', () => { readFired = true; });
    const unsubStepped = globalEvents.on('signpost:stepped', () => { steppedFired = true; });

    const loop = new GameLoop(sampleLevel, mainCanvas, minimapCanvas);

    // Explorer moves onto the signpost at (2, 1)
    loop.player.gridX = 2;
    loop.player.gridY = 1;
    loop.player.worldX = 2 * 32 + 16;
    loop.player.worldY = 1 * 32 + 16;
    loop.handleCellArrival();

    // Verify stepping did NOT fire auto-read
    assertEqual(readFired, false, 'Stepping onto signpost did not auto-read or blast modals');
    assertEqual(steppedFired, true, 'signpost:stepped event was cleanly emitted');

    // Verify single interaction candidate is available
    const interaction = loop.getAvailableInteraction();
    assert(interaction !== null, 'Single interaction candidate is available');
    assertEqual(interaction.type, 'signpost');
    assertEqual(interaction.keyHint, 'E');
    assert(interaction.label.includes("Architect's Field Journal"), 'Interaction prompt describes the note title');

    unsubRead();
    unsubStepped();
  });

  it('records notes to level journal upon manual interaction [E]', () => {
    const mainCanvas = createMockCanvas();
    const minimapCanvas = createMockCanvas(150, 150);

    let readData = null;
    const unsub = globalEvents.on('signpost:read', (data) => { readData = data; });

    const loop = new GameLoop(sampleLevel, mainCanvas, minimapCanvas);
    assertEqual(loop.getJournalEntries().length, 0, 'Journal starts empty');

    // Arrive at signpost cell (2, 1)
    loop.player.gridX = 2;
    loop.player.gridY = 1;
    loop.handleCellArrival();

    // Trigger manual interaction [E]
    loop.handleManualInteract();

    assert(readData !== null, 'signpost:read was emitted upon manual examination');
    assertEqual(readData.title, "Architect's Field Journal");

    // Verify Journal recorded the entry
    const entries = loop.getJournalEntries();
    assertEqual(entries.length, 1, 'Journal recorded 1 note');
    assertEqual(entries[0].title, "Architect's Field Journal");
    assertEqual(entries[0].author, 'Chief Architect Daedalus');
    assert(entries[0].text.includes('western corridors'), 'Journal saved full note text');

    // Triggering interact again should deduplicate in Journal
    loop.handleManualInteract();
    assertEqual(loop.getJournalEntries().length, 1, 'Journal does not duplicate identical notes');

    unsub();
  });

  it('records wall decor / murals into level journal upon manual interaction', () => {
    const mainCanvas = createMockCanvas();
    const minimapCanvas = createMockCanvas(150, 150);

    let decorData = null;
    const unsub = globalEvents.on('wall_decor:inspected', (data) => { decorData = data; });

    const loop = new GameLoop(sampleLevel, mainCanvas, minimapCanvas);

    // Stand adjacent to wall decor at (1, 2)
    loop.player.gridX = 1;
    loop.player.gridY = 3;
    loop.player.facing = 'north'; // Facing (1, 2)
    loop.handleManualInteract();

    assert(decorData !== null, 'wall_decor:inspected was dispatched');
    assertEqual(decorData.title, 'Fresco of the Sun');

    const entries = loop.getJournalEntries();
    assertEqual(entries.length, 1, 'Journal recorded wall decor');
    assertEqual(entries[0].decorType, 'fresco');
    assertEqual(entries[0].author, 'Ancient Artisans');

    unsub();
  });

  it('resets level journal when restartLevel is called', () => {
    const mainCanvas = createMockCanvas();
    const minimapCanvas = createMockCanvas(150, 150);

    const loop = new GameLoop(sampleLevel, mainCanvas, minimapCanvas);
    loop.recordJournalEntry({
      title: 'Scattered Parchment',
      author: 'Lost Cartographer',
      text: 'Water flows south.',
    });
    assertEqual(loop.getJournalEntries().length, 1, 'Journal holds entry');

    loop.restartLevel();
    assertEqual(loop.getJournalEntries().length, 0, 'restartLevel reset journal');
  });

  it('supports note presentation mode setting in StorageManager', () => {
    // Default should fall back to modal
    StorageManager.setSetting('note_display_mode', 'modal');
    assertEqual(StorageManager.getSetting('note_display_mode'), 'modal');

    // Can be switched to feed_only
    StorageManager.setSetting('note_display_mode', 'feed_only');
    assertEqual(StorageManager.getSetting('note_display_mode'), 'feed_only');

    // Cleanup
    StorageManager.setSetting('note_display_mode', 'modal');
  });
});
