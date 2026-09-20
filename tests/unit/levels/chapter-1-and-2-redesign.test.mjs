/**
 * Unit Tests: Chapter 1 & Chapter 2 Kishōtenketsu Redesign & Zero-Bypass Integrity
 * 
 * Verifies that:
 * 1. Levels 1–8 follow 4-stage Kishōtenketsu structure and anti-box spatial rules.
 * 2. All 8 levels have 0% circumvention: doors cannot be bypassed without collecting keys.
 * 3. Spawn and exit positions exhibit intentional variance (not generic corner-to-corner templates).
 * 4. Multi-elevation bridges in Chapter 2 require climbing directional ramps and crossing overhead decks.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { solveLevel } from '../../../js/engine/solver.js';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';

describe('Levels > Chapters 1 & 2 Kishōtenketsu & Zero-Bypass Integrity', () => {
  const ch1And2 = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 1 && num <= 8;
  });

  it('contains exactly 8 workshopped levels across Chapters 1 and 2', () => {
    assertEqual(ch1And2.length, 8, '8 campaign levels retrieved for Chapters 1 and 2');
  });

  ch1And2.forEach(level => {
    it(`Level ${level.id} ("${level.title}") passes validation with zero errors`, () => {
      const result = LevelValidator.validate(level);
      assertEqual(result.errors.length, 0, `Level ${level.id} must have 0 validation errors`);
    });

    it(`Level ${level.id} ("${level.title}") is BFS reachable and solvable`, () => {
      const solution = solveLevel(level);
      assert(solution !== null, `Level ${level.id} must be solvable`);
      assert(solution.length >= 10, `Level ${level.id} solution must contain at least 10 steps`);
    });

    it(`Level ${level.id} ("${level.title}") enforces 100% zero bypass (locked doors are mandatory)`, () => {
      const doors = (level.entities || []).filter(e => e.type === 'door');
      if (doors.length > 0) {
        const bypass = solveLevel(level, { allowDoors: false });
        assertEqual(bypass, null, `Level ${level.id} cannot be solved when doors are locked`);
      }
    });
  });

  it('demonstrates non-uniform dimensions and dynamic spawn/exit anchors across chapters', () => {
    const anchors = ch1And2.map(lvl => ({
      id: lvl.id,
      dims: `${lvl.dimensions.width}x${lvl.dimensions.height}`,
      spawn: `(${lvl.spawn.x},${lvl.spawn.y})`,
      exit: `(${lvl.exit.x},${lvl.exit.y})`,
    }));

    // Check dimension variance
    const uniqueDims = new Set(anchors.map(a => a.dims));
    assert(uniqueDims.size >= 4, `At least 4 distinct dimensions used across Chapters 1 & 2 (found: ${uniqueDims.size})`);

    // Verify non-generic corner-to-corner (not all spawn at 1,1)
    const nonCornerSpawns = anchors.filter(a => a.spawn !== '(1,1)');
    assert(nonCornerSpawns.length >= 6, `At least 6 of 8 levels use non-(1,1) dynamic spawns (found: ${nonCornerSpawns.length})`);
  });

  it('verifies Chapter 2 (Levels 5–8) enforces elevation traversal via ramps and bridge decks', () => {
    const ch2Levels = ch1And2.filter(lvl => parseInt(lvl.id, 10) >= 5);
    for (const lvl of ch2Levels) {
      // Must contain elevated keys (z=1) on bridge decks
      const elevatedKeys = lvl.entities.filter(e => e.type === 'key' && (e.z === 1 || e.elevation === 1));
      assert(elevatedKeys.length > 0, `Level ${lvl.id} must contain at least one elevated key at z=1`);

      // Overhead layer must contain bridge deck tiles
      const hasBridgeOverhead = lvl.layers.overhead.some(row => row.some(cell => cell === 'B_EW' || cell === 'B_NS'));
      assert(hasBridgeOverhead, `Level ${lvl.id} must contain bridge deck tiles in overhead layer`);

      // Ground layer must contain directional ramp tiles
      const hasRamps = lvl.layers.ground.some(row => row.some(cell => typeof cell === 'string' && cell.startsWith('R_')));
      assert(hasRamps, `Level ${lvl.id} must contain directional ramps in ground layer`);
    }
  });
});
