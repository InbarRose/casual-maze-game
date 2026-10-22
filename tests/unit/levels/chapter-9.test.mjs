/**
 * Unit Tests: Campaign Chapter 9 (The Sunken Aqueducts) (BL-128, ADR-0035)
 *
 * Validates Levels 33–36 against:
 * 1. Kishōtenketsu 4-stage progression (Ki: Level 33, Shō: Level 34, Ten: Level 35, Ketsu: Level 36).
 * 2. Strict zero-bypass gating (doors and keys cannot be bypassed).
 * 3. BFS state-space pathfinder solvability.
 * 4. Empirical par step calibration (parSteps = ceil(optimal * 1.15)).
 * 5. Multi-elevation bridges over flooded canals, timed flow hazard channels, and dual sluice seals.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';
import { TILES } from '../../../js/core/constants.js';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';

function loadLevel(num) {
  return CAMPAIGN_LEVELS.find(l => String(l.id) === String(num));
}

describe('Levels > Chapter 9 The Sunken Aqueducts (BL-128)', () => {
  const l33 = loadLevel(33);
  const l34 = loadLevel(34);
  const l35 = loadLevel(35);
  const l36 = loadLevel(36);

  it('validates all Chapter 9 levels pass LevelValidator with 0 errors and 0 warnings', () => {
    for (const lvl of [l33, l34, l35, l36]) {
      assert(lvl !== undefined, `Level ${lvl?.id || 'unknown'} must exist in CAMPAIGN_LEVELS`);
      const rep = LevelValidator.validate(lvl);
      assertEqual(rep.valid, true, `Level ${lvl.id} is valid`);
      assertEqual(rep.errors.length, 0, `Level ${lvl.id} has 0 validation errors`);
      assertEqual(rep.warnings.length, 0, `Level ${lvl.id} has 0 validation warnings (zero bypass)`);
      assertEqual(rep.stats.exitReached, true, `Level ${lvl.id} exit is BFS reachable`);
    }
  });

  it('Level 33 (Ki): The Sluice Gate introduces aqueduct flumes and central watergate', () => {
    const sol = solveLevel(l33);
    assert(sol !== null, 'Level 33 must be solvable');
    assertEqual(sol.length, 53, 'Optimal path is 53 steps');
    assertEqual(l33.parSteps, Math.ceil(53 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without key
    const noKey = JSON.parse(JSON.stringify(l33));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 33 requires bronze sluice key');

    // Unsolvable without door passage
    assertEqual(solveLevel(l33, { allowDoors: false }), null, 'Level 33 requires central sluice gate unlock');
  });

  it('Level 34 (Shō): Submerged Crossings develops multi-elevation bridges over flooded canals', () => {
    const sol = solveLevel(l34);
    assert(sol !== null, 'Level 34 must be solvable');
    assertEqual(sol.length, 63, 'Optimal path is 63 steps');
    assertEqual(l34.parSteps, Math.ceil(63 * 1.15), 'Par steps calibrated with 15% margin');

    // 3D Bridge & Canal underpass tiles
    assertEqual(l34.layers.ground[5][8], TILES.BRIDGE_NS, 'Ground layer has BRIDGE_NS canal underpass');
    assertEqual(l34.layers.overhead[5][8], TILES.BRIDGE_EW, 'Overhead layer has BRIDGE_EW bridge deck');

    // Verify elevated bridge traversal is included in solution path
    const hasBridgeStep = sol.some(s => s.elevation === 1 && s.y === 5 && s.x >= 5 && s.x <= 11);
    assert(hasBridgeStep, 'Level 34 solution path traverses the elevated bridge deck at Z=1');

    // Unsolvable without canal key
    const noKey = JSON.parse(JSON.stringify(l34));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 34 requires canal pressure key');
  });

  it('Level 35 (Ten): The Pressure Basin introduces timed hazards and secret chambers', () => {
    const sol = solveLevel(l35);
    assert(sol !== null, 'Level 35 must be solvable');
    assertEqual(sol.length, 79, 'Optimal path is 79 steps');
    assertEqual(l35.parSteps, Math.ceil(79 * 1.15), 'Par steps calibrated with 15% margin');

    // Secret wall presence
    assertEqual(l35.layers.ground[15][1], TILES.SECRET_WALL, 'Ground layer has SECRET_WALL concealing relic');

    // Timed hazard entity
    const hazard = l35.entities.find(e => e.type === 'timed_hazard');
    assert(hazard !== undefined, 'Timed hazard exists in pressure basin');

    // Unsolvable without basin key
    const noKey = JSON.parse(JSON.stringify(l35));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 35 requires pressure basin key');
  });

  it('Level 36 (Ketsu): Grand Aqueduct Reservoir culimates in dual-key multi-layer progression', () => {
    const sol = solveLevel(l36);
    assert(sol !== null, 'Level 36 must be solvable');
    assertEqual(sol.length, 107, 'Optimal path is 107 steps');
    assertEqual(l36.parSteps, Math.ceil(107 * 1.15), 'Par steps calibrated with 15% margin');

    // Requires both keys (cyan and amethyst)
    const noCyan = JSON.parse(JSON.stringify(l36));
    noCyan.entities = noCyan.entities.filter(e => e.id !== 'key_cyan_36');
    assertEqual(solveLevel(noCyan), null, 'Level 36 requires cyan key');

    const noAmethyst = JSON.parse(JSON.stringify(l36));
    noAmethyst.entities = noAmethyst.entities.filter(e => e.id !== 'key_amethyst_36');
    assertEqual(solveLevel(noAmethyst), null, 'Level 36 requires amethyst key');
  });
});
