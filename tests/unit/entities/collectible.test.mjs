/**
 * Unit Tests: Collectible Entity
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Collectible } from '../../../js/entities/collectible.js';
import { Player } from '../../../js/entities/player.js';
import { ELEVATION, ENTITY_TYPES } from '../../../js/core/constants.js';

describe('Entities > Collectible', () => {
  it('initializes with default and custom configurations', () => {
    const defaultItem = new Collectible();
    assertEqual(defaultItem.type, ENTITY_TYPES.COLLECTIBLE);
    assertEqual(defaultItem.x, 0);
    assertEqual(defaultItem.y, 0);
    assertEqual(defaultItem.z, ELEVATION.GROUND);
    assertEqual(defaultItem.itemType, 'gem');
    assertEqual(defaultItem.scoreValue, 100);
    assertEqual(defaultItem.isCollected, false);
    assertEqual(defaultItem.isCarriable, false);

    const coin = new Collectible({
      id: 'coin_alcove_1',
      x: 3,
      y: 4,
      itemType: 'coin',
    });
    assertEqual(coin.scoreValue, 50);
    assertEqual(coin.isCarriable, false);

    const relic = new Collectible({
      id: 'relic_vault_crown',
      x: 12,
      y: 15,
      itemType: 'relic',
    });
    assertEqual(relic.scoreValue, 300);

    const torch = new Collectible({
      id: 'torch_entrance',
      x: 2,
      y: 2,
      itemType: 'torch',
    });
    assertEqual(torch.isCarriable, true);
  });

  it('awards score and adds to player carried items on collect', () => {
    const player = new Player(1, 1, 0, 32);
    assertEqual(player.score, 0);
    assertEqual(player.carriedItems.length, 0);

    const gem = new Collectible({
      id: 'gem_ruby_1',
      x: 2,
      y: 1,
      itemType: 'gem',
      scoreValue: 150,
      name: 'Ruby Gem',
    });

    const gemData = gem.collect(player);
    assertEqual(gem.isCollected, true);
    assertEqual(player.score, 150);
    assertEqual(gemData.scoreValue, 150);
    assertEqual(player.carriedItems.length, 0, 'Score-only gems are not added to carried items');

    const torch = new Collectible({
      id: 'torch_handy',
      x: 3,
      y: 1,
      itemType: 'torch',
      scoreValue: 25,
      name: 'Adventurer Torch',
    });

    torch.collect(player);
    assertEqual(torch.isCollected, true);
    assertEqual(player.score, 175);
    assertEqual(player.carriedItems.length, 1, 'Carriable torch is added to player carried items');
    assertEqual(player.hasTorch(), true);
    assertEqual(player.hasItem('torch'), true);
  });

  it('updates bobbing animation timer when uncollected', () => {
    const gem = new Collectible({ x: 1, y: 1 });
    const initialBob = gem.bobTimer;
    gem.update(0.1);
    assert(gem.bobTimer > initialBob, 'bobTimer advances on update');
  });
});
