/**
 * Unit Test: Inventory Journal Architecture, Note Despawning & Visual Noise Reduction (BL-188, BL-189, ADR-0063, ADR-0064)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Signpost } from '../../../js/entities/signpost.js';
import { Player } from '../../../js/entities/player.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { BiomeSurfaceShaders } from '../../../js/engine/biome-surface-shaders.js';
import { GameRenderer } from '../../../js/engine/renderer.js';
import { ENTITY_TYPES, ELEVATION } from '../../../js/core/constants.js';

function createMockCanvas() {
  return {
    width: 800,
    height: 600,
    getContext: () => ({
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      rect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      stroke: () => {},
      fill: () => {},
      clearRect: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      drawImage: () => {},
      measureText: () => ({ width: 40 }),
      fillText: () => {},
      setLineDash: () => {},
      translate: () => {},
      rotate: () => {},
    }),
  };
}

describe('Inventory Journal Architecture & Note Despawning (BL-188, ADR-0063)', () => {
  it('Signpost entity reflects collected / despawn state properly', () => {
    const sign = new Signpost({
      id: 'test_note_1',
      x: 3,
      y: 4,
      z: 0,
      title: 'Architect Journal I',
      text: 'Follow the river of stones.',
    });

    assertEqual(sign.isCollected, false);
    assertEqual(sign.collected, false);
    assertEqual(sign.canInteract(3, 3, 0), true);

    const payload = sign.readSign();
    assertEqual(payload.id, 'test_note_1');
    assertEqual(payload.collected, true);
    assertEqual(payload.isCollected, true);
    assertEqual(sign.isCollected, true);
    assertEqual(sign.collected, true);

    // Once collected, canInteract must return false
    assertEqual(sign.canInteract(3, 3, 0), false);

    // Render should return early without executing draw operations
    let drawCalls = 0;
    const mockCtx = {
      save: () => { drawCalls++; },
      restore: () => { drawCalls++; },
      beginPath: () => { drawCalls++; },
      fill: () => { drawCalls++; },
    };
    sign.render(mockCtx, 100, 100, 32);
    assertEqual(drawCalls, 0, 'Collected signpost must not render on canvas');
  });

  it('Player entity tracks journalFolios, collectedFolioIds, and preserves inventory array backward compatibility', () => {
    const player = new Player(1, 1, 0, 32, ['key_alpha', 'key_beta']);

    // Backward compatibility: inventory is standard array
    assert(Array.isArray(player.inventory), 'player.inventory is array');
    assertEqual(player.inventory.length, 2);
    assert(player.hasKey('key_alpha'), 'hasKey works');
    assert(player.inventory.includes('key_beta'), 'inventory.includes works');

    // Journal folios
    assert(Array.isArray(player.journalFolios), 'journalFolios is array');
    assertEqual(player.getJournalFolios().length, 0);
    assertEqual(player.hasFolio('folio_1'), false);

    const added = player.addFolio({
      id: 'folio_1',
      title: 'First Folio',
      text: 'The labyrinth awakens.',
      x: 5,
      y: 6,
      z: 0,
    });
    assertEqual(added, true);
    assertEqual(player.getJournalFolios().length, 1);
    assertEqual(player.hasFolio('folio_1'), true);

    // Duplicate folio addition is safely ignored
    const addedAgain = player.addFolio({
      id: 'folio_1',
      title: 'Duplicate Folio',
    });
    assertEqual(addedAgain, false);
    assertEqual(player.getJournalFolios().length, 1);
  });

  it('GameLoop despawns collected signposts from runtime entities and adds to player journal', () => {
    const testLevel = {
      id: 'level_test_note',
      title: 'Note Test Labyrinth',
      chapter: 'prologue',
      zone: 'sanctuary',
      dimensions: { width: 10, height: 10 },
      spawn: { x: 1, y: 1, z: 0 },
      grid: Array(10).fill(null).map(() => Array(10).fill(1)),
      entities: [
        {
          id: 'note_chamber_1',
          type: ENTITY_TYPES.SIGNPOST,
          x: 2,
          y: 1,
          z: 0,
          title: 'Chamber I Inscription',
          text: 'Behold the threshold.',
        },
        {
          id: 'key_active_1',
          type: 'key',
          x: 4,
          y: 1,
          z: 0,
          name: 'Golden Key',
          color: '#fbbf24',
        },
      ],
    };

    const mainCanvas = createMockCanvas();
    const gameLoop = new GameLoop({
      mainCanvas,
      level: testLevel,
    });

    const noteEntity = gameLoop.entities.find(e => e.id === 'note_chamber_1');
    assert(noteEntity, 'Note entity exists before collection');

    // Execute interaction with signpost
    const candidate = {
      type: 'signpost',
      entity: noteEntity,
    };
    const executed = gameLoop.executeInteraction(candidate);
    assertEqual(executed, true);

    // Note is despawned from runtime entities and level entities
    const remainingInEntities = gameLoop.entities.find(e => e.id === 'note_chamber_1');
    assertEqual(remainingInEntities, undefined, 'Note entity must be removed from gameLoop.entities');
    const remainingInLevel = gameLoop.level.entities.find(e => e.id === 'note_chamber_1');
    assertEqual(remainingInLevel, undefined, 'Note entity must be removed from level.entities');

    // Note is recorded in player journal
    assertEqual(gameLoop.player.hasFolio('note_chamber_1'), true);
    const folios = gameLoop.player.getJournalFolios();
    assertEqual(folios.length, 1);
    assertEqual(folios[0].title, 'Chamber I Inscription');
  });
});

describe('Visual Noise Reduction & Art Demarcation (BL-189, ADR-0064)', () => {
  it('BiomeSurfaceShaders obeys sparse ~8% master density gate', () => {
    let gatePassCount = 0;
    const totalTiles = 1000;
    const seed = 12345;

    for (let i = 0; i < totalTiles; i++) {
      const x = i % 50;
      const y = Math.floor(i / 50);
      const decorGate = BiomeSurfaceShaders.getDecorHash(x, y, seed + 997);
      if (decorGate <= 0.08) {
        gatePassCount++;
      }
    }

    const passRatio = gatePassCount / totalTiles;
    // Must be tightly within 6% - 10%
    assert(passRatio >= 0.06 && passRatio <= 0.10, `Decor pass ratio was ${passRatio}, expected ~0.08`);
  });

  it('Renderer floor variant resolution keeps runic floor tiles rare (h > 0.96)', () => {
    let runicCount = 0;
    let crackedCount = 0;
    let plainCount = 0;
    const totalSamples = 2000;
    const seed = 42;

    for (let i = 0; i < totalSamples; i++) {
      const x = i % 40;
      const y = Math.floor(i / 40);
      const h = BiomeSurfaceShaders.getDecorHash(x, y, seed + 101);
      if (h > 0.96) {
        runicCount++;
      } else if (h > 0.88) {
        crackedCount++;
      } else {
        plainCount++;
      }
    }

    const runicRatio = runicCount / totalSamples;
    const crackedRatio = crackedCount / totalSamples;
    const plainRatio = plainCount / totalSamples;

    // Runic floor should be ~4%
    assert(runicRatio <= 0.06, `Runic ratio was ${runicRatio}, expected <= 0.06`);
    // Plain floor should be ~88%
    assert(plainRatio >= 0.84, `Plain floor ratio was ${plainRatio}, expected >= 0.84`);
  });
});
