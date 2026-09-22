/**
 * Unit Tests: Campaign Chapter 8 (The Shifting Monolith & World Rotation)
 *
 * Validates Levels 29–32 against:
 * 1. Kishōtenketsu 4-stage progression (Ki: Level 29, Shō: Level 30, Ten: Level 31, Ketsu: Level 32).
 * 2. Strict zero-bypass gating (doors and keys cannot be bypassed).
 * 3. BFS state-space pathfinder solvability.
 * 4. Empirical par step calibration (parSteps = ceil(optimal * 1.15)).
 * 5. 3D perspective rotation, occluded underpasses, 4-faced monoliths, and branching exits.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';
import { TILES } from '../../../js/core/constants.js';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';

function loadLevel(num) {
  return CAMPAIGN_LEVELS.find(l => String(l.id) === String(num));
}

describe('Levels > Chapter 8 The Shifting Monolith & World Rotation', () => {
  const l29 = loadLevel(29);
  const l30 = loadLevel(30);
  const l31 = loadLevel(31);
  const l32 = loadLevel(32);

  it('validates all Chapter 8 levels pass LevelValidator with 0 errors and 0 warnings', () => {
    for (const lvl of [l29, l30, l31, l32]) {
      const rep = LevelValidator.validate(lvl);
      assertEqual(rep.valid, true, `Level ${lvl.id} is valid`);
      assertEqual(rep.errors.length, 0, `Level ${lvl.id} has 0 validation errors`);
      assertEqual(rep.warnings.length, 0, `Level ${lvl.id} has 0 validation warnings (zero bypass)`);
      assertEqual(rep.stats.exitReached, true, `Level ${lvl.id} exit is BFS reachable`);
    }
  });

  it('Level 29 (Ki): The Cardinal Needle introduces camera rotation and cardinal corridors', () => {
    const sol = solveLevel(l29);
    assert(sol !== null, 'Level 29 must be solvable');
    assertEqual(sol.length, 25, 'Optimal path is 25 steps');
    assertEqual(l29.parSteps, Math.ceil(25 * 1.15), 'Par steps calibrated with 15% margin');

    // Help text teaches Q/R rotation controls
    assert(l29.help.message.includes('[Q] and [R]'), 'Help message teaches Q and R rotation keys');

    // Unsolvable without golden door
    assertEqual(solveLevel(l29, { allowDoors: false }), null, 'Level 29 requires needle sanctum gate');

    // Unsolvable without golden key
    const noKey = JSON.parse(JSON.stringify(l29));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 29 requires golden needle key');
  });

  it('Level 30 (Shō): The Hidden Underpass develops 3D underpasses occluded by overhead bridges', () => {
    const sol = solveLevel(l30);
    assert(sol !== null, 'Level 30 must be solvable');
    assertEqual(sol.length, 25, 'Optimal path is 25 steps');
    assertEqual(l30.parSteps, Math.ceil(25 * 1.15), 'Par steps calibrated with 15% margin');

    // 3D Underpass tile layout
    assertEqual(l30.layers.ground[7][7], TILES.BRIDGE_EW, 'Ground layer has BRIDGE_EW underpass tunnel');
    assertEqual(l30.layers.overhead[7][7], TILES.BRIDGE_NS, 'Overhead layer has BRIDGE_NS bridge deck');

    // Unsolvable without cyan key under the bridge
    const noKey = JSON.parse(JSON.stringify(l30));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 30 requires underpass cyan key');
  });

  it('Level 31 (Ten): The Four-Faced Pillar twists mechanics with 4 cardinal monolith carvings', () => {
    const sol = solveLevel(l31);
    assert(sol !== null, 'Level 31 must be solvable');
    assertEqual(sol.length, 33, 'Optimal path is 33 steps');
    assertEqual(l31.parSteps, Math.ceil(33 * 1.15), 'Par steps calibrated with 15% margin');

    // Cardinal carvings around the central monument
    const carvings = l31.entities.filter(e => e.type === 'wall_decor' && e.decorType === 'carving');
    assertEqual(carvings.length, 4, '4 carvings facing cardinal compass directions');
    const facings = new Set(carvings.map(c => c.facing));
    assert(facings.has('north') && facings.has('east') && facings.has('south') && facings.has('west'), 'All 4 facings present');

    // Unsolvable without door
    assertEqual(solveLevel(l31, { allowDoors: false }), null, 'Level 31 requires four winds gate');
  });

  it('Level 32 (Ketsu): The Prismatic Spire synthesizes full campaign with branching exits contract', () => {
    const sol = solveLevel(l32);
    assert(sol !== null, 'Level 32 must be solvable');
    assertEqual(sol.length, 29, 'Optimal path is 29 steps');
    assertEqual(l32.parSteps, Math.ceil(29 * 1.15), 'Par steps calibrated with 15% margin');

    // Branching exits contract
    assert(Array.isArray(l32.exits), 'Level 32 has exits array');
    assertEqual(l32.exits.length, 2, 'Level 32 has 2 branching exits');
    const primaryExit = l32.exits.find(e => e.id === 'exit_spire_primary');
    assertEqual(primaryExit.targetLevel, '1', 'Primary victory exit loops to Level 1');
    const branchExit = l32.exits.find(e => e.id === 'exit_spire_citadel_branch');
    assertEqual(branchExit.targetLevel, 'story_citadel_1', 'Branch exit targets Whispering Citadel');

    // Unsolvable without crown door
    assertEqual(solveLevel(l32, { allowDoors: false }), null, 'Level 32 requires crown gate');
  });
});
