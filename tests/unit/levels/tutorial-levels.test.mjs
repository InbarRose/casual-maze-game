/**
 * Unit Tests: Tutorial Academy Levels Solvability & Mechanics
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { TUTORIAL_LEVELS } from '../../../js/levels/default-levels.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';

describe('Levels > Tutorial Levels Solvability', () => {
  TUTORIAL_LEVELS.forEach((level, idx) => {
    const tutNum = idx + 1;
    it(`validates Tutorial ${tutNum}: "${level.title}" is valid and BFS reachable`, () => {
      const report = LevelValidator.validate(level);
      assertEqual(report.valid, true, `Tutorial ${tutNum} passes validation with 0 errors`);
      assertEqual(report.errors.length, 0, `Tutorial ${tutNum} has no validation errors`);
      assertEqual(report.stats.exitReached, true, `Tutorial ${tutNum} exit is reached via BFS`);
    });
  });

  it('validates Tutorial 2 strict key dependencies without bypassability', () => {
    const tut2 = TUTORIAL_LEVELS[1];
    const report = LevelValidator.validate(tut2);
    assertEqual(report.warnings.length, 0, 'Tutorial 2 has 0 bypass warnings');

    const keyMap = new Map(tut2.entities.filter(e => e.type === 'key').map(k => [k.id, k]));
    const doorList = tut2.entities.filter(e => e.type === 'door');

    // Without unlocking red door
    const noRed = LevelValidator.analyzeReachability(tut2, keyMap, doorList, new Set(['door_red_t2']));
    assertEqual(noRed.exitReached, false, 'Tutorial 2 exit is unreachable if red gate is kept locked');

    // Without unlocking blue door
    const noBlue = LevelValidator.analyzeReachability(tut2, keyMap, doorList, new Set(['door_blue_t2']));
    assertEqual(noBlue.exitReached, false, 'Tutorial 2 exit is unreachable if blue gate is kept locked');
  });
});
