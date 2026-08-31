/**
 * Unit Tests: CollisionEngine Subsystem
 * Verifies 2D grid movement, door locking/unlocking, multi-elevation bridges, ramps, and voids.
 */

import { describe, it, assert, assertEqual, assertDeepEqual } from '../../harness/index.mjs';
import { CollisionEngine } from '../../../js/engine/collision.js';
import { ELEVATION, TILES } from '../../../js/core/constants.js';
import { Key } from '../../../js/entities/key.js';
import { Door } from '../../../js/entities/door.js';

describe('Engine > CollisionEngine', () => {
  const sampleLevel = {
    dimensions: { width: 10, height: 10 },
    layers: {
      ground: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 'B_EW', 0, 'R_E', 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      overhead: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 'B_EW', 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
    },
    entities: [
      { id: 'key_gold', type: 'key', x: 1, y: 1, color: '#fbbf24' },
      { id: 'door_gold', type: 'door', x: 2, y: 1, requiresKey: 'key_gold', isOpen: false },
    ],
  };

  it('blocks movement into solid walls on ground level', () => {
    const res = CollisionEngine.checkMove(1, 1, 1, 0, ELEVATION.GROUND, sampleLevel);
    assertEqual(res.allowed, false, 'Movement into north wall blocked');
  });

  it('allows movement across open floor tiles', () => {
    const res = CollisionEngine.checkMove(1, 2, 2, 2, ELEVATION.GROUND, sampleLevel);
    assertEqual(res.allowed, true, 'Floor movement allowed');
    assertEqual(res.nextElevation, ELEVATION.GROUND);
  });

  it('blocks locked door without matching key', () => {
    const res = CollisionEngine.checkMove(1, 1, 2, 1, ELEVATION.GROUND, sampleLevel, sampleLevel.entities, []);
    assertEqual(res.allowed, false, 'Blocked by locked door');
    assertEqual(res.reason, 'door_locked');
  });

  it('allows passage and returns doorToUnlock when matching key is in inventory', () => {
    const res = CollisionEngine.checkMove(1, 1, 2, 1, ELEVATION.GROUND, sampleLevel, sampleLevel.entities, ['key_gold']);
    assertEqual(res.allowed, true, 'Door allows passage');
    assertEqual(res.doorToUnlock?.id, 'door_gold', 'Identifies correct door to unlock');
  });

  it('strictly validates multi-colored keys and gates', () => {
    const multiDoorLevel = {
      dimensions: { width: 6, height: 6 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1],
        ],
        overhead: Array.from({ length: 4 }, () => Array(6).fill(0)),
      },
      entities: [],
    };

    const multiEntities = [
      new Key({ id: 'key_ruby', x: 1, y: 1, color: '#f43f5e', name: 'Ruby Key' }),
      new Key({ id: 'key_sapphire', x: 1, y: 2, color: '#38bdf8', name: 'Sapphire Key' }),
      new Door({ id: 'door_ruby', x: 3, y: 1, requiresKey: 'key_ruby', color: '#f43f5e' }),
      new Door({ id: 'door_sapphire', x: 4, y: 1, requiresKey: 'key_sapphire', color: '#38bdf8' }),
    ];

    const wrongKeyRes = CollisionEngine.checkMove(2, 1, 3, 1, ELEVATION.GROUND, multiDoorLevel, multiEntities, ['key_sapphire']);
    assertEqual(wrongKeyRes.allowed, false, 'Ruby door rejects Sapphire key');
    assertEqual(wrongKeyRes.reason, 'door_locked');

    const rightKeyRes = CollisionEngine.checkMove(2, 1, 3, 1, ELEVATION.GROUND, multiDoorLevel, multiEntities, ['key_ruby']);
    assertEqual(rightKeyRes.allowed, true, 'Ruby door unlocked by Ruby key');
    assertEqual(rightKeyRes.doorToUnlock.id, 'door_ruby');
  });

  it('handles East-West bridge (B_EW) elevation mechanics', () => {
    // Under bridge on Ground (E-W allowed, N-S blocked)
    const groundEW = CollisionEngine.checkMove(4, 1, 5, 1, ELEVATION.GROUND, sampleLevel);
    assertEqual(groundEW.allowed, true, 'Ground can walk East-West under B_EW bridge');

    const groundNS = CollisionEngine.checkMove(5, 2, 5, 1, ELEVATION.GROUND, sampleLevel);
    assertEqual(groundNS.allowed, false, 'Ground cannot cross North-South into B_EW bridge support pillar');

    // On bridge on Overhead (N-S allowed, E-W blocked by railings)
    const overheadNS = CollisionEngine.checkMove(5, 2, 5, 1, ELEVATION.OVERHEAD, sampleLevel);
    assertEqual(overheadNS.allowed, true, 'Overhead can walk North-South across B_EW bridge deck');

    const overheadEW = CollisionEngine.checkMove(4, 1, 5, 1, ELEVATION.OVERHEAD, sampleLevel);
    assertEqual(overheadEW.allowed, false, 'Overhead cannot walk East-West over bridge railing');
    assertEqual(overheadEW.reason, 'bridge_overhead_cross_blocked');
  });

  it('handles North-South bridge (B_NS) elevation mechanics', () => {
    const nsBridgeLevel = {
      dimensions: { width: 5, height: 5 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1],
          [1, 0, 'B_NS', 0, 1],
          [1, 0, 0, 0, 1],
          [1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0],
          [0, 0, 'B_NS', 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
    };

    // Ground walks North-South under B_NS
    const groundNS = CollisionEngine.checkMove(2, 2, 2, 1, ELEVATION.GROUND, nsBridgeLevel);
    assertEqual(groundNS.allowed, true, 'Ground can walk North-South under B_NS');

    // Ground blocked East-West across B_NS pillars
    const groundEW = CollisionEngine.checkMove(1, 1, 2, 1, ELEVATION.GROUND, nsBridgeLevel);
    assertEqual(groundEW.allowed, false, 'Ground blocked East-West across B_NS pillars');

    // Overhead walks East-West across B_NS deck
    const overheadEW = CollisionEngine.checkMove(1, 1, 2, 1, ELEVATION.OVERHEAD, nsBridgeLevel);
    assertEqual(overheadEW.allowed, true, 'Overhead can walk East-West across B_NS deck');

    // Overhead blocked North-South by B_NS railings
    const overheadNS = CollisionEngine.checkMove(2, 2, 2, 1, ELEVATION.OVERHEAD, nsBridgeLevel);
    assertEqual(overheadNS.allowed, false, 'Overhead blocked North-South across B_NS railings');
  });

  it('handles Ramp R_N climb and descend directional transitions', () => {
    const rampLevel = {
      dimensions: { width: 5, height: 5 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1],
          [1, 0, 'B_EW', 0, 1],
          [1, 0, 'R_N', 0, 1],
          [1, 0, 0, 0, 1],
          [1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0],
          [0, 0, 'B_EW', 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ],
      },
    };

    // Climb R_N moving North: Ground (0) -> Overhead (1)
    const climb = CollisionEngine.checkMove(2, 3, 2, 2, ELEVATION.GROUND, rampLevel);
    assertEqual(climb.allowed, true, 'R_N climb North allowed');
    assertEqual(climb.nextElevation, ELEVATION.OVERHEAD, 'Elevation transitions to OVERHEAD (1)');

    // Exit R_N North onto bridge deck on Overhead (1)
    const stepBridge = CollisionEngine.checkMove(2, 2, 2, 1, ELEVATION.OVERHEAD, rampLevel);
    assertEqual(stepBridge.allowed, true, 'Step onto bridge deck allowed');
    assertEqual(stepBridge.nextElevation, ELEVATION.OVERHEAD);

    // Descend from bridge South onto R_N on Overhead (1) -> transitions to Ground (0)
    const descend = CollisionEngine.checkMove(2, 1, 2, 2, ELEVATION.OVERHEAD, rampLevel);
    assertEqual(descend.allowed, true, 'Descend onto R_N South allowed');
    assertEqual(descend.nextElevation, ELEVATION.GROUND, 'Elevation transitions back to GROUND (0)');

    // Side entry into R_N from East on Ground is blocked
    const sideEntry = CollisionEngine.checkMove(3, 2, 2, 2, ELEVATION.GROUND, rampLevel);
    assertEqual(sideEntry.allowed, false, 'Side entry into R_N ramp blocked');
    assertEqual(sideEntry.reason, 'ramp_side_entry_blocked');
  });

  it('blocks stepping into overhead voids without elevated walkways', () => {
    const res = CollisionEngine.checkMove(2, 2, 3, 2, ELEVATION.OVERHEAD, sampleLevel);
    assertEqual(res.allowed, false, 'Cannot float into empty overhead void');
    assertEqual(res.reason, 'no_overhead_path');
  });
});
