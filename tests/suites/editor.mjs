/**
 * Editor Subsystem Test Suite Runner for Casual Maze Game
 * Runs validator, exporter, canvas, buttons, history, and prefabs tests.
 */

import { run } from '../harness/index.mjs';

import '../unit/editor/level-validator.test.mjs';
import '../unit/editor/json-exporter.test.mjs';
import '../unit/editor/editor-canvas.test.mjs';
import '../unit/editor/editor-buttons-and-functions.test.mjs';
import '../unit/editor/history-stack.test.mjs';
import '../unit/editor/prefabs-and-autofix.test.mjs';
import '../unit/editor/bridge-ramp-guide.test.mjs';
import '../unit/editor/generator-integration.test.mjs';
import '../unit/editor/custom-prefabs.test.mjs';
import '../unit/editor/diagnostic-pins-validation.test.mjs';
import '../unit/editor/entrance-exit-clash.test.mjs';
import '../unit/editor/editor-perspective-and-ui.test.mjs';

await run();
