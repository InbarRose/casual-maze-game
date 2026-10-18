/**
 * Core Subsystem Test Suite Runner for Casual Maze Game
 * Runs PRNG, events, storage, constants, coordinates, and versioning tests.
 */

import { run } from '../harness/index.mjs';

import '../unit/core/prng.test.mjs';
import '../unit/core/events.test.mjs';
import '../unit/core/storage.test.mjs';
import '../unit/core/constants.test.mjs';
import '../unit/core/coordinates-xyz.test.mjs';
import '../unit/core/versioning.test.mjs';
import '../unit/core/storage-migration-and-diagnostics.test.mjs';
import '../unit/core/storage-backup-restore.test.mjs';
import '../unit/core/geometry.test.mjs';
import '../unit/core/maze-generator.test.mjs';
import '../unit/core/storage-metadata-snapshot.test.mjs';
import '../unit/core/explorer-outfits.test.mjs';
import '../unit/core/smart-test-runner.test.mjs';

await run();
