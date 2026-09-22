/**
 * Unit Tests: Campaign Chapter 5 (Perilous Hazards & Obsidian Sentinels)
 *
 * Validates Levels 17–20 against:
 * 1. Kishōtenketsu 4-stage progression (Ki: Level 17, Shō: Level 18, Ten: Level 19, Ketsu: Level 20).
 * 2. Strict zero-bypass gating (doors and keys cannot be bypassed).
 * 3. BFS state-space pathfinder solvability.
 * 4. Empirical par step calibration (parSteps = ceil(optimal * 1.15)).
 * 5. Architectural variety (caldera halls, basalt pillars, safe harbor alcoves, zero 1-tile grid boxes).
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';

function loadLevel(num) {
  return CAMPAIGN_LEVELS.find(l => String(l.id) === String(num));
}

describe('Levels > Chapter 5 Perilous Hazards & Obsidian Sentinels', () => {
  const l17 = loadLevel(17);
  const l18 = loadLevel(18);
  const l19 = loadLevel(19);
  const l20 = loadLevel(20);

  it('validates all Chapter 5 levels pass LevelValidator with 0 errors and 0 warnings', () => {
    for (const lvl of [l17, l18, l19, l20]) {
      const rep = LevelValidator.validate(lvl);
      assertEqual(rep.valid, true, `Level ${lvl.id} is valid`);
      assertEqual(rep.errors.length, 0, `Level ${lvl.id} has 0 validation errors`);
      assertEqual(rep.warnings.length, 0, `Level ${lvl.id} has 0 validation warnings (zero bypass)`);
      assertEqual(rep.stats.exitReached, true, `Level ${lvl.id} exit is BFS reachable`);
    }
  });

  it('Level 17 (Ki): The Fire Vents introduces rhythmic magma vents and safe harbors', () => {
    const sol = solveLevel(l17);
    assert(sol !== null, 'Level 17 must be solvable');
    assertEqual(sol.length, 19, 'Optimal path is 19 steps');
    assertEqual(l17.parSteps, Math.ceil(19 * 1.15), 'Par steps calibrated with 15% margin');

    // Verify hazard entities present
    const hazards = l17.entities.filter(e => e.type === 'hazard');
    assertEqual(hazards.length >= 2, true, 'Level 17 includes multiple flame vent hazards');
  });

  it('Level 18 (Shō): The Molten Sentinels develops moving sentinels and evasion loops', () => {
    const sol = solveLevel(l18);
    assert(sol !== null, 'Level 18 must be solvable');
    assertEqual(sol.length, 30, 'Optimal path is 30 steps');
    assertEqual(l18.parSteps, Math.ceil(30 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without door
    assertEqual(solveLevel(l18, { allowDoors: false }), null, 'Level 18 requires unlocking foundry gate');

    // Unsolvable without key
    const noKey = JSON.parse(JSON.stringify(l18));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 18 requires basalt foundry key');

    // Verify patroller entity present
    const patroller = l18.entities.find(e => e.type === 'patroller');
    assert(patroller !== undefined, 'Level 18 includes a molten sentinel patroller');
  });

  it('Level 19 (Ten): The Crucible Crossing twists mechanics with combined hazards and checkpoint', () => {
    const sol = solveLevel(l19);
    assert(sol !== null, 'Level 19 must be solvable');
    assertEqual(sol.length, 25, 'Optimal path is 25 steps');
    assertEqual(l19.parSteps, Math.ceil(25 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without door
    assertEqual(solveLevel(l19, { allowDoors: false }), null, 'Level 19 requires unlocking silver seal');

    // Unsolvable without key
    const noKey = JSON.parse(JSON.stringify(l19));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 19 requires crucible silver key');

    // Verify checkpoint entity present
    const checkpoint = l19.entities.find(e => e.type === 'checkpoint');
    assert(checkpoint !== undefined, 'Level 19 includes a glacial beacon checkpoint');
  });

  it('Level 20 (Ketsu): The Caldera Gauntlet synthesizes dual sentinels, vents, and ruby gate', () => {
    const sol = solveLevel(l20);
    assert(sol !== null, 'Level 20 must be solvable');
    assertEqual(sol.length, 31, 'Optimal path is 31 steps');
    assertEqual(l20.parSteps, Math.ceil(31 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without ruby door
    assertEqual(solveLevel(l20, { allowDoors: false }), null, 'Level 20 requires unlocking apex crucible gate');

    // Unsolvable without ruby key
    const noRuby = JSON.parse(JSON.stringify(l20));
    noRuby.entities = noRuby.entities.filter(e => e.id !== 'key_ruby_20');
    assertEqual(solveLevel(noRuby), null, 'Level 20 requires caldera ruby key');

    // Verify dual sentinels
    const sentinels = l20.entities.filter(e => e.type === 'patroller');
    assertEqual(sentinels.length, 2, 'Level 20 features dual sentinels (North & South)');
  });
});
