/**
 * Unit Tests: Campaign Levels Solvability & Validation
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';

describe('Levels > Campaign Levels Solvability', () => {
  CAMPAIGN_LEVELS.forEach((level, idx) => {
    const levelNum = idx + 1;
    it(`validates Campaign Level ${levelNum}: "${level.title}" passes validation and exit is BFS reachable`, () => {
      const report = LevelValidator.validate(level);
      assertEqual(report.valid, true, `Campaign Level ${levelNum} passes validation with 0 errors`);
      assertEqual(report.errors.length, 0, `Campaign Level ${levelNum} has no validation errors`);
      assertEqual(report.stats.exitReached, true, `Campaign Level ${levelNum} exit is reached via BFS`);
      assert(report.stats.reachableTiles > 10, `Campaign Level ${levelNum} has open walkable area`);
    });
  });
});
