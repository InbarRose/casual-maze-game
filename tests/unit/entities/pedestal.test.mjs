/**
 * Unit Tests: Pedestal Entity
 * Validates pedestal creation, item slotting/removal, satisfaction verification, and serialization.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Pedestal } from '../../../js/entities/pedestal.js';
import { RiddleItem } from '../../../js/entities/riddle-item.js';
import { ENTITY_TYPES } from '../../../js/core/constants.js';

describe('Unit > Entities > Pedestal', () => {
  it('initializes with riddle hint and requirements', () => {
    const ped = new Pedestal({
      id: 'ped_east',
      name: 'East Dawn Pedestal',
      riddleHint: 'The winged hunter must greet the first rays of dawn.',
      acceptedItemId: 'statue_falcon',
      puzzleGroupId: 'sphinx_riddle',
      targetDoorId: 'door_sanctum',
      x: 5,
      y: 5,
    });

    assertEqual(ped.id, 'ped_east');
    assertEqual(ped.type, ENTITY_TYPES.PEDESTAL);
    assertEqual(ped.name, 'East Dawn Pedestal');
    assertEqual(ped.riddleHint, 'The winged hunter must greet the first rays of dawn.');
    assertEqual(ped.acceptedItemId, 'statue_falcon');
    assertEqual(ped.puzzleGroupId, 'sphinx_riddle');
    assertEqual(ped.targetDoorId, 'door_sanctum');
    assertEqual(ped.slottedItem, null);
    assertEqual(ped.isSatisfied(), false);
  });

  it('correctly evaluates satisfaction when matching vs wrong item is slotted', () => {
    const ped = new Pedestal({
      id: 'ped_fire',
      acceptedItemId: 'orb_fire',
      puzzleGroupId: 'elements',
    });

    const wrongItem = new RiddleItem({ id: 'orb_water', styleId: 'orb_water' });
    const correctItem = new RiddleItem({ id: 'orb_fire', styleId: 'orb_fire' });

    // Place wrong item
    ped.placeItem(wrongItem);
    assertEqual(ped.slottedItem, wrongItem);
    assertEqual(wrongItem.isSlotted, true);
    assertEqual(ped.isSatisfied(), false);

    // Remove wrong item
    const removed = ped.removeItem();
    assertEqual(removed, wrongItem);
    assertEqual(ped.slottedItem, null);
    assertEqual(ped.isSatisfied(), false);

    // Place correct item
    ped.placeItem(correctItem);
    assertEqual(ped.isSatisfied(), true);
  });

  it('exports cleanly to JSON', () => {
    const ped = new Pedestal({
      id: 'ped_1',
      name: 'Shrine Plinth',
      acceptedItemId: 'rune_sun',
    });
    const json = ped.toJSON();
    assertEqual(json.id, 'ped_1');
    assertEqual(json.type, ENTITY_TYPES.PEDESTAL);
    assertEqual(json.acceptedItemId, 'rune_sun');
  });
});
