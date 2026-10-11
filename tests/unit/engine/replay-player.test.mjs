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

  it('aligns player world coordinates with level tile size (BL-96)', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
    });

    player.stepForward();
    const firstAction = replay1.actions[0];
    const ts = player.gameLoop.tileSize;
    assert(ts > 0, 'Tile size must be positive');
    assertEqual(player.gameLoop.player.worldX, firstAction.to.x * ts + ts / 2);
    assertEqual(player.gameLoop.player.worldY, firstAction.to.y * ts + ts / 2);

    player.destroy();
  });

  it('supports dynamic viewport resize for grand theater presentation (BL-112)', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
    });

    player.resize(1280, 720);
    assertEqual(mockCanvas.width, 1280);
    assertEqual(mockCanvas.height, 720);
    assertEqual(player.gameLoop.camera.viewportWidth, 1280);
    assertEqual(player.gameLoop.camera.viewportHeight, 720);

    player.destroy();
  });

  it('jumps directly to walkthrough end with jumpToEnd() (BL-112)', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
    });

    player.jumpToEnd();
    assertEqual(player.currentStep, player.totalSteps);
    assertEqual(player.state, REPLAY_STATES.COMPLETED);

    player.destroy();
  });

  it('manages loop toggle and continuous playback configuration (BL-112)', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
      isLooping: false,
    });

    assertEqual(player.isLooping, false);
    const toggled = player.toggleLoop();
    assertEqual(toggled, true);
    assertEqual(player.isLooping, true);

    player.setLooping(false);
    assertEqual(player.isLooping, false);

    player.destroy();
  });

  it('toggles camera perspective and 90-degree rotations (BL-112)', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
    });

    // Perspective toggle
    const initialMode = player.gameLoop.renderer?.perspective || 'angled';
    const newMode = player.togglePerspective();
    assert(newMode !== initialMode, 'Perspective mode switched');
    assertEqual(player.gameLoop.renderer.perspective, newMode);

    // Rotation controls
    const rotBefore = player.gameLoop.camera.targetRotation;
    player.rotateRight();
    assert(player.gameLoop.camera.targetRotation !== rotBefore, 'Camera rotated CW');
    player.rotateLeft();
    assertEqual(player.gameLoop.camera.targetRotation, rotBefore, 'Camera returned to initial heading CCW');

    player.destroy();
  });

  it('retrieves level metadata via getLevelInfo() (BL-112)', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
    });

    const info = player.getLevelInfo();
    assert(info !== null, 'Metadata exists');
    assertEqual(info.id, level1.id);
    assertEqual(info.title, level1.title);
    assert(typeof info.theme === 'string', 'Has theme string');

    player.destroy();
  });

  it('forwards uiCallbacks.onStateUpdate to internal GameLoop (BL-112)', () => {
    const mockCanvas = createMockCanvas();
    let stateDispatched = null;

    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
      uiCallbacks: {
        onStateUpdate: (st) => {
          stateDispatched = st;
        },
      },
    });

    // Notify UI from GameLoop
    player.gameLoop.notifyUI();
    assert(stateDispatched !== null, 'onStateUpdate was called');
    assertEqual(stateDispatched.levelTitle, level1.title);
    assert(Array.isArray(stateDispatched.inventory), 'Has inventory array');

    player.destroy();
  });
});

