/**
 * Unit Tests: Secret Walls, Illusory Chambers & Fog Occlusion (BL-51)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { TILES, ELEVATION, FOG_STATE } from '../../../js/core/constants.js';
import { CollisionEngine } from '../../../js/engine/collision.js';
import { FogOfWar } from '../../../js/engine/fog.js';
import { GameLoop } from '../../../js/engine/game-loop.js';
import { globalEvents } from '../../../js/core/events.js';

describe('Engine > Secret Walls & Illusory Chambers (BL-51)', () => {
  it('allows player traversal through secret walls on ground elevation', () => {
    const level = {
      dimensions: { width: 5, height: 5 },
      spawn: { x: 1, y: 1 },
      exit: { x: 3, y: 3 },
      config: {},
      layers: {
        ground: [
          [1, 1, 1, 1, 1],
          [1, 0, TILES.SECRET_WALL, 0, 1],
          [1, 0, 1, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      entities: [],
    };

    // Move from (1, 1) onto Secret Wall at (2, 1)
    const moveResult = CollisionEngine.checkMove(1, 1, 2, 1, ELEVATION.GROUND, level, []);
    assertEqual(moveResult.allowed, true, 'Moving into secret wall is allowed on ground');
    assertEqual(moveResult.isSecretWall, true, 'Result identifies target tile as secret wall');

    // Move into normal wall at (0, 1) is blocked
    const wallResult = CollisionEngine.checkMove(1, 1, 0, 1, ELEVATION.GROUND, level, []);
    assertEqual(wallResult.allowed, false, 'Moving into solid wall is blocked');
    assertEqual(wallResult.reason, 'wall_hit');
  });

  it('blocks Fog of War line-of-sight before discovery, then allows sight when revealed', () => {
    const ground = [
      [1, 1, 1, 1, 1],
      [1, 0, TILES.SECRET_WALL, 0, 1], // Secret chamber at (3, 1)
      [1, 1, 1, 1, 1],
    ];
    const overhead = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];

    const fog = new FogOfWar(5, 3);

    // 1. Before discovery: player is at (1, 1), secret wall is at (2, 1), chamber is at (3, 1)
    fog.update(1, 1, ELEVATION.GROUND, ground, overhead, 6, null);

    assertEqual(fog.getVisibility(1, 1), FOG_STATE.VISIBLE, 'Player tile is visible');
    assertEqual(fog.getVisibility(2, 1), FOG_STATE.VISIBLE, 'Secret wall surface is visible');
    assertEqual(fog.getVisibility(3, 1), FOG_STATE.UNEXPLORED, 'Chamber behind unrevealed secret wall remains shrouded in darkness');

    // 2. After discovery: revealedSecrets contains '2,1'
    const revealedSecrets = new Set(['2,1']);
    fog.update(1, 1, ELEVATION.GROUND, ground, overhead, 6, revealedSecrets);

    assertEqual(fog.getVisibility(3, 1), FOG_STATE.VISIBLE, 'Chamber behind revealed secret wall is now illuminated');
  });

  it('triggers secret discovery event, sound fx hook, and tracks secrets in GameLoop', () => {
    let secretEventPayload = null;
    const unsub = globalEvents.on('secret:found', (data) => {
      secretEventPayload = data;
    });

    const mockCanvas = {
      width: 400,
      height: 400,
      getContext: () => ({
        fillRect: () => {},
        strokeRect: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
      }),
    };

    const level = {
      id: 'test_secret_level',
      title: 'Secret Vault',
      dimensions: { width: 5, height: 5 },
      spawn: { x: 1, y: 1 },
      exit: { x: 3, y: 3 },
      config: { fogOfWar: true },
      layers: {
        ground: [
          [1, 1, 1, 1, 1],
          [1, 0, TILES.SECRET_WALL, 0, 1],
          [1, 0, 1, 0, 1],
          [1, 0, 0, 0, 1],
          [1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
      entities: [],
    };

    const game = new GameLoop({
      mainCanvas: mockCanvas,
      minimapCanvas: mockCanvas,
      level,
    });

    assertEqual(game.totalSecrets, 1, 'Correctly computes 1 total secret wall in level');
    assertEqual(game.secretsFound, 0, 'Starts with 0 secrets found');

    // Move player from (1, 1) to (2, 1) onto the secret wall
    const moved = game.tryMove(2, 1);
    assertEqual(moved, true, 'Move onto secret wall accepted');

    // Complete the movement interpolation
    game.player.worldX = 2 * 32 + 16;
    game.player.worldY = 1 * 32 + 16;
    game.player.isMoving = false;
    game.player.gridX = 2;
    game.player.gridY = 1;

    game.handleCellArrival();

    assertEqual(game.secretsFound, 1, 'Secrets found incremented to 1');
    assert(game.revealedSecrets.has('2,1'), 'Revealed secrets set contains "2,1"');
    assertEqual(secretEventPayload?.x, 2, 'Event payload contains secret X coordinate');
    assertEqual(secretEventPayload?.y, 1, 'Event payload contains secret Y coordinate');
    assertEqual(secretEventPayload?.totalFound, 1, 'Event payload contains totalFound');

    // Stepping on the same secret wall again does not double-count
    game.handleCellArrival();
    assertEqual(game.secretsFound, 1, 'Does not duplicate secret discovery on re-entry');

    game.stop();
    unsub();
  });
});
