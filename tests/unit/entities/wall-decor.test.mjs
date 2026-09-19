/**
 * Unit Tests: WallDecor Entity
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { WallDecor } from '../../../js/entities/wall-decor.js';
import { ELEVATION, ENTITY_TYPES } from '../../../js/core/constants.js';

describe('Entities > WallDecor', () => {
  it('initializes with default and custom configurations', () => {
    const defaultDecor = new WallDecor();
    assertEqual(defaultDecor.type, ENTITY_TYPES.WALL_DECOR);
    assertEqual(defaultDecor.x, 0);
    assertEqual(defaultDecor.y, 0);
    assertEqual(defaultDecor.z, ELEVATION.GROUND);
    assertEqual(defaultDecor.facing, 'south');
    assertEqual(defaultDecor.decorType, 'painting');
    assertEqual(defaultDecor.inspected, false);

    const customDecor = new WallDecor({
      id: 'decor_flame_warning_note',
      x: 5,
      y: 8,
      z: ELEVATION.OVERHEAD,
      facing: 'north',
      decorType: 'note',
      title: 'Scrawled Warning Note',
      text: 'The flame vents trigger every two ticks. Watch the floor vents carefully.',
      response: 'Someone took the time to scrawl this in charcoal...',
      author: 'A Perceptive Survivor',
    });

    assertEqual(customDecor.id, 'decor_flame_warning_note');
    assertEqual(customDecor.x, 5);
    assertEqual(customDecor.y, 8);
    assertEqual(customDecor.z, ELEVATION.OVERHEAD);
    assertEqual(customDecor.elevation, ELEVATION.OVERHEAD);
    assertEqual(customDecor.getCoordString(), '(5, 8, 1)');
    assertEqual(customDecor.facing, 'north');
    assertEqual(customDecor.decorType, 'note');
    assertEqual(customDecor.title, 'Scrawled Warning Note');
    assertEqual(customDecor.response, 'Someone took the time to scrawl this in charcoal...');
    assertEqual(customDecor.author, 'A Perceptive Survivor');
  });

  it('marks decor as inspected and returns atmospheric payload upon inspection', () => {
    const painting = new WallDecor({
      id: 'painting_citadel',
      x: 10,
      y: 4,
      decorType: 'painting',
      title: 'The Sunlit Citadel',
      text: 'An oil painting depicting a majestic golden citadel overlooking crystalline waters.',
      response: 'This painting is nice! The pigments look ancient yet surprisingly vivid.',
    });

    assertEqual(painting.inspected, false);

    const data = painting.inspect();
    assertEqual(painting.inspected, true, 'WallDecor marked inspected');
    assertEqual(data.id, 'painting_citadel');
    assertEqual(data.title, 'The Sunlit Citadel');
    assertEqual(data.text, 'An oil painting depicting a majestic golden citadel overlooking crystalline waters.');
    assertEqual(data.response, 'This painting is nice! The pigments look ancient yet surprisingly vivid.');
    assertEqual(data.decorType, 'painting');
  });

  it('advances shimmer animation timer on update', () => {
    const decor = new WallDecor({ x: 2, y: 2 });
    const initialShimmer = decor.shimmerTimer;
    decor.update(0.1);
    assert(decor.shimmerTimer > initialShimmer, 'shimmerTimer advances on update');
  });
});
