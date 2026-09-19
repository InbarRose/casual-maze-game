/**
 * Unit Tests: Dynamic Activities (Teleporters, Hazards, Patrollers, Puzzle Gates)
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { Teleporter } from '../../../js/entities/teleporter.js';
import { TimedHazard, Patroller } from '../../../js/entities/hazard.js';
import { PuzzleGate } from '../../../js/entities/puzzle-gate.js';
import { ELEVATION } from '../../../js/core/constants.js';

describe('Entities > Dynamic Activities', () => {
  it('handles Teleporter warping and cooldown cycling', () => {
    const teleporter = new Teleporter({
      id: 'tp_1',
      x: 3,
      y: 4,
      z: ELEVATION.GROUND,
      targetX: 12,
      targetY: 15,
      targetZ: ELEVATION.OVERHEAD,
      cooldown: 1.0,
    });

    assertEqual(teleporter.getCoordString(), '(3, 4, 0)');
    assertEqual(teleporter.getTargetCoordString(), '(12, 15, 1)');
    assert(teleporter.canWarp(), 'Teleporter is initially ready to warp');

    const destination = teleporter.triggerWarp();
    assertEqual(destination.x, 12);
    assertEqual(destination.y, 15);
    assertEqual(destination.z, 1);
    assertEqual(destination.elevation, 1);
    assert(!teleporter.canWarp(), 'Teleporter enters cooldown after warp');

    // Advance 0.5s -> still on cooldown
    teleporter.update(0.5);
    assert(!teleporter.canWarp(), 'Still on cooldown at 0.5s');

    // Advance 0.6s -> cooldown expires
    teleporter.update(0.6);
    assert(teleporter.canWarp(), 'Cooldown expired after 1.1s total');
  });

  it('cycles TimedHazard active and inactive lethal states', () => {
    const hazard = new TimedHazard({
      id: 'spikes_1',
      x: 5,
      y: 6,
      z: 0,
      interval: 2.0,
      activeDuration: 0.8,
    });

    // At t=0, timer=0, isActive is set in update()
    hazard.update(0.1);
    assert(hazard.isActive, 'Hazard is active during activeDuration window');
    assert(hazard.isLethalAt(5, 6, 0), 'Hazard is lethal at matching coords');
    assert(!hazard.isLethalAt(5, 6, 1), 'Hazard is not lethal at different elevation');
    assert(!hazard.isLethalAt(4, 6, 0), 'Hazard is not lethal at different grid cell');

    // Advance past activeDuration (t = 1.0s)
    hazard.update(0.9);
    assert(!hazard.isActive, 'Hazard is retracted/inactive after active window');
    assert(!hazard.isLethalAt(5, 6, 0), 'Inactive hazard is not lethal');
  });

  it('navigates Patroller across waypoints and checks player collision', () => {
    const patroller = new Patroller({
      id: 'guard_1',
      waypoints: [
        { x: 2, y: 5, z: 0 },
        { x: 6, y: 5, z: 0 },
      ],
      speed: 4.0, // 4 tiles per second
      behavior: 'pingpong',
      tileSize: 32,
    });

    assertEqual(patroller.x, 2);
    assertEqual(patroller.y, 5);

    // Initial world coords
    assertEqual(patroller.worldX, 2 * 32 + 16);
    assertEqual(patroller.worldY, 5 * 32 + 16);

    // Collision with player standing at (2, 5)
    assert(patroller.checkCollision(patroller.worldX, patroller.worldY, 0, 32), 'Collides with player at same spot');
    assert(!patroller.checkCollision(patroller.worldX, patroller.worldY, 1, 32), 'No collision when elevation differs');

    // Move along path towards (6, 5)
    patroller.update(0.5); // moves 2 tiles east -> x ≈ 4
    assert(patroller.x > 2.5 && patroller.x < 5.5, `Patroller progressed to x=${patroller.x}`);
  });

  it('validates PuzzleGate minigame solutions and unlocks', () => {
    const gate = new PuzzleGate({
      id: 'pg_1',
      x: 7,
      y: 8,
      puzzleType: 'rune_memory',
      solution: [0, 2, 1, 3],
    });

    assert(!gate.isUnlocked, 'Gate starts locked');
    assert(!gate.verifySolution([0, 1, 2, 3]), 'Incorrect sequence rejected');
    assert(gate.verifySolution([0, 2, 1, 3]), 'Correct sequence approved');

    gate.unlock();
    assert(gate.isUnlocked, 'Gate marked as unlocked');
  });
});
