/**
 * Unit Tests: Campaign Chapter 10 (The Prismatic Labyrinth) (BL-129, ADR-0035)
 *
 * Validates Levels 37–40 against:
 * 1. Kishōtenketsu 4-stage progression (Ki: Level 37, Shō: Level 38, Ten: Level 39, Ketsu: Level 40).
 * 2. Strict zero-bypass gating (doors and keys cannot be bypassed).
 * 3. BFS state-space pathfinder solvability.
 * 4. Empirical par step calibration.
 * 5. Refraction barriers, multi-elevation crystal trestles, and sequential 4-quadrant apex gates.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';
import { TILES } from '../../../js/core/constants.js';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';

function loadLevel(num) {
  return CAMPAIGN_LEVELS.find(l => String(l.id) === String(num));
}

describe('Levels > Chapter 10 The Prismatic Labyrinth (BL-129)', () => {
  const l37 = loadLevel(37);
  const l38 = loadLevel(38);
  const l39 = loadLevel(39);
  const l40 = loadLevel(40);

  it('validates all Chapter 10 levels pass LevelValidator with 0 errors and 0 warnings', () => {
    for (const lvl of [l37, l38, l39, l40]) {
      assert(lvl !== undefined, `Level ${lvl?.id || 'unknown'} must exist in CAMPAIGN_LEVELS`);
      const rep = LevelValidator.validate(lvl);
      assertEqual(rep.valid, true, `Level ${lvl.id} is valid`);
      assertEqual(rep.errors.length, 0, `Level ${lvl.id} has 0 validation errors`);
      assertEqual(rep.warnings.length, 0, `Level ${lvl.id} has 0 validation warnings (zero bypass)`);
      assertEqual(rep.stats.exitReached, true, `Level ${lvl.id} exit is BFS reachable`);
    }
  });

  it('Level 37 (Ki): The Spectral Gate introduces chromatic keys and bottleneck spectral barriers', () => {
    const sol = solveLevel(l37);
    assert(sol !== null, 'Level 37 must be solvable');
    assertEqual(sol.length, 69, 'Optimal path is 69 steps');
    assert(l37.parSteps >= 69, 'Par steps is calibrated over optimal');

    // Unsolvable without amber key
    const noKey = JSON.parse(JSON.stringify(l37));
    noKey.entities = noKey.entities.filter(e => e.id !== 'key_amber_37');
    assertEqual(solveLevel(noKey), null, 'Level 37 requires amber spectral key');

    // Has secret wall
    const hasSecretWall = l37.layers.ground.some(r => r.includes(TILES.SECRET_WALL));
    assertEqual(hasSecretWall, true, 'Level 37 contains secret wall');
  });

  it('Level 38 (Shō): Concentric Trestles develops multi-elevation bridges over crystalline chasms', () => {
    const sol = solveLevel(l38);
    assert(sol !== null, 'Level 38 must be solvable');
    assertEqual(sol.length, 95, 'Optimal path is 95 steps');
    assert(l38.parSteps >= 95, 'Par steps is calibrated over optimal');

    // Verify directional ramps and overhead bridges exist
    const hasRamps = l38.layers.ground.some(r => r.includes(TILES.RAMP_E) || r.includes(TILES.RAMP_W));
    assertEqual(hasRamps, true, 'Level 38 contains directional ramps on ground');
    const hasOverheadBridge = l38.layers.overhead.some(r => r.includes(TILES.BRIDGE_NS));
    assertEqual(hasOverheadBridge, true, 'Level 38 contains elevated bridge tiles overhead');
  });

  it('Level 39 (Ten): Harmonic Mirror Seals introduces resonant tuning and concentric forcefields', () => {
    const sol = solveLevel(l39);
    assert(sol !== null, 'Level 39 must be solvable');
    assertEqual(sol.length, 37, 'Optimal path is 37 steps');
    assert(l39.parSteps >= 37, 'Par steps is calibrated over optimal');

    // Unsolvable without silver tuning key
    const noKey = JSON.parse(JSON.stringify(l39));
    noKey.entities = noKey.entities.filter(e => e.id !== 'key_silver_39');
    assertEqual(solveLevel(noKey), null, 'Level 39 requires silver tuning key');
  });

  it('Level 40 (Ketsu): Heart of the Prism executes 4-quadrant sequential macro-puzzle finale', () => {
    const sol = solveLevel(l40);
    assert(sol !== null, 'Level 40 must be solvable');
    assertEqual(sol.length, 154, 'Optimal path is 154 steps');
    assert(l40.parSteps >= 154, 'Par steps is calibrated over optimal');

    // 4 elemental shard keys
    const keyIds = l40.entities.filter(e => e.type === 'key').map(e => e.id);
    assertEqual(keyIds.includes('key_ruby_40'), true, 'Contains ruby key');
    assertEqual(keyIds.includes('key_emerald_40'), true, 'Contains emerald key');
    assertEqual(keyIds.includes('key_sapphire_40'), true, 'Contains sapphire key');
    assertEqual(keyIds.includes('key_apex_40'), true, 'Contains apex key');

    // Climax macro-maze size
    assertEqual(l40.dimensions.width, 29, 'Macro-maze width is 29');
    assertEqual(l40.dimensions.height, 29, 'Macro-maze height is 29');
  });
});
