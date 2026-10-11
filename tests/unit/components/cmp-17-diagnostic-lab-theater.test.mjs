/**
 * Component Unit Tests: Diagnostics Lab, In-Browser Runner & Replay Theater Deck (CMP-17)
 *
 * Verifies test.html components, media play deck transport buttons, live scrubber,
 * activity feed classification, speed pills, and in-browser automated test runner.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { ReplayPlayer, REPLAY_STATES } from '../../../js/engine/replay-player.js';
import { generateWalkthroughReplay } from '../../../js/engine/solver.js';
import { CAMPAIGN_CH1_LEVELS } from '../../../js/levels/campaign-ch1.js';
import { createMockCanvas } from '../../helpers/campaign-solver.mjs';

const isNode = typeof process !== 'undefined' && process.versions?.node;

describe('Components > CMP-17: Diagnostic Test Lab & Media Replay Theater', () => {
  it('CMP-17: validates test.html tabs, buttons, media deck, and HUD markup', async () => {
    if (!isNode) return;
    const fs = await import('fs');
    const path = await import('path');
    const testHtml = fs.readFileSync(path.resolve(process.cwd(), 'test.html'), 'utf-8');

    // 1. Navigation / Lab Header Tabs
    assert(testHtml.includes('data-tab="replay"'), 'Replay theater tab button exists');
    assert(testHtml.includes('data-tab="tests"'), 'Test runner tab button exists');
    assert(testHtml.includes('data-tab="diagnostics"'), 'Diagnostics tab button exists');
    assert(testHtml.includes('id="btn-run-all-tests"'), 'Run all tests button exists');

    // 2. Media Play Deck Transport Controls
    assert(testHtml.includes('id="btn-replay-reset"'), 'Rewind/reset button exists');
    assert(testHtml.includes('id="btn-replay-prev"'), 'Step prev button exists');
    assert(testHtml.includes('id="btn-replay-play"'), 'Hero Play/Pause button exists');
    assert(testHtml.includes('id="btn-replay-next"'), 'Step next button exists');
    assert(testHtml.includes('id="btn-replay-end"'), 'Skip to end button exists');
    assert(testHtml.includes('id="btn-replay-sound"'), 'Audio mute toggle exists');
    assert(testHtml.includes('id="btn-replay-loop"'), 'Loop playback toggle exists');
    assert(testHtml.includes('id="btn-replay-fullscreen"'), 'Fullscreen toggle exists');

    // 3. Playback Speeds
    assert(testHtml.includes('data-speed="0.5"'), '0.5x speed pill exists');
    assert(testHtml.includes('data-speed="1.0"'), '1x speed pill exists');
    assert(testHtml.includes('data-speed="2.0"'), '2x speed pill exists');
    assert(testHtml.includes('data-speed="4.0"'), '4x speed pill exists');

    // 4. Interactive Scrubber Timeline & Metrics
    assert(testHtml.includes('id="replay-scrubber"'), 'Timeline range scrubber exists');
    assert(testHtml.includes('id="media-time-current"'), 'Current time readout exists');
    assert(testHtml.includes('id="media-time-total"'), 'Total time readout exists');
    assert(testHtml.includes('id="media-step-pill"'), 'Step count pill exists');
    assert(testHtml.includes('id="media-action-pill"'), 'Action detail pill exists');

    // 5. Activity Feed Overlay & Categories
    assert(testHtml.includes('id="replay-activity-feed"'), 'Activity feed overlay exists');
    assert(testHtml.includes('data-filter="all"'), 'Feed filter All exists');
    assert(testHtml.includes('data-filter="lore"'), 'Feed filter Lore exists');
    assert(testHtml.includes('data-filter="mech"'), 'Feed filter Mech exists');
    assert(testHtml.includes('data-filter="item"'), 'Feed filter Item exists');
  });

  it('CMP-17: coordinates ReplayPlayer transport state and events with mock canvas', () => {
    const level = CAMPAIGN_CH1_LEVELS[0];
    const replay = generateWalkthroughReplay(level);
    const mockCanvas = createMockCanvas(800, 600);

    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level,
      replay: replay,
    });

    assertEqual(player.state, REPLAY_STATES.PAUSED);
    assertEqual(player.currentStep, 0);

    // Step forward
    player.stepForward();
    assertEqual(player.currentStep, 1);

    // Jump to end
    player.jumpToEnd();
    assertEqual(player.currentStep, player.totalSteps);
    assertEqual(player.state, REPLAY_STATES.COMPLETED);

    // Reset back to start
    player.restart();
    assertEqual(player.currentStep, 0);

    // Continuous loop toggle
    assertEqual(player.isLooping, false);
    player.toggleLoop();
    assertEqual(player.isLooping, true);

    // Clean up
    player.destroy();
  });
});
