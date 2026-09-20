/**
 * Unit Tests: Story 2 (Relics of the Four Guardians) Unbypassable Challenge Integrity
 *
 * Verifies with the BFS state-space pathfinder that all gates, keys, pedestals,
 * and environmental riddle barriers in Story 2 (Chapters 1 to 3) cannot be bypassed
 * through open corridors.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { solveLevel } from '../../../js/engine/solver.js';
import { getStoryChapter } from '../../../js/stories/storylines.js';

describe('Levels > Story 2 Unbypassable Challenges & Gate Routing', () => {
  const g1 = getStoryChapter('relics_of_the_guardians', 1);
  const g2 = getStoryChapter('relics_of_the_guardians', 2);
  const g3 = getStoryChapter('relics_of_the_guardians', 3);

  it('Guardians 1: The Whispering Ruins strictly requires the Golden Sun Key', () => {
    // 1. Solvable with key
    const solution = solveLevel(g1);
    assert(solution !== null, 'Guardians 1 must be solvable');
    assert(solution.length > 0, 'Solution must contain steps');

    // 2. Unsolvable without Golden Sun Key (door at 5,6 blocks south sanctum)
    const noKey = JSON.parse(JSON.stringify(g1));
    noKey.entities = noKey.entities.filter(e => e.id !== 'key_ruins_gold');
    const solNoKey = solveLevel(noKey);
    assertEqual(solNoKey, null, 'Guardians 1 exit must be unreachable without Golden Sun Key');

    // 3. Verify door cannot be bypassed
    const bypass = solveLevel(g1, { allowDoors: false });
    assertEqual(bypass, null, 'Guardians 1 exit must be unreachable when door is closed');
  });

  it("Guardians 2: The Falcon's Plinth strictly requires unlocking the terrace gate", () => {
    // 1. Solvable when puzzle gate / pedestal riddle is resolved
    const solution = solveLevel(g2);
    assert(solution !== null, "Guardians 2 must be solvable with Falcon's plinth solved");

    // 2. Unsolvable if terrace gate remains locked
    const bypass = solveLevel(g2, { allowPuzzles: false });
    assertEqual(bypass, null, 'Terrace Gate is a mandatory bottleneck; cannot be bypassed');
  });

  it('Guardians 3: Sanctum of the Four Guardians strictly requires unlocking the Golden Gate', () => {
    // 1. Solvable when the 4 guardian plinths unlock the gate
    const solution = solveLevel(g3);
    assert(solution !== null, 'Guardians 3 must be solvable');

    // 2. Unsolvable if the Golden Sanctum Gate remains locked
    const bypass = solveLevel(g3, { allowPuzzles: false });
    assertEqual(bypass, null, 'Golden Sanctum Gate is a mandatory bottleneck; cannot be bypassed');
  });
});
