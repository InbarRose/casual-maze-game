/**
 * User Journey 5: Multi-Elevation Bridge & Ramp Navigation
 * Simulates an explorer mastering 3D elevation mechanics: crossing under bridges,
 * climbing directional ramps, walking along overhead bridge decks, and preventing void falls.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { CollisionEngine } from '../../../js/engine/collision.js';
import { ELEVATION } from '../../../js/core/constants.js';

describe('User Journey > Multi-Elevation 3D Bridge & Ramp Traversal', () => {
  it('guides an explorer through multi-elevation bridges, ramps, railings, and overhead key retrieval', () => {
    // 7x7 layout with an East-West bridge at (3, 3), Ramp North at (3, 4), and Ramp South at (3, 2)
    const multiLevel = {
      dimensions: { width: 7, height: 7 },
      spawn: { x: 1, y: 3, elevation: 0 },
      exit: { x: 5, y: 5 },
      layers: {
        ground: [
          [1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 0, 0, 'R_S', 0, 0, 1],
          [1, 0, 0, 'B_EW', 0, 0, 1], // Ground path runs E-W under bridge
          [1, 0, 0, 'R_N', 0, 0, 1],
          [1, 0, 0, 0, 0, 0, 1],
          [1, 1, 1, 1, 1, 1, 1],
        ],
        overhead: [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 'B_EW', 0, 0, 0], // Overhead deck runs N-S across bridge
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
        ],
      },
      entities: [
        { id: 'key_high', type: 'key', x: 3, y: 3, color: '#fbbf24', name: 'Overhead Relic' },
        { id: 'door_ground', type: 'door', x: 5, y: 4, requiresKey: 'key_high', color: '#fbbf24' },
      ],
    };

    let px = 1;
    let py = 3;
    let elevation = ELEVATION.GROUND;
    const inventory = [];

    // Phase 1: Player walks East under the bridge on Ground level (x: 1 -> 2 -> 3 -> 4)
    let move = CollisionEngine.checkMove(1, 3, 2, 3, elevation, multiLevel, multiLevel.entities, inventory);
    assert(move.allowed, 'Ground movement to (2, 3) allowed');
    px = 2;

    move = CollisionEngine.checkMove(2, 3, 3, 3, elevation, multiLevel, multiLevel.entities, inventory);
    assert(move.allowed, 'Ground movement under B_EW bridge at (3, 3) allowed');
    px = 3;

    move = CollisionEngine.checkMove(3, 3, 4, 3, elevation, multiLevel, multiLevel.entities, inventory);
    assert(move.allowed, 'Ground movement past B_EW bridge to (4, 3) allowed');
    px = 4;

    // Phase 2: Player loops South to (3, 5) to approach Ramp North at (3, 4)
    px = 3;
    py = 5;

    // Move North onto R_N ramp from Ground (0) -> climbs to Overhead (1)
    move = CollisionEngine.checkMove(3, 5, 3, 4, elevation, multiLevel, multiLevel.entities, inventory);
    assert(move.allowed, 'Step North onto R_N ramp allowed');
    assertEqual(move.nextElevation, ELEVATION.OVERHEAD, 'Elevation transitions to OVERHEAD (1)');
    py = 4;
    elevation = move.nextElevation;

    // Phase 3: Step North from Ramp onto Bridge Deck at (3, 3) on Overhead layer
    move = CollisionEngine.checkMove(3, 4, 3, 3, elevation, multiLevel, multiLevel.entities, inventory);
    assert(move.allowed, 'Step onto bridge deck at (3, 3) allowed');
    assertEqual(move.nextElevation, ELEVATION.OVERHEAD);
    py = 3;

    // Collect the Overhead Relic Key at (3, 3)
    inventory.push('key_high');

    // Phase 4: Verify boundary safety checks on Overhead deck
    // A. Attempt to step East into open air off bridge deck
    const jumpRailing = CollisionEngine.checkMove(3, 3, 4, 3, elevation, multiLevel, multiLevel.entities, inventory);
    assertEqual(jumpRailing.allowed, false, 'Overhead boundary blocks stepping into empty air');
    assertEqual(jumpRailing.reason, 'no_overhead_path');

    // B. Attempt to step West off the side of Ramp North from Overhead
    const floatVoid = CollisionEngine.checkMove(3, 4, 2, 4, elevation, multiLevel, multiLevel.entities, inventory);
    assertEqual(floatVoid.allowed, false, 'Ramp side exit on overhead is blocked');
    assertEqual(floatVoid.reason, 'ramp_side_exit_blocked');

    // Phase 5: Continue North across bridge and descend via Ramp South (R_S) at (3, 2)
    move = CollisionEngine.checkMove(3, 3, 3, 2, elevation, multiLevel, multiLevel.entities, inventory);
    assert(move.allowed, 'Move North onto R_S ramp allowed');
    assertEqual(move.nextElevation, ELEVATION.GROUND, 'Descends back to GROUND (0)');
    py = 2;
    elevation = move.nextElevation;

    // Step off ramp North to Ground at (3, 1)
    move = CollisionEngine.checkMove(3, 2, 3, 1, elevation, multiLevel, multiLevel.entities, inventory);
    assert(move.allowed, 'Step North onto open Ground floor allowed');
    py = 1;

    // Phase 6: Navigate to Ground Door at (5, 4) with Key in inventory
    const unlockDoor = CollisionEngine.checkMove(5, 3, 5, 4, elevation, multiLevel, multiLevel.entities, inventory);
    assert(unlockDoor.allowed, 'Ground door unlocks with key retrieved from overhead deck');
    assertEqual(unlockDoor.doorToUnlock?.id, 'door_ground');
  });
});
