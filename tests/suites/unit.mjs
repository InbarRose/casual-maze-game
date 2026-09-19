/**
 * Unit Test Suite Runner for Casual Maze Game
 * Runs all core, engine, entity, level, and editor unit tests (excludes heavy journeys & campaign solvers).
 */

import { run } from '../harness/index.mjs';

// Core
import '../unit/core/prng.test.mjs';
import '../unit/core/events.test.mjs';
import '../unit/core/storage.test.mjs';
import '../unit/core/constants.test.mjs';
import '../unit/core/coordinates-xyz.test.mjs';
import '../unit/core/versioning.test.mjs';

// Engine
import '../unit/engine/collision.test.mjs';
import '../unit/engine/fog.test.mjs';
import '../unit/engine/camera.test.mjs';
import '../unit/engine/camera-rotation.test.mjs';
import '../unit/engine/debug-logger.test.mjs';
import '../unit/engine/perspective-renderer.test.mjs';
import '../unit/engine/solver.test.mjs';
import '../unit/engine/replay-player.test.mjs';

// Entities
import '../unit/entities/player.test.mjs';
import '../unit/entities/entities.test.mjs';
import '../unit/entities/dynamic-activities.test.mjs';
import '../unit/entities/signpost.test.mjs';
import '../unit/entities/wall-decor.test.mjs';
import '../unit/entities/checkpoint.test.mjs';
import '../unit/entities/collectible.test.mjs';
import '../unit/entities/riddle-item.test.mjs';
import '../unit/entities/pedestal.test.mjs';

// Levels & Story
import '../unit/levels/level-loader.test.mjs';
import '../unit/levels/json-integrity.test.mjs';
import '../unit/levels/campaign-levels.test.mjs';
import '../unit/levels/tutorial-levels.test.mjs';
import '../unit/levels/multi-room.test.mjs';
import '../unit/levels/level-drift.test.mjs';
import '../unit/stories/storylines.test.mjs';
import '../unit/levels/story-1-unbypassable.test.mjs';

// Editor
import '../unit/editor/level-validator.test.mjs';
import '../unit/editor/json-exporter.test.mjs';
import '../unit/editor/editor-canvas.test.mjs';
import '../unit/editor/editor-buttons-and-functions.test.mjs';

// Assets
import '../unit/assets/asset-catalog.test.mjs';
import '../unit/assets/asset-drift.test.mjs';

// UI
import '../unit/ui/audio-fx.test.mjs';
import '../unit/ui/game-menu.test.mjs';

await run();
