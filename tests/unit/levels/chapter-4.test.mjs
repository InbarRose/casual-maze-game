/**
 * Unit Tests: Campaign Chapter 4 (Astral Rifts & Teleporters)
 *
 * Validates Levels 13–16 against:
 * 1. Kishōtenketsu 4-stage progression (Ki: Level 13, Shō: Level 14, Ten: Level 15, Ketsu: Level 16).
 * 2. Strict zero-bypass gating (teleporters and doors cannot be bypassed).
 * 3. BFS state-space pathfinder solvability.
 * 4. Empirical par step calibration (parSteps = ceil(optimal * 1.15)).
 * 5. Architectural variety (room hierarchy, astral pillars, zero 1-tile grid boxes).
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

function loadLevel(num) {
  const filePath = path.join(rootDir, 'levels', 'chapter_4', `level_${num}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('Levels > Chapter 4 Astral Rifts & Teleporters', () => {
  const l13 = loadLevel(13);
  const l14 = loadLevel(14);
  const l15 = loadLevel(15);
  const l16 = loadLevel(16);

  it('validates all Chapter 4 levels pass LevelValidator with 0 errors and 0 warnings', () => {
    for (const lvl of [l13, l14, l15, l16]) {
      const rep = LevelValidator.validate(lvl);
      assertEqual(rep.valid, true, `Level ${lvl.id} is valid`);
      assertEqual(rep.errors.length, 0, `Level ${lvl.id} has 0 validation errors`);
      assertEqual(rep.warnings.length, 0, `Level ${lvl.id} has 0 validation warnings (zero bypass)`);
      assertEqual(rep.stats.exitReached, true, `Level ${lvl.id} exit is BFS reachable`);
    }
  });

  it('Level 13 (Ki): The First Rift introduces spatial warping between disconnected halls', () => {
    const sol = solveLevel(l13);
    assert(sol !== null, 'Level 13 must be solvable');
    assertEqual(sol.length, 14, 'Optimal path is 14 steps');
    assertEqual(l13.parSteps, Math.ceil(14 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without teleporter
    const bypass = solveLevel(l13, { allowTeleporters: false });
    assertEqual(bypass, null, 'Level 13 cannot be solved without traversing the astral rift');
  });

  it('Level 14 (Shō): Twinned Portals develops paired Alpha/Beta spires with return loop', () => {
    const sol = solveLevel(l14);
    assert(sol !== null, 'Level 14 must be solvable');
    assertEqual(sol.length, 37, 'Optimal path is 37 steps');
    assertEqual(l14.parSteps, Math.ceil(37 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without teleporters
    assertEqual(solveLevel(l14, { allowTeleporters: false }), null, 'Level 14 requires teleporters to cross spires');

    // Unsolvable without door
    assertEqual(solveLevel(l14, { allowDoors: false }), null, 'Level 14 requires unlocking azure door');

    // Unsolvable without key
    const noKey = JSON.parse(JSON.stringify(l14));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 14 requires azure key');
  });

  it('Level 15 (Ten): Dimensional Warp twists mechanics with elevation-shifting rifts', () => {
    const sol = solveLevel(l15);
    assert(sol !== null, 'Level 15 must be solvable');
    assertEqual(sol.length, 26, 'Optimal path is 26 steps');
    assertEqual(l15.parSteps, Math.ceil(26 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without teleporter
    assertEqual(solveLevel(l15, { allowTeleporters: false }), null, 'Level 15 requires elevation warp');

    // Unsolvable without gold door
    assertEqual(solveLevel(l15, { allowDoors: false }), null, 'Level 15 requires unlocking gold door');
  });

  it('Level 16 (Ketsu): The Astral Nexus synthesizes multi-realm rifts and sequential seals', () => {
    const sol = solveLevel(l16);
    assert(sol !== null, 'Level 16 must be solvable');
    assertEqual(sol.length, 33, 'Optimal path is 33 steps');
    assertEqual(l16.parSteps, Math.ceil(33 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without teleporters
    assertEqual(solveLevel(l16, { allowTeleporters: false }), null, 'Level 16 requires teleporters');

    // Unsolvable without ruby key
    const noRuby = JSON.parse(JSON.stringify(l16));
    noRuby.entities = noRuby.entities.filter(e => e.id !== 'key_ruby_16');
    assertEqual(solveLevel(noRuby), null, 'Level 16 requires ruby key');

    // Unsolvable without sapphire key
    const noSapphire = JSON.parse(JSON.stringify(l16));
    noSapphire.entities = noSapphire.entities.filter(e => e.id !== 'key_sapphire_16');
    assertEqual(solveLevel(noSapphire), null, 'Level 16 requires sapphire key');
  });
});
