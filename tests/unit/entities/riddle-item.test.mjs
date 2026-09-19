/**
 * Unit Tests: RiddleItem Entity
 * Validates carryable state, pickup, dropping, slotting, and serialization.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { RiddleItem } from '../../../js/entities/riddle-item.js';
import { ENTITY_TYPES, ELEVATION } from '../../../js/core/constants.js';

describe('Unit > Entities > RiddleItem', () => {
  it('initializes with default and preset properties', () => {
    const item = new RiddleItem({
      id: 'falcon_relic',
      styleId: 'statue_falcon',
      x: 3,
      y: 4,
      elevation: 0,
    });

    assertEqual(item.id, 'falcon_relic');
    assertEqual(item.type, ENTITY_TYPES.RIDDLE_ITEM);
    assertEqual(item.itemType, 'statue');
    assertEqual(item.name, 'Falcon Statue');
    assertEqual(item.symbol, '🦅');
    assertEqual(item.isCarried, false);
    assertEqual(item.isSlotted, false);
    assertEqual(item.getCoordString(), '(3, 4, 0)');
  });

  it('manages pickup and drop lifecycle', () => {
    const item = new RiddleItem({ id: 'item_1', x: 2, y: 5 });
    item.pickup();
    assertEqual(item.isCarried, true);
    assertEqual(item.isSlotted, false);

    item.drop(6, 7, ELEVATION.GROUND);
    assertEqual(item.isCarried, false);
    assertEqual(item.isSlotted, false);
    assertEqual(item.x, 6);
    assertEqual(item.y, 7);
  });

  it('manages slotting into a pedestal', () => {
    const item = new RiddleItem({ id: 'orb_fire_1', styleId: 'orb_fire' });
    const mockPedestal = { id: 'ped_1', x: 4, y: 8, elevation: 1 };

    item.slotInto(mockPedestal);
    assertEqual(item.isCarried, false);
    assertEqual(item.isSlotted, true);
    assertEqual(item.slottedPedestalId, 'ped_1');
    assertEqual(item.x, 4);
    assertEqual(item.y, 8);
    assertEqual(item.elevation, 1);
  });

  it('exports cleanly to JSON', () => {
    const item = new RiddleItem({
      id: 'dragon_statue',
      styleId: 'statue_dragon',
      x: 1,
      y: 2,
    });
    const json = item.toJSON();
    assertEqual(json.id, 'dragon_statue');
    assertEqual(json.type, ENTITY_TYPES.RIDDLE_ITEM);
    assertEqual(json.name, 'Dragon Statue');
    assertEqual(json.symbol, '🐉');
  });
});
