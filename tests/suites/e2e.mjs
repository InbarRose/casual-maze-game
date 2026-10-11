/**
 * Headless E2E Browser Test Suite Runner for Casual Maze Game
 * Runs browser navigation, level selection, and live gameplay execution.
 */

import { run } from '../harness/index.mjs';
import '../e2e/headless-hub-and-gameplay.test.mjs';

await run();
