/**
 * Entity Subsystem Test Suite Runner for Casual Maze Game
 * Runs player, doors, keys, levers, hazards, and puzzle entity tests.
 */

import { run } from '../harness/index.mjs';

import '../unit/entities/player.test.mjs';
import '../unit/entities/entities.test.mjs';
import '../unit/entities/dynamic-activities.test.mjs';
import '../unit/entities/signpost.test.mjs';
import '../unit/entities/wall-decor.test.mjs';
import '../unit/entities/checkpoint.test.mjs';
import '../unit/entities/collectible.test.mjs';
import '../unit/entities/riddle-item.test.mjs';
import '../unit/entities/pedestal.test.mjs';

await run();
