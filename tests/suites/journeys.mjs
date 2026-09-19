/**
 * End-to-End User Journeys Runner for Casual Maze Game
 * Runs all full user playthrough journeys.
 */

import { run } from '../harness/index.mjs';

import '../integration/journeys/tutorial-progression.journey.test.mjs';
import '../integration/journeys/campaign-solvability.journey.test.mjs';
import '../integration/journeys/editor-authoring.journey.test.mjs';
import '../integration/journeys/fog-exploration.journey.test.mjs';
import '../integration/journeys/multi-elevation.journey.test.mjs';
import '../integration/journeys/interactive-activities.journey.test.mjs';
import '../integration/journeys/campaign-progression.journey.test.mjs';
import '../integration/journeys/obstacle-interactions.journey.test.mjs';
import '../integration/journeys/checkpoints-and-lore.journey.test.mjs';
import '../integration/journeys/riddle-pedestals.journey.test.mjs';
import '../integration/journeys/storylines-progression.journey.test.mjs';
import '../integration/journeys/camera-rotation.journey.test.mjs';
import '../integration/journeys/multi-room-dungeon.journey.test.mjs';

await run();
