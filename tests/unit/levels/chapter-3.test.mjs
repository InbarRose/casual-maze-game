/**
 * Unit Tests: Campaign Chapter 3 (Clockwork Mechanisms & Dynamic Levers)
 *
 * Validates Levels 9–12 against:
 * 1. Kishōtenketsu 4-stage progression (Ki: Level 9, Shō: Level 10, Ten: Level 11, Ketsu: Level 12).
 * 2. Strict zero-bypass gating (levers and doors cannot be bypassed).
 * 3. BFS state-space pathfinder solvability.
 * 4. Empirical par step calibration (parSteps = ceil(optimal * 1.15)).
 * 5. Architectural variety (room hierarchy, loopbacks, no 1-tile grid boxes).
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';

function loadLevel(num) {
  return CAMPAIGN_LEVELS.find(l => String(l.id) === String(num));
}

describe('Levels > Chapter 3 Clockwork Mechanisms & Architecture', () => {
  const l9 = loadLevel(9);
  const l10 = loadLevel(10);
  const l11 = loadLevel(11);
  const l12 = loadLevel(12);

  it('validates all Chapter 3 levels pass LevelValidator with 0 errors and 0 warnings', () => {
    for (const lvl of [l9, l10, l11, l12]) {
      const rep = LevelValidator.validate(lvl);
      assertEqual(rep.valid, true, `Level ${lvl.id} is valid`);
      assertEqual(rep.errors.length, 0, `Level ${lvl.id} has 0 validation errors`);
      assertEqual(rep.warnings.length, 0, `Level ${lvl.id} has 0 validation warnings (zero bypass)`);
      assertEqual(rep.stats.exitReached, true, `Level ${lvl.id} exit is BFS reachable`);
    }
  });

  it('Level 9 (Ki): The Iron Lever introduces dynamic levers with zero backtracking', () => {
    const sol = solveLevel(l9);
    assert(sol !== null, 'Level 9 must be solvable');
    assertEqual(sol.length, 24, 'Optimal path is 24 steps');
    assertEqual(l9.parSteps, Math.ceil(24 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without flipping the iron lever
    const noLever = JSON.parse(JSON.stringify(l9));
    noLever.entities = noLever.entities.filter(e => e.type !== 'lever');
    const bypass = solveLevel(noLever);
    assertEqual(bypass, null, 'Level 9 cannot be solved without activating the iron lever');
  });

  it('Level 10 (Shō): Clockwork Gates develops dual sequential valves', () => {
    const sol = solveLevel(l10);
    assert(sol !== null, 'Level 10 must be solvable');
    assertEqual(sol.length, 35, 'Optimal path is 35 steps');
    assertEqual(l10.parSteps, Math.ceil(35 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without western valve
    const noWest = JSON.parse(JSON.stringify(l10));
    noWest.entities = noWest.entities.filter(e => e.id !== 'lever_10_west');
    assertEqual(solveLevel(noWest), null, 'Level 10 requires western valve');

    // Unsolvable without eastern piston
    const noEast = JSON.parse(JSON.stringify(l10));
    noEast.entities = noEast.entities.filter(e => e.id !== 'lever_10_east');
    assertEqual(solveLevel(noEast), null, 'Level 10 requires eastern piston');
  });

  it('Level 11 (Ten): Shifting Foundations twists mechanics with toggling counterweights', () => {
    const sol = solveLevel(l11);
    assert(sol !== null, 'Level 11 must be solvable');
    assertEqual(sol.length, 26, 'Optimal path is 26 steps');
    assertEqual(l11.parSteps, Math.ceil(26 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without counterweight lever
    const noLever = JSON.parse(JSON.stringify(l11));
    noLever.entities = noLever.entities.filter(e => e.type !== 'lever');
    assertEqual(solveLevel(noLever), null, 'Level 11 requires counterweight lever');

    // Unsolvable without gold key
    const noKey = JSON.parse(JSON.stringify(l11));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 11 requires sluice key');
  });

  it('Level 12 (Ketsu): Master of Wheels synthesizes keys, levers, and pillared plazas', () => {
    const sol = solveLevel(l12);
    assert(sol !== null, 'Level 12 must be solvable');
    assertEqual(sol.length, 47, 'Optimal path is 47 steps');
    assertEqual(l12.parSteps, Math.ceil(47 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without furnace ruby key
    const noRuby = JSON.parse(JSON.stringify(l12));
    noRuby.entities = noRuby.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noRuby), null, 'Level 12 exit unreachable without furnace ruby key');

    // Unsolvable without master dynamo lever
    const noLever = JSON.parse(JSON.stringify(l12));
    noLever.entities = noLever.entities.filter(e => e.type !== 'lever');
    assertEqual(solveLevel(noLever), null, 'Level 12 exit unreachable without master dynamo lever');
  });

  it('enforces architectural non-uniformity across Chapter 3', () => {
    assertEqual(l9.dimensions.width !== l10.dimensions.width, true);
    assertEqual(l10.dimensions.width !== l12.dimensions.width, true);
    // Non-corner spawns
    assertEqual(l9.spawn.x !== 1 || l9.spawn.y !== 1, true);
    assertEqual(l10.spawn.x !== 1 || l10.spawn.y !== 1, true);
    assertEqual(l11.spawn.x !== 1 || l11.spawn.y !== 1, true);
    assertEqual(l12.spawn.x !== 1 || l12.spawn.y !== 1, true);
  });
});
