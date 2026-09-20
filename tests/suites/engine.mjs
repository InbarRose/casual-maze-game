/**
 * Engine Subsystem Test Suite Runner for Casual Maze Game
 * Runs physics, collision, camera, fog, debug-logger, solver, and replay engine tests.
 */

import { run } from '../harness/index.mjs';

import '../unit/core/coordinates-xyz.test.mjs';
import '../unit/engine/collision.test.mjs';
import '../unit/engine/fog.test.mjs';
import '../unit/engine/camera.test.mjs';
import '../unit/engine/camera-rotation.test.mjs';
import '../unit/engine/debug-logger.test.mjs';
import '../unit/engine/perspective-renderer.test.mjs';
import '../unit/engine/depth-sorting.test.mjs';
import '../unit/renderer/vector-rendering.test.mjs';
import '../unit/renderer/particles-lighting.test.mjs';
import '../unit/engine/solver.test.mjs';
import '../unit/engine/replay-player.test.mjs';
import '../unit/ui/touch-controls.test.mjs';
import '../integration/journeys/camera-rotation.journey.test.mjs';

await run();
