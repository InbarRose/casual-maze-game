/**
 * Unit Tests: Player Entity
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { Player } from '../../../js/entities/player.js';
import { ELEVATION } from '../../../js/core/constants.js';

describe('Entities > Player', () => {
  it('initializes at designated grid coordinates and elevation', () => {
    const player = new Player(3, 4, ELEVATION.OVERHEAD, 32);
    assertEqual(player.gridX, 3);
    assertEqual(player.gridY, 4);
    assertEqual(player.elevation, ELEVATION.OVERHEAD);
    assertEqual(player.worldX, 3 * 32 + 16);
    assertEqual(player.worldY, 4 * 32 + 16);
    assertEqual(player.isMoving, false);
    assertEqual(player.facing, 'south');
    assertDeepEqual(player.inventory, []);
  });

  it('supports initialInventory constructor parameter', () => {
    const player = new Player(1, 1, ELEVATION.GROUND, 32, ['key_ruby', 'key_blue']);
    assertDeepEqual(player.inventory, ['key_ruby', 'key_blue']);
  });

  it('adds keys to inventory', () => {
    const player = new Player(1, 1, 0, 32);
    player.inventory.push('key_gold_1');
    assertEqual(player.inventory.includes('key_gold_1'), true);
    assertDeepEqual(player.inventory, ['key_gold_1']);
  });

  it('handles movement step initiation and completion', () => {
    const player = new Player(1, 1, 0, 32);
    player.startMove(2, 1, 0);

    assertEqual(player.isMoving, true);
    assertEqual(player.targetGridX, 2);
    assertEqual(player.targetGridY, 1);
    assertEqual(player.facing, 'east');

    // Update with full progress (0.2s at moveSpeed = 6)
    player.update(0.25);
    assertEqual(player.isMoving, false);
    assertEqual(player.gridX, 2);
    assertEqual(player.gridY, 1);
    assertEqual(player.worldX, 2 * 32 + 16);
  });

  it('resets player state and inventory cleanly upon reset()', () => {
    const player = new Player(5, 5, 1, 32, ['key_1']);
    player.startMove(5, 6, 1);

    player.reset(1, 1, 0, ['key_spawn']);
    assertEqual(player.gridX, 1);
    assertEqual(player.gridY, 1);
    assertEqual(player.elevation, 0);
    assertEqual(player.isMoving, false);
    assertDeepEqual(player.inventory, ['key_spawn']);
  });
});
