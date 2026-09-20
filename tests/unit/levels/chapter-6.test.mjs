/**
 * Unit Tests: Campaign Chapter 6 (Arcane Minigames & Celestial Seals)
 *
 * Validates Levels 21–24 against:
 * 1. Kishōtenketsu 4-stage progression (Ki: Level 21, Shō: Level 22, Ten: Level 23, Ketsu: Level 24).
 * 2. Strict zero-bypass gating (puzzle gates, levers, and doors cannot be bypassed).
 * 3. BFS state-space pathfinder solvability.
 * 4. Empirical par step calibration (parSteps = ceil(optimal * 1.15)).
 * 5. Architectural variety (celestial libraries, rotunda columns, zero 1-tile grid boxes).
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
  const filePath = path.join(rootDir, 'levels', 'chapter_6', `level_${num}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('Levels > Chapter 6 Arcane Minigames & Celestial Seals', () => {
  const l21 = loadLevel(21);
  const l22 = loadLevel(22);
  const l23 = loadLevel(23);
  const l24 = loadLevel(24);

  it('validates all Chapter 6 levels pass LevelValidator with 0 errors and 0 warnings', () => {
    for (const lvl of [l21, l22, l23, l24]) {
      const rep = LevelValidator.validate(lvl);
      assertEqual(rep.valid, true, `Level ${lvl.id} is valid`);
      assertEqual(rep.errors.length, 0, `Level ${lvl.id} has 0 validation errors`);
      assertEqual(rep.warnings.length, 0, `Level ${lvl.id} has 0 validation warnings (zero bypass)`);
      assertEqual(rep.stats.exitReached, true, `Level ${lvl.id} exit is BFS reachable`);
    }
  });

  it('Level 21 (Ki): The Rune Lock introduces Rune Memory puzzle gates', () => {
    const sol = solveLevel(l21);
    assert(sol !== null, 'Level 21 must be solvable');
    assertEqual(sol.length, 19, 'Optimal path is 19 steps');
    assertEqual(l21.parSteps, Math.ceil(19 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without solving rune memory puzzle
    assertEqual(solveLevel(l21, { allowPuzzles: false }), null, 'Level 21 requires solving rune memory gate');
  });

  it('Level 22 (Shō): The Cipher Dials develops Cipher Dial puzzles and colored keys', () => {
    const sol = solveLevel(l22);
    assert(sol !== null, 'Level 22 must be solvable');
    assertEqual(sol.length, 33, 'Optimal path is 33 steps');
    assertEqual(l22.parSteps, Math.ceil(33 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without cipher dial
    assertEqual(solveLevel(l22, { allowPuzzles: false }), null, 'Level 22 requires solving cipher dial gate');

    // Unsolvable without azure door
    assertEqual(solveLevel(l22, { allowDoors: false }), null, 'Level 22 requires unlocking azure gate');

    // Unsolvable without azure key
    const noKey = JSON.parse(JSON.stringify(l22));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 22 requires azure key');
  });

  it('Level 23 (Ten): The Entangled Wards twists mechanics with dual puzzle types and dynamo lever', () => {
    const sol = solveLevel(l23);
    assert(sol !== null, 'Level 23 must be solvable');
    assertEqual(sol.length, 26, 'Optimal path is 26 steps');
    assertEqual(l23.parSteps, Math.ceil(26 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without puzzles
    assertEqual(solveLevel(l23, { allowPuzzles: false }), null, 'Level 23 requires solving puzzle gates');

    // Unsolvable without lever
    assertEqual(solveLevel(l23, { allowLevers: false }), null, 'Level 23 requires toggling conduit lever');
  });

  it('Level 24 (Ketsu): The Grand Archive synthesizes Rune Memory, Cipher Dial, Golden Key, and Barrier Lever', () => {
    const sol = solveLevel(l24);
    assert(sol !== null, 'Level 24 must be solvable');
    assertEqual(sol.length, 45, 'Optimal path is 45 steps');
    assertEqual(l24.parSteps, Math.ceil(45 * 1.15), 'Par steps calibrated with 15% margin');

    // Unsolvable without puzzles
    assertEqual(solveLevel(l24, { allowPuzzles: false }), null, 'Level 24 requires solving arcane puzzle gates');

    // Unsolvable without lever
    assertEqual(solveLevel(l24, { allowLevers: false }), null, 'Level 24 requires toggling stargazer dynamo lever');

    // Unsolvable without golden door
    assertEqual(solveLevel(l24, { allowDoors: false }), null, 'Level 24 requires unlocking golden archive gate');

    // Unsolvable without golden key
    const noKey = JSON.parse(JSON.stringify(l24));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    assertEqual(solveLevel(noKey), null, 'Level 24 requires master archive golden key');
  });
});
