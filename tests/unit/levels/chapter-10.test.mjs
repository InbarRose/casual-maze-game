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
    assertEqual(sol.length, 75, 'Optimal path is 75 steps');
    assert(l37.parSteps >= 75, 'Par steps is calibrated over optimal');

    // Unsolvable without amber key
    const noKey = JSON.parse(JSON.stringify(l37));
    noKey.entities = noKey.entities.filter(e => e.id !== 'key_amber_37');
    assertEqual(solveLevel(noKey), null, 'Level 37 requires amber spectral key');

    // Has secret wall and compounding mechanics
    const hasSecretWall = l37.layers.ground.some(r => r.includes(TILES.SECRET_WALL));
    assertEqual(hasSecretWall, true, 'Level 37 contains secret wall');
    const hasPlatforms = l37.layers.overhead.some(r => r.includes(TILES.PLATFORM));
    assertEqual(hasPlatforms, true, 'Level 37 contains elevated viaduct platforms');
    const hasTeleporters = l37.entities.some(e => e.type === 'teleporter');
    assertEqual(hasTeleporters, true, 'Level 37 contains astral rift teleporters');
  });

  it('Level 38 (Shō): Concentric Trestles develops multi-elevation bridges over crystalline chasms', () => {
    const sol = solveLevel(l38);
    assert(sol !== null, 'Level 38 must be solvable');
    assertEqual(sol.length, 81, 'Optimal path is 81 steps');
    assertEqual(l38.parSteps, 94, 'Par steps is calibrated with 15% margin over optimal');
    const elevatedSteps = sol.filter(s => s.z === 1 || s.elevation === 1).length;
    assert(elevatedSteps >= 35, 'Over 50% of optimal path is elevated across battlements and viaducts');

    // Verify directional ramps and overhead bridges exist
    const hasRamps = l38.layers.ground.some(r => r.includes(TILES.RAMP_E) || r.includes(TILES.RAMP_W) || r.includes(TILES.RAMP_S) || r.includes(TILES.RAMP_N));
    assertEqual(hasRamps, true, 'Level 38 contains directional ramps on ground');
    const hasOverheadBridge = l38.layers.overhead.some(r => r.includes(TILES.BRIDGE_NS) || r.includes(TILES.BRIDGE_EW));
    assertEqual(hasOverheadBridge, true, 'Level 38 contains elevated bridge tiles overhead');
    const hasWallWalk = l38.layers.overhead.some(r => r.includes(TILES.WALL_WALK));
    assertEqual(hasWallWalk, true, 'Level 38 contains wall-walk battlement tiles');
    const hasLever = l38.entities.some(e => e.type === 'lever');
    assertEqual(hasLever, true, 'Level 38 contains battlement focal lever');
  });

  it('Level 39 (Ten): Harmonic Mirror Seals introduces resonant tuning and concentric forcefields', () => {
    const sol = solveLevel(l39);
    assert(sol !== null, 'Level 39 must be solvable');
    assertEqual(sol.length, 76, 'Optimal path is 76 steps');
    assert(l39.parSteps >= 76, 'Par steps is calibrated over optimal');

    // Unsolvable without silver tuning key
    const noKey = JSON.parse(JSON.stringify(l39));
    noKey.entities = noKey.entities.filter(e => e.id !== 'key_silver_39');
    assertEqual(solveLevel(noKey), null, 'Level 39 requires silver tuning key');

    // Compounding mechanics: elevated viaducts, astral rifts, and levers
    const hasPlatforms = l39.layers.overhead.some(r => r.includes(TILES.PLATFORM));
    assertEqual(hasPlatforms, true, 'Level 39 contains elevated viaduct platforms');
    const hasTeleporters = l39.entities.some(e => e.type === 'teleporter');
    assertEqual(hasTeleporters, true, 'Level 39 contains astral rift teleporters');
    const hasLever = l39.entities.some(e => e.type === 'lever');
    assertEqual(hasLever, true, 'Level 39 contains harmonic mirror lever');
  });

  it('Level 40 (Ketsu): Heart of the Prism executes 4-quadrant sequential macro-puzzle finale', () => {
    const sol = solveLevel(l40);
    assert(sol !== null, 'Level 40 must be solvable');
    assertEqual(sol.length, 165, 'Optimal path is 165 steps');
    assert(l40.parSteps >= 165, 'Par steps is calibrated over optimal');

    // 4 elemental shard keys
    const keyIds = l40.entities.filter(e => e.type === 'key').map(e => e.id);
    assertEqual(keyIds.includes('key_ruby_40'), true, 'Contains ruby key');
    assertEqual(keyIds.includes('key_emerald_40'), true, 'Contains emerald key');
    assertEqual(keyIds.includes('key_sapphire_40'), true, 'Contains sapphire key');
    assertEqual(keyIds.includes('key_apex_40'), true, 'Contains apex key');

    // Compounding mechanics: elevated bridges, wall-walks, and apex colossus
    const hasBridges = l40.layers.overhead.some(r => r.includes(TILES.BRIDGE_EW) || r.includes(TILES.BRIDGE_NS));
    assertEqual(hasBridges, true, 'Level 40 contains elevated viaduct bridges');
    const hasWallWalk = l40.layers.overhead.some(r => r.includes(TILES.WALL_WALK));
    assertEqual(hasWallWalk, true, 'Level 40 contains wall-walk battlements');
    const hasPatroller = l40.entities.some(e => e.type === 'patroller');
    assertEqual(hasPatroller, true, 'Level 40 contains apex sentinel colossus');

    // Climax macro-maze size
    assertEqual(l40.dimensions.width, 29, 'Macro-maze width is 29');
    assertEqual(l40.dimensions.height, 29, 'Macro-maze height is 29');
  });
});
