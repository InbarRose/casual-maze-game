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

// 2. Engine Subsystem Unit Tests
import './unit/engine/collision.test.mjs';
import './unit/engine/fog.test.mjs';
import './unit/engine/camera.test.mjs';
import './unit/engine/debug-logger.test.mjs';

// 3. Entity Subsystem Unit Tests
import './unit/entities/player.test.mjs';
import './unit/entities/entities.test.mjs';

// 4. Level Subsystem Unit Tests
import './unit/levels/level-loader.test.mjs';
import './unit/levels/json-integrity.test.mjs';
import './unit/levels/campaign-levels.test.mjs';
import './unit/levels/tutorial-levels.test.mjs';

// 5. Editor Subsystem Unit Tests
import './unit/editor/level-validator.test.mjs';
import './unit/editor/json-exporter.test.mjs';
import './unit/editor/editor-canvas.test.mjs';

// 6. Asset & Vector Pipeline Unit Tests
import './unit/assets/asset-catalog.test.mjs';

// 7. End-to-End User Journey Tests
import './integration/journeys/tutorial-progression.journey.test.mjs';
import './integration/journeys/campaign-solvability.journey.test.mjs';
import './integration/journeys/editor-authoring.journey.test.mjs';
import './integration/journeys/fog-exploration.journey.test.mjs';
import './integration/journeys/multi-elevation.journey.test.mjs';

// Run registered suites
await run();
