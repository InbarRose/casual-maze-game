/**
 * Unit Tests: Level Solver & Walkthrough Replay Generator
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { solveLevel, generateWalkthroughReplay, getDirection } from '../../../js/engine/solver.js';
import { CAMPAIGN_CH1_LEVELS } from '../../../js/levels/campaign-ch1.js';

describe('Engine > Solver & Walkthrough Replay Generator', () => {
  it('correctly calculates cardinal directions', () => {
    assertEqual(getDirection(2, 2, 3, 2), 'right');
    assertEqual(getDirection(2, 2, 1, 2), 'left');
    assertEqual(getDirection(2, 2, 2, 3), 'down');
    assertEqual(getDirection(2, 2, 2, 1), 'up');
    assertEqual(getDirection(2, 2, 2, 2), 'none');
  });

  it('solves Campaign Level 1 (First Footsteps) with a valid step sequence', () => {
    const level1 = CAMPAIGN_CH1_LEVELS[0];
    const path = solveLevel(level1);

    assert(path !== null, 'Solution path exists');
    assert(Array.isArray(path), 'Path is an array');
    assert(path.length >= 2, 'Path has at least 2 steps');

    const first = path[0];
    assertEqual(first.x, level1.spawn.x);
    assertEqual(first.y, level1.spawn.y);

    const last = path[path.length - 1];
    assertEqual(last.x, level1.exit.x);
    assertEqual(last.y, level1.exit.y);
  });

  it('generates a canonical walkthrough replay object', () => {
    const level1 = CAMPAIGN_CH1_LEVELS[0];
    const replay = generateWalkthroughReplay(level1);

    assert(replay !== null, 'Replay was generated');
    assertEqual(replay.schemaVersion, '1.0.0');
    assertEqual(replay.type, 'casual-maze-replay');
    assertEqual(replay.levelId, String(level1.id));
    assertEqual(replay.summary.completed, true);
    assert(Array.isArray(replay.actions), 'Replay actions is an array');
    assert(replay.actions.length > 0, 'Replay has actions');

    const firstAction = replay.actions[0];
    assertEqual(firstAction.stepIndex, 1);
    assert(['up', 'down', 'left', 'right'].includes(firstAction.direction), 'Direction is cardinal');
    assert(firstAction.elapsedMs > 0, 'Action has elapsedMs');
  });

  it('handles invalid or empty level objects gracefully', () => {
    assertEqual(solveLevel(null), null);
    assertEqual(solveLevel({}), null);
    assertEqual(generateWalkthroughReplay(null), null);
    assertEqual(generateWalkthroughReplay({}), null);
  });
});
