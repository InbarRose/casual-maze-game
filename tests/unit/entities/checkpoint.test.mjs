/**
 * Unit Tests: Checkpoint Entity
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Checkpoint } from '../../../js/entities/checkpoint.js';
import { ELEVATION, ENTITY_TYPES } from '../../../js/core/constants.js';

describe('Entities > Checkpoint', () => {
  it('initializes with default and custom configurations', () => {
    const defaultCheckpoint = new Checkpoint();
    assertEqual(defaultCheckpoint.type, ENTITY_TYPES.CHECKPOINT);
    assertEqual(defaultCheckpoint.x, 0);
    assertEqual(defaultCheckpoint.y, 0);
    assertEqual(defaultCheckpoint.z, ELEVATION.GROUND);
    assertEqual(defaultCheckpoint.style, 'shrine');
    assertEqual(defaultCheckpoint.activated, false);
    assertEqual(defaultCheckpoint.activationCount, 0);

    const customCheckpoint = new Checkpoint({
      id: 'cp_foundry_gauntlet',
      x: 14,
      y: 9,
      z: ELEVATION.OVERHEAD,
      style: 'crystal_beacon',
      name: 'Molten Overpass Sanctuary',
      color: '#38bdf8',
    });

    assertEqual(customCheckpoint.id, 'cp_foundry_gauntlet');
    assertEqual(customCheckpoint.x, 14);
    assertEqual(customCheckpoint.y, 9);
    assertEqual(customCheckpoint.z, ELEVATION.OVERHEAD);
    assertEqual(customCheckpoint.elevation, ELEVATION.OVERHEAD);
    assertEqual(customCheckpoint.getCoordString(), '(14, 9, 1)');
    assertEqual(customCheckpoint.style, 'crystal_beacon');
    assertEqual(customCheckpoint.name, 'Molten Overpass Sanctuary');
    assertEqual(customCheckpoint.color, '#38bdf8');
  });

  it('activates and increments activation count', () => {
    const cp = new Checkpoint({
      id: 'cp_hearth_1',
      x: 7,
      y: 7,
      style: 'runic_hearth',
      name: 'Crypt Hearth',
    });

    assertEqual(cp.activated, false);
    assertEqual(cp.activationCount, 0);

    const result = cp.activate();
    assertEqual(cp.activated, true);
    assertEqual(cp.activationCount, 1);
    assertEqual(result.id, 'cp_hearth_1');
    assertEqual(result.name, 'Crypt Hearth');
    assertEqual(result.x, 7);
    assertEqual(result.y, 7);

    // Activating again increments count
    cp.activate();
    assertEqual(cp.activationCount, 2);
  });

  it('updates animation timers and pulse rings when activated', () => {
    const cp = new Checkpoint({ activated: true });
    const initialFlame = cp.flameTimer;
    cp.update(0.1);
    assert(cp.flameTimer > initialFlame, 'flameTimer advances on update');
    assert(cp.pulseRing > 0, 'pulseRing advances when activated');
  });
});
