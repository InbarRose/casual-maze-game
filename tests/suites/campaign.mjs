/**
 * Campaign Playthrough Test Suite Runner for Casual Maze Game
 * Runs BFS solver verifications across all 32 campaign megalabyrinths (Chapters 1 to 8).
 */

import { run } from '../harness/index.mjs';

import '../integration/campaign/chapter-1.test.mjs';
import '../integration/campaign/chapter-2.test.mjs';
import '../integration/campaign/chapter-3.test.mjs';
import '../integration/campaign/chapter-4.test.mjs';
import '../integration/campaign/chapter-5.test.mjs';
import '../integration/campaign/chapter-6.test.mjs';
import '../integration/campaign/chapter-7.test.mjs';
import '../integration/campaign/chapter-8.test.mjs';

await run();
