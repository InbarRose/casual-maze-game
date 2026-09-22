/**
 * Unit Tests: Campaign Chapter 7 (Grand Synthesis & Citadel Trials)
 *
 * Validates Levels 25–28 against:
 * 1. Kishōtenketsu 4-stage progression (Ki: Level 25, Shō: Level 26, Ten: Level 27, Ketsu: Level 28).
 * 2. Strict zero-bypass gating (ramps, bridges, teleporters, doors, and levers cannot be bypassed).
 * 3. BFS state-space pathfinder solvability.
 * 4. Empirical par step calibration (parSteps = ceil(optimal * 1.15)).
 * 5. Architectural variety (citadel ramparts, frozen vaults, zero 1-tile grid boxes).
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';

function loadLevel(num) {
  return CAMPAIGN_LEVELS.find(l => String(l.id) === String(num));
}

describe('Levels > Chapter 7 Grand Synthesis & Citadel Trials', () => {
  const l25 = loadLevel(25);
  const l26 = loadLevel(26);
  const l27 = loadLevel(27);
  const l28 = loadLevel(28);

  it('validates all Chapter 7 levels pass LevelValidator with 0 errors and 0 warnings', () => {
    for (const lvl of [l25, l26, l27, l28]) {
      const rep = LevelValidator.validate(lvl);
      assertEqual(rep.valid, true, `Level ${lvl.id} is valid`);
      assertEqual(rep.errors.length, 0, `Level ${lvl.id} has 0 validation errors`);
      assertEqual(rep.warnings.length, 0, `Level ${lvl.id} has 0 validation warnings (zero bypass)`);
      assertEqual(rep.stats.exitReached, true, `Level ${lvl.id} exit is BFS reachable`);
    }
  });

  it('Level 25 (Ki): The Sovereign Rampart introduces high bridge decks and frost rifts', () => {
    const sol = solveLevel(l25);
    assert(sol !== null, 'Level 25 must be solvable');
    assertEqual(sol.length, 32, 'Optimal path is 32 steps');
    assertEqual(l25.parSteps, Math.ceil(32 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without teleporter
    assertEqual(solveLevel(l25, { allowTeleporters: false }), null, 'Level 25 requires traversing frost rift');

    // Unsolvable without azure door
    assertEqual(solveLevel(l25, { allowDoors: false }), null, 'Level 25 requires unlocking azure sigil gate');

    // Unsolvable without azure key
    const noKey = JSON.parse(JSON.stringify(l25));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 25 requires azure sigil key');
  });

  it('Level 26 (Shō): The Frostfire Conduit develops bridge traversal over sentinels with barrier levers', () => {
    const sol = solveLevel(l26);
    assert(sol !== null, 'Level 26 must be solvable');
    assertEqual(sol.length, 53, 'Optimal path is 53 steps');
    assertEqual(l26.parSteps, Math.ceil(53 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without barrier lever
    assertEqual(solveLevel(l26, { allowLevers: false }), null, 'Level 26 requires toggling frost barrier lever');

    // Unsolvable without ruby door
    assertEqual(solveLevel(l26, { allowDoors: false }), null, 'Level 26 requires unlocking ruby sanctuary gate');

    // Unsolvable without ruby key
    const noKey = JSON.parse(JSON.stringify(l26));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 26 requires ruby key');
  });

  it('Level 27 (Ten): The Prismatic Bastion twists mechanics with cipher gates and aerial vortex warp', () => {
    const sol = solveLevel(l27);
    assert(sol !== null, 'Level 27 must be solvable');
    assertEqual(sol.length, 26, 'Optimal path is 26 steps');
    assertEqual(l27.parSteps, Math.ceil(26 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without cipher gate
    assertEqual(solveLevel(l27, { allowPuzzles: false }), null, 'Level 27 requires solving cipher gate');

    // Unsolvable without teleporter
    assertEqual(solveLevel(l27, { allowTeleporters: false }), null, 'Level 27 requires aerial vortex');

    // Unsolvable without golden door
    assertEqual(solveLevel(l27, { allowDoors: false }), null, 'Level 27 requires golden gate');
  });

  it("Level 28 (Ketsu): The Sovereign's Ascent synthesizes ramparts, sentinels, rune seals, and checkpoint", () => {
    const sol = solveLevel(l28);
    assert(sol !== null, 'Level 28 must be solvable');
    assertEqual(sol.length, 47, 'Optimal path is 47 steps');
    assertEqual(l28.parSteps, Math.ceil(47 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without rune gate
    assertEqual(solveLevel(l28, { allowPuzzles: false }), null, 'Level 28 requires solving sovereign rune seal');

    // Unsolvable without lever
    assertEqual(solveLevel(l28, { allowLevers: false }), null, 'Level 28 requires toggling crypt lever');

    // Unsolvable without golden door
    assertEqual(solveLevel(l28, { allowDoors: false }), null, 'Level 28 requires golden apex gate');

    // Unsolvable without golden key
    const noKey = JSON.parse(JSON.stringify(l28));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 28 requires golden key');
  });
});
