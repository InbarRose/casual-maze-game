/**
 * Engine Subsystem Test Suite Runner for Casual Maze Game
 * Runs physics, collision, camera, fog, debug-logger, solver, and replay engine tests.
 */

import { run } from '../harness/index.mjs';

import '../unit/engine/collision.test.mjs';
import '../unit/engine/fog.test.mjs';
import '../unit/engine/camera.test.mjs';
import '../unit/engine/camera-rotation.test.mjs';
import '../unit/engine/camera-zoom.test.mjs';
import '../unit/engine/debug-logger.test.mjs';
import '../unit/engine/perspective-renderer.test.mjs';
import '../unit/engine/depth-sorting.test.mjs';
import '../unit/renderer/vector-rendering.test.mjs';
import '../unit/renderer/particles-lighting.test.mjs';
import '../unit/engine/solver.test.mjs';
import '../unit/engine/replay-player.test.mjs';
import '../unit/engine/click-to-move-and-hotkeys.test.mjs';
import '../unit/engine/secret-wall.test.mjs';
import '../unit/engine/scoring-medals.test.mjs';
import '../unit/engine/input-manager.test.mjs';
import '../unit/engine/tactical-minimap.test.mjs';
import '../unit/engine/multi-elevation-pathfinding.test.mjs';
import '../unit/engine/canvas-visual-regression.test.mjs';
import '../unit/engine/entrance-exit-visuals.test.mjs';
import '../unit/engine/interact-directions-disambiguation.test.mjs';
import '../unit/engine/fog-expansion.test.mjs';
import '../unit/engine/game-state-manager.test.mjs';
import '../unit/engine/biome-surface-shaders.test.mjs';

await run();
