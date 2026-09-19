/**
 * Browser Test Suite Runner for Casual Maze Game
 * Executes unit tests and journey simulations directly inside the browser DOM.
 */

import { runner } from './harness/runner.mjs';

// 1. Core Subsystems
import './unit/core/prng.test.mjs';
import './unit/core/events.test.mjs';
import './unit/core/storage.test.mjs';
import './unit/core/constants.test.mjs';
import './unit/core/coordinates-xyz.test.mjs';
import './unit/core/versioning.test.mjs';

// 2. Engine Subsystems
import './unit/engine/collision.test.mjs';
import './unit/engine/fog.test.mjs';
import './unit/engine/camera.test.mjs';
import './unit/engine/camera-rotation.test.mjs';
import './unit/engine/debug-logger.test.mjs';
import './unit/engine/perspective-renderer.test.mjs';
import './unit/engine/solver.test.mjs';
import './unit/engine/replay-player.test.mjs';

// 3. Entity Subsystems
import './unit/entities/player.test.mjs';
import './unit/entities/entities.test.mjs';
import './unit/entities/dynamic-activities.test.mjs';
import './unit/entities/signpost.test.mjs';
import './unit/entities/wall-decor.test.mjs';
import './unit/entities/checkpoint.test.mjs';
import './unit/entities/collectible.test.mjs';
import './unit/entities/riddle-item.test.mjs';
import './unit/entities/pedestal.test.mjs';

// 4. Level Subsystems
import './unit/levels/level-loader.test.mjs';
import './unit/levels/campaign-levels.test.mjs';
import './unit/levels/tutorial-levels.test.mjs';
import './unit/levels/multi-room.test.mjs';
import './unit/stories/storylines.test.mjs';

// 5. Editor Subsystems
import './unit/editor/level-validator.test.mjs';
import './unit/editor/json-exporter.test.mjs';
import './unit/editor/editor-canvas.test.mjs';
import './unit/editor/editor-buttons-and-functions.test.mjs';

// 6. UI & Audio Engine Subsystems
import './unit/ui/audio-fx.test.mjs';
import './unit/ui/game-menu.test.mjs';

// 7. Modular Campaign Chapter Playthrough Tests (Levels 1–32)
import './integration/campaign/chapter-1.test.mjs';
import './integration/campaign/chapter-2.test.mjs';
import './integration/campaign/chapter-3.test.mjs';
import './integration/campaign/chapter-4.test.mjs';
import './integration/campaign/chapter-5.test.mjs';
import './integration/campaign/chapter-6.test.mjs';
import './integration/campaign/chapter-7.test.mjs';
import './integration/campaign/chapter-8.test.mjs';

// 8. End-to-End User Journey Tests
import './integration/journeys/tutorial-progression.journey.test.mjs';
import './integration/journeys/campaign-solvability.journey.test.mjs';
import './integration/journeys/editor-authoring.journey.test.mjs';
import './integration/journeys/fog-exploration.journey.test.mjs';
import './integration/journeys/multi-elevation.journey.test.mjs';
import './integration/journeys/interactive-activities.journey.test.mjs';
import './integration/journeys/obstacle-interactions.journey.test.mjs';
import './integration/journeys/checkpoints-and-lore.journey.test.mjs';
import './integration/journeys/riddle-pedestals.journey.test.mjs';
import './integration/journeys/storylines-progression.journey.test.mjs';
import './integration/journeys/camera-rotation.journey.test.mjs';
import './integration/journeys/multi-room-dungeon.journey.test.mjs';

/**
 * Execute the registered test suites in the browser
 * @param {Function} [onEvent] Listener callback for test progress updates
 * @returns {Promise<object>}
 */
export async function executeBrowserTests(onEvent) {
  if (typeof onEvent === 'function') {
    runner.addListener(onEvent);
  }

  // Reset counters before running
  runner.results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    totalAssertions: 0,
    failures: [],
    suitesCount: 0,
  };

  const results = await runner.run();
  return results;
}
