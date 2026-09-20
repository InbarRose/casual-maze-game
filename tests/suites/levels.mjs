/**
 * Level & Story Subsystem Test Suite Runner for Casual Maze Game
 * Runs level schema integrity, loaders, multi-room, drift, storylines, and gate challenge tests.
 */

import { run } from '../harness/index.mjs';

import '../unit/levels/level-loader.test.mjs';
import '../unit/levels/json-integrity.test.mjs';
import '../unit/levels/campaign-levels.test.mjs';
import '../unit/levels/tutorial-levels.test.mjs';
import '../unit/levels/multi-room.test.mjs';
import '../unit/levels/level-drift.test.mjs';
import '../unit/stories/storylines.test.mjs';
import '../unit/levels/story-1-unbypassable.test.mjs';
import '../unit/levels/story-2-unbypassable.test.mjs';
import '../unit/levels/story-3-unbypassable.test.mjs';
import '../unit/levels/chapter-1.test.mjs';
import '../unit/levels/chapter-2.test.mjs';
import '../unit/levels/chapter-3.test.mjs';
import '../unit/levels/chapter-4.test.mjs';
import '../unit/levels/chapter-5.test.mjs';
import '../unit/levels/chapter-6.test.mjs';
import '../unit/levels/chapter-7.test.mjs';
import '../unit/levels/chapter-8.test.mjs';

await run();
