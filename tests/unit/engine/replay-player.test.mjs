/**
 * Unit Tests: Replay Player Engine
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { ReplayPlayer, REPLAY_STATES } from '../../../js/engine/replay-player.js';
import { generateWalkthroughReplay } from '../../../js/engine/solver.js';
import { CAMPAIGN_CH1_LEVELS } from '../../../js/levels/campaign-ch1.js';
import { createMockCanvas } from '../../helpers/campaign-solver.mjs';

describe('Engine > ReplayPlayer', () => {
  const level1 = CAMPAIGN_CH1_LEVELS[0];
  const replay1 = generateWalkthroughReplay(level1);

  it('initializes in PAUSED state with correct total steps', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
    });

    assertEqual(player.state, REPLAY_STATES.PAUSED);
    assertEqual(player.currentStep, 0);
    assertEqual(player.totalSteps, replay1.actions.length);
    assert(player.totalSteps > 0, 'Has steps to play');

    player.destroy();
  });

  it('steps forward action by action and tracks player position', () => {
    const mockCanvas = createMockCanvas();
    let stepNotified = null;

    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
      onStep: (data) => { stepNotified = data; },
    });

    const firstAction = replay1.actions[0];
    const advanced = player.stepForward();

    assertEqual(advanced, true);
    assertEqual(player.currentStep, 1);
    assertEqual(stepNotified.currentStep, 1);
    assertEqual(player.gameLoop.player.gridX, firstAction.to.x);
    assertEqual(player.gameLoop.player.gridY, firstAction.to.y);

    player.destroy();
  });

  it('seeks to any step index accurately and updates state', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
    });

    const targetStep = Math.min(5, player.totalSteps);
    player.seekTo(targetStep);

    assertEqual(player.currentStep, targetStep);
    const expectedPos = replay1.actions[targetStep - 1].to;
    assertEqual(player.gameLoop.player.gridX, expectedPos.x);
    assertEqual(player.gameLoop.player.gridY, expectedPos.y);

    // Seek to end transitions to COMPLETED
    player.seekTo(player.totalSteps);
    assertEqual(player.currentStep, player.totalSteps);
    assertEqual(player.state, REPLAY_STATES.COMPLETED);

    // Seek to 0 restarts
    player.restart();
    assertEqual(player.currentStep, 0);
    assertEqual(player.gameLoop.player.gridX, level1.spawn.x);
    assertEqual(player.gameLoop.player.gridY, level1.spawn.y);

    player.destroy();
  });

  it('manages speed settings safely', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({ canvas: mockCanvas });

    player.setSpeed(2.0);
    assertEqual(player.speed, 2.0);

    player.setSpeed(100);
    assertEqual(player.speed, 10.0, 'Clamps upper bound');

    player.setSpeed(-5);
    assertEqual(player.speed, 0.1, 'Clamps lower bound');

    player.destroy();
  });

  it('loads new levels and replays dynamically on the fly', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({ canvas: mockCanvas });

    player.load(level1, replay1);
    assertEqual(player.totalSteps, replay1.actions.length);
    assertEqual(player.currentStep, 0);

    const stepSuccess = player.stepForward();
    assertEqual(stepSuccess, true);
    assertEqual(player.currentStep, 1);

    player.destroy();
  });
});
