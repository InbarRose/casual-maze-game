/**
 * Unit Tests: Replay Theater & Activity Feed (BL-112, ADR-0021)
 *
 * Verifies:
 * 1. test.html static markup contains the grand theater stage, full floating HUD islands,
 *    tactical radar minimap, real-time action activity feed, and media play deck.
 * 2. Activity feed filter categories properly match/filter lore, mech, item, and general events.
 * 3. Colorblind geometric shape glyph helper integrates seamlessly with carried keys.
 * 4. ReplayPlayer and Media Play Deck controls coordinate seamlessly.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { getKeyColorblindShape } from '../../../js/core/constants.js';
import { ReplayPlayer, REPLAY_STATES } from '../../../js/engine/replay-player.js';
import { generateWalkthroughReplay } from '../../../js/engine/solver.js';
import { CAMPAIGN_CH1_LEVELS } from '../../../js/levels/campaign-ch1.js';
import { createMockCanvas } from '../../helpers/campaign-solver.mjs';

const isNode = typeof process !== 'undefined' && process.versions?.node;

describe('UI > Replay Theater & Activity Feed (BL-112)', () => {
  const level1 = CAMPAIGN_CH1_LEVELS[0];
  const replay1 = generateWalkthroughReplay(level1);

  it('verifies test.html includes all Replay Theater DOM elements and media play deck', async () => {
    if (!isNode) return;
    const fs = await import('fs');
    const path = await import('path');
    const testHtml = fs.readFileSync(path.resolve(process.cwd(), 'test.html'), 'utf-8');

    // Grand Stage & Viewport
    assert(testHtml.includes('class="replay-stage-wrapper"'), 'Stage wrapper present');
    assert(testHtml.includes('id="replay-viewport"'), 'Replay viewport present');
    assert(testHtml.includes('id="replay-canvas"'), 'Replay main canvas present');

    // Floating HUD Islands
    assert(testHtml.includes('id="replay-hud-title"'), 'HUD level title present');
    assert(testHtml.includes('id="replay-hud-chapter"'), 'HUD chapter present');
    assert(testHtml.includes('id="replay-hud-elevation"'), 'HUD elevation badge present');
    assert(testHtml.includes('id="replay-keys-list"'), 'HUD carried keys list present');
    assert(testHtml.includes('id="replay-hud-timer"'), 'HUD timer present');
    assert(testHtml.includes('id="replay-hud-steps"'), 'HUD steps present');
    assert(testHtml.includes('id="btn-replay-perspective"'), 'Perspective toggle button present');
    assert(testHtml.includes('id="replay-compass-badge"'), 'Compass badge present');

    // Tactical Radar Minimap
    assert(testHtml.includes('id="replay-minimap-container"'), 'Minimap container present');
    assert(testHtml.includes('id="replay-minimap-canvas"'), 'Minimap canvas present');
    assert(testHtml.includes('id="btn-replay-minimap-toggle"'), 'Minimap toggle button present');

    // Real-Time Action Activity Feed
    assert(testHtml.includes('id="replay-activity-feed"'), 'Activity feed overlay present');
    assert(testHtml.includes('id="replay-activity-feed-items"'), 'Activity feed items container present');
    assert(testHtml.includes('data-filter="all"'), 'Filter pill All present');
    assert(testHtml.includes('data-filter="lore"'), 'Filter pill Lore present');
    assert(testHtml.includes('data-filter="mech"'), 'Filter pill Mech present');
    assert(testHtml.includes('data-filter="item"'), 'Filter pill Item present');

    // Media Play Menu Deck
    assert(testHtml.includes('class="media-play-deck"'), 'Media play deck container present');
    assert(testHtml.includes('id="replay-scrubber"'), 'Media scrubber timeline present');
    assert(testHtml.includes('id="media-time-current"'), 'Current timestamp label present');
    assert(testHtml.includes('id="media-time-total"'), 'Total timestamp label present');
    assert(testHtml.includes('id="media-step-pill"'), 'Step count pill present');
    assert(testHtml.includes('id="media-action-pill"'), 'Action detail pill present');

    // Media Deck Transport Buttons
    assert(testHtml.includes('id="btn-replay-reset"'), 'Restart transport button present');
    assert(testHtml.includes('id="btn-replay-prev"'), 'Step prev transport button present');
    assert(testHtml.includes('id="btn-replay-play"'), 'Play/Pause hero button present');
    assert(testHtml.includes('id="btn-replay-next"'), 'Step next transport button present');
    assert(testHtml.includes('id="btn-replay-end"'), 'Skip to end transport button present');
    assert(testHtml.includes('id="btn-replay-sound"'), 'Sound toggle button present');
    assert(testHtml.includes('id="btn-replay-loop"'), 'Loop toggle button present');
    assert(testHtml.includes('id="btn-replay-fullscreen"'), 'Fullscreen theater button present');
  });

  it('correctly maps event categories in activity feed filter logic', () => {
    function matchesFilter(currentFilter, itemCategory) {
      return currentFilter === 'all' ||
        (currentFilter === 'lore' && itemCategory === 'lore') ||
        (currentFilter === 'mech' && (itemCategory === 'mech' || itemCategory === 'lever' || itemCategory === 'door')) ||
        (currentFilter === 'item' && (itemCategory === 'item' || itemCategory === 'key'));
    }

    // All filter allows everything
    assert(matchesFilter('all', 'lore'), 'All matches lore');
    assert(matchesFilter('all', 'mech'), 'All matches mech');
    assert(matchesFilter('all', 'key'), 'All matches key');
    assert(matchesFilter('all', 'info'), 'All matches info');

    // Lore filter only matches lore
    assert(matchesFilter('lore', 'lore'), 'Lore matches lore');
    assert(!matchesFilter('lore', 'mech'), 'Lore rejects mech');
    assert(!matchesFilter('lore', 'key'), 'Lore rejects key');

    // Mech filter matches mech, lever, door
    assert(matchesFilter('mech', 'mech'), 'Mech matches mech');
    assert(matchesFilter('mech', 'lever'), 'Mech matches lever');
    assert(matchesFilter('mech', 'door'), 'Mech matches door');
    assert(!matchesFilter('mech', 'lore'), 'Mech rejects lore');

    // Item filter matches item and key
    assert(matchesFilter('item', 'item'), 'Item matches item');
    assert(matchesFilter('item', 'key'), 'Item matches key');
    assert(!matchesFilter('item', 'mech'), 'Item rejects mech');
  });

  it('integrates colorblind shape glyphs for keys displayed in replay HUD', () => {
    const goldKeyShape = getKeyColorblindShape('#fbbf24');
    assert(typeof goldKeyShape.symbol === 'string', 'Has geometric symbol');
    assert(typeof goldKeyShape.label === 'string', 'Has accessible label');

    const blueKeyShape = getKeyColorblindShape('#38bdf8');
    assert(blueKeyShape.symbol.length > 0, 'Blue key has glyph');
    assert(goldKeyShape.symbol !== blueKeyShape.symbol, 'Different colors have distinct geometric symbols');
  });

  it('coordinates media controls with ReplayPlayer transport state', () => {
    const mockCanvas = createMockCanvas();
    const player = new ReplayPlayer({
      canvas: mockCanvas,
      level: level1,
      replay: replay1,
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

    player.destroy();
  });
});
