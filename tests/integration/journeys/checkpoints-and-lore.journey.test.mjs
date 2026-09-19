/**
 * User Journey: Wall Art & Notes, Checkpoint Respawns, and Carriable Bonus Items
 *
 * Verifies end-to-end:
 * 1. Inspecting wall decorations (framed paintings, scrawled notes, frescoes) via [E] action.
 * 2. Picking up bonus score collectibles (gems, coins, relics) and accumulating score on HUD.
 * 3. Equipping carriable items (Adventurer Torch) and expanding fog-of-war line of sight.
 * 4. Activating mid-level Checkpoint shrines and respawning safely at the Checkpoint upon hazard hit.
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { ELEVATION, ENTITY_TYPES } from '../../../js/core/constants.js';

function createMockCanvas(width = 800, height = 600) {
  return {
    width,
    height,
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
      roundRect: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      drawImage: () => {},
      setLineDash: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

describe('User Journey > Wall Art, Checkpoints, and Collectibles Suite', () => {
  it('validates wall art & notes inspection with lore text and player reaction', () => {
    const testLevel = {
      id: 'test_decor_journey',
      title: 'Hall of Murals',
      dimensions: { width: 9, height: 9 },
      config: { fogOfWar: false, tileSize: 32 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 7, y: 7, elevation: 0 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 3 }, () => Array(9).fill(0)),
      },
      entities: [
        {
          id: 'decor_painting_1',
          type: ENTITY_TYPES.WALL_DECOR,
          x: 1,
          y: 0,
          z: 0,
          facing: 'south',
          decorType: 'painting',
          title: 'The Sunlit Citadel',
          text: 'An oil painting depicting a majestic golden citadel overlooking tranquil waters.',
          response: 'This painting is nice! The pigments look ancient yet remarkably vibrant.',
        },
        {
          id: 'decor_note_1',
          type: ENTITY_TYPES.WALL_DECOR,
          x: 2,
          y: 0,
          z: 0,
          facing: 'south',
          decorType: 'note',
          title: 'Scrawled Warning Note',
          text: 'Beware the shifting stone pressure plates in the next hall.',
          response: 'Someone left this note pinned to the stone recently.',
        },
      ],
    };

    let inspectedData = null;
    const gameLoop = new GameLoop({
      mainCanvas: createMockCanvas(),
      minimapCanvas: createMockCanvas(180, 180),
      level: testLevel,
      uiCallbacks: {
        onWallDecorInspected: (data) => {
          inspectedData = data;
        },
      },
    });

    // Player starts at (1, 1) adjacent to painting at (1, 0)
    assertEqual(gameLoop.player.gridX, 1);
    assertEqual(gameLoop.player.gridY, 1);

    // Player presses interact button [E] / Space
    gameLoop.handleManualInteract();

    assert(inspectedData !== null, 'Wall decor inspection triggered');
    assertEqual(inspectedData.id, 'decor_painting_1');
    assertEqual(inspectedData.title, 'The Sunlit Citadel');
    assertEqual(inspectedData.response, 'This painting is nice! The pigments look ancient yet remarkably vibrant.');
    assertEqual(inspectedData.decorType, 'painting');

    // Move east to (2, 1) adjacent to scrawled note at (2, 0)
    gameLoop.player.gridX = 2;
    gameLoop.player.gridY = 1;
    inspectedData = null;

    gameLoop.handleManualInteract();
    assert(inspectedData !== null, 'Second wall decor inspection triggered');
    assertEqual(inspectedData.id, 'decor_note_1');
    assertEqual(inspectedData.decorType, 'note');
    assertEqual(inspectedData.response, 'Someone left this note pinned to the stone recently.');

    gameLoop.destroy();
  });

  it('validates collecting bonus score gems and equipping carriable torch', () => {
    const testLevel = {
      id: 'test_collectibles_journey',
      title: 'Treasure Gallery',
      dimensions: { width: 9, height: 9 },
      config: { fogOfWar: true, viewRadius: 6, tileSize: 32 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 7, y: 7, elevation: 0 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 3 }, () => Array(9).fill(0)),
      },
      entities: [
        {
          id: 'gem_ruby',
          type: ENTITY_TYPES.COLLECTIBLE,
          x: 2,
          y: 1,
          z: 0,
          itemType: 'gem',
          scoreValue: 100,
          name: 'Ruby Gem',
        },
        {
          id: 'coin_ancient',
          type: ENTITY_TYPES.COLLECTIBLE,
          x: 3,
          y: 1,
          z: 0,
          itemType: 'coin',
          scoreValue: 50,
          name: 'Ancient Coin',
        },
        {
          id: 'torch_handy',
          type: ENTITY_TYPES.COLLECTIBLE,
          x: 4,
          y: 1,
          z: 0,
          itemType: 'torch',
          scoreValue: 25,
          name: 'Adventurer Torch',
        },
      ],
    };

    let latestUIState = null;
    const gameLoop = new GameLoop({
      mainCanvas: createMockCanvas(),
      minimapCanvas: createMockCanvas(180, 180),
      level: testLevel,
      uiCallbacks: {
        onStateUpdate: (state) => {
          latestUIState = state;
        },
      },
    });

    assertEqual(gameLoop.player.score, 0);
    assertEqual(gameLoop.player.carriedItems.length, 0);
    assertEqual(gameLoop.getEffectiveViewRadius(), 6);

    // Step to (2, 1) -> collects Ruby Gem
    gameLoop.player.gridX = 2;
    gameLoop.player.worldX = 2 * 32 + 16;
    gameLoop.handleCellArrival();

    assertEqual(gameLoop.player.score, 100);
    assertEqual(latestUIState.score, 100);

    // Step to (3, 1) -> collects Ancient Coin
    gameLoop.player.gridX = 3;
    gameLoop.player.worldX = 3 * 32 + 16;
    gameLoop.handleCellArrival();

    assertEqual(gameLoop.player.score, 150);
    assertEqual(latestUIState.score, 150);

    // Step to (4, 1) -> collects Adventurer Torch
    gameLoop.player.gridX = 4;
    gameLoop.player.worldX = 4 * 32 + 16;
    gameLoop.handleCellArrival();

    assertEqual(gameLoop.player.score, 175);
    assertEqual(gameLoop.player.hasTorch(), true);
    assertEqual(gameLoop.player.carriedItems.length, 1);
    assertEqual(gameLoop.getEffectiveViewRadius(), 9, 'Torch expands line-of-sight view radius from 6 to 9');

    gameLoop.destroy();
  });

  it('validates mid-level checkpoint activation and hazard hit respawn snapshot', () => {
    const testLevel = {
      id: 'test_checkpoint_journey',
      title: 'Perilous Gauntlet',
      dimensions: { width: 9, height: 9 },
      config: { fogOfWar: false, tileSize: 32 },
      spawn: { x: 1, y: 1, elevation: 0 },
      exit: { x: 7, y: 1, elevation: 0 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 3 }, () => Array(9).fill(0)),
      },
      entities: [
        {
          id: 'key_gate',
          type: ENTITY_TYPES.KEY,
          x: 2,
          y: 1,
          color: '#fbbf24',
        },
        {
          id: 'cp_shrine',
          type: ENTITY_TYPES.CHECKPOINT,
          x: 3,
          y: 1,
          z: 0,
          style: 'shrine',
          name: 'Gauntlet Waypoint Shrine',
        },
        {
          id: 'hazard_spikes',
          type: ENTITY_TYPES.HAZARD,
          x: 4,
          y: 1,
          hazardType: 'spikes',
          cycleTime: 2.0,
          activeDuration: 1.0,
          name: 'Lethal Spikes',
        },
      ],
    };

    let checkpointActivatedEvent = null;
    const gameLoop = new GameLoop({
      mainCanvas: createMockCanvas(),
      minimapCanvas: createMockCanvas(180, 180),
      level: testLevel,
      uiCallbacks: {
        onCheckpointActivated: (cp) => {
          checkpointActivatedEvent = cp;
        },
      },
    });

    // Pick up key at (2, 1) and earn some score
    gameLoop.player.gridX = 2;
    gameLoop.player.worldX = 2 * 32 + 16;
    gameLoop.player.addScore(300);
    gameLoop.handleCellArrival();

    assertEqual(gameLoop.player.hasKey('key_gate'), true);
    assertEqual(gameLoop.player.score, 300);
    assertEqual(gameLoop.activeCheckpoint, null, 'No checkpoint active before reaching shrine');

    // Step onto Checkpoint at (3, 1)
    gameLoop.player.gridX = 3;
    gameLoop.player.worldX = 3 * 32 + 16;
    gameLoop.handleCellArrival();

    assert(checkpointActivatedEvent !== null, 'Checkpoint activation callback fired');
    assertEqual(checkpointActivatedEvent.name, 'Gauntlet Waypoint Shrine');
    assertEqual(gameLoop.activeCheckpoint.activated, true);
    assertEqual(gameLoop.checkpointSnapshot.x, 3);
    assertEqual(gameLoop.checkpointSnapshot.y, 1);
    assertEqual(gameLoop.checkpointSnapshot.score, 300);
    assertDeepEqual(gameLoop.checkpointSnapshot.inventory, ['key_gate']);

    // Advance to (4, 1) and hit hazard
    gameLoop.player.gridX = 4;
    gameLoop.player.worldX = 4 * 32 + 16;
    const hazard = gameLoop.entities.find(e => e.id === 'hazard_spikes');
    gameLoop.handleHazardHit(hazard);

    // Assert player was RESPAWNED at the active checkpoint (3, 1), NOT back at (1, 1)!
    assertEqual(gameLoop.player.gridX, 3, 'Player respawned at active checkpoint X');
    assertEqual(gameLoop.player.gridY, 1, 'Player respawned at active checkpoint Y');
    assertEqual(gameLoop.player.hasKey('key_gate'), true, 'Inventory key preserved from checkpoint');
    assertEqual(gameLoop.player.score, 300, 'Score preserved from checkpoint');

    gameLoop.destroy();
  });
});
