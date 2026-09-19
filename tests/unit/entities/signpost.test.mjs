/**
 * Unit Tests: Signpost Entity ("The Architect's Journal")
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Signpost } from '../../../js/entities/signpost.js';
import { ELEVATION, ENTITY_TYPES } from '../../../js/core/constants.js';

describe('Entities > Signpost (Architect Journal)', () => {
  it('initializes with default and custom configurations', () => {
    const defaultSign = new Signpost();
    assertEqual(defaultSign.type, ENTITY_TYPES.SIGNPOST);
    assertEqual(defaultSign.x, 0);
    assertEqual(defaultSign.y, 0);
    assertEqual(defaultSign.z, ELEVATION.GROUND);
    assertEqual(defaultSign.read, false);
    assertEqual(defaultSign.title, "Architect's Journal");

    const customSign = new Signpost({
      id: 'sign_flame_warning',
      x: 7,
      y: 9,
      z: ELEVATION.OVERHEAD,
      title: 'Warning: Flame Vents Ahead',
      text: 'The jets erupt rhythmically. Do not pause on the bronze floor grates.',
      author: 'Lost Adventurer',
      style: 'wooden_sign',
    });

    assertEqual(customSign.id, 'sign_flame_warning');
    assertEqual(customSign.x, 7);
    assertEqual(customSign.y, 9);
    assertEqual(customSign.z, ELEVATION.OVERHEAD);
    assertEqual(customSign.elevation, ELEVATION.OVERHEAD);
    assertEqual(customSign.getCoordString(), '(7, 9, 1)');
    assertEqual(customSign.style, 'wooden_sign');
    assertEqual(customSign.author, 'Lost Adventurer');
  });

  it('marks signpost as read and returns message details upon inspection', () => {
    const sign = new Signpost({
      id: 'sign_bridge_hint',
      x: 3,
      y: 5,
      z: 0,
      title: 'Bridge Crossing Notes',
      text: 'You can walk under the stone archway on ground level, or take the western ramp to walk above it.',
      author: 'The Chief Architect',
      style: 'stone_tablet',
    });

    assertEqual(sign.read, false);

    const content = sign.readSign();
    assertEqual(sign.read, true, 'Signpost marked as read');
    assertEqual(content.id, 'sign_bridge_hint');
    assertEqual(content.title, 'Bridge Crossing Notes');
    assertEqual(content.text, 'You can walk under the stone archway on ground level, or take the western ramp to walk above it.');
    assertEqual(content.author, 'The Chief Architect');
    assertEqual(content.style, 'stone_tablet');
  });

  it('updates animation timers cleanly', () => {
    const sign = new Signpost({ x: 2, y: 2, z: 0 });
    const initialGlow = sign.glowTimer;
    sign.update(0.2);
    assert(sign.glowTimer > initialGlow, 'glowTimer advances with delta time');
    assert(sign.sparkleTimer > 0, 'sparkleTimer advances with delta time');
  });
});
