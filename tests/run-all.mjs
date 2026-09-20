/**
 * Master Test Suite Runner for Casual Maze Game
 * Discovers and executes all unit tests and end-to-end user journeys.
 *
 * Usage:
 *   node tests/run-all.mjs
 *   node tests/run-all.mjs --suite=collision
 *   node tests/run-all.mjs --grep=deadlock
 *   node tests/run-all.mjs --verbose
 */

import { run } from './harness/index.mjs';

// 1. Core Subsystem Unit Tests
import './unit/core/prng.test.mjs';
import './unit/core/events.test.mjs';
import './unit/core/storage.test.mjs';
import './unit/core/constants.test.mjs';
import './unit/core/coordinates-xyz.test.mjs';
import './unit/core/versioning.test.mjs';

// 2. Engine Subsystem Unit Tests
import './unit/engine/collision.test.mjs';
import './unit/engine/fog.test.mjs';
import './unit/engine/camera.test.mjs';
import './unit/engine/camera-rotation.test.mjs';
import './unit/engine/debug-logger.test.mjs';
import './unit/engine/perspective-renderer.test.mjs';
import './unit/engine/depth-sorting.test.mjs';
import './unit/renderer/vector-rendering.test.mjs';
import './unit/renderer/particles-lighting.test.mjs';
import './unit/engine/solver.test.mjs';
import './unit/engine/replay-player.test.mjs';
import './unit/engine/click-to-move-and-hotkeys.test.mjs';

// 3. Entity Subsystem Unit Tests
import './unit/entities/player.test.mjs';
import './unit/entities/entities.test.mjs';
import './unit/entities/dynamic-activities.test.mjs';
import './unit/entities/signpost.test.mjs';
import './unit/entities/wall-decor.test.mjs';
import './unit/entities/checkpoint.test.mjs';
import './unit/entities/collectible.test.mjs';
import './unit/entities/riddle-item.test.mjs';
import './unit/entities/pedestal.test.mjs';

// 4. Level & Story Subsystem Unit Tests
import './unit/levels/level-loader.test.mjs';
import './unit/levels/json-integrity.test.mjs';
import './unit/levels/campaign-levels.test.mjs';
import './unit/levels/tutorial-levels.test.mjs';
import './unit/levels/multi-room.test.mjs';
import './unit/levels/level-drift.test.mjs';
import './unit/stories/storylines.test.mjs';
import './unit/levels/story-1-unbypassable.test.mjs';
import './unit/levels/story-2-unbypassable.test.mjs';
import './unit/levels/story-3-unbypassable.test.mjs';
import './unit/levels/chapter-1.test.mjs';
import './unit/levels/chapter-2.test.mjs';
import './unit/levels/chapter-3.test.mjs';
import './unit/levels/chapter-4.test.mjs';
import './unit/levels/chapter-5.test.mjs';
import './unit/levels/chapter-6.test.mjs';
import './unit/levels/chapter-7.test.mjs';
import './unit/levels/chapter-8.test.mjs';

// 5. Editor Subsystem Unit Tests
import './unit/editor/level-validator.test.mjs';
import './unit/editor/json-exporter.test.mjs';
import './unit/editor/editor-canvas.test.mjs';
import './unit/editor/editor-buttons-and-functions.test.mjs';
import './unit/editor/history-stack.test.mjs';

// 6. Asset & Vector Pipeline Unit Tests
import './unit/assets/asset-catalog.test.mjs';
import './unit/assets/asset-drift.test.mjs';

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
import './integration/journeys/campaign-progression.journey.test.mjs';
import './integration/journeys/obstacle-interactions.journey.test.mjs';
import './integration/journeys/checkpoints-and-lore.journey.test.mjs';
import './integration/journeys/riddle-pedestals.journey.test.mjs';
import './integration/journeys/storylines-progression.journey.test.mjs';
import './integration/journeys/camera-rotation.journey.test.mjs';
import './integration/journeys/multi-room-dungeon.journey.test.mjs';

// 9. Modern UI & Audio Engine Subsystem Unit Tests
import './unit/ui/audio-fx.test.mjs';
import './unit/ui/audio-ambience.test.mjs';
import './unit/ui/game-menu.test.mjs';
import './unit/ui/app-header.test.mjs';
import './unit/ui/touch-controls.test.mjs';

// Run registered suites

await run();

